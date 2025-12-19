import React from 'react';
import comingSoon from '../../../../public/animations/coming-soon-2.json';
import './page.scss';
import NewClubForm from '@/partials/authentication/newClubForm';
import LottieAnimation from '@/components/LottieAnimation';
import Script from 'next/script';
import { Metadata } from 'next';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: `Créez le compte de votre Klub`,
		description: `Laissez-nous vos coordonnées et nous vous recontacterons rapidement.`,
		openGraph: {
			title: `Créez le compte de votre Klub`,
			description: `Laissez-nous vos coordonnées et nous vous recontacterons rapidement.`,
			url: `${new URL(SITE_URL)}/new-club`,
			siteName: 'Donaction',
			images: [
				{
					url: 'https://ik.imagekit.io/klubr/tr:w-1200,ar-1.91-1/Pages/klubr_home_page_a7944e5376_gyyKlN99P.jpg?updatedAt=1717622748902',
					width: 800,
					height: 385,
					alt: 'Créer votre club',
				},
			],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function Page() {
	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/new-club`,
		name: `Créez le compte de votre Klub`,
		description: `Laissez-nous vos coordonnées et nous vous recontacterons rapidement.`,
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
			url: 'https://ik.imagekit.io/klubr/tr:w-1200,ar-1.91-1/Pages/klubr_home_page_a7944e5376_gyyKlN99P.jpg?updatedAt=1717622748902',
			width: '800',
			height: '385',
		},
	};
	return (
		<div className='flex flex-col items-center justify-center gap-16 text-black w-full min-h-[25rem] bg-white z-0 mb-20 mt-10'>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 w-full minMaxWidth items-center px-6 lg:px-0 lg:mt-10'>
				<LottieAnimation animation={comingSoon} />
				<div className={'flex flex-col gap-2 items-start h-full'}>
					<h1 className='font-bold text-[32px]'>Créez le compte de votre Klub !</h1>
					<h3 className={'text-md text-[#F7A74F]'}>Créons une connexion entre nous.</h3>
					<NewClubForm />
				</div>
			</div>
			<Script
				src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&language=fr`}
				async={true}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
		</div>
	);
}

// export const revalidate = 3600;
