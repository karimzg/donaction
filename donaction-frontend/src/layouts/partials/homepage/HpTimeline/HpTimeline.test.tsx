import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HpTimeline from './index';

// Mock IntersectionObserver
beforeEach(() => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

describe('HpTimeline', () => {
  it('renders section title', () => {
    render(<HpTimeline />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/étapes/i);
  });

  it('renders all 4 timeline steps', () => {
    render(<HpTimeline />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });

  it('renders step titles', () => {
    render(<HpTimeline />);
    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent(/compte/i);
    expect(items[1]).toHaveTextContent(/stripe/i);
    expect(items[2]).toHaveTextContent(/document/i);
    expect(items[3]).toHaveTextContent(/personnaliser/i);
  });

  it('renders duration badges', () => {
    render(<HpTimeline />);
    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent(/2\s*min/i);
    expect(items[1]).toHaveTextContent(/5\s*min/i);
    expect(items[2]).toHaveTextContent(/variable/i);
    expect(items[3]).toHaveTextContent(/5\s*min/i);
  });

  it('renders step descriptions', () => {
    render(<HpTimeline />);
    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent(/inscription/i);
    expect(items[1]).toHaveTextContent(/configuration/i);
    expect(items[2]).toHaveTextContent(/statuts/i);
    expect(items[3]).toHaveTextContent(/logo/i);
  });

  it('renders list with accessibility label', () => {
    render(<HpTimeline />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('aria-label');
  });

  it('renders SVG icons with aria-hidden', () => {
    const { container } = render(<HpTimeline />);
    const hiddenSvgs = container.querySelectorAll('svg[aria-hidden="true"]');
    // 4 step icons + 2 connecting line SVGs (desktop + mobile)
    expect(hiddenSvgs.length).toBeGreaterThanOrEqual(4);
  });

  it('renders step number badges', () => {
    const { container } = render(<HpTimeline />);
    const numberBadges = container.querySelectorAll(
      '.hp-timeline__step-number'
    );
    expect(numberBadges).toHaveLength(4);

    expect(numberBadges[0]).toHaveTextContent('1');
    expect(numberBadges[1]).toHaveTextContent('2');
    expect(numberBadges[2]).toHaveTextContent('3');
    expect(numberBadges[3]).toHaveTextContent('4');
  });

  it('applies CSS variable for step index', () => {
    const { container } = render(<HpTimeline />);
    const steps = container.querySelectorAll('.hp-timeline__step');

    steps.forEach((step, index) => {
      expect(step).toHaveStyle({ '--step-index': index.toString() });
    });
  });
});
