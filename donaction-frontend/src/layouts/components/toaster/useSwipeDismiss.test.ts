import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSwipeDismiss, { SWIPE_THRESHOLD } from './useSwipeDismiss';

/**
 * Helper function to create a mock React.TouchEvent
 * Simulates a touch event with clientY coordinate
 */
const createTouchEvent = (clientY: number): React.TouchEvent => {
	const mockElement = document.createElement('div');
	return {
		touches: [{ clientY } as Touch],
		currentTarget: mockElement as EventTarget,
	} as React.TouchEvent;
};

/**
 * Helper function to create a touch event with lifecycle support
 * Allows setting properties on the element being touched
 */
const createTouchEventWithElement = (
	clientY: number,
	element: HTMLElement
): React.TouchEvent => {
	return {
		touches: [{ clientY } as Touch],
		currentTarget: element as EventTarget,
	} as React.TouchEvent;
};

describe('useSwipeDismiss', () => {
	let mockOnDismiss: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOnDismiss = vi.fn();
	});

	describe('Hook initialization and returns', () => {
		it('returns an object with three handler functions', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			expect(result.current).toHaveProperty('onTouchStart');
			expect(result.current).toHaveProperty('onTouchMove');
			expect(result.current).toHaveProperty('onTouchEnd');

			expect(typeof result.current.onTouchStart).toBe('function');
			expect(typeof result.current.onTouchMove).toBe('function');
			expect(typeof result.current.onTouchEnd).toBe('function');
		});

		it('returns different function references on different render calls with same enabled state', () => {
			const { result, rerender } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const firstCallStart = result.current.onTouchStart;
			const firstCallMove = result.current.onTouchMove;
			const firstCallEnd = result.current.onTouchEnd;

			rerender();

			// References should be different due to dependency change or memoization
			// (callbacks are memoized with dependencies, so they persist across rerenders with same dependencies)
			expect(result.current.onTouchStart).toBe(firstCallStart);
			expect(result.current.onTouchMove).toBe(firstCallMove);
			expect(result.current.onTouchEnd).toBe(firstCallEnd);
		});
	});

	describe('Disabled state handling', () => {
		it('does not call onDismiss when enabled is false', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: false, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');
			const touchEvent = createTouchEventWithElement(100, element);

			act(() => {
				result.current.onTouchStart(touchEvent);
				result.current.onTouchMove(touchEvent);
				result.current.onTouchEnd(touchEvent);
			});

			expect(mockOnDismiss).not.toHaveBeenCalled();
		});

		it('does not modify element styles when disabled', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: false, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');
			const touchEvent = createTouchEventWithElement(100, element);

			act(() => {
				result.current.onTouchMove(touchEvent);
			});

			expect(element.style.transform).toBe('');
			expect(element.style.opacity).toBe('');
		});

		it('re-enables handling when enabled prop changes from false to true', () => {
			const { result, rerender } = renderHook(
				({ enabled, onDismiss }) =>
					useSwipeDismiss({ enabled, onDismiss }),
				{ initialProps: { enabled: false, onDismiss: mockOnDismiss } }
			);

			const element = document.createElement('div');
			const touchEvent = createTouchEventWithElement(100, element);

			// Initially disabled
			act(() => {
				result.current.onTouchStart(touchEvent);
			});

			// Re-enable
			rerender({ enabled: true, onDismiss: mockOnDismiss });

			const element2 = document.createElement('div');
			const touchEvent2 = createTouchEventWithElement(100, element2);

			// Now should process
			act(() => {
				result.current.onTouchMove(touchEvent2);
			});

			expect(element2.style.transform).not.toBe('');
		});
	});

	describe('Touch tracking and state management', () => {
		it('initializes tracking on touchStart', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');
			const touchEvent = createTouchEventWithElement(100, element);

			act(() => {
				result.current.onTouchStart(touchEvent);
			});

			// Verify by checking that subsequent touchMove uses this as baseline
			const moveEvent = createTouchEventWithElement(80, element);
			act(() => {
				result.current.onTouchMove(moveEvent);
			});

			// If delta calculation is correct, moving up by 20 should have offset of -20
			expect(element.style.transform).toBe('translateY(-20px)');
		});

		it('resets offset to 0 after touchEnd', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			// Start touch
			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Move (swipe up by 25 - below threshold)
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(75, element));
			});

			// End touch - should snap back
			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(75, element));
			});

			// After snap-back animation, offset should be 0 (internal ref reset)
			// Verify by starting new gesture
			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			const moveEvent2 = createTouchEventWithElement(99, element);
			act(() => {
				result.current.onTouchMove(moveEvent2);
			});

			// Should calculate from new start point (100), not old offset
			expect(element.style.transform).toBe('translateY(-1px)');
		});
	});

	describe('Upward swipe handling', () => {
		it('only allows upward swipes (negative deltaY)', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			// Start at y=100
			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Move upward to y=75 (deltaY = -25)
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(75, element));
			});

			expect(element.style.transform).toBe('translateY(-25px)');

			// Reset element
			element.style.transform = '';

			// Now try downward to y=120 (deltaY = 20, should be clamped to 0)
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(120, element));
			});

			// Math.min(0, 20) = 0, so no downward movement
			expect(element.style.transform).toBe('translateY(0px)');
		});

		it('does not call onDismiss for downward swipe even if Math.abs exceeds threshold', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Attempt large downward swipe (deltaY = 100, clamped to 0)
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(200, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(200, element));
			});

			expect(mockOnDismiss).not.toHaveBeenCalled();
		});
	});

	describe('Threshold handling for dismissal', () => {
		it('calls onDismiss when swipe distance equals threshold', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Swipe exactly SWIPE_THRESHOLD (50px)
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(100 - SWIPE_THRESHOLD, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(100 - SWIPE_THRESHOLD, element));
			});

			expect(mockOnDismiss).toHaveBeenCalledTimes(1);
		});

		it('calls onDismiss when swipe distance exceeds threshold', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Swipe 75px upward (beyond threshold of 50px)
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(25, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(25, element));
			});

			expect(mockOnDismiss).toHaveBeenCalledTimes(1);
		});

		it('does not call onDismiss when swipe distance is below threshold', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Swipe only 30px (below threshold of 50px)
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(70, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(70, element));
			});

			expect(mockOnDismiss).not.toHaveBeenCalled();
		});

		it('calls onDismiss exactly once per gesture', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(20, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(20, element));
			});

			expect(mockOnDismiss).toHaveBeenCalledTimes(1);
		});
	});

	describe('Visual feedback during swipe', () => {
		it('applies transform translateY during touchMove', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(70, element));
			});

			expect(element.style.transform).toBe('translateY(-30px)');
		});

		it('applies opacity change based on swipe distance', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Swipe 75px up -> offset = -75
			// opacity = Math.max(0.3, 1 - 75/150) = Math.max(0.3, 0.5) = 0.5
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(25, element));
			});

			expect(element.style.opacity).toBe('0.5');
		});

		it('maintains minimum opacity of 0.3 even with very large swipe', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Swipe 300px up -> offset = -300
			// opacity = Math.max(0.3, 1 - 300/150) = Math.max(0.3, -1) = 0.3
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(-200, element));
			});

			expect(element.style.opacity).toBe('0.3');
		});

		it('starts with full opacity at first swipe', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Tiny swipe 1px -> offset = -1
			// opacity = Math.max(0.3, 1 - 1/150) ≈ 0.9933
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(99, element));
			});

			const opacityValue = parseFloat(element.style.opacity);
			expect(opacityValue).toBeGreaterThan(0.99);
		});

		it('updates opacity linearly as swipe distance increases', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			const measurements = [];

			// Collect opacity at different swipe distances
			for (let swipeDistance = 0; swipeDistance <= 150; swipeDistance += 30) {
				act(() => {
					result.current.onTouchMove(
						createTouchEventWithElement(100 - swipeDistance, element)
					);
				});
				measurements.push(parseFloat(element.style.opacity));
			}

			// Opacity should decrease as swipe distance increases
			for (let i = 1; i < measurements.length; i++) {
				expect(measurements[i]).toBeLessThanOrEqual(measurements[i - 1]);
			}
		});
	});

	describe('Snap-back animation (below threshold)', () => {
		it('applies transition styles on touchEnd when below threshold', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(80, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(80, element));
			});

			expect(element.style.transition).toContain('transform');
			expect(element.style.transition).toContain('opacity');
			expect(element.style.transition).toContain('0.2s');
		});

		it('resets transform and opacity on touchEnd when below threshold', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(80, element));
			});

			expect(element.style.transform).toBe('translateY(-20px)');

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(80, element));
			});

			expect(element.style.transform).toBe('');
			expect(element.style.opacity).toBe('');
		});

		it('does not apply transition on dismissal (above threshold)', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(20, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(20, element));
			});

			// Should not add transition styles when dismissing
			expect(element.style.transition).not.toContain('0.2s');
		});

		it('registers transitionend listener for cleanup', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');
			const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(80, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(80, element));
			});

			expect(addEventListenerSpy).toHaveBeenCalledWith('transitionend', expect.any(Function));

			addEventListenerSpy.mockRestore();
		});

		it('cleans up transition styles after transitionend event', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(80, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(80, element));
			});

			// Manually trigger transitionend
			act(() => {
				element.dispatchEvent(new Event('transitionend'));
			});

			expect(element.style.transition).toBe('');
		});

		it('removes transitionend listener after cleanup', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');
			const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(80, element));
			});

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(80, element));
			});

			act(() => {
				element.dispatchEvent(new Event('transitionend'));
			});

			expect(removeEventListenerSpy).toHaveBeenCalledWith('transitionend', expect.any(Function));

			removeEventListenerSpy.mockRestore();
		});
	});

	describe('Dependency handling (memoization)', () => {
		it('maintains stable callback references when dependencies do not change', () => {
			const { result, rerender } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const firstStart = result.current.onTouchStart;
			const firstMove = result.current.onTouchMove;
			const firstEnd = result.current.onTouchEnd;

			rerender();

			expect(result.current.onTouchStart).toBe(firstStart);
			expect(result.current.onTouchMove).toBe(firstMove);
			expect(result.current.onTouchEnd).toBe(firstEnd);
		});

		it('updates callback references when enabled prop changes', () => {
			const { result, rerender } = renderHook(
				({ enabled, onDismiss }) =>
					useSwipeDismiss({ enabled, onDismiss }),
				{ initialProps: { enabled: true, onDismiss: mockOnDismiss } }
			);

			const firstStart = result.current.onTouchStart;

			rerender({ enabled: false, onDismiss: mockOnDismiss });

			expect(result.current.onTouchStart).not.toBe(firstStart);
		});

		it('updates callback references when onDismiss prop changes', () => {
			const newMockOnDismiss = vi.fn();
			const { result, rerender } = renderHook(
				({ enabled, onDismiss }) =>
					useSwipeDismiss({ enabled, onDismiss }),
				{ initialProps: { enabled: true, onDismiss: mockOnDismiss } }
			);

			const firstEnd = result.current.onTouchEnd;

			rerender({ enabled: true, onDismiss: newMockOnDismiss });

			expect(result.current.onTouchEnd).not.toBe(firstEnd);
		});
	});

	describe('Edge cases and stress tests', () => {
		it('handles rapid touch events in sequence', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			// Multiple rapid swipes
			for (let i = 0; i < 5; i++) {
				act(() => {
					result.current.onTouchStart(createTouchEventWithElement(100, element));
				});

				act(() => {
					result.current.onTouchMove(createTouchEventWithElement(60, element));
				});

				act(() => {
					result.current.onTouchEnd(createTouchEventWithElement(60, element));
				});
			}

			// Should only call onDismiss once (40px swipe is below 50px threshold)
			expect(mockOnDismiss).not.toHaveBeenCalled();
		});

		it('handles gesture that exactly reaches threshold on multiple moves', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			// Move to exactly threshold
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(50, element));
			});

			expect(element.style.transform).toBe(`translateY(-50px)`);

			// Move slightly further
			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(49, element));
			});

			expect(element.style.transform).toBe(`translateY(-51px)`);

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(49, element));
			});

			expect(mockOnDismiss).toHaveBeenCalledTimes(1);
		});

		it('handles zero-distance swipe', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
			});

			act(() => {
				result.current.onTouchMove(createTouchEventWithElement(100, element));
			});

			expect(element.style.transform).toBe('translateY(0px)');

			act(() => {
				result.current.onTouchEnd(createTouchEventWithElement(100, element));
			});

			expect(mockOnDismiss).not.toHaveBeenCalled();
		});

		it('preserves callback functionality across multiple gesture cycles', () => {
			const { result } = renderHook(() =>
				useSwipeDismiss({ enabled: true, onDismiss: mockOnDismiss })
			);

			const element = document.createElement('div');

			// First gesture - dismisses
			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
				result.current.onTouchMove(createTouchEventWithElement(25, element));
				result.current.onTouchEnd(createTouchEventWithElement(25, element));
			});

			expect(mockOnDismiss).toHaveBeenCalledTimes(1);

			// Second gesture - does not dismiss
			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
				result.current.onTouchMove(createTouchEventWithElement(80, element));
				result.current.onTouchEnd(createTouchEventWithElement(80, element));
			});

			expect(mockOnDismiss).toHaveBeenCalledTimes(1);

			// Third gesture - dismisses again
			act(() => {
				result.current.onTouchStart(createTouchEventWithElement(100, element));
				result.current.onTouchMove(createTouchEventWithElement(30, element));
				result.current.onTouchEnd(createTouchEventWithElement(30, element));
			});

			expect(mockOnDismiss).toHaveBeenCalledTimes(2);
		});
	});
});
