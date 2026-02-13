import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before import
const mockDispatch = vi.fn();
vi.mock('@/core/store/hooks', () => ({
	useAppDispatch: () => mockDispatch,
	useAppSelector: () => null,
}));

const mockPostNewsletters = vi.fn();
const mockCreateReCaptchaToken = vi.fn();
vi.mock('@/core/services/cms', () => ({
	postNewsletters: (...args: any[]) => mockPostNewsletters(...args),
	createReCaptchaToken: (...args: any[]) => mockCreateReCaptchaToken(...args),
}));

vi.mock('@/core/store/modules/rootSlice', () => ({
	pushToast: (payload: any) => ({ type: 'root/pushToast', payload }),
}));

vi.mock('@/partials/sponsorshipForm/logic/validations', () => ({
	emailRexExp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}));

vi.mock('@/components/ScrollAnimator', () => ({
	default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<div data-testid="scroll-animator" className={className}>
			{children}
		</div>
	),
}));

import NewHpNewsletter from './index';

describe('NewHpNewsletter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateReCaptchaToken.mockResolvedValue('mock-token');
		mockPostNewsletters.mockResolvedValue({});
	});

	it('renders section with heading and form', () => {
		render(<NewHpNewsletter />);

		expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Saisissez votre e-mail')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /abonner/i })).toBeInTheDocument();
	});

	it('uses ScrollAnimator wrapper', () => {
		render(<NewHpNewsletter />);

		expect(screen.getByTestId('scroll-animator')).toBeInTheDocument();
	});

	it('shows error toast for invalid email', () => {
		render(<NewHpNewsletter />);

		const input = screen.getByPlaceholderText('Saisissez votre e-mail');
		fireEvent.change(input, { target: { value: 'invalid-email' } });
		fireEvent.submit(screen.getByRole('button', { name: /abonner/i }));

		expect(mockDispatch).toHaveBeenCalledWith(
			expect.objectContaining({
				payload: expect.objectContaining({ type: 'error' }),
			}),
		);
	});

	it('shows error toast for empty email', () => {
		render(<NewHpNewsletter />);

		fireEvent.submit(screen.getByRole('button', { name: /abonner/i }));

		expect(mockDispatch).toHaveBeenCalledWith(
			expect.objectContaining({
				payload: expect.objectContaining({ type: 'error' }),
			}),
		);
	});

	it('submits valid email and shows success state', async () => {
		render(<NewHpNewsletter />);

		const input = screen.getByPlaceholderText('Saisissez votre e-mail');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		fireEvent.submit(screen.getByRole('button', { name: /abonner/i }));

		await waitFor(() => {
			expect(mockCreateReCaptchaToken).toHaveBeenCalledWith('CREATE_NEWSLETTER_FORM');
		});

		await waitFor(() => {
			expect(mockPostNewsletters).toHaveBeenCalledWith({
				data: { email: 'test@example.com', formToken: 'mock-token' },
			});
		});

		await waitFor(() => {
			expect(screen.getByText('Merci pour votre inscription !')).toBeInTheDocument();
		});
	});

	it('shows already-subscribed message without toast when email exists', async () => {
		mockPostNewsletters.mockRejectedValue({
			error: { status: 400, message: 'This attribute must be unique' },
		});

		render(<NewHpNewsletter />);

		const input = screen.getByPlaceholderText('Saisissez votre e-mail');
		fireEvent.change(input, { target: { value: 'existing@example.com' } });
		fireEvent.submit(screen.getByRole('button', { name: /abonner/i }));

		await waitFor(() => {
			expect(screen.getByText('Vous êtes déjà inscrit(e)')).toBeInTheDocument();
		});

		// No toast dispatched for already-subscribed
		const toastCalls = mockDispatch.mock.calls.filter(
			([action]: any) => action?.type === 'root/pushToast',
		);
		expect(toastCalls).toHaveLength(0);
	});

	it('shows generic error toast on unexpected failure', async () => {
		mockPostNewsletters.mockRejectedValue(new Error('Network error'));

		render(<NewHpNewsletter />);

		const input = screen.getByPlaceholderText('Saisissez votre e-mail');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		fireEvent.submit(screen.getByRole('button', { name: /abonner/i }));

		await waitFor(() => {
			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					payload: expect.objectContaining({ type: 'error' }),
				}),
			);
		});
	});

	it('has accessible form elements', () => {
		render(<NewHpNewsletter />);

		const input = screen.getByLabelText('Adresse e-mail pour la newsletter');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('type', 'email');
		expect(input).toHaveAttribute('required');
	});

	it('shows spinner during submission', async () => {
		// Make the token promise hang to keep loading state
		mockCreateReCaptchaToken.mockReturnValue(new Promise(() => {}));

		render(<NewHpNewsletter />);

		const input = screen.getByPlaceholderText('Saisissez votre e-mail');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		fireEvent.submit(screen.getByRole('button', { name: /abonner/i }));

		await waitFor(() => {
			const button = screen.getByRole('button');
			expect(button).toBeDisabled();
			expect(button.querySelector('.new-hp-newsletter__spinner')).toBeInTheDocument();
		});
	});

	it('has aria-live region for screen reader feedback', () => {
		render(<NewHpNewsletter />);

		const liveRegion = screen.getByRole('status');
		expect(liveRegion).toBeInTheDocument();
		expect(liveRegion).toHaveAttribute('aria-live', 'polite');
	});

	it('trims whitespace from email before submission', async () => {
		render(<NewHpNewsletter />);

		const input = screen.getByPlaceholderText('Saisissez votre e-mail');
		fireEvent.change(input, { target: { value: '  test@example.com  ' } });
		fireEvent.submit(screen.getByRole('button', { name: /abonner/i }));

		await waitFor(() => {
			expect(mockPostNewsletters).toHaveBeenCalledWith({
				data: { email: 'test@example.com', formToken: 'mock-token' },
			});
		});
	});
});
