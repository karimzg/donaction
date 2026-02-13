'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { popToast, selectToasts, type IToast } from '@/core/store/modules/rootSlice';
import { getActions, clearActions, type ToastAction } from './actionRegistry';
import SuccessIcon from './icons/SuccessIcon';
import ErrorIcon from './icons/ErrorIcon';
import InfoIcon from './icons/InfoIcon';
import WarnIcon from './icons/WarnIcon';
import CloseIcon from './icons/CloseIcon';
import './index.scss';

const TOAST_DURATION = 5000; // visible time before dismiss starts
const DISMISS_ANIMATION_DURATION = 400; // exit animation length

const ICON_MAP: Record<IToast['type'], React.FC<{ className?: string }>> = {
	success: SuccessIcon,
	error: ErrorIcon,
	info: InfoIcon,
	warn: WarnIcon,
};

const ARIA_LABELS: Record<IToast['type'], string> = {
	success: 'Success notification',
	error: 'Error notification',
	info: 'Information notification',
	warn: 'Warning notification',
};

const Toaster = () => {
	const dispatch = useAppDispatch();
	const toasts = useAppSelector(selectToasts);
	const [dismissing, setDismissing] = useState<Set<string>>(new Set());
	const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

	const dismissToast = useCallback(
		(toastId: string) => {
			// Clear existing auto-dismiss timers
			const existingTimer = timersRef.current.get(toastId);
			if (existingTimer) clearTimeout(existingTimer);
			const existingRemoveTimer = timersRef.current.get(toastId + '-remove');
			if (existingRemoveTimer) clearTimeout(existingRemoveTimer);

			// Start dismiss animation
			setDismissing((prev) => new Set(prev).add(toastId));

			// Schedule removal after animation
			const removeTimer = setTimeout(() => {
				dispatch(popToast(toastId));
				clearActions(toastId);
				setDismissing((prev) => {
					const next = new Set(prev);
					next.delete(toastId);
					return next;
				});
				timersRef.current.delete(toastId);
				timersRef.current.delete(toastId + '-remove');
			}, DISMISS_ANIMATION_DURATION);

			timersRef.current.set(toastId + '-remove', removeTimer);
		},
		[dispatch],
	);

	const handleAction = useCallback(
		(toastId: string, action: ToastAction) => {
			action.callback();
			dismissToast(toastId);
		},
		[dismissToast],
	);

	useEffect(() => {
		// Schedule timers for new toasts
		toasts.forEach((toast) => {
			if (!timersRef.current.has(toast.id)) {
				const dismissTimer = setTimeout(() => {
					setDismissing((prev) => new Set(prev).add(toast.id));

					const removeTimer = setTimeout(() => {
						dispatch(popToast(toast.id));
						clearActions(toast.id);
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

		// Clean up timers and dismissing state for externally removed toasts
		const activeIds = new Set(toasts.map((t) => t.id));
		const keysToDelete: string[] = [];
		timersRef.current.forEach((timer, key) => {
			const baseId = key.replace('-remove', '');
			if (!activeIds.has(baseId)) {
				clearTimeout(timer);
				keysToDelete.push(key);
			}
		});
		keysToDelete.forEach((key) => timersRef.current.delete(key));

		// Clean up action registry for externally removed toasts
		keysToDelete.forEach((key) => {
			const baseId = key.replace('-remove', '');
			clearActions(baseId);
		});

		setDismissing((prev) => {
			let changed = false;
			prev.forEach((id) => {
				if (!activeIds.has(id)) changed = true;
			});
			if (!changed) return prev;
			const next = new Set<string>();
			prev.forEach((id) => {
				if (activeIds.has(id)) next.add(id);
			});
			return next;
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
				const actions = toast.hasActions ? getActions(toast.id) : [];

				return (
					<div
						className={`toastItem toastItem--${toast.type}${isDismissing ? ' toastItem--dismissing' : ''}`}
						key={toast.id}
						aria-label={ARIA_LABELS[toast.type]}
					>
						{Icon && (
							<span className="toastItem__icon">
								<Icon />
							</span>
						)}
						<span className="toastItem__text">{toast.title}</span>

						{actions.length > 0 && (
							<div className="toastItem__actions">
								{actions.map((action, index) => (
									<button
										key={index}
										className="toastItem__action"
										onClick={() => handleAction(toast.id, action)}
										type="button"
									>
										{action.label}
									</button>
								))}
							</div>
						)}

						<button
							className="toastItem__close"
							onClick={() => dismissToast(toast.id)}
							aria-label="Dismiss notification"
							type="button"
						>
							<CloseIcon />
						</button>
					</div>
				);
			})}
		</div>
	);
};

export default Toaster;
