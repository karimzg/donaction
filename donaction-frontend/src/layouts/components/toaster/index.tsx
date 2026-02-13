'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { popToast, selectToasts, type IToast } from '@/core/store/modules/rootSlice';
import { getActions, clearActions, clearAllActions, type ToastAction } from './actionRegistry';
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

/** Build the timer key used for the removal phase of a toast. */
const getRemoveTimerKey = (toastId: string) => `${toastId}-remove`;

const Toaster = () => {
	const dispatch = useAppDispatch();
	const toasts = useAppSelector(selectToasts);
	const [dismissing, setDismissing] = useState<Set<string>>(new Set());
	const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

	const dismissToast = useCallback(
		(toastId: string) => {
			// Clear existing auto-dismiss timers
			const existingTimer = timersRef.current.get(toastId);
			if (existingTimer) clearTimeout(existingTimer);
			const existingRemoveTimer = timersRef.current.get(getRemoveTimerKey(toastId));
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
				timersRef.current.delete(getRemoveTimerKey(toastId));
			}, DISMISS_ANIMATION_DURATION);

			timersRef.current.set(getRemoveTimerKey(toastId), removeTimer);
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

	// Schedule auto-dismiss timers for new toasts
	useEffect(() => {
		toasts.forEach((toast) => {
			if (!timersRef.current.has(toast.id)) {
				const autoDismissTimer = setTimeout(() => {
					dismissToast(toast.id);
				}, TOAST_DURATION);

				timersRef.current.set(toast.id, autoDismissTimer);
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
	}, [toasts, dismissToast]);

	// Cleanup all timers and action registry on unmount
	useEffect(() => {
		return () => {
			timersRef.current.forEach((timer) => clearTimeout(timer));
			timersRef.current.clear();
			clearAllActions();
		};
	}, []);

	// Memoize actions lookup to avoid calling getActions on every render
	const actionsMap = useMemo(
		() => new Map(toasts.map((t) => [t.id, t.hasActions ? getActions(t.id) : []])),
		[toasts],
	);

	if (toasts.length === 0) return null;

	return (
		<div className="toastContainer" role="status" aria-live="polite">
			{toasts.map((toast) => {
				const Icon = ICON_MAP[toast.type];
				const isDismissing = dismissing.has(toast.id);
				const actions = actionsMap.get(toast.id) ?? [];

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
								{actions.map((action) => (
									<button
										key={action.label}
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
