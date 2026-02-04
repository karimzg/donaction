import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewHpWidgetDemo from './index';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('NewHpWidgetDemo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section with heading', () => {
    render(<NewHpWidgetDemo />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Essayez notre widget de don');
  });

  it('renders demo badge indicator', () => {
    render(<NewHpWidgetDemo />);
    expect(screen.getByText(/mode démo/i)).toBeInTheDocument();
  });

  it('renders donor type toggle with both options', () => {
    render(<NewHpWidgetDemo />);
    expect(screen.getByRole('button', { name: /particulier/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entreprise/i })).toBeInTheDocument();
  });

  it('displays default amount selection buttons for individuals', () => {
    render(<NewHpWidgetDemo />);
    expect(screen.getByRole('button', { name: '10 €' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20 €' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50 €' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '100 €' })).toBeInTheDocument();
  });

  it('shows organization amounts when enterprise is selected', () => {
    render(<NewHpWidgetDemo />);
    const entrepriseBtn = screen.getByRole('button', { name: /entreprise/i });
    fireEvent.click(entrepriseBtn);

    expect(screen.getByRole('button', { name: '100 €' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '200 €' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '500 €' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1000 €' })).toBeInTheDocument();
  });

  it('updates tax calculation when amount changes', () => {
    render(<NewHpWidgetDemo />);
    const button100 = screen.getByRole('button', { name: '100 €' });
    fireEvent.click(button100);

    // 100€ - 66% = 34€ cost after tax
    expect(screen.getByText('34.00 €')).toBeInTheDocument();
  });

  it('changes tax rate when toggling to enterprise', () => {
    render(<NewHpWidgetDemo />);

    // First select 100€
    const button100 = screen.getByRole('button', { name: '100 €' });
    fireEvent.click(button100);

    // Then switch to enterprise
    const entrepriseBtn = screen.getByRole('button', { name: /entreprise/i });
    fireEvent.click(entrepriseBtn);

    // 100€ - 60% = 40€ cost after tax
    expect(screen.getByText('40.00 €')).toBeInTheDocument();
    // Check for enterprise tax info in tax display
    expect(screen.getByText(/entreprises/)).toBeInTheDocument();
  });

  it('shows blocker when clicking continue button', () => {
    render(<NewHpWidgetDemo />);
    const continueBtn = screen.getByRole('button', { name: /continuer/i });
    fireEvent.click(continueBtn);

    expect(screen.getByText(/mode démonstration/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voir les projets/i })).toHaveAttribute(
      'href',
      '/projets'
    );
  });

  it('closes blocker when clicking close button', () => {
    render(<NewHpWidgetDemo />);
    const continueBtn = screen.getByRole('button', { name: /continuer/i });
    fireEvent.click(continueBtn);

    const closeBtn = screen.getByRole('button', { name: /fermer/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/mode démonstration/i)).not.toBeInTheDocument();
  });

  it('renders benefits list', () => {
    render(<NewHpWidgetDemo />);
    expect(screen.getByText('Calcul fiscal en temps réel')).toBeInTheDocument();
    // Paiement sécurisé appears in two places - use getAllBy
    expect(screen.getAllByText(/Paiement sécurisé par Stripe/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Reçu fiscal automatique')).toBeInTheDocument();
  });

  it('displays custom amount input', () => {
    render(<NewHpWidgetDemo />);
    const input = screen.getByLabelText(/montant libre/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('updates calculation when custom amount is entered', () => {
    render(<NewHpWidgetDemo />);
    const input = screen.getByLabelText(/montant libre/i);
    fireEvent.change(input, { target: { value: '200' } });

    // 200€ - 66% = 68€ cost after tax
    expect(screen.getByText('68.00 €')).toBeInTheDocument();
  });
});
