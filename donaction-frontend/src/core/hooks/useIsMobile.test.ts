import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useIsMobile, { MOBILE_BREAKPOINT } from './useIsMobile';

describe('useIsMobile', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;
  let listeners: Record<string, (e: MediaQueryListEvent) => void> = {};

  beforeEach(() => {
    listeners = {};

    mockAddEventListener = vi.fn((event: string, callback) => {
      if (event === 'change') {
        listeners[event] = callback;
      }
    });

    mockRemoveEventListener = vi.fn((event: string) => {
      if (event === 'change') {
        delete listeners[event];
      }
    });

    mockMatchMedia = vi.fn((query: string) => ({
      matches: query.includes('max-width') ? false : true,
      media: query,
      onchange: null,
      addListener: mockAddEventListener,
      removeListener: mockRemoveEventListener,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    listeners = {};
  });

  it('returns false initially (SSR-safe default)', () => {
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('returns true when matchMedia matches mobile breakpoint', async () => {
    mockMatchMedia = vi.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: mockAddEventListener,
      removeListener: mockRemoveEventListener,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('returns false when matchMedia does not match mobile breakpoint', async () => {
    mockMatchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: mockAddEventListener,
      removeListener: mockRemoveEventListener,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('updates when media query change event fires', async () => {
    let currentMatches = false;

    mockAddEventListener = vi.fn((event: string, callback) => {
      if (event === 'change') {
        listeners[event] = callback;
      }
    });

    mockMatchMedia = vi.fn((query: string) => ({
      get matches() {
        return currentMatches;
      },
      media: query,
      onchange: null,
      addListener: mockAddEventListener,
      removeListener: mockRemoveEventListener,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { result } = renderHook(() => useIsMobile());

    // Initially false
    expect(result.current).toBe(false);

    // Simulate media query change to true
    currentMatches = true;
    const changeEvent = new Event('change') as MediaQueryListEvent;
    Object.defineProperty(changeEvent, 'matches', { value: true });
    listeners['change']?.(changeEvent);

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    // Simulate media query change back to false
    currentMatches = false;
    const changeEventBack = new Event('change') as MediaQueryListEvent;
    Object.defineProperty(changeEventBack, 'matches', { value: false });
    listeners['change']?.(changeEventBack);

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('cleans up event listener on unmount', async () => {
    const { unmount } = renderHook(() => useIsMobile());

    // Verify addEventListener was called
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    unmount();

    // Verify removeEventListener was called
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('uses correct mobile breakpoint in query', async () => {
    const { result } = renderHook(() => useIsMobile());

    const expectedQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    expect(mockMatchMedia).toHaveBeenCalledWith(expectedQuery);
  });
});
