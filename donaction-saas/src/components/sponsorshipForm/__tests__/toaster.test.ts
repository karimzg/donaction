import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchToast } from '../logic/toaster';

describe('dispatchToast', () => {
  let mockShadowRoot: {
    appendChild: ReturnType<typeof vi.fn>;
    removeChild: ReturnType<typeof vi.fn>;
  };
  let createdElement: HTMLSpanElement | null;

  beforeEach(() => {
    vi.useFakeTimers();
    mockShadowRoot = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    };

    vi.spyOn(document, 'querySelector').mockReturnValue({
      shadowRoot: mockShadowRoot,
    } as unknown as Element);

    createdElement = null;
    const originalCreateElement = document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement.call(document, tagName);
      if (tagName === 'span') {
        createdElement = el;
      }
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('element creation', () => {
    it('creates a span element with correct text', () => {
      dispatchToast('Test message', 'SUCCESS');
      expect(createdElement?.innerText).toBe('Test message');
    });

    it('sets correct padding style', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.padding).toBe('8px 12px');
    });

    it('sets correct maxWidth style', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.maxWidth).toBe('350px');
    });

    it('sets position to fixed', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.position).toBe('fixed');
    });

    it('sets zIndex to 9999', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.zIndex).toBe('9999');
    });

    it('sets top to 50px', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.top).toBe('50px');
    });

    it('sets initial right to -100%', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.right).toBe('-100%');
    });

    it('sets text color to white', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.color).toBe('white');
    });

    it('sets correct fontFamily', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.fontFamily).toBe('"Maven-Pro-Regular", sans-serif');
    });

    it('sets borderTopLeftRadius to 6px', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.borderTopLeftRadius).toBe('6px');
    });

    it('sets borderBottomLeftRadius to 6px', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.borderBottomLeftRadius).toBe('6px');
    });

    it('sets transition property', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(createdElement?.style.transition).toBe('right .5s ease-in-out');
    });
  });

  describe('background colors', () => {
    it('sets background color to red for DANGER', () => {
      dispatchToast('Danger message', 'DANGER');
      expect(createdElement?.style.backgroundColor).toBe('red');
    });

    it('sets background color to yellow for WARNING', () => {
      dispatchToast('Warning message', 'WARNING');
      expect(createdElement?.style.backgroundColor).toBe('yellow');
    });

    it('sets background color to green for SUCCESS', () => {
      dispatchToast('Success message', 'SUCCESS');
      expect(createdElement?.style.backgroundColor).toBe('green');
    });
  });

  describe('shadowRoot interactions', () => {
    it('appends element to shadowRoot', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(mockShadowRoot.appendChild).toHaveBeenCalledWith(createdElement);
    });

    it('appends element immediately', () => {
      dispatchToast('Test', 'SUCCESS');
      expect(mockShadowRoot.appendChild).toHaveBeenCalledTimes(1);
    });
  });

  describe('animation timing', () => {
    it('sets right to 0 after 100ms', () => {
      dispatchToast('Test', 'SUCCESS');
      vi.advanceTimersByTime(100);
      expect(createdElement?.style.right).toBe('0px');
    });

    it('sets right to -100% after 4000ms', () => {
      dispatchToast('Test', 'SUCCESS');
      vi.advanceTimersByTime(4000);
      expect(createdElement?.style.right).toBe('-100%');
    });

    it('removes element from shadowRoot after 5000ms', () => {
      dispatchToast('Test', 'SUCCESS');
      vi.advanceTimersByTime(5000);
      expect(mockShadowRoot.removeChild).toHaveBeenCalledWith(createdElement);
    });

    it('maintains correct sequence of style changes', () => {
      dispatchToast('Test', 'SUCCESS');

      expect(createdElement?.style.right).toBe('-100%');

      vi.advanceTimersByTime(100);
      expect(createdElement?.style.right).toBe('0px');
      expect(mockShadowRoot.removeChild).not.toHaveBeenCalled();

      vi.advanceTimersByTime(3900);
      expect(createdElement?.style.right).toBe('-100%');
      expect(mockShadowRoot.removeChild).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(mockShadowRoot.removeChild).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles null shadowRoot gracefully', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue({
        shadowRoot: null,
      } as unknown as Element);

      expect(() => {
        dispatchToast('Test', 'SUCCESS');
      }).not.toThrow();
    });

    it('handles null query selector result gracefully', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      expect(() => {
        dispatchToast('Test', 'SUCCESS');
      }).not.toThrow();
    });

    it('handles multiple toasts in sequence', () => {
      dispatchToast('Toast 1', 'SUCCESS');
      dispatchToast('Toast 2', 'WARNING');
      dispatchToast('Toast 3', 'DANGER');

      expect(mockShadowRoot.appendChild).toHaveBeenCalledTimes(3);
    });
  });
});
