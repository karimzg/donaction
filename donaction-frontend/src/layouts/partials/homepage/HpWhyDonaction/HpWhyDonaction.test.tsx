import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HpWhyDonaction from './index';

describe('HpWhyDonaction', () => {
  it('renders all 6 advantage cards', () => {
    render(<HpWhyDonaction />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(6);
  });

  it('renders section title', () => {
    render(<HpWhyDonaction />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/donaction/i);
  });

  it('renders card titles with key terms', () => {
    render(<HpWhyDonaction />);

    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent(/100%|transparent/i);
    expect(items[1]).toHaveTextContent(/zéro|abonnement/i);
    expect(items[2]).toHaveTextContent(/5\s*min|prêt/i);
    expect(items[3]).toHaveTextContent(/fiscal|cerfa|reçu/i);
    expect(items[4]).toHaveTextContent(/sport|pensé/i);
    expect(items[5]).toHaveTextContent(/tableau|bord|dashboard/i);
  });

  it('renders as a section with proper accessibility', () => {
    render(<HpWhyDonaction />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('aria-label');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(6);
  });

  it('renders SVG icons for each card with aria-hidden', () => {
    const { container } = render(<HpWhyDonaction />);

    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons).toHaveLength(6);

    svgIcons.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('renders card subtitles', () => {
    render(<HpWhyDonaction />);

    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent(/suivi|temps réel/i);
    expect(items[1]).toHaveTextContent(/paiement|usage/i);
    expect(items[2]).toHaveTextContent(/configuration|rapide/i);
    expect(items[3]).toHaveTextContent(/génération|automatique/i);
    expect(items[4]).toHaveTextContent(/adapté|clubs/i);
    expect(items[5]).toHaveTextContent(/statistiques|complètes/i);
  });
});
