import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NewHpHero from './index';

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe('NewHpHero', () => {
  it('renders hero section with default content', () => {
    render(<NewHpHero />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/donnez du sens/i)).toBeInTheDocument();
  });

  it('renders both CTA buttons', () => {
    render(<NewHpHero />);

    const primaryCta = screen.getByRole('link', { name: /créer mon club/i });
    const secondaryCta = screen.getByRole('link', { name: /découvrir les projets/i });

    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toHaveAttribute('href', '/new-club');

    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toHaveAttribute('href', '/projets');
  });

  it('renders with custom props', () => {
    render(
      <NewHpHero
        title="Custom Title"
        subtitle="Custom subtitle text"
        primaryCtaText="Primary Action"
        primaryCtaHref="/custom-primary"
        secondaryCtaText="Secondary Action"
        secondaryCtaHref="/custom-secondary"
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title');
    expect(screen.getByText('Custom subtitle text')).toBeInTheDocument();

    const primaryCta = screen.getByRole('link', { name: /primary action/i });
    expect(primaryCta).toHaveAttribute('href', '/custom-primary');

    const secondaryCta = screen.getByRole('link', { name: /secondary action/i });
    expect(secondaryCta).toHaveAttribute('href', '/custom-secondary');
  });

  it('renders scroll indicator', () => {
    const { container } = render(<NewHpHero />);

    const scrollIndicator = container.querySelector('.newHpHero__scroll-indicator');
    expect(scrollIndicator).toBeInTheDocument();

    const scrollText = container.querySelector('.newHpHero__scroll-text');
    expect(scrollText).toHaveTextContent('Découvrir');
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<NewHpHero />);

    const section = container.querySelector('.newHpHero');
    expect(section).toBeInTheDocument();

    const content = container.querySelector('.newHpHero__content');
    expect(content).toBeInTheDocument();

    const illustration = container.querySelector('.newHpHero__illustration');
    expect(illustration).toBeInTheDocument();
  });

  it('renders illustration placeholder SVG', () => {
    const { container } = render(<NewHpHero />);

    const svg = container.querySelector('.newHpHero__illustration-svg');
    expect(svg).toBeInTheDocument();
  });
});
