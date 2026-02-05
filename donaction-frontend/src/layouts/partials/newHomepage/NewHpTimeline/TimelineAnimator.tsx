'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface TimelineAnimatorProps {
  children: ReactNode;
  className?: string;
}

export default function TimelineAnimator({
  children,
  className,
}: TimelineAnimatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
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
