import { signOut } from 'next-auth/react';

export function initListeners() {
	document.querySelectorAll('#LOGOUT_BTN')?.forEach((_) => {
		_?.addEventListener('click', (e) => {
			e.stopPropagation();
			e.stopImmediatePropagation();
			signOut();
		});
	});
}

export function removeListeners() {
	document.querySelectorAll('#LOGOUT_BTN')?.forEach((_) => {
		_?.removeEventListener('click', (e) => {
			e.stopPropagation();
			e.stopImmediatePropagation();
			signOut();
		});
	});
}
