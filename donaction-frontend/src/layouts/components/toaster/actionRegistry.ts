/**
 * Module-level callback registry for toast actions.
 * Kept outside Redux to avoid serialization issues with function callbacks.
 */

export interface ToastAction {
	label: string;
	callback: () => void;
}

const registry = new Map<string, ToastAction[]>();

export const registerActions = (toastId: string, actions: ToastAction[]) => {
	registry.set(toastId, actions);
};

export const getActions = (toastId: string): ToastAction[] => {
	return registry.get(toastId) ?? [];
};

export const clearActions = (toastId: string) => {
	registry.delete(toastId);
};
