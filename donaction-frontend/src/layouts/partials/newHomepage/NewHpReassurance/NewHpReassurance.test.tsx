import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NewHpReassurance from './index';

describe('NewHpReassurance', () => {
  it('renders all 4 trust badges', () => {
    render(<NewHpReassurance />);

    expect(screen.getByText('Paiement sécurisé')).toBeInTheDocument();
    expect(screen.getByText('Reçu fiscal')).toBeInTheDocument();
    expect(screen.getByText('Conforme')).toBeInTheDocument();
    expect(screen.getByText('Activation')).toBeInTheDocument();
  });

  it('renders badge subtitles', () => {
    render(<NewHpReassurance />);

    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('Cerfa')).toBeInTheDocument();
    expect(screen.getByText('RGPD')).toBeInTheDocument();
    expect(screen.getByText('en 5 min')).toBeInTheDocument();
  });

  it('renders as a section with proper accessibility', () => {
    render(<NewHpReassurance />);

    const list = screen.getByRole('list', { name: /garanties et avantages/i });
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });

  it('renders SVG icons for each badge', () => {
    const { container } = render(<NewHpReassurance />);

    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBe(4);
  });
});
