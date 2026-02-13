import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock SCSS
vi.mock('./index.scss', () => ({}));

// Stable dispatch mock (persists across renders)
const mockDispatch = vi.fn();

vi.mock('@/core/store/hooks', () => ({
	useAppDispatch: () => mockDispatch,
	useAppSelector: vi.fn(),
}));

vi.mock('@/core/store/modules/rootSlice', () => ({
	popToast: (id: string) => ({ type: 'root/popToast', payload: id }),
	selectToasts: (state: { root: { toasts: unknown[] } }) => state.root.toasts,
}));

import Toaster from './index';
import * as storeHooks from '@/core/store/hooks';

const makeToast = (
	overrides: Partial<{ id: string; title: string; type: 'success' | 'error' | 'info' | 'warn' }> = {}
) => ({
	id: 'toast-1',
	title: 'Test message',
	type: 'success' as const,
	...overrides,
});

describe('Toaster', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Rendering', () => {
		it('renders nothing when no toasts', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([]);
			const { container } = render(<Toaster />);
			expect(container.firstChild).toBeNull();
		});

		it('renders toast with correct text and icon', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			expect(screen.getByText('Test message')).toBeInTheDocument();
			expect(container.querySelector('.toastItem__icon svg')).toBeInTheDocument();
		});

		it('renders multiple toasts stacked', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([
				makeToast({ id: 'a', title: 'First' }),
				makeToast({ id: 'b', title: 'Second', type: 'error' }),
			]);
			render(<Toaster />);

			expect(screen.getByText('First')).toBeInTheDocument();
			expect(screen.getByText('Second')).toBeInTheDocument();
		});
	});

	describe('BEM type modifiers', () => {
		it.each([
			['success', '.toastItem--success'],
			['error', '.toastItem--error'],
			['info', '.toastItem--info'],
			['warn', '.toastItem--warn'],
		])('applies %s modifier class', (type, selector) => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([
				makeToast({ type: type as 'success' | 'error' | 'info' | 'warn' }),
			]);
			const { container } = render(<Toaster />);
			expect(container.querySelector(selector)).toBeInTheDocument();
		});

		it('renders all four types simultaneously', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([
				makeToast({ id: '1', type: 'success' }),
				makeToast({ id: '2', type: 'error' }),
				makeToast({ id: '3', type: 'info' }),
				makeToast({ id: '4', type: 'warn' }),
			]);
			const { container } = render(<Toaster />);
			expect(container.querySelectorAll('.toastItem')).toHaveLength(4);
		});
	});

	describe('Auto-dismiss timing', () => {
		it('adds dismissing class after TOAST_DURATION (3700ms)', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			expect(container.querySelector('.toastItem--dismissing')).toBeNull();

			act(() => {
				vi.advanceTimersByTime(3700);
			});

			expect(container.querySelector('.toastItem--dismissing')).toBeInTheDocument();
		});

		it('dispatches popToast after TOAST_DURATION + DISMISS_ANIMATION_DURATION', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast({ id: 'xyz' })]);
			render(<Toaster />);

			act(() => {
				vi.advanceTimersByTime(3700 + 400);
			});

			expect(mockDispatch).toHaveBeenCalledWith({
				type: 'root/popToast',
				payload: 'xyz',
			});
		});

		it('does not dispatch popToast before full duration', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			render(<Toaster />);

			act(() => {
				vi.advanceTimersByTime(3700);
			});

			expect(mockDispatch).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('has role="status" and aria-live="polite" on container', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			render(<Toaster />);

			const container = screen.getByRole('status');
			expect(container).toHaveAttribute('aria-live', 'polite');
		});

		it('icons have aria-hidden="true"', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			container.querySelectorAll('svg').forEach((svg) => {
				expect(svg).toHaveAttribute('aria-hidden', 'true');
			});
		});
	});

	describe('DOM structure', () => {
		it('renders toastContainer > toastItem > icon + text', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			const wrapper = container.querySelector('.toastContainer');
			expect(wrapper).toBeInTheDocument();

			const item = wrapper?.querySelector('.toastItem');
			expect(item?.querySelector('.toastItem__icon')).toBeInTheDocument();
			expect(item?.querySelector('.toastItem__text')).toHaveTextContent('Test message');
		});
	});

	describe('Redux integration', () => {
		it('calls useAppSelector with selectToasts', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([]);
			render(<Toaster />);
			expect(vi.mocked(storeHooks.useAppSelector)).toHaveBeenCalled();
		});

		it('uses stable dispatch reference for popToast', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			render(<Toaster />);

			act(() => {
				vi.advanceTimersByTime(4100);
			});

			expect(mockDispatch).toHaveBeenCalledTimes(1);
		});
	});
});
