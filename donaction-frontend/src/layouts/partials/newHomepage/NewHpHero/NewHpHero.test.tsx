import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import NewHpHero from './index';

// Mock next/link to render as anchor with proper types
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('NewHpHero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section with h1 title', () => {
    render(<NewHpHero />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBeTruthy();
  });

  it('renders description paragraph', () => {
    render(<NewHpHero />);

    expect(
      screen.getByText(/Créez des collectes de dons/i)
    ).toBeInTheDocument();
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

  it('renders scroll indicator with correct accessibility attributes', () => {
    render(<NewHpHero />);

    const scrollIndicator = screen.getByRole('img', {
      name: /défiler vers le bas/i,
    });
    expect(scrollIndicator).toBeInTheDocument();
    expect(scrollIndicator).toHaveAttribute('role', 'img');
    expect(scrollIndicator).toHaveAttribute('aria-label', 'Défiler vers le bas');
  });

  it('renders placeholder illustration with aria-hidden', () => {
    const { container } = render(<NewHpHero />);

    const illustration = container.querySelector('svg[aria-hidden="true"]');
    expect(illustration).toBeInTheDocument();
  });

  it('applies responsive layout classes', () => {
    const { container } = render(<NewHpHero />);

    const section = container.querySelector('.new-hp-hero');
    expect(section).toHaveClass('min-h-[80vh]');
    expect(section).toHaveClass('w-full');
    expect(section).toHaveClass('relative');

    // Check text content container has responsive width using escaped selector
    const textContainer = container.querySelector('.lg\\:w-\\[60\\%\\]');
    expect(textContainer).toBeInTheDocument();
  });

  it('applies responsive button layout', () => {
    const { container } = render(<NewHpHero />);

    // Button container should stack on mobile, row on sm+
    const buttonContainer = container.querySelector('.flex-col.sm\\:flex-row');
    expect(buttonContainer).toBeInTheDocument();
  });
});
