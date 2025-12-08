'use client';

import { useEffect, useState } from 'react';

const KillCookie = () => {
	const [message, setMessage] = useState<string | undefined>(undefined);

	useEffect(() => {
		const getCookie = (name: string) => {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) return parts.pop()?.split(';').shift();
		};

		const messageCookie = getCookie('message');
		setMessage(messageCookie);

		if (messageCookie && !getCookie('redirectAfterAuth')) {
			console.log('message', messageCookie);
			document.cookie = 'message=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		}
	}, []);

	return <></>;
};

export default KillCookie;
