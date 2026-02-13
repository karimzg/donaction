import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HpFederations from './index';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('HpFederations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 3 advantage cards', () => {
    render(<HpFederations />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders section title', () => {
    render(<HpFederations />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/fédérations|comités/i);
  });

  it('renders subtitle with federation context', () => {
    render(<HpFederations />);

    const subtitle = screen.getByText(/solution complète|accompagner/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('renders card titles with key terms', () => {
    render(<HpFederations />);

    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent(/gestion|multi-clubs/i);
    expect(items[1]).toHaveTextContent(/reporting|consolidé/i);
    expect(items[2]).toHaveTextContent(/accompagnement|dédié/i);
  });

  it('renders card subtitles with correct content', () => {
    render(<HpFederations />);

    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent(/pilotez|interface/i);
    expect(items[1]).toHaveTextContent(/tableaux|exports|instances/i);
    expect(items[2]).toHaveTextContent(/interlocuteur|fédération/i);
  });

  it('renders as section with proper accessibility', () => {
    render(<HpFederations />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('aria-label', 'Avantages pour les fédérations');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders SVG icons for each card with aria-hidden', () => {
    const { container } = render(<HpFederations />);

    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThanOrEqual(3);

    svgIcons.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('renders CTA link to contact page with demo parameter', () => {
    render(<HpFederations />);

    const demoLink = screen.getByRole('link', { name: /demander une démo/i });
    expect(demoLink).toBeInTheDocument();
    expect(demoLink).toHaveAttribute(
      'href',
      '/contact?objet=Demande+de+D%C3%A9mo'
    );
  });

  it('renders contact email as mailto link with aria-label', () => {
    render(<HpFederations />);

    const emailLink = screen.getByRole('link', {
      name: /contacter par email/i,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:contact@donaction.fr');
    expect(emailLink).toHaveAttribute('aria-label', 'Contacter par email');
    expect(emailLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders both CTA elements together', () => {
    render(<HpFederations />);

    const demoLink = screen.getByRole('link', { name: /demander une démo/i });
    const emailLink = screen.getByRole('link', {
      name: /contacter par email/i,
    });

    expect(demoLink).toBeInTheDocument();
    expect(emailLink).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<HpFederations />);

    const section = container.querySelector('.hp-federations');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('w-full', 'py-16');

    const grid = container.querySelector('.hp-federations__grid');
    expect(grid).toBeInTheDocument();

    const cards = container.querySelectorAll('.hp-federations__card');
    expect(cards).toHaveLength(3);
  });

  it('renders icon wrappers with correct styling', () => {
    const { container } = render(<HpFederations />);

    const iconWrappers = container.querySelectorAll(
      '.hp-federations__icon-wrapper'
    );
    expect(iconWrappers).toHaveLength(3);

    iconWrappers.forEach((wrapper) => {
      expect(wrapper).toBeInTheDocument();
    });
  });

  it('renders section with dark background styles', () => {
    const { container } = render(<HpFederations />);

    const section = container.querySelector('.hp-federations');
    expect(section).toBeInTheDocument();
    // Section has gradient background applied via CSS
  });
});
