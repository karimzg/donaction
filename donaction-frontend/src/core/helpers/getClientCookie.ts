'use client';

export default function GetClientCookie(cookieName: string): string | null {
	const nameEQ = cookieName + '=';
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i].trim();
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

export const SetClientCookie = (name: string, value: string, days = 365): void => {
	let expires = '';
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = '; expires=' + date.toUTCString();
	}
	document.cookie = name + '=' + value + expires + '; path=/';
};

export const DeleteClientCookie = (name: string): void => {
	document.cookie = name + '=; Max-Age=-99999999;';
};
