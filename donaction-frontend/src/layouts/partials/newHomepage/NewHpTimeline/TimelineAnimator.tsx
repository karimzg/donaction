'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface TimelineAnimatorProps {
  /** Content to animate on scroll */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Client component that triggers animations when content enters viewport.
 * Uses IntersectionObserver to detect scroll position and adds 'is-visible'
 * class to enable CSS animations. SSR-safe with fallback for unsupported browsers.
 */
export default function TimelineAnimator({
  children,
  className,
}: TimelineAnimatorProps) {
  // SSR-safe: default to visible if IntersectionObserver not supported
  const [isVisible, setIsVisible] = useState(
    typeof window !== 'undefined' && !('IntersectionObserver' in window)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip if IntersectionObserver not available (already visible via fallback)
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    };

    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px 0px -15% 0px',
      threshold: 0.1,
    });

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${className || ''} ${isVisible ? 'is-visible' : ''}`}
      data-visible={isVisible}
    >
      {children}
    </div>
  );
}
