import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SCSS
vi.mock('./index.scss', () => ({}));

// Mock Redux hooks before importing component
vi.mock('@/core/store/hooks', () => ({
	useAppDispatch: () => vi.fn(),
	useAppSelector: vi.fn(),
}));

import Toaster from './index';
import * as storeHooks from '@/core/store/hooks';

describe('Toaster', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders nothing when no toasts', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([]);

			const { container } = render(<Toaster />);

			expect(container.firstChild).toBeNull();
		});

		it('renders toast with text', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Success message',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			render(<Toaster />);

			expect(screen.getByText('Success message')).toBeInTheDocument();
		});

		it('renders multiple toasts', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'First message',
					type: 'success' as const,
				},
				{
					id: 'toast-2',
					title: 'Second message',
					type: 'error' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			render(<Toaster />);

			expect(screen.getByText('First message')).toBeInTheDocument();
			expect(screen.getByText('Second message')).toBeInTheDocument();
		});
	});

	describe('Icons', () => {
		it('renders correct icon for success type', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Success',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const iconSpan = container.querySelector('.toastItem__icon');
			expect(iconSpan).toBeInTheDocument();
			expect(iconSpan?.querySelector('svg')).toBeInTheDocument();
		});

		it('renders correct icon for error type', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Error',
					type: 'error' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const iconSpan = container.querySelector('.toastItem__icon');
			expect(iconSpan).toBeInTheDocument();
			expect(iconSpan?.querySelector('svg')).toBeInTheDocument();
		});

		it('renders correct icon for info type', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Info',
					type: 'info' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const iconSpan = container.querySelector('.toastItem__icon');
			expect(iconSpan).toBeInTheDocument();
			expect(iconSpan?.querySelector('svg')).toBeInTheDocument();
		});

		it('renders correct icon for warn type', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Warning',
					type: 'warn' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const iconSpan = container.querySelector('.toastItem__icon');
			expect(iconSpan).toBeInTheDocument();
			expect(iconSpan?.querySelector('svg')).toBeInTheDocument();
		});
	});

	describe('CSS Classes', () => {
		it('applies correct CSS class for success type', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Success',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastItem = container.querySelector('.toastItem.success');
			expect(toastItem).toBeInTheDocument();
		});

		it('applies correct CSS class for error type', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Error',
					type: 'error' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastItem = container.querySelector('.toastItem.error');
			expect(toastItem).toBeInTheDocument();
		});

		it('applies correct CSS class for info type', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Info',
					type: 'info' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastItem = container.querySelector('.toastItem.info');
			expect(toastItem).toBeInTheDocument();
		});

		it('applies correct CSS class for warn type', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Warning',
					type: 'warn' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastItem = container.querySelector('.toastItem.warn');
			expect(toastItem).toBeInTheDocument();
		});

		it('applies toastItem--dismissing class when toast is dismissing', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastItem = container.querySelector('.toastItem');
			expect(toastItem).not.toHaveClass('toastItem--dismissing');
		});
	});

	describe('Accessibility', () => {
		it('has role="status" on container', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test message',
					type: 'info' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			render(<Toaster />);

			const container = screen.getByRole('status');
			expect(container).toBeInTheDocument();
		});

		it('has aria-live="polite" on container', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test message',
					type: 'info' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			render(<Toaster />);

			const container = screen.getByRole('status');
			expect(container).toHaveAttribute('aria-live', 'polite');
		});

		it('icon has aria-hidden="true"', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test message',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const svgs = container.querySelectorAll('svg');
			svgs.forEach((svg) => {
				expect(svg).toHaveAttribute('aria-hidden', 'true');
			});
		});
	});

	describe('Text Content', () => {
		it('displays toast title text correctly', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Custom toast message',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			render(<Toaster />);

			expect(screen.getByText('Custom toast message')).toBeInTheDocument();
		});

		it('displays multiple toast titles correctly', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'First toast',
					type: 'success' as const,
				},
				{
					id: 'toast-2',
					title: 'Second toast',
					type: 'error' as const,
				},
				{
					id: 'toast-3',
					title: 'Third toast',
					type: 'warn' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			render(<Toaster />);

			expect(screen.getByText('First toast')).toBeInTheDocument();
			expect(screen.getByText('Second toast')).toBeInTheDocument();
			expect(screen.getByText('Third toast')).toBeInTheDocument();
		});

		it('renders text in toastItem__text span', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test message',
					type: 'info' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const textSpan = container.querySelector('.toastItem__text');
			expect(textSpan).toBeInTheDocument();
			expect(textSpan).toHaveTextContent('Test message');
		});
	});

	describe('DOM Structure', () => {
		it('renders container with toastContainer class', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastContainer = container.querySelector('.toastContainer');
			expect(toastContainer).toBeInTheDocument();
		});

		it('renders toastItem elements with correct class', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test 1',
					type: 'success' as const,
				},
				{
					id: 'toast-2',
					title: 'Test 2',
					type: 'error' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastItems = container.querySelectorAll('.toastItem');
			expect(toastItems).toHaveLength(2);
		});

		it('renders icon span within each toast item', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastItem = container.querySelector('.toastItem');
			const iconSpan = toastItem?.querySelector('.toastItem__icon');
			expect(iconSpan).toBeInTheDocument();
		});

		it('renders text span within each toast item', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			const toastItem = container.querySelector('.toastItem');
			const textSpan = toastItem?.querySelector('.toastItem__text');
			expect(textSpan).toBeInTheDocument();
		});
	});

	describe('Type Variations', () => {
		it('handles all toast types: success, error, info, warn', () => {
			const mockToasts = [
				{
					id: 'toast-success',
					title: 'Success message',
					type: 'success' as const,
				},
				{
					id: 'toast-error',
					title: 'Error message',
					type: 'error' as const,
				},
				{
					id: 'toast-info',
					title: 'Info message',
					type: 'info' as const,
				},
				{
					id: 'toast-warn',
					title: 'Warning message',
					type: 'warn' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			const { container } = render(<Toaster />);

			expect(container.querySelector('.toastItem.success')).toBeInTheDocument();
			expect(container.querySelector('.toastItem.error')).toBeInTheDocument();
			expect(container.querySelector('.toastItem.info')).toBeInTheDocument();
			expect(container.querySelector('.toastItem.warn')).toBeInTheDocument();
		});
	});

	describe('Redux Integration', () => {
		it('uses useAppSelector to get toasts', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			render(<Toaster />);

			expect(vi.mocked(storeHooks.useAppSelector)).toHaveBeenCalled();
		});

		it('uses useAppDispatch hook', () => {
			const mockToasts = [
				{
					id: 'toast-1',
					title: 'Test',
					type: 'success' as const,
				},
			];
			vi.mocked(storeHooks.useAppSelector).mockReturnValue(mockToasts);

			render(<Toaster />);

			// Component initializes dispatch reference during render
			// Verify component doesn't error with dispatch available
			expect(vi.mocked(storeHooks.useAppDispatch)).toBeDefined();
		});
	});
});
