import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NewHpReassurance from './index';

describe('NewHpReassurance', () => {
  it('renders all 4 trust badges', () => {
    render(<NewHpReassurance />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);

    // Test structure rather than exact text (i18n-friendly)
    expect(items[0]).toHaveTextContent(/paiement|payment/i);
    expect(items[1]).toHaveTextContent(/fiscal|cerfa/i);
    expect(items[2]).toHaveTextContent(/rgpd|conforme/i);
    expect(items[3]).toHaveTextContent(/activation|min/i);
  });

  it('renders badge subtitles with key terms', () => {
    render(<NewHpReassurance />);

    const items = screen.getAllByRole('listitem');

    // Check for key terms that identify each badge
    expect(items[0]).toHaveTextContent(/stripe/i);
    expect(items[1]).toHaveTextContent(/cerfa/i);
    expect(items[2]).toHaveTextContent(/rgpd/i);
    expect(items[3]).toHaveTextContent(/5\s*min/i);
  });

  it('renders as a section with proper accessibility', () => {
    render(<NewHpReassurance />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('aria-label');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });

  it('renders SVG icons for each badge with aria-hidden', () => {
    const { container } = render(<NewHpReassurance />);

    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons).toHaveLength(4);

    // All icons should be decorative (aria-hidden)
    svgIcons.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
