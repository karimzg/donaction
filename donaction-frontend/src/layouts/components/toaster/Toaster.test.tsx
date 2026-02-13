import { render, screen, act, fireEvent } from '@testing-library/react';
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
	MAX_VISIBLE_TOASTS: 3,
}));

vi.mock('./actionRegistry', () => ({
	getActions: vi.fn(() => []),
	clearActions: vi.fn(),
	clearAllActions: vi.fn(),
}));

import Toaster from './index';
import * as storeHooks from '@/core/store/hooks';
import type { IToast } from '@/core/store/modules/rootSlice';
import { getActions } from './actionRegistry';

type ToastWithId = IToast & { id: string };

const makeToast = (overrides: Partial<ToastWithId> = {}): ToastWithId => ({
	id: 'toast-1',
	title: 'Test message',
	type: 'success',
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
		it('adds dismissing class after TOAST_DURATION (5000ms)', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			expect(container.querySelector('.toastItem--dismissing')).toBeNull();

			act(() => {
				vi.advanceTimersByTime(5000);
			});

			expect(container.querySelector('.toastItem--dismissing')).toBeInTheDocument();
		});

		it('dispatches popToast after TOAST_DURATION + DISMISS_ANIMATION_DURATION', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast({ id: 'xyz' })]);
			render(<Toaster />);

			act(() => {
				vi.advanceTimersByTime(5000 + 400);
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
				vi.advanceTimersByTime(5000);
			});

			expect(mockDispatch).not.toHaveBeenCalled();
		});
	});

	describe('Dismiss button', () => {
		it('renders a close button for each toast', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);
			const closeBtn = container.querySelector('.toastItem__close');
			expect(closeBtn).toBeInTheDocument();
		});

		it('close button has correct aria-label', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);
			const closeBtn = container.querySelector('.toastItem__close');
			expect(closeBtn).toHaveAttribute('aria-label', 'Dismiss notification');
		});

		it('clicking close triggers dismiss animation', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			const closeBtn = container.querySelector('.toastItem__close') as HTMLElement;
			fireEvent.click(closeBtn);

			expect(container.querySelector('.toastItem--dismissing')).toBeInTheDocument();
		});

		it('clicking close dispatches popToast after animation duration', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast({ id: 'manual-dismiss' })]);
			render(<Toaster />);

			const closeBtn = document.querySelector('.toastItem__close') as HTMLElement;
			fireEvent.click(closeBtn);

			act(() => {
				vi.advanceTimersByTime(400);
			});

			expect(mockDispatch).toHaveBeenCalledWith({
				type: 'root/popToast',
				payload: 'manual-dismiss',
			});
		});

		it('auto-dismiss still works when close is not clicked', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast({ id: 'auto' })]);
			render(<Toaster />);

			act(() => {
				vi.advanceTimersByTime(5400);
			});

			expect(mockDispatch).toHaveBeenCalledWith({
				type: 'root/popToast',
				payload: 'auto',
			});
		});
	});

	describe('Contextual action buttons', () => {
		it('does not render actions section when hasActions is falsy', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);
			expect(container.querySelector('.toastItem__actions')).toBeNull();
		});

		it('renders action buttons when hasActions is true', () => {
			vi.mocked(getActions).mockReturnValue([
				{ label: 'Undo', callback: vi.fn() },
				{ label: 'Details', callback: vi.fn() },
			]);

			vi.mocked(storeHooks.useAppSelector).mockReturnValue([
				makeToast({ hasActions: true }),
			]);
			const { container } = render(<Toaster />);

			const actionBtns = container.querySelectorAll('.toastItem__action');
			expect(actionBtns).toHaveLength(2);
			expect(actionBtns[0]).toHaveTextContent('Undo');
			expect(actionBtns[1]).toHaveTextContent('Details');
		});

		it('clicking action button calls its callback and dismisses toast', () => {
			const callbackFn = vi.fn();
			vi.mocked(getActions).mockReturnValue([
				{ label: 'Undo', callback: callbackFn },
			]);

			vi.mocked(storeHooks.useAppSelector).mockReturnValue([
				makeToast({ id: 'action-toast', hasActions: true }),
			]);
			const { container } = render(<Toaster />);

			const actionBtn = container.querySelector('.toastItem__action') as HTMLElement;
			fireEvent.click(actionBtn);

			expect(callbackFn).toHaveBeenCalledTimes(1);
			expect(container.querySelector('.toastItem--dismissing')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has role="status" and aria-live="polite" on container', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			render(<Toaster />);

			const container = screen.getByRole('status');
			expect(container).toHaveAttribute('aria-live', 'polite');
		});

		it.each([
			['success', 'Success notification'],
			['error', 'Error notification'],
			['info', 'Information notification'],
			['warn', 'Warning notification'],
		])('has aria-label for %s toast', (type, expectedLabel) => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([
				makeToast({ type: type as IToast['type'] }),
			]);
			const { container } = render(<Toaster />);
			const item = container.querySelector('.toastItem');
			expect(item).toHaveAttribute('aria-label', expectedLabel);
		});

		it('icons have aria-hidden="true"', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			container.querySelectorAll('svg').forEach((svg) => {
				expect(svg).toHaveAttribute('aria-hidden', 'true');
			});
		});

		it('dismiss button is keyboard accessible', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);
			const closeBtn = container.querySelector('.toastItem__close');
			expect(closeBtn?.tagName).toBe('BUTTON');
			expect(closeBtn).toHaveAttribute('type', 'button');
		});
	});

	describe('DOM structure', () => {
		it('renders toastContainer > toastItem > icon + text + close', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			const wrapper = container.querySelector('.toastContainer');
			expect(wrapper).toBeInTheDocument();

			const item = wrapper?.querySelector('.toastItem');
			expect(item?.querySelector('.toastItem__icon')).toBeInTheDocument();
			expect(item?.querySelector('.toastItem__text')).toHaveTextContent('Test message');
			expect(item?.querySelector('.toastItem__close')).toBeInTheDocument();
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
				vi.advanceTimersByTime(5400);
			});

			expect(mockDispatch).toHaveBeenCalledTimes(1);
		});
	});

	describe('Stacking & depth effect', () => {
		it('assigns depth-0 to a single toast (newest)', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			const item = container.querySelector('.toastItem');
			expect(item).toHaveAttribute('data-depth', '0');
			expect(item?.classList.contains('toastItem--depth-0')).toBe(false);
		});

		it('assigns increasing depth to older toasts', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([
				makeToast({ id: 'oldest', title: 'Oldest' }),
				makeToast({ id: 'middle', title: 'Middle' }),
				makeToast({ id: 'newest', title: 'Newest' }),
			]);
			const { container } = render(<Toaster />);

			const items = container.querySelectorAll('.toastItem');
			// Array order: oldest first, newest last
			expect(items[0]).toHaveAttribute('data-depth', '2'); // oldest
			expect(items[1]).toHaveAttribute('data-depth', '1'); // middle
			expect(items[2]).toHaveAttribute('data-depth', '0'); // newest
		});

		it('applies depth modifier classes for non-zero depths', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([
				makeToast({ id: 'oldest', title: 'Oldest' }),
				makeToast({ id: 'middle', title: 'Middle' }),
				makeToast({ id: 'newest', title: 'Newest' }),
			]);
			const { container } = render(<Toaster />);

			const items = container.querySelectorAll('.toastItem');
			expect(items[0].classList.contains('toastItem--depth-2')).toBe(true);
			expect(items[1].classList.contains('toastItem--depth-1')).toBe(true);
			expect(items[2].classList.contains('toastItem--depth-0')).toBe(false);
		});

		it('does not apply depth class to single toast', () => {
			vi.mocked(storeHooks.useAppSelector).mockReturnValue([makeToast()]);
			const { container } = render(<Toaster />);

			const item = container.querySelector('.toastItem');
			expect(item?.className).not.toContain('depth');
		});
	});
});
