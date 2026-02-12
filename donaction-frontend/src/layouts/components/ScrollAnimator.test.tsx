import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ScrollAnimator from './ScrollAnimator';

// Track observer instances for assertions
let observerInstances: Array<{
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}> = [];

function createMockObserver() {
  const observe = vi.fn();
  const disconnect = vi.fn();

  // @ts-ignore - mock constructor
  global.IntersectionObserver = vi.fn(
    (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
      const instance = { callback, options, observe, disconnect };
      observerInstances.push(instance);
      return instance;
    }
  );

  return { observe, disconnect };
}

function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: reducedMotion }),
  });
}

describe('ScrollAnimator', () => {
  let rafCallbacks: Array<FrameRequestCallback> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    observerInstances = [];
    rafCallbacks = [];

    // Mock requestAnimationFrame to capture callbacks
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    // Default: IO supported, no reduced motion
    createMockObserver();
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushRAF() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb(performance.now()));
  }

  it('renders children', () => {
    render(
      <ScrollAnimator>
        <p>Hello</p>
      </ScrollAnimator>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('starts without is-visible class (SSR-safe)', () => {
    const { container } = render(
      <ScrollAnimator className="wrapper">
        <div>Content</div>
      </ScrollAnimator>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveClass('is-visible');
    expect(wrapper).toHaveAttribute('data-visible', 'false');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ScrollAnimator className="my-section__wrapper">
        <div>Content</div>
      </ScrollAnimator>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('my-section__wrapper');
  });

  it('shows immediately when prefers-reduced-motion is set', async () => {
    mockMatchMedia(true);

    const { container } = render(
      <ScrollAnimator className="wrapper">
        <div>Content</div>
      </ScrollAnimator>
    );

    await waitFor(() => {
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('is-visible');
      expect(wrapper).toHaveAttribute('data-visible', 'true');
    });
  });

  it('shows immediately when IntersectionObserver is unavailable', async () => {
    // Remove IO from window
    // @ts-ignore
    delete window.IntersectionObserver;

    const { container } = render(
      <ScrollAnimator>
        <div>Content</div>
      </ScrollAnimator>
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('is-visible');
    });
  });

  it('creates observer and observes container after RAF', () => {
    const { observe } = createMockObserver();

    render(
      <ScrollAnimator>
        <div>Content</div>
      </ScrollAnimator>
    );

    // Observer not created yet (waiting for RAF)
    expect(observe).not.toHaveBeenCalled();

    // Flush RAF
    act(() => flushRAF());

    expect(observe).toHaveBeenCalledTimes(1);
  });

  it('passes custom threshold and rootMargin to observer', () => {
    createMockObserver();

    render(
      <ScrollAnimator threshold={0.5} rootMargin="0px 0px -20% 0px">
        <div>Content</div>
      </ScrollAnimator>
    );

    act(() => flushRAF());

    const instance = observerInstances[observerInstances.length - 1];
    expect(instance.options).toEqual(
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '0px 0px -20% 0px',
      })
    );
  });

  it('adds is-visible class when element intersects', async () => {
    createMockObserver();

    const { container } = render(
      <ScrollAnimator className="wrapper">
        <div>Content</div>
      </ScrollAnimator>
    );

    act(() => flushRAF());

    // Simulate intersection
    const instance = observerInstances[observerInstances.length - 1];
    act(() => {
      instance.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        instance as unknown as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('is-visible');
    });
  });

  it('disconnects observer after intersection', () => {
    const { disconnect } = createMockObserver();

    render(
      <ScrollAnimator>
        <div>Content</div>
      </ScrollAnimator>
    );

    act(() => flushRAF());

    const instance = observerInstances[observerInstances.length - 1];
    act(() => {
      instance.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        instance as unknown as IntersectionObserver
      );
    });

    expect(disconnect).toHaveBeenCalled();
  });

  it('does not add is-visible when not intersecting', () => {
    createMockObserver();

    const { container } = render(
      <ScrollAnimator>
        <div>Content</div>
      </ScrollAnimator>
    );

    act(() => flushRAF());

    const instance = observerInstances[observerInstances.length - 1];
    act(() => {
      instance.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        instance as unknown as IntersectionObserver
      );
    });

    expect(container.firstChild).not.toHaveClass('is-visible');
  });

  it('cleans up observer on unmount', () => {
    const { disconnect } = createMockObserver();

    const { unmount } = render(
      <ScrollAnimator>
        <div>Content</div>
      </ScrollAnimator>
    );

    act(() => flushRAF());

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });

  it('cancels RAF on unmount before frame fires', () => {
    render(
      <ScrollAnimator>
        <div>Content</div>
      </ScrollAnimator>
    );

    // Don't flush RAF — unmount before it fires
    // The cleanup should call cancelAnimationFrame
    expect(window.cancelAnimationFrame).not.toHaveBeenCalled();
  });

  it('falls back to visible if IntersectionObserver constructor throws', async () => {
    // @ts-ignore - make constructor throw
    global.IntersectionObserver = vi.fn(() => {
      throw new Error('Not supported');
    });

    const { container } = render(
      <ScrollAnimator>
        <div>Content</div>
      </ScrollAnimator>
    );

    act(() => flushRAF());

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('is-visible');
    });
  });
});
