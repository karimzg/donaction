import { signOut } from 'next-auth/react';

export function initListeners() {
	document.querySelectorAll('#LOGOUT_BTN')?.forEach((_) => {
		_?.addEventListener('click', (e) => {
			e.stopPropagation();
			e.stopImmediatePropagation();
			signOut();
		});
	});
	document.querySelector('#MOBILE_DRAWER_OPENER')?.addEventListener('click', (e) => {
		e.stopPropagation();
		e.stopImmediatePropagation();
		const MOBILE_DRAWER = document.querySelector('#MOBILE_DRAWER') as HTMLDivElement;
		if (MOBILE_DRAWER) {
			MOBILE_DRAWER.style.right = '0';
		}
	});
	document.querySelector('#MOBILE_DRAWER_CLOSER')?.addEventListener('click', (e) => {
		e.stopPropagation();
		e.stopImmediatePropagation();
		const MOBILE_DRAWER = document.querySelector('#MOBILE_DRAWER') as HTMLDivElement;
		if (MOBILE_DRAWER) {
			MOBILE_DRAWER.style.right = '-100%';
		}
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
	document.querySelector('#MOBILE_DRAWER_OPENER')?.removeEventListener('click', (e) => {
		e.stopPropagation();
		e.stopImmediatePropagation();
		const MOBILE_DRAWER = document.querySelector('#MOBILE_DRAWER') as HTMLDivElement;
		if (MOBILE_DRAWER) {
			MOBILE_DRAWER.style.right = '0';
		}
	});
	document.querySelector('#MOBILE_DRAWER_CLOSER')?.removeEventListener('click', (e) => {
		e.stopPropagation();
		e.stopImmediatePropagation();
		const MOBILE_DRAWER = document.querySelector('#MOBILE_DRAWER') as HTMLDivElement;
		if (MOBILE_DRAWER) {
			MOBILE_DRAWER.style.right = '-100%';
		}
	});
}
