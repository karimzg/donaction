'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollAnimatorProps {
  /** Content to animate on scroll */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** IntersectionObserver threshold (0-1). Default: 0.1 */
  threshold?: number;
  /** IntersectionObserver rootMargin. Default: '0px 0px -15% 0px' */
  rootMargin?: string;
}

/**
 * Client component that triggers CSS animations when content scrolls into viewport.
 * Uses IntersectionObserver to detect visibility and adds 'is-visible' class.
 *
 * SSR strategy: always render hidden (opacity: 0 via CSS), then useEffect on client
 * either sets up observer or immediately shows content (reduced motion / no IO support).
 * This avoids hydration mismatches between server and client state.
 */
export default function ScrollAnimator({
  children,
  className,
  threshold = 0.1,
  rootMargin = '0px 0px -15% 0px',
}: ScrollAnimatorProps) {
  // Always start false — consistent between server & client (no hydration mismatch)
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Already visible (e.g. from a previous render), skip
    if (isVisible) return;

    // No IntersectionObserver support → show immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // User prefers reduced motion → show immediately (no animation)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    let observer: IntersectionObserver | null = null;

    // Wait one frame so the browser has painted the hidden state (opacity: 0).
    // Without this, the observer can fire in the same frame as useEffect,
    // making the CSS transition from 0→1 imperceptible.
    const rafId = requestAnimationFrame(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true);
            observer?.disconnect();
          }
        },
        { root: null, rootMargin, threshold }
      );

      const el = containerRef.current;
      if (el) observer.observe(el);
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [isVisible, rootMargin, threshold]);

  return (
    <div
      ref={containerRef}
      className={`${className || ''} ${isVisible ? 'is-visible' : ''}`.trim()}
    >
      {children}
    </div>
  );
}
