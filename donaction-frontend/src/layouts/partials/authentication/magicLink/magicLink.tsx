'use client';

import { signIn } from 'next-auth/react';

const MagicLink = () => {
	const magicLink = () => {
		signIn('email', {
			email: 'medchouiref@outlook.com',
			redirect: false,
			callbackUrl: '/',
		}).then((res) => {
			console.log(res, '&&&');
		});
	};
	return (
		<button
			onClick={magicLink}
			className={`btn btn-outline-primary flex items-center justify-center gap-2 py-2 px-8 w-full md:max-w-[400px]`}
		>
			Avec Magic link
		</button>
	);
};

export default MagicLink;
