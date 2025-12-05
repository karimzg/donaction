import Image from 'next/image';
import loginSignIn from '../../../../public/images/auth/loginSignIn.svg';
import ResetPasswordForm from '@/partials/authentication/resetPasswordForm';
import { WebPage, WithContext } from 'schema-dts';
import { SITE_URL } from '@/core/services/endpoints';
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Réinitialiser votre mot de passe.',
	openGraph: {
		title: 'Réinitialiser votre mot de passe.',
		url: `${new URL(SITE_URL)}/reset-password`,
		siteName: 'Klubr',
		images: [
			{
				url: `${SITE_URL}/images/images/auth/loginSignIn.svg`,
				width: 800,
				height: 385,
			},
		],
		locale: 'fr_FR',
		type: 'website',
	},
};

export default function Page({ searchParams }: { searchParams?: { code?: string } }) {
	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/reset-password`,
		name: `Réinitialiser votre mot de passe.`,
		publisher: {
			'@type': 'Organization',
			name: 'Nakaa',
			url: 'https://nakaa.fr',
			logo: {
				'@type': 'ImageObject',
				url: 'https://nakaa.fr/img/NAKAA.png',
				width: '600',
				height: '272',
			},
		},
		datePublished: '2024-10-16',
		image: {
			'@type': 'ImageObject',
			url: `${SITE_URL}/images/images/auth/loginSignIn.svg`,
			width: '428',
			height: '379',
		},
	};
	return (
		<div className='flex flex-col items-center justify-center gap-16 text-black w-full min-h-[25rem] bg-white z-0 mb-20 mt-10'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-10 w-full minMaxWidth items-start px-6 md:px-0 md:mt-10'>
				<div className='flex flex-col gap-5'>
					<Image className='md:block hidden mx-auto mt-10' src={loginSignIn} alt='login' />
				</div>
				<div className='flex flex-col items-start gap-6'>
					<Image
						className='md:hidden block max-w-[70%] mx-auto'
						src={loginSignIn}
						alt='contact-us'
					/>
					<ResetPasswordForm code={searchParams?.code} />
				</div>
			</div>
		</div>
	);
}
