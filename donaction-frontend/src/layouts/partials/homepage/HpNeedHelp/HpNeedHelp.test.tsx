import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HpNeedHelp from './index';
import { FaqI } from '@/core/models/hp';

// Mock next/headers
vi.mock('next/headers', () => ({
	headers: () => ({
		get: () => '/new-hp',
	}),
}));

// Mock next/link
vi.mock('next/link', () => ({
	default: ({ children, href, className }: any) => (
		<a href={href} className={className}>
			{children}
		</a>
	),
}));

const mockFaq: FaqI = {
	id: 1,
	title: 'Questions fr\u00e9quentes',
	subtitle: 'Tout ce que vous devez savoir',
	description: '',
	faq_item: [
		{
			id: 10,
			question: 'Comment fonctionne Donaction ?',
			answer: [
				{
					type: 'paragraph',
					children: [{ type: 'text', text: 'Donaction est une plateforme de dons.' }],
				},
			],
		},
		{
			id: 20,
			question: 'Les dons sont-ils d\u00e9ductibles ?',
			answer: [
				{
					type: 'paragraph',
					children: [{ type: 'text', text: '66% du montant est d\u00e9ductible.' }],
				},
			],
		},
		{
			id: 30,
			question: 'Comment contacter le support ?',
			answer: [
				{
					type: 'paragraph',
					children: [{ type: 'text', text: 'Par email ou formulaire.' }],
				},
			],
		},
	],
};

describe('HpNeedHelp', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns null when faq is undefined', () => {
		const { container } = render(<HpNeedHelp />);
		expect(container.innerHTML).toBe('');
	});

	it('returns null when faq_item is empty', () => {
		const emptyFaq: FaqI = { id: 1, faq_item: [] };
		const { container } = render(<HpNeedHelp faq={emptyFaq} />);
		expect(container.innerHTML).toBe('');
	});

	it('renders section with correct BEM class', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const section = container.querySelector('.hp-needhelp');
		expect(section).toBeInTheDocument();
		expect(section).toHaveClass('w-full');
	});

	it('renders CMS title', () => {
		render(<HpNeedHelp faq={mockFaq} />);
		const heading = screen.getByRole('heading', { level: 2 });
		expect(heading).toBeInTheDocument();
		expect(heading.textContent).toBeTruthy();
	});

	it('renders subtitle when provided', () => {
		render(<HpNeedHelp faq={mockFaq} />);
		const subtitle = screen.getByText(/tout ce que vous devez savoir/i);
		expect(subtitle).toBeInTheDocument();
	});

	it('does not render subtitle when not provided', () => {
		const faqNoSubtitle: FaqI = { ...mockFaq, subtitle: undefined };
		const { container } = render(<HpNeedHelp faq={faqNoSubtitle} />);
		const subtitle = container.querySelector('.hp-needhelp__subtitle');
		expect(subtitle).not.toBeInTheDocument();
	});

	it('renders JSON-LD script with FAQPage type', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const script = container.querySelector('script[type="application/ld+json"]');
		expect(script).toBeInTheDocument();

		const jsonLd = JSON.parse(script!.innerHTML);
		expect(jsonLd['@type']).toBe('FAQPage');
		expect(jsonLd['@context']).toBe('https://schema.org');
		expect(jsonLd.mainEntity).toHaveLength(3);
		expect(jsonLd.mainEntity[0]['@type']).toBe('Question');
	});

	it('renders all FAQ items (single DOM, no duplication)', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const items = container.querySelectorAll('.hp-needhelp__faq-item');
		expect(items).toHaveLength(3);
	});

	it('renders all trigger buttons', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const triggers = container.querySelectorAll('.hp-needhelp__faq-trigger');
		expect(triggers).toHaveLength(3);
	});

	it('first item is active by default', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const items = container.querySelectorAll('.hp-needhelp__faq-item');
		expect(items[0]).toHaveClass('hp-needhelp__faq-item--active');
		expect(items[1]).not.toHaveClass('hp-needhelp__faq-item--active');
	});

	it('first trigger has aria-expanded true by default', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const triggers = container.querySelectorAll('.hp-needhelp__faq-trigger');
		expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
		expect(triggers[1]).toHaveAttribute('aria-expanded', 'false');
	});

	it('toggles active item on click', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const triggers = container.querySelectorAll('.hp-needhelp__faq-trigger');

		fireEvent.click(triggers[1]);

		const items = container.querySelectorAll('.hp-needhelp__faq-item');
		expect(items[0]).not.toHaveClass('hp-needhelp__faq-item--active');
		expect(items[1]).toHaveClass('hp-needhelp__faq-item--active');
		expect(triggers[0]).toHaveAttribute('aria-expanded', 'false');
		expect(triggers[1]).toHaveAttribute('aria-expanded', 'true');
	});

	it('renders numbered badges for questions', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const numbers = container.querySelectorAll('.hp-needhelp__faq-number');
		expect(numbers).toHaveLength(3);
		expect(numbers[0].textContent).toBe('01');
		expect(numbers[1].textContent).toBe('02');
		expect(numbers[2].textContent).toBe('03');
	});

	it('renders desktop panel background element', () => {
		const { container } = render(<HpNeedHelp faq={mockFaq} />);
		const panel = container.querySelector('.hp-needhelp__faq-panel');
		expect(panel).toBeInTheDocument();
		expect(panel).toHaveAttribute('aria-hidden', 'true');
	});

	it('uses default title when CMS title is not provided', () => {
		const faqNoTitle: FaqI = { ...mockFaq, title: undefined };
		render(<HpNeedHelp faq={faqNoTitle} />);
		const heading = screen.getByRole('heading', { level: 2 });
		expect(heading.textContent).toBeTruthy();
	});
});
