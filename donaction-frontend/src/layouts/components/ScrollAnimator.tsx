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
 * SSR-safe: falls back to visible state if IntersectionObserver is unavailable.
 *
 * Usage:
 * ```tsx
 * <ScrollAnimator className="my-section__wrapper">
 *   <div className="my-section__title">...</div>
 * </ScrollAnimator>
 * ```
 *
 * Then in SCSS:
 * ```scss
 * .my-section__title {
 *   opacity: 0;
 *   transform: translateY(30px);
 *   transition: opacity 0.6s ease, transform 0.6s ease;
 * }
 * .my-section__wrapper.is-visible .my-section__title {
 *   opacity: 1;
 *   transform: translateY(0);
 * }
 * ```
 */
export default function ScrollAnimator({
  children,
  className,
  threshold = 0.1,
  rootMargin = '0px 0px -15% 0px',
}: ScrollAnimatorProps) {
  const supportsObserver =
    typeof window !== 'undefined' && 'IntersectionObserver' in window;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Start visible if no observer support or user prefers reduced motion
  const [isVisible, setIsVisible] = useState(
    !supportsObserver || prefersReducedMotion
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;

    // Fallback: ensure visibility after 3s if observer never fires
    const fallbackTimeout = setTimeout(() => setIsVisible(true), 3000);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          clearTimeout(fallbackTimeout);
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold }
    );

    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      clearTimeout(fallbackTimeout);
      observer.disconnect();
    };
  }, [isVisible, rootMargin, threshold]);

  return (
    <div
      ref={containerRef}
      className={`${className || ''} ${isVisible ? 'is-visible' : ''}`.trim()}
      data-visible={isVisible}
    >
      {children}
    </div>
  );
}
