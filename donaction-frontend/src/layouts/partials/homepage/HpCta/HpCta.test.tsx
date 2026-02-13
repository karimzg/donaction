import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import HpCta from './index';

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

describe('HpCta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section with h2 title', () => {
    render(<HpCta />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/.+/);
  });

  it('renders subtitle paragraph', () => {
    render(<HpCta />);

    expect(
      screen.getByText(/Créez votre espace association/i)
    ).toBeInTheDocument();
  });

  it('renders CTA button linking to /new-club', () => {
    render(<HpCta />);

    const cta = screen.getByRole('link', { name: /créer mon compte/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/new-club');
    expect(cta).toHaveClass('hp-cta__button');
  });

  it('renders reassurance text', () => {
    render(<HpCta />);

    expect(
      screen.getByText(/gratuit, sans engagement/i)
    ).toBeInTheDocument();
  });

  it('renders decorative shapes with aria-hidden', () => {
    const { container } = render(<HpCta />);

    const shapes = container.querySelector('.hp-cta__shapes');
    expect(shapes).toBeInTheDocument();
    expect(shapes).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders dot grid with aria-hidden', () => {
    const { container } = render(<HpCta />);

    const grid = container.querySelector('.hp-cta__grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders three floating shape elements', () => {
    const { container } = render(<HpCta />);

    expect(container.querySelector('.hp-cta__shape--1')).toBeInTheDocument();
    expect(container.querySelector('.hp-cta__shape--2')).toBeInTheDocument();
    expect(container.querySelector('.hp-cta__shape--3')).toBeInTheDocument();
  });

  it('applies section base class with responsive padding', () => {
    const { container } = render(<HpCta />);

    const section = container.querySelector('.hp-cta');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('w-full');
    expect(section).toHaveClass('py-20');
  });

  it('renders content within max-width container', () => {
    const { container } = render(<HpCta />);

    const contentContainer = container.querySelector('.max-w-\\[1320px\\]');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('relative');
    expect(contentContainer).toHaveClass('z-10');
  });
});
