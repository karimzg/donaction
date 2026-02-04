import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewHpReassurance from './index';

describe('NewHpReassurance', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders section with correct role', () => {
		const { container } = render(<NewHpReassurance />);

		const section = container.querySelector('.new-hp-reassurance');
		expect(section).toBeInTheDocument();
		expect(section?.tagName).toBe('SECTION');
	});

	it('renders 4 trust badges', () => {
		render(<NewHpReassurance />);

		const badges = screen.getAllByRole('listitem');
		expect(badges).toHaveLength(4);
	});

	it('renders all badge titles', () => {
		render(<NewHpReassurance />);

		expect(screen.getByText('Paiement sécurisé')).toBeInTheDocument();
		expect(screen.getByText('Reçu fiscal')).toBeInTheDocument();
		expect(screen.getByText('Conforme')).toBeInTheDocument();
		expect(screen.getByText('Activation')).toBeInTheDocument();
	});

	it('renders all badge subtitles', () => {
		render(<NewHpReassurance />);

		expect(screen.getByText('Stripe')).toBeInTheDocument();
		expect(screen.getByText('Cerfa')).toBeInTheDocument();
		expect(screen.getByText('RGPD')).toBeInTheDocument();
		expect(screen.getByText('en 5 min')).toBeInTheDocument();
	});

	it('renders icons with aria-hidden for accessibility', () => {
		const { container } = render(<NewHpReassurance />);

		const icons = container.querySelectorAll('[aria-hidden="true"]');
		expect(icons).toHaveLength(4);
	});

	it('uses semantic list structure', () => {
		render(<NewHpReassurance />);

		const list = screen.getByRole('list');
		expect(list).toBeInTheDocument();
		expect(list).toHaveClass('new-hp-reassurance__grid');
	});

	it('applies background styling class', () => {
		const { container } = render(<NewHpReassurance />);

		const section = container.querySelector('.new-hp-reassurance');
		expect(section).toHaveClass('bg-gray-50');
	});

	it('badge elements support hover interactions', () => {
		const { container } = render(<NewHpReassurance />);

		const badge = container.querySelector('.new-hp-reassurance__badge');
		expect(badge).toBeInTheDocument();

		// Verify badge can receive mouse events (hover capability)
		fireEvent.mouseEnter(badge!);
		fireEvent.mouseLeave(badge!);

		// Badge should still be in document after hover interactions
		expect(badge).toBeInTheDocument();
	});
});
