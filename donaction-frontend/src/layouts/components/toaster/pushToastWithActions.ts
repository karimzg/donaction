import { pushToast, type IToast } from '@/core/store/modules/rootSlice';
import { registerActions, type ToastAction } from './actionRegistry';
import type { AppDispatch } from '@/core/store';

/**
 * Dispatches a toast with contextual action buttons.
 * Pre-generates an ID so callbacks can be registered in the side-channel registry
 * before the toast enters Redux state.
 */
export const pushToastWithActions = (
	dispatch: AppDispatch,
	toast: IToast,
	actions: ToastAction[],
) => {
	const id =
		crypto?.randomUUID?.() ??
		`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
	registerActions(id, actions);
	dispatch(pushToast({ ...toast, id, hasActions: true }));
};
