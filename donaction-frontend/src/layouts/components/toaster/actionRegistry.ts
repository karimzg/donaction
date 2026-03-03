/**
 * Module-level callback registry for toast actions.
 * Kept outside Redux to avoid serialization issues with function callbacks.
 * Entries are cleaned up when toasts are dismissed or the Toaster unmounts.
 */

export interface ToastAction {
	label: string;
	callback: () => void;
}

const registry = new Map<string, ToastAction[]>();

/** Register action callbacks for a toast by its ID. */
export const registerActions = (toastId: string, actions: ToastAction[]) => {
	registry.set(toastId, actions);
};

/** Retrieve action callbacks for a toast. Returns empty array if none registered. */
export const getActions = (toastId: string): ToastAction[] => {
	return registry.get(toastId) ?? [];
};

/** Remove action callbacks for a single toast. */
export const clearActions = (toastId: string) => {
	registry.delete(toastId);
};

/** Remove all entries from the registry. Called on Toaster unmount to prevent leaks. */
export const clearAllActions = () => {
	registry.clear();
};
