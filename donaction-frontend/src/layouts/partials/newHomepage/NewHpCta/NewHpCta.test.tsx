import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import NewHpCta from './index';

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

describe('NewHpCta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section with h2 title', () => {
    render(<NewHpCta />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/.+/);
  });

  it('renders subtitle paragraph', () => {
    render(<NewHpCta />);

    expect(
      screen.getByText(/Créez votre espace association/i)
    ).toBeInTheDocument();
  });

  it('renders CTA button linking to /new-club', () => {
    render(<NewHpCta />);

    const cta = screen.getByRole('link', { name: /créer mon compte/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/new-club');
    expect(cta).toHaveClass('new-hp-cta__button');
  });

  it('renders reassurance text', () => {
    render(<NewHpCta />);

    expect(
      screen.getByText(/gratuit, sans engagement/i)
    ).toBeInTheDocument();
  });

  it('renders decorative shapes with aria-hidden', () => {
    const { container } = render(<NewHpCta />);

    const shapes = container.querySelector('.new-hp-cta__shapes');
    expect(shapes).toBeInTheDocument();
    expect(shapes).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders dot grid with aria-hidden', () => {
    const { container } = render(<NewHpCta />);

    const grid = container.querySelector('.new-hp-cta__grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders three floating shape elements', () => {
    const { container } = render(<NewHpCta />);

    expect(container.querySelector('.new-hp-cta__shape--1')).toBeInTheDocument();
    expect(container.querySelector('.new-hp-cta__shape--2')).toBeInTheDocument();
    expect(container.querySelector('.new-hp-cta__shape--3')).toBeInTheDocument();
  });

  it('applies section base class with responsive padding', () => {
    const { container } = render(<NewHpCta />);

    const section = container.querySelector('.new-hp-cta');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('w-full');
    expect(section).toHaveClass('py-20');
  });

  it('renders content within max-width container', () => {
    const { container } = render(<NewHpCta />);

    const contentContainer = container.querySelector('.max-w-\\[1320px\\]');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('relative');
    expect(contentContainer).toHaveClass('z-10');
  });
});
