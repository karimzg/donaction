'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import googleSvg from '../../../../../public/images/auth/google.svg';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

const GoogleAuth = () => {
	const { status } = useSession();
	const router = useRouter();
	const popupCenter = () => {
		sendGaEvent({
			category: 'login',
			method: 'Google',
			label: 'Google login/register',
		});
		const dualScreenLeft = window.screenLeft ?? window.screenX;
		const dualScreenTop = window.screenTop ?? window.screenY;

		const width = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

		const height = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;

		const systemZoom = width / window.screen.availWidth;

		const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
		const top = (height - 550) / 2 / systemZoom + dualScreenTop;

		const newWindow = window.open(
			'/google-signin',
			'_blank',
			`width=${500 / systemZoom},height=${550 / systemZoom},top=${top},left=${left}`,
		);

		if (newWindow) {
			newWindow.focus();
		}
	};
	useEffect(() => {
		if (status === 'authenticated' && ['/connexion'].includes(location.pathname)) {
			location.reload();
		}
	}, [status]);

	return (
		<button
			id={'googleSignInBtn'}
			onClick={popupCenter}
			className={`btn btn-outline-primary flex items-center justify-center gap-2 py-2 px-8 w-full`}
		>
			<Image src={googleSvg} alt='google' />
			Connecter avec Google
		</button>
	);
};

export default GoogleAuth;
