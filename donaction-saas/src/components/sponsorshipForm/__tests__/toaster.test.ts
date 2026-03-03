import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  dispatchToast,
  clearAllToasts,
  __testing__,
} from '../logic/toaster';

// ============================================================================
// Test Setup & Utilities
// ============================================================================

let mockShadowRoot: ShadowRoot;
let mockHost: HTMLDivElement;

/**
 * Create a real shadow DOM for testing
 */
function createMockShadowRoot(): ShadowRoot {
  const host = document.createElement('div');
  host.id = 'mock-form-host';
  document.body.appendChild(host);
  return host.attachShadow({ mode: 'open' });
}

/**
 * Setup mock for document.querySelector to return element with shadowRoot
 */
function mockShadowRootLookup(): void {
  const mockElement = {
    shadowRoot: mockShadowRoot,
  };
  vi.spyOn(document, 'querySelector').mockReturnValue(
    mockElement as unknown as Element
  );
}

/**
 * Set viewport width for mobile detection
 */
function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true,
  });
}

// ============================================================================
// Test Hooks
// ============================================================================

beforeEach(() => {
  vi.useFakeTimers();
  mockShadowRoot = createMockShadowRoot();
  mockHost = document.querySelector('#mock-form-host') as HTMLDivElement;
  mockShadowRootLookup();
  setViewportWidth(1024); // Default desktop
  __testing__.resetState();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  if (mockHost && mockHost.parentElement) {
    mockHost.remove();
  }
  __testing__.resetState();
});

// ============================================================================
// 1. Toast Container Management
// ============================================================================

describe('Toast Container Management', () => {
  it('creates container on first toast', () => {
    dispatchToast('Test message', 'success');

    const container = __testing__.getToastContainer();
    expect(container).not.toBeNull();
    expect(container?.classList.contains('don-toastContainer')).toBe(true);
  });

  it('reuses existing container for subsequent toasts', () => {
    dispatchToast('First toast', 'success');
    const firstContainer = __testing__.getToastContainer();

    dispatchToast('Second toast', 'error');
    const secondContainer = __testing__.getToastContainer();

    expect(firstContainer).toBe(secondContainer);
    expect(mockShadowRoot.querySelectorAll('.don-toastContainer').length).toBe(1);
  });

  it('container has correct accessibility attributes', () => {
    dispatchToast('Test message', 'info');

    const container = __testing__.getToastContainer();
    expect(container?.getAttribute('role')).toBe('status');
    expect(container?.getAttribute('aria-live')).toBe('polite');
    expect(container?.getAttribute('aria-atomic')).toBe('false');
  });

  it('removes container after last toast dismissed and removed', () => {
    dispatchToast('Test message', 'success');
    vi.runAllTimers();

    expect(__testing__.getToastContainer()).toBeNull();
  });

  it('does not remove container while toasts remain', () => {
    dispatchToast('First toast', 'success');
    dispatchToast('Second toast', 'error');

    const activeToasts = __testing__.getActiveToasts();
    expect(activeToasts.length).toBe(2);

    // Dismiss first toast only
    const closeButton = mockShadowRoot.querySelector('[data-toast-id="0"] .don-toast__close') as HTMLButtonElement;
    closeButton.click();
    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DISMISS_ANIMATION_DURATION);

    // Container should still exist because second toast remains
    const container = __testing__.getToastContainer();
    expect(container).not.toBeNull();
    expect(__testing__.getActiveToasts().length).toBe(1);
  });
});

// ============================================================================
// 2. Toast Element Structure
// ============================================================================

describe('Toast Element Structure', () => {
  it('creates div with correct classes for type', () => {
    dispatchToast('Test message', 'success');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast).not.toBeNull();
    expect(toast.classList.contains('don-toast')).toBe(true);
    expect(toast.classList.contains('don-toast--success')).toBe(true);
  });

  it('sets data-toast-id attribute', () => {
    dispatchToast('Test message', 'error');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.getAttribute('data-toast-id')).toBe('0');
  });

  it('sets aria-label based on toast type', () => {
    dispatchToast('Test message', 'warn');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.getAttribute('aria-label')).toBe('Warning notification');
  });

  it('creates icon div with SVG', () => {
    dispatchToast('Test message', 'success');

    const icon = mockShadowRoot.querySelector('.don-toast__icon') as HTMLDivElement;
    expect(icon).not.toBeNull();
    expect(icon.querySelector('svg')).not.toBeNull();
    expect(icon.innerHTML).toContain('<svg');
  });

  it('creates text div with message content', () => {
    const message = 'This is a test message';
    dispatchToast(message, 'info');

    const textElement = mockShadowRoot.querySelector('.don-toast__text') as HTMLDivElement;
    expect(textElement).not.toBeNull();
    expect(textElement.textContent).toBe(message);
  });

  it('creates close button with correct attributes', () => {
    dispatchToast('Test message', 'success');

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    expect(closeButton).not.toBeNull();
    expect(closeButton.type).toBe('button');
    expect(closeButton.getAttribute('aria-label')).toBe('Dismiss notification');
    expect(closeButton.innerHTML).toContain('<svg');
  });

  it('verifies toast DOM hierarchy', () => {
    dispatchToast('Test message', 'error');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    const children = Array.from(toast.children) as HTMLElement[];

    expect(children[0].classList.contains('don-toast__icon')).toBe(true);
    expect(children[1].classList.contains('don-toast__text')).toBe(true);
    expect(children[2].classList.contains('don-toast__close')).toBe(true);
  });
});

// ============================================================================
// 3. Type Mapping (Backward Compatibility)
// ============================================================================

describe('Type Mapping (Legacy Compatibility)', () => {
  it('maps DANGER to error', () => {
    dispatchToast('Test message', 'DANGER');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.classList.contains('don-toast--error')).toBe(true);
  });

  it('maps WARNING to warn', () => {
    dispatchToast('Test message', 'WARNING');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.classList.contains('don-toast--warn')).toBe(true);
  });

  it('maps SUCCESS to success', () => {
    dispatchToast('Test message', 'SUCCESS');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.classList.contains('don-toast--success')).toBe(true);
  });

  it('accepts lowercase types directly', () => {
    const types: Array<'success' | 'error' | 'warn' | 'info'> = [
      'success',
      'error',
      'warn',
      'info',
    ];

    types.forEach((type) => {
      __testing__.resetState();
      // Clear the shadow root between iterations
      const allElements = mockShadowRoot.querySelectorAll('*');
      allElements.forEach(el => el.remove());

      dispatchToast('Test', type);

      const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
      expect(toast.classList.contains(`don-toast--${type}`)).toBe(true);
    });
  });
});

// ============================================================================
// 4. Style Injection
// ============================================================================

describe('Style Injection', () => {
  it('injects style element on first toast', () => {
    dispatchToast('Test message', 'success');

    const style = mockShadowRoot.querySelector('#don-toast-styles');
    expect(style).not.toBeNull();
    expect(style?.tagName).toBe('STYLE');
  });

  it('does not duplicate style element on subsequent toasts', () => {
    dispatchToast('First toast', 'success');
    dispatchToast('Second toast', 'error');

    const styles = mockShadowRoot.querySelectorAll('#don-toast-styles');
    expect(styles.length).toBe(1);
  });

  it('style contains CSS content', () => {
    dispatchToast('Test message', 'success');

    const style = mockShadowRoot.querySelector('#don-toast-styles') as HTMLStyleElement;
    const content = style.textContent || '';

    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('.don-toastContainer');
    expect(content).toContain('.don-toast');
  });

  it('style contains animation keyframes', () => {
    dispatchToast('Test message', 'success');

    const style = mockShadowRoot.querySelector('#don-toast-styles') as HTMLStyleElement;
    const content = style.textContent || '';

    expect(content).toContain('@keyframes donToastSlideIn');
    expect(content).toContain('@keyframes donToastFadeOut');
  });

  it('style contains glassmorphism properties', () => {
    dispatchToast('Test message', 'success');

    const style = mockShadowRoot.querySelector('#don-toast-styles') as HTMLStyleElement;
    const content = style.textContent || '';

    expect(content).toContain('backdrop-filter: blur(20px) saturate(180%)');
    expect(content).toContain('-webkit-backdrop-filter: blur(20px) saturate(180%)');
  });
});

// ============================================================================
// 5. Close Button Interaction
// ============================================================================

describe('Close Button Interaction', () => {
  it('adds dismissing class when close button clicked', () => {
    dispatchToast('Test message', 'success');

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    closeButton.click();

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.classList.contains('don-toast--dismissing')).toBe(true);
  });

  it('removes toast from DOM after dismiss animation duration', () => {
    dispatchToast('Test message', 'success');
    expect(mockShadowRoot.querySelectorAll('.don-toast').length).toBe(1);

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    closeButton.click();

    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DISMISS_ANIMATION_DURATION);
    expect(mockShadowRoot.querySelectorAll('.don-toast').length).toBe(0);
  });

  it('removes toast from active toasts array after dismiss', () => {
    dispatchToast('Test message', 'success');
    expect(__testing__.getActiveToasts().length).toBe(1);

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    closeButton.click();

    vi.runAllTimers();
    expect(__testing__.getActiveToasts().length).toBe(0);
  });

  it('clears auto-dismiss timer when manually dismissed', () => {
    dispatchToast('Test message', 'success');

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    closeButton.click();

    // Toast should have dismissing class immediately after manual click
    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.classList.contains('don-toast--dismissing')).toBe(true);

    // Verify the toast is removed after dismiss animation duration
    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DISMISS_ANIMATION_DURATION);
    expect(__testing__.getActiveToasts().length).toBe(0);
  });
});

// ============================================================================
// 6. Auto-Dismiss Timing
// ============================================================================

describe('Auto-Dismiss Timing', () => {
  it('dismisses desktop toast after 5000ms', () => {
    setViewportWidth(1024);
    dispatchToast('Test message', 'success');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.classList.contains('don-toast--dismissing')).toBe(false);

    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DURATION_DESKTOP);
    expect(toast.classList.contains('don-toast--dismissing')).toBe(true);
  });

  it('dismisses mobile toast after 4000ms', () => {
    setViewportWidth(375);
    dispatchToast('Test message', 'success');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;

    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DURATION_MOBILE);
    expect(toast.classList.contains('don-toast--dismissing')).toBe(true);
  });

  it('removes toast from DOM after dismiss animation', () => {
    setViewportWidth(1024);
    dispatchToast('Test message', 'success');

    vi.advanceTimersByTime(
      __testing__.TOAST_CONFIG.DURATION_DESKTOP +
      __testing__.TOAST_CONFIG.DISMISS_ANIMATION_DURATION
    );

    expect(mockShadowRoot.querySelectorAll('.don-toast').length).toBe(0);
  });

  it('respects different timing for mobile vs desktop', () => {
    const timeDiff =
      __testing__.TOAST_CONFIG.DURATION_DESKTOP -
      __testing__.TOAST_CONFIG.DURATION_MOBILE;

    expect(timeDiff).toBe(1000);
  });
});

// ============================================================================
// 7. Stacking and Depth
// ============================================================================

describe('Stacking and Depth', () => {
  it('limits to max 3 visible toasts', () => {
    for (let i = 0; i < 5; i++) {
      dispatchToast(`Toast ${i}`, 'success');
    }

    const activeToasts = __testing__.getActiveToasts();
    expect(activeToasts.length).toBe(3);
  });

  it('newest toast has data-depth=0 and no depth class', () => {
    dispatchToast('First toast', 'success');
    dispatchToast('Second toast', 'error');

    const toasts = mockShadowRoot.querySelectorAll('.don-toast');
    const newest = toasts[0] as HTMLDivElement;

    expect(newest.getAttribute('data-depth')).toBe('0');
    expect(newest.classList.contains('don-toast--depth-1')).toBe(false);
    expect(newest.classList.contains('don-toast--depth-2')).toBe(false);
  });

  it('second toast has data-depth=1 and depth-1 class', () => {
    dispatchToast('First toast', 'success');
    dispatchToast('Second toast', 'error');

    const toasts = mockShadowRoot.querySelectorAll('.don-toast');
    const second = toasts[1] as HTMLDivElement;

    expect(second.getAttribute('data-depth')).toBe('1');
    expect(second.classList.contains('don-toast--depth-1')).toBe(true);
  });

  it('third toast has data-depth=2 and depth-2 class', () => {
    dispatchToast('First toast', 'success');
    dispatchToast('Second toast', 'error');
    dispatchToast('Third toast', 'warn');

    const toasts = mockShadowRoot.querySelectorAll('.don-toast');
    const third = toasts[2] as HTMLDivElement;

    expect(third.getAttribute('data-depth')).toBe('2');
    expect(third.classList.contains('don-toast--depth-2')).toBe(true);
  });

  it('evicts oldest toast when 4th added', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');
    dispatchToast('Toast 3', 'warn');

    expect(__testing__.getActiveToasts().length).toBe(3);
    expect(mockShadowRoot.querySelector('[data-toast-id="0"]')).not.toBeNull();

    dispatchToast('Toast 4', 'info');

    expect(__testing__.getActiveToasts().length).toBe(3);
    expect(mockShadowRoot.querySelector('[data-toast-id="0"]')).toBeNull();
  });

  it('updates depths when toast removed', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');
    dispatchToast('Toast 3', 'warn');

    const closeButton = mockShadowRoot.querySelector('[data-toast-id="2"] .don-toast__close') as HTMLButtonElement;
    closeButton.click();
    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DISMISS_ANIMATION_DURATION);

    const toasts = mockShadowRoot.querySelectorAll('.don-toast');
    expect(toasts[1].getAttribute('data-depth')).toBe('1');
    expect(toasts[1].classList.contains('don-toast--depth-1')).toBe(true);
  });

  it('newest toast always at index 0 (column-reverse)', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');

    const toasts = mockShadowRoot.querySelectorAll('.don-toast');

    // In the DOM, with flex column-reverse, the visual order is reversed
    // Toast IDs are 0, 1. The newest (ID 1) should be visually first
    // but the DOM order depends on flex direction
    // Verify by checking data-depth: newest=0, second=1
    expect((toasts[0] as HTMLDivElement).getAttribute('data-depth')).toBe('0');
    expect((toasts[1] as HTMLDivElement).getAttribute('data-depth')).toBe('1');
  });
});

// ============================================================================
// 8. Swipe-to-Dismiss (Mobile)
// ============================================================================

describe('Swipe-to-Dismiss (Mobile)', () => {
  it('attaches touch listeners on mobile', () => {
    setViewportWidth(375);

    const addEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, 'addEventListener');
    dispatchToast('Test message', 'success');

    // Check that addEventListener was called with touch events
    const touchstartCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'touchstart'
    );
    const touchmoveCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'touchmove'
    );
    const touchendCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'touchend'
    );
    const touchcancelCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'touchcancel'
    );

    expect(touchstartCalls.length).toBeGreaterThan(0);
    expect(touchmoveCalls.length).toBeGreaterThan(0);
    expect(touchendCalls.length).toBeGreaterThan(0);
    expect(touchcancelCalls.length).toBeGreaterThan(0);

    vi.restoreAllMocks();
  });

  it('does NOT attach touch listeners on desktop', () => {
    setViewportWidth(1024);

    const addEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, 'addEventListener');
    dispatchToast('Test message', 'success');

    const touchCalls = addEventListenerSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].startsWith('touch')
    );
    expect(touchCalls.length).toBe(0);

    vi.restoreAllMocks();
  });

  it('swipe up beyond threshold dismisses toast', () => {
    setViewportWidth(375);
    dispatchToast('Test message', 'success');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;

    // Simulate swipe up
    toast.dispatchEvent(new TouchEvent('touchstart', {
      touches: [{ clientY: 100 } as unknown as Touch],
    }));

    toast.dispatchEvent(new TouchEvent('touchmove', {
      touches: [{ clientY: 30 } as unknown as Touch],
    }));

    const touchEndEvent = new TouchEvent('touchend', {});
    toast.dispatchEvent(touchEndEvent);

    expect(toast.classList.contains('don-toast--dismissing')).toBe(true);
  });

  it('snap back if swipe below threshold', () => {
    setViewportWidth(375);
    dispatchToast('Test message', 'success');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;

    // Simulate small swipe up (below threshold)
    toast.dispatchEvent(new TouchEvent('touchstart', {
      touches: [{ clientY: 100 } as unknown as Touch],
    }));

    toast.dispatchEvent(new TouchEvent('touchmove', {
      touches: [{ clientY: 80 } as unknown as Touch],
    }));

    const touchEndEvent = new TouchEvent('touchend', {});
    toast.dispatchEvent(touchEndEvent);

    // Toast should NOT be dismissing
    expect(toast.classList.contains('don-toast--dismissing')).toBe(false);
  });

  it('cleans up touch listeners on toast removal', () => {
    setViewportWidth(375);
    dispatchToast('Test message', 'success');

    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    const removeListenerSpy = vi.spyOn(toast, 'removeEventListener');

    // Dismiss and wait for removal
    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DURATION_MOBILE);
    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DISMISS_ANIMATION_DURATION);

    const removedEvents = removeListenerSpy.mock.calls.map((call) => call[0]);
    expect(removedEvents).toContain('touchstart');
    expect(removedEvents).toContain('touchmove');
    expect(removedEvents).toContain('touchend');
    expect(removedEvents).toContain('touchcancel');
  });
});

// ============================================================================
// 9. Edge Cases
// ============================================================================

describe('Edge Cases', () => {
  it('handles null shadowRoot gracefully', () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null);

    expect(() => {
      dispatchToast('Test message', 'success');
    }).not.toThrow();

    expect(__testing__.getActiveToasts().length).toBe(0);
  });

  it('handles element with no shadowRoot', () => {
    vi.spyOn(document, 'querySelector').mockReturnValue({} as unknown as Element);

    expect(() => {
      dispatchToast('Test message', 'success');
    }).not.toThrow();

    expect(__testing__.getActiveToasts().length).toBe(0);
  });

  it('handles multiple rapid toasts', () => {
    for (let i = 0; i < 10; i++) {
      dispatchToast(`Toast ${i}`, 'success');
    }

    expect(__testing__.getActiveToasts().length).toBe(3);
    expect(mockShadowRoot.querySelectorAll('.don-toast').length).toBe(3);
  });

  it('handles dispatchToast with empty string', () => {
    dispatchToast('', 'success');

    const textElement = mockShadowRoot.querySelector('.don-toast__text') as HTMLDivElement;
    expect(textElement.textContent).toBe('');
  });

  it('handles dispatchToast with very long text', () => {
    const longText = 'A'.repeat(500);
    dispatchToast(longText, 'success');

    const textElement = mockShadowRoot.querySelector('.don-toast__text') as HTMLDivElement;
    expect(textElement.textContent).toBe(longText);
  });

  it('handles special characters in message', () => {
    const specialMessage = 'Test <>&"\'`;';
    dispatchToast(specialMessage, 'success');

    const textElement = mockShadowRoot.querySelector('.don-toast__text') as HTMLDivElement;
    expect(textElement.textContent).toBe(specialMessage);
  });
});

// ============================================================================
// 10. clearAllToasts
// ============================================================================

describe('clearAllToasts', () => {
  it('dismisses all active toasts', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');
    dispatchToast('Toast 3', 'warn');

    const toasts = mockShadowRoot.querySelectorAll('.don-toast');
    expect(toasts.length).toBe(3);

    clearAllToasts();

    const dismissingToasts = mockShadowRoot.querySelectorAll('.don-toast--dismissing');
    expect(dismissingToasts.length).toBe(3);
  });

  it('removes all toasts from DOM after animation duration', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');
    dispatchToast('Toast 3', 'warn');

    clearAllToasts();

    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DISMISS_ANIMATION_DURATION);

    expect(mockShadowRoot.querySelectorAll('.don-toast').length).toBe(0);
    expect(__testing__.getActiveToasts().length).toBe(0);
  });

  it('removes container after all toasts cleared', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');

    clearAllToasts();

    vi.runAllTimers();

    expect(__testing__.getToastContainer()).toBeNull();
  });

  it('handles clearAllToasts when no toasts present', () => {
    expect(() => {
      clearAllToasts();
    }).not.toThrow();

    expect(__testing__.getActiveToasts().length).toBe(0);
  });

  it('handles clearAllToasts called while toasts already dismissing', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');

    const firstCloseButton = mockShadowRoot.querySelector('[data-toast-id="1"] .don-toast__close') as HTMLButtonElement;
    firstCloseButton.click();

    clearAllToasts();

    vi.runAllTimers();

    expect(__testing__.getActiveToasts().length).toBe(0);
  });
});

// ============================================================================
// 11. Testing Utilities (resetState, getActiveToasts, getToastContainer)
// ============================================================================

describe('Testing Utilities', () => {
  it('getActiveToasts returns copy of active toasts', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');

    const toasts = __testing__.getActiveToasts();
    expect(toasts.length).toBe(2);
    expect(toasts[0].text).toBe('Toast 2');
    expect(toasts[1].text).toBe('Toast 1');
  });

  it('getActiveToasts returns empty array when no toasts', () => {
    const toasts = __testing__.getActiveToasts();
    expect(Array.isArray(toasts)).toBe(true);
    expect(toasts.length).toBe(0);
  });

  it('getToastContainer returns null when no container', () => {
    const container = __testing__.getToastContainer();
    expect(container).toBeNull();
  });

  it('getToastContainer returns container after first toast', () => {
    dispatchToast('Test message', 'success');

    const container = __testing__.getToastContainer();
    expect(container).not.toBeNull();
    expect(container?.classList.contains('don-toastContainer')).toBe(true);
  });

  it('resetState clears all toasts', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');

    __testing__.resetState();

    expect(__testing__.getActiveToasts().length).toBe(0);
  });

  it('resetState removes container', () => {
    dispatchToast('Test message', 'success');

    __testing__.resetState();

    expect(__testing__.getToastContainer()).toBeNull();
  });

  it('resetState clears timers', () => {
    dispatchToast('Test message', 'success');

    __testing__.resetState();

    // Timers should not fire
    vi.runAllTimers();

    expect(__testing__.getActiveToasts().length).toBe(0);
  });
});

// ============================================================================
// 12. Constants & Configuration
// ============================================================================

describe('Constants & Configuration', () => {
  it('exposes TOAST_CONFIG', () => {
    const config = __testing__.TOAST_CONFIG;
    expect(config.MAX_VISIBLE).toBe(3);
    expect(config.DURATION_DESKTOP).toBe(5000);
    expect(config.DURATION_MOBILE).toBe(4000);
    expect(config.DISMISS_ANIMATION_DURATION).toBe(400);
    expect(config.SWIPE_THRESHOLD).toBe(50);
    expect(config.MOBILE_BREAKPOINT).toBe(768);
  });

  it('exposes TOAST_CSS', () => {
    const css = __testing__.TOAST_CSS;
    expect(typeof css).toBe('string');
    expect(css.length).toBeGreaterThan(0);
  });

  it('exposes TOAST_ICONS', () => {
    const icons = __testing__.TOAST_ICONS;
    expect(icons.success).toContain('<svg');
    expect(icons.error).toContain('<svg');
    expect(icons.warn).toContain('<svg');
    expect(icons.info).toContain('<svg');
  });

  it('exposes CLOSE_ICON', () => {
    const icon = __testing__.CLOSE_ICON;
    expect(typeof icon).toBe('string');
    expect(icon).toContain('<svg');
  });

  it('exposes ARIA_LABELS', () => {
    const labels = __testing__.ARIA_LABELS;
    expect(labels.success).toBe('Success notification');
    expect(labels.error).toBe('Error notification');
    expect(labels.warn).toBe('Warning notification');
    expect(labels.info).toBe('Information notification');
  });

  it('exposes LEGACY_TYPE_MAP', () => {
    const map = __testing__.LEGACY_TYPE_MAP;
    expect(map.DANGER).toBe('error');
    expect(map.WARNING).toBe('warn');
    expect(map.SUCCESS).toBe('success');
  });
});

// ============================================================================
// 13. Icon Correctness
// ============================================================================

describe('Icon Correctness', () => {
  it('uses correct icon for success toast', () => {
    dispatchToast('Test message', 'success');

    const iconContainer = mockShadowRoot.querySelector('.don-toast--success .don-toast__icon') as HTMLDivElement;
    expect(iconContainer.innerHTML).toContain('<svg');
    expect(iconContainer.innerHTML).toContain('viewBox="0 0 20 20"');
  });

  it('uses correct icon for error toast', () => {
    dispatchToast('Test message', 'error');

    const iconContainer = mockShadowRoot.querySelector('.don-toast--error .don-toast__icon') as HTMLDivElement;
    expect(iconContainer.innerHTML).toContain('<svg');
    expect(iconContainer.innerHTML).toContain('viewBox="0 0 20 20"');
  });

  it('uses correct icon for warn toast', () => {
    dispatchToast('Test message', 'warn');

    const iconContainer = mockShadowRoot.querySelector('.don-toast--warn .don-toast__icon') as HTMLDivElement;
    expect(iconContainer.innerHTML).toContain('<svg');
    expect(iconContainer.innerHTML).toContain('viewBox="0 0 20 20"');
  });

  it('uses correct icon for info toast', () => {
    dispatchToast('Test message', 'info');

    const iconContainer = mockShadowRoot.querySelector('.don-toast--info .don-toast__icon') as HTMLDivElement;
    expect(iconContainer.innerHTML).toContain('<svg');
    expect(iconContainer.innerHTML).toContain('viewBox="0 0 20 20"');
  });

  it('uses correct close icon for all toasts', () => {
    dispatchToast('Test message', 'success');

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    expect(closeButton.innerHTML).toContain('<svg');
    expect(closeButton.innerHTML).toContain('viewBox="0 0 20 20"');
  });
});

// ============================================================================
// 14. Order & Newest First
// ============================================================================

describe('Order & Newest First', () => {
  it('newest toast appears first in activeToasts array', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');
    dispatchToast('Toast 3', 'warn');

    const activeToasts = __testing__.getActiveToasts();
    expect(activeToasts[0].text).toBe('Toast 3');
    expect(activeToasts[1].text).toBe('Toast 2');
    expect(activeToasts[2].text).toBe('Toast 1');
  });

  it('newest toast in activeToasts array is at index 0', () => {
    dispatchToast('Toast 1', 'success');
    dispatchToast('Toast 2', 'error');
    dispatchToast('Toast 3', 'warn');

    const activeToasts = __testing__.getActiveToasts();
    expect(activeToasts[0].text).toBe('Toast 3');
    expect(activeToasts[1].text).toBe('Toast 2');
    expect(activeToasts[2].text).toBe('Toast 1');
  });
});

// ============================================================================
// 15. Timer Management
// ============================================================================

describe('Timer Management', () => {
  it('schedules auto-dismiss timer on dispatch', () => {
    dispatchToast('Test message', 'success');

    const activeToasts = __testing__.getActiveToasts();
    expect(activeToasts[0].autoDismissTimer).not.toBeNull();
  });

  it('clears auto-dismiss timer on manual dismiss', () => {
    dispatchToast('Test message', 'success');

    const activeToasts = __testing__.getActiveToasts();
    expect(activeToasts[0].autoDismissTimer).not.toBeNull();

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    closeButton.click();

    // After dismiss, the toast should have dismissing class
    const toast = mockShadowRoot.querySelector('.don-toast') as HTMLDivElement;
    expect(toast.classList.contains('don-toast--dismissing')).toBe(true);
  });

  it('schedules remove timer on dismiss', () => {
    dispatchToast('Test message', 'success');

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    closeButton.click();

    const activeToasts = __testing__.getActiveToasts();
    expect(activeToasts[0].removeTimer).not.toBeNull();
  });

  it('removes toast after remove timer fires', () => {
    dispatchToast('Test message', 'success');

    const closeButton = mockShadowRoot.querySelector('.don-toast__close') as HTMLButtonElement;
    closeButton.click();

    vi.advanceTimersByTime(__testing__.TOAST_CONFIG.DISMISS_ANIMATION_DURATION);

    expect(__testing__.getActiveToasts().length).toBe(0);
  });
});
