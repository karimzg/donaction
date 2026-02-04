import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NewHpHero from './index';

// Mock next/link to render as anchor
vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe('NewHpHero', () => {
  it('renders hero section with h1 title', () => {
    render(<NewHpHero />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Mobilisez votre communauté pour vos projets');
  });

  it('renders primary CTA linking to /new-club', () => {
    render(<NewHpHero />);

    const primaryCta = screen.getByRole('link', { name: /créer mon club/i });
    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toHaveAttribute('href', '/new-club');
    expect(primaryCta).toHaveClass('btn-primary');
  });

  it('renders secondary CTA linking to /projets', () => {
    render(<NewHpHero />);

    const secondaryCta = screen.getByRole('link', { name: /voir les projets/i });
    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toHaveAttribute('href', '/projets');
    expect(secondaryCta).toHaveClass('btn-outline-primary');
  });

  it('renders scroll indicator with aria-label', () => {
    render(<NewHpHero />);

    const scrollIndicator = screen.getByRole('img', { name: /défiler vers le bas/i });
    expect(scrollIndicator).toBeInTheDocument();
    expect(scrollIndicator).toHaveAttribute('aria-label', 'Défiler vers le bas');
  });

  it('applies responsive layout classes', () => {
    const { container } = render(<NewHpHero />);

    const section = container.querySelector('.new-hp-hero');
    expect(section).toHaveClass('min-h-[80vh]');
    expect(section).toHaveClass('w-full');
    expect(section).toHaveClass('relative');

    // Check text content container has responsive width
    const heading = screen.getByRole('heading', { level: 1 });
    const textContainer = heading.closest('div');
    expect(textContainer).toHaveClass('lg:w-[60%]');
  });
});
