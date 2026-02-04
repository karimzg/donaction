import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewHpWidgetDemo from './index';

describe('NewHpWidgetDemo', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders section with correct class', () => {
		const { container } = render(<NewHpWidgetDemo />);

		const section = container.querySelector('.new-hp-widget-demo');
		expect(section).toBeInTheDocument();
		expect(section?.tagName).toBe('SECTION');
	});

	it('renders main heading', () => {
		render(<NewHpWidgetDemo />);

		const heading = screen.getByRole('heading', { level: 2 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveTextContent('Testez notre formulaire de don');
	});

	it('renders widget heading', () => {
		render(<NewHpWidgetDemo />);

		const heading = screen.getByRole('heading', { level: 3 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveTextContent('Faites un don');
	});

	it('renders 4 preset amount buttons', () => {
		const { container } = render(<NewHpWidgetDemo />);

		const amountButtons = container.querySelectorAll('.new-hp-widget-demo__amount-btn');
		expect(amountButtons).toHaveLength(4);
		expect(amountButtons[0]).toHaveTextContent('10');
		expect(amountButtons[1]).toHaveTextContent('25');
		expect(amountButtons[2]).toHaveTextContent('50');
		expect(amountButtons[3]).toHaveTextContent('100');
	});

	it('renders custom amount input', () => {
		render(<NewHpWidgetDemo />);

		const input = screen.getByRole('textbox', { name: /montant personnalisé/i });
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('placeholder', 'Autre');
	});

	it('defaults to 50€ selected', () => {
		const { container } = render(<NewHpWidgetDemo />);

		const amountButtons = container.querySelectorAll('.new-hp-widget-demo__amount-btn');
		const button50 = amountButtons[2]; // 50€ is the third button
		expect(button50).toHaveAttribute('aria-pressed', 'true');
		expect(button50).toHaveClass('active');

		expect(screen.getByTestId('amount-display')).toHaveTextContent('50');
	});

	it('calculates tax reduction correctly for 50€', () => {
		render(<NewHpWidgetDemo />);

		// 50€ * 66% = 33€ tax savings
		expect(screen.getByTestId('tax-savings')).toHaveTextContent('33');
		// 50€ - 33€ = 17€ cost after tax
		expect(screen.getByTestId('cost-after-tax')).toHaveTextContent('17');
	});

	it('updates calculation when preset amount is clicked', () => {
		render(<NewHpWidgetDemo />);

		const button100 = screen.getByRole('button', { name: /100 €/i });
		fireEvent.click(button100);

		expect(button100).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByTestId('amount-display')).toHaveTextContent('100');
		// 100€ * 66% = 66€ tax savings
		expect(screen.getByTestId('tax-savings')).toHaveTextContent('66');
		// 100€ - 66€ = 34€ cost after tax
		expect(screen.getByTestId('cost-after-tax')).toHaveTextContent('34');
	});

	it('updates calculation when custom amount is entered', () => {
		render(<NewHpWidgetDemo />);

		const input = screen.getByRole('textbox', { name: /montant personnalisé/i });
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: '200' } });

		expect(screen.getByTestId('amount-display')).toHaveTextContent('200');
		// 200€ * 66% = 132€ tax savings
		expect(screen.getByTestId('tax-savings')).toHaveTextContent('132');
		// 200€ - 132€ = 68€ cost after tax
		expect(screen.getByTestId('cost-after-tax')).toHaveTextContent('68');
	});

	it('only accepts numeric input in custom field', () => {
		render(<NewHpWidgetDemo />);

		const input = screen.getByRole('textbox', { name: /montant personnalisé/i });
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: 'abc' } });

		expect(input).toHaveValue('');
	});

	it('deselects preset when custom input is focused', () => {
		const { container } = render(<NewHpWidgetDemo />);

		const amountButtons = container.querySelectorAll('.new-hp-widget-demo__amount-btn');
		const button50 = amountButtons[2]; // 50€ is the third button
		expect(button50).toHaveAttribute('aria-pressed', 'true');

		const input = screen.getByRole('textbox', { name: /montant personnalisé/i });
		fireEvent.focus(input);

		expect(button50).toHaveAttribute('aria-pressed', 'false');
	});

	it('clears custom input when preset is clicked', () => {
		render(<NewHpWidgetDemo />);

		const input = screen.getByRole('textbox', { name: /montant personnalisé/i });
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: '75' } });

		const button25 = screen.getByRole('button', { name: /25 €/i });
		fireEvent.click(button25);

		expect(input).toHaveValue('');
		expect(button25).toHaveAttribute('aria-pressed', 'true');
	});

	it('renders disabled CTA button with demo badge', () => {
		render(<NewHpWidgetDemo />);

		const ctaButton = screen.getByRole('button', { name: /donner.*mode démo/i });
		expect(ctaButton).toBeInTheDocument();
		expect(ctaButton).toBeDisabled();
		expect(ctaButton).toHaveAttribute('aria-disabled', 'true');
	});

	it('renders disclaimer text', () => {
		render(<NewHpWidgetDemo />);

		expect(
			screen.getByText(/Ceci est une démonstration.*aucun paiement/i)
		).toBeInTheDocument();
	});

	it('renders benefits list with 3 items', () => {
		const { container } = render(<NewHpWidgetDemo />);

		const benefits = container.querySelectorAll('.new-hp-widget-demo__benefit');
		expect(benefits).toHaveLength(3);
	});

	it('renders benefits with icons having aria-hidden', () => {
		const { container } = render(<NewHpWidgetDemo />);

		const icons = container.querySelectorAll('.new-hp-widget-demo__benefit-icon[aria-hidden="true"]');
		expect(icons).toHaveLength(3);
	});

	it('has accessible widget region', () => {
		render(<NewHpWidgetDemo />);

		const region = screen.getByRole('region', { name: /simulateur de don/i });
		expect(region).toBeInTheDocument();
	});

	it('has accessible amount group', () => {
		render(<NewHpWidgetDemo />);

		const group = screen.getByRole('group', { name: /montant du don/i });
		expect(group).toBeInTheDocument();
	});

	it('fiscal section has aria-live for screen readers', () => {
		const { container } = render(<NewHpWidgetDemo />);

		const fiscal = container.querySelector('.new-hp-widget-demo__fiscal');
		expect(fiscal).toHaveAttribute('aria-live', 'polite');
	});

	it('handles zero amount correctly', () => {
		render(<NewHpWidgetDemo />);

		const input = screen.getByRole('textbox', { name: /montant personnalisé/i });
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: '' } });

		expect(screen.getByTestId('amount-display')).toHaveTextContent('0');
		expect(screen.getByTestId('tax-savings')).toHaveTextContent('0');
		expect(screen.getByTestId('cost-after-tax')).toHaveTextContent('0');
	});
});
