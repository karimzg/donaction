'use client';

import { ReactNode } from 'react';
import ScrollAnimator from '@/components/ScrollAnimator';

interface TimelineAnimatorProps {
  /** Content to animate on scroll */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Timeline-specific scroll animator.
 * Thin wrapper around the shared ScrollAnimator component.
 */
export default function TimelineAnimator({
  children,
  className,
}: TimelineAnimatorProps) {
  return (
    <ScrollAnimator className={className}>
      {children}
    </ScrollAnimator>
  );
}
