import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewHpWhyDonaction from './index';

describe('NewHpWhyDonaction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders section with correct class', () => {
		const { container } = render(<NewHpWhyDonaction />);

		const section = container.querySelector('.new-hp-why-donaction');
		expect(section).toBeInTheDocument();
		expect(section?.tagName).toBe('SECTION');
	});

	it('renders 6 advantage cards', () => {
		render(<NewHpWhyDonaction />);

		const cards = screen.getAllByRole('listitem');
		expect(cards).toHaveLength(6);
	});

	it('renders section title', () => {
		render(<NewHpWhyDonaction />);

		const heading = screen.getByRole('heading', { level: 2 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveTextContent('Pourquoi choisir DONACTION ?');
	});

	it('renders all advantage titles', () => {
		render(<NewHpWhyDonaction />);

		expect(screen.getByText('100% Transparent')).toBeInTheDocument();
		expect(screen.getByText('Zéro abonnement')).toBeInTheDocument();
		expect(screen.getByText('Prêt en 5 min')).toBeInTheDocument();
		expect(screen.getByText('Reçus fiscaux auto')).toBeInTheDocument();
		expect(screen.getByText('Pensé pour le sport')).toBeInTheDocument();
		expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
	});

	it('renders all advantage descriptions', () => {
		render(<NewHpWhyDonaction />);

		expect(screen.getByText(/Aucun frais caché/)).toBeInTheDocument();
		expect(screen.getByText(/Payez uniquement sur les dons/)).toBeInTheDocument();
		expect(screen.getByText(/Créez votre page de collecte/)).toBeInTheDocument();
		expect(screen.getByText(/Génération automatique des Cerfa/)).toBeInTheDocument();
		expect(screen.getByText(/Des outils adaptés aux associations/)).toBeInTheDocument();
		expect(screen.getByText(/Suivez vos collectes et donateurs/)).toBeInTheDocument();
	});

	it('renders icons with aria-hidden for accessibility', () => {
		const { container } = render(<NewHpWhyDonaction />);

		const icons = container.querySelectorAll('[aria-hidden="true"]');
		expect(icons).toHaveLength(6);
	});

	it('uses semantic list structure', () => {
		render(<NewHpWhyDonaction />);

		const list = screen.getByRole('list');
		expect(list).toBeInTheDocument();
		expect(list).toHaveClass('new-hp-why-donaction__grid');
	});

	it('renders card elements with correct structure', () => {
		const { container } = render(<NewHpWhyDonaction />);

		const cards = container.querySelectorAll('.new-hp-why-donaction__card');
		expect(cards).toHaveLength(6);

		const firstCard = cards[0];
		expect(firstCard.querySelector('.new-hp-why-donaction__icon')).toBeInTheDocument();
		expect(firstCard.querySelector('.new-hp-why-donaction__title')).toBeInTheDocument();
		expect(firstCard.querySelector('.new-hp-why-donaction__description')).toBeInTheDocument();
	});

	it('card elements support hover interactions', () => {
		const { container } = render(<NewHpWhyDonaction />);

		const card = container.querySelector('.new-hp-why-donaction__card');
		expect(card).toBeInTheDocument();

		fireEvent.mouseEnter(card!);
		fireEvent.mouseLeave(card!);

		expect(card).toBeInTheDocument();
	});

	it('renders subtitle paragraph', () => {
		render(<NewHpWhyDonaction />);

		expect(
			screen.getByText(/Tout ce dont votre association a besoin/)
		).toBeInTheDocument();
	});
});
