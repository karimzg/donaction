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
    expect(screen.getByRole('radio', { name: /particulier/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /entreprise/i })).toBeInTheDocument();
  });

  it('displays default amount selection buttons for individuals', () => {
    render(<NewHpWidgetDemo />);
    expect(screen.getByRole('radio', { name: '10 €' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '20 €' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '50 €' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '100 €' })).toBeInTheDocument();
  });

  it('shows organization amounts when enterprise is selected', () => {
    render(<NewHpWidgetDemo />);
    const entrepriseBtn = screen.getByRole('radio', { name: /entreprise/i });
    fireEvent.click(entrepriseBtn);

    expect(screen.getByRole('radio', { name: '100 €' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '200 €' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '500 €' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '1000 €' })).toBeInTheDocument();
  });

  it('updates tax calculation when amount changes', () => {
    render(<NewHpWidgetDemo />);
    const button100 = screen.getByRole('radio', { name: '100 €' });
    fireEvent.click(button100);

    // 100€ - 66% = 34€ cost after tax
    expect(screen.getByText('34.00 €')).toBeInTheDocument();
  });

  it('changes tax rate when toggling to enterprise', () => {
    render(<NewHpWidgetDemo />);

    // First select 100€
    const button100 = screen.getByRole('radio', { name: '100 €' });
    fireEvent.click(button100);

    // Then switch to enterprise
    const entrepriseBtn = screen.getByRole('radio', { name: /entreprise/i });
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
    // Using type="text" with inputMode="numeric" for better mobile UX
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('updates calculation when custom amount is entered', () => {
    render(<NewHpWidgetDemo />);
    const input = screen.getByLabelText(/montant libre/i);
    fireEvent.change(input, { target: { value: '200' } });

    // 200€ - 66% = 68€ cost after tax
    expect(screen.getByText('68.00 €')).toBeInTheDocument();
  });

  // Edge case tests for input validation
  describe('input validation edge cases', () => {
    it('allows empty input while typing, resets on blur', () => {
      render(<NewHpWidgetDemo />);
      const input = screen.getByLabelText(/montant libre/i);

      // Empty while typing is allowed
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');

      // On blur, resets to minimum
      fireEvent.blur(input);
      expect(input).toHaveValue('1');
    });

    it('caps amounts at maximum (100000)', () => {
      render(<NewHpWidgetDemo />);
      const input = screen.getByLabelText(/montant libre/i);
      fireEvent.change(input, { target: { value: '999999' } });

      // 100000€ - 66% = 34000€ cost after tax
      expect(screen.getByText('34000.00 €')).toBeInTheDocument();
    });

    it('validates minimum on blur', () => {
      render(<NewHpWidgetDemo />);
      const input = screen.getByLabelText(/montant libre/i);
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.blur(input);

      // Should reset to minimum on blur
      expect(input).toHaveValue('1');
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('modal has correct aria attributes', () => {
      render(<NewHpWidgetDemo />);
      const continueBtn = screen.getByRole('button', { name: /continuer/i });
      fireEvent.click(continueBtn);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'demo-blocker-title');
    });

    it('closes modal on Escape key', () => {
      render(<NewHpWidgetDemo />);
      const continueBtn = screen.getByRole('button', { name: /continuer/i });
      fireEvent.click(continueBtn);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('amount buttons have aria-checked attribute', () => {
      render(<NewHpWidgetDemo />);
      const button50 = screen.getByRole('radio', { name: '50 €' });
      expect(button50).toHaveAttribute('aria-checked', 'true');

      const button100 = screen.getByRole('radio', { name: '100 €' });
      expect(button100).toHaveAttribute('aria-checked', 'false');
    });

    it('donor type toggle has radiogroup role', () => {
      render(<NewHpWidgetDemo />);
      const radiogroup = screen.getByRole('radiogroup', { name: /type de donateur/i });
      expect(radiogroup).toBeInTheDocument();
    });

    it('closes modal when clicking backdrop', () => {
      render(<NewHpWidgetDemo />);
      const continueBtn = screen.getByRole('button', { name: /continuer/i });
      fireEvent.click(continueBtn);

      // Click the backdrop (dialog element itself, not inner content)
      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
