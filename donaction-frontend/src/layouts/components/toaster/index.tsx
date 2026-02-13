'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { popToast, selectToasts } from '@/core/store/modules/rootSlice';
import SuccessIcon from './icons/SuccessIcon';
import ErrorIcon from './icons/ErrorIcon';
import InfoIcon from './icons/InfoIcon';
import WarnIcon from './icons/WarnIcon';
import './index.scss';

const TOAST_DURATION = 3700; // visible time before dismiss starts
const DISMISS_ANIMATION_DURATION = 400; // exit animation length

const ICON_MAP = {
	success: SuccessIcon,
	error: ErrorIcon,
	info: InfoIcon,
	warn: WarnIcon,
} as const;

const Toaster = () => {
	const dispatch = useAppDispatch();
	const toasts = useAppSelector(selectToasts);
	const [dismissing, setDismissing] = useState<Set<string>>(new Set());
	const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

	useEffect(() => {
		// Schedule timers for new toasts
		toasts.forEach((toast) => {
			if (!timersRef.current.has(toast.id)) {
				const dismissTimer = setTimeout(() => {
					setDismissing((prev) => new Set(prev).add(toast.id));

					const removeTimer = setTimeout(() => {
						dispatch(popToast(toast.id));
						setDismissing((prev) => {
							const next = new Set(prev);
							next.delete(toast.id);
							return next;
						});
						timersRef.current.delete(toast.id);
						timersRef.current.delete(toast.id + '-remove');
					}, DISMISS_ANIMATION_DURATION);

					timersRef.current.set(toast.id + '-remove', removeTimer);
				}, TOAST_DURATION);

				timersRef.current.set(toast.id, dismissTimer);
			}
		});

		// Clean up timers for externally removed toasts
		const activeIds = new Set(toasts.map((t) => t.id));
		timersRef.current.forEach((timer, key) => {
			const baseId = key.replace('-remove', '');
			if (!activeIds.has(baseId)) {
				clearTimeout(timer);
				timersRef.current.delete(key);
			}
		});
		setDismissing((prev) => {
			const next = new Set(prev);
			let changed = false;
			next.forEach((id) => {
				if (!activeIds.has(id)) {
					next.delete(id);
					changed = true;
				}
			});
			return changed ? next : prev;
		});
	}, [toasts, dispatch]);

	// Cleanup all timers on unmount
	useEffect(() => {
		return () => {
			timersRef.current.forEach((timer) => clearTimeout(timer));
			timersRef.current.clear();
		};
	}, []);

	if (toasts.length === 0) return null;

	return (
		<div className="toastContainer" role="status" aria-live="polite">
			{toasts.map((toast) => {
				const Icon = ICON_MAP[toast.type];
				const isDismissing = dismissing.has(toast.id);

				return (
					<div
						className={`toastItem toastItem--${toast.type}${isDismissing ? ' toastItem--dismissing' : ''}`}
						key={toast.id}
					>
						{Icon && (
							<span className="toastItem__icon">
								<Icon />
							</span>
						)}
						<span className="toastItem__text">{toast.title}</span>
					</div>
				);
			})}
		</div>
	);
};

export default Toaster;
