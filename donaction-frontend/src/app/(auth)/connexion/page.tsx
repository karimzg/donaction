import GoogleAuth from '@/partials/authentication/googleForm';
import Image from 'next/image';
import loginSignIn from '../../../../public/images/auth/loginSignIn.svg';
import cautionIcon from '../../../../public/images/icons/caution.svg';
import forbidden403 from '../../../../public/animations/403.json';
import LottieAnimation from '@/components/LottieAnimation';
import KillCookie from '@/components/KillCookie';
import { cookies } from 'next/headers';
import ConnexionForm from '@/partials/authentication/connexionForm';
import { getAvatars } from '@/core/services/auth';
import { WebPage, WithContext } from 'schema-dts';
import { SITE_URL } from '@/core/services/endpoints';
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'On ne se connait pas encore! Créez votre compte.',
	openGraph: {
		title: 'On ne se connait pas encore! Créez votre compte.',
		url: `${new URL(SITE_URL)}/connexion`,
		siteName: 'Donaction',
		images: [
			{
				url: `${SITE_URL}/images/images/auth/loginSignIn.svg`,
				width: 800,
				height: 385,
				alt: 'Se Connecter',
			},
		],
		locale: 'fr_FR',
		type: 'website',
	},
};
export default async function page({
	params,
	searchParams,
}: {
	params: any;
	searchParams?: { [key: string]: string | string[] | undefined };
}) {
	const womenAvatars = await getAvatars('women', 1, 5, cookies().toString());
	const menAvatars = await getAvatars('men', 1, 5, cookies().toString());
	const message = cookies().get('message')?.value || undefined;

	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/connexion`,
		name: `On ne se connait pas encore! Créez votre compte.`,
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
			<KillCookie />
			<div className='grid grid-cols-1 md:grid-cols-2 gap-10 w-full minMaxWidth items-start px-6 md:px-0 md:mt-10'>
				{!!searchParams?.isUnAuthorized ? (
					<div className={'max-w-[300px] md:block hidden mx-auto mt-10'}>
						<div className={''}>
							<LottieAnimation animation={forbidden403} />
						</div>
						<p className={'text-2xl text-center mt-4'}>
							Vous devez être connecté pour accéder à cette page.
						</p>
					</div>
				) : (
					<div className='flex flex-col gap-5'>
						{message && (
							<div className='bg-[#3A9EE41A]/10 rounded p-3'>
								<Image
									src={cautionIcon}
									alt='caution'
									className='inline relative top-[-2px]'
								></Image>
								<p className='inline text-[#3A9EE4] font-medium leading-6'> {message} </p>
							</div>
						)}
						<Image className='md:block hidden mx-auto mt-10' src={loginSignIn} alt='login' />
					</div>
				)}
				<div className='flex flex-col items-start gap-6'>
					{!!searchParams?.isUnAuthorized ? (
						<div className={'md:hidden block mx-auto'}>
							<div className={'max-w-[200px] mx-auto'}>
								<LottieAnimation animation={forbidden403} />
							</div>
							<p className={'text-xl text-center mt-4'}>
								Vous devez être connecté pour accéder à cette page.
							</p>
						</div>
					) : (
						<Image
							className='md:hidden block max-w-[70%] mx-auto'
							src={loginSignIn}
							alt='contact-us'
						/>
					)}
					<ConnexionForm
						value={{ email: (searchParams?.email as string) || '' }}
						avatars={{
							womenAvatars: womenAvatars?.slice(0, 5),
							menAvatars: menAvatars?.slice(0, 5),
						}}
					/>
					<p className='lineThrough w-full text-[#C1BFBF]'>
						<span>Ou</span>
					</p>
					<GoogleAuth />
				</div>
			</div>
		</div>
	);
}
