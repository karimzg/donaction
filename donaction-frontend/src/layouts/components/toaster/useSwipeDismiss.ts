import { useRef, useCallback } from 'react';

export const SWIPE_THRESHOLD = 50;

interface UseSwipeDismissOptions {
	enabled: boolean;
	onDismiss: () => void;
}

interface SwipeHandlers {
	onTouchStart: (e: React.TouchEvent) => void;
	onTouchMove: (e: React.TouchEvent) => void;
	onTouchEnd: (e: React.TouchEvent) => void;
	onTouchCancel: (e: React.TouchEvent) => void;
}

/**
 * Touch swipe-up gesture handler for toast dismissal.
 * Uses direct DOM manipulation for smooth 60fps visual feedback during the gesture.
 * Returns touch event handlers to attach to a toast element.
 */
const useSwipeDismiss = ({ enabled, onDismiss }: UseSwipeDismissOptions): SwipeHandlers => {
	const startYRef = useRef(0);
	const currentOffsetRef = useRef(0);

	const onTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (!enabled) return;
			startYRef.current = e.touches[0].clientY;
			currentOffsetRef.current = 0;
		},
		[enabled],
	);

	const onTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!enabled) return;
			const deltaY = e.touches[0].clientY - startYRef.current;
			// Only allow upward swipe (negative delta)
			const offset = Math.min(0, deltaY);
			currentOffsetRef.current = offset;

			// Direct DOM manipulation for smooth visual feedback
			const el = e.currentTarget as HTMLElement;
			el.style.transform = `translateY(${offset}px)`;
			el.style.opacity = `${Math.max(0.3, 1 - Math.abs(offset) / 150)}`;
		},
		[enabled],
	);

	const onTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			if (!enabled) return;
			const el = e.currentTarget as HTMLElement;

			if (Math.abs(currentOffsetRef.current) >= SWIPE_THRESHOLD) {
				onDismiss();
			} else {
				// Snap back with transition
				el.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
				el.style.transform = '';
				el.style.opacity = '';
				// Clean up transition after snap-back
				const cleanup = () => {
					el.style.transition = '';
					el.removeEventListener('transitionend', cleanup);
				};
				el.addEventListener('transitionend', cleanup);
			}
			currentOffsetRef.current = 0;
		},
		[enabled, onDismiss],
	);

	const onTouchCancel = useCallback(
		(e: React.TouchEvent) => {
			if (!enabled) return;
			// Reset inline styles when touch is interrupted (e.g., browser gesture)
			const el = e.currentTarget as HTMLElement;
			el.style.transform = '';
			el.style.opacity = '';
			currentOffsetRef.current = 0;
		},
		[enabled],
	);

	return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
};

export default useSwipeDismiss;
