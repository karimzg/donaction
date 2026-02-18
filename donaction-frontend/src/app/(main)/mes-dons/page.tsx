import React from 'react';
import { getMesDonsPage } from '@/core/services/cms';
import NeedHelp from '@/partials/mecenatPage/needHelp';
import MyDonations from '@/partials/myDonations';
import { WebPage, WithContext } from 'schema-dts';
import { SITE_URL, OG_DEFAULT_IMAGE } from '@/core/services/endpoints';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Mes dons',
	description: 'Consultez l\'historique de vos dons et téléchargez vos reçus fiscaux.',
	robots: { index: false, follow: false },
};

export default async function Page() {
	const content = await getMesDonsPage(cookies().toString());
	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/mes-dons`,
		// name: `Conditions Générales d'Utilisation`,
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
			url: OG_DEFAULT_IMAGE,
			width: '800',
			height: '385',
		},
	};
	return (
		<div className='flex flex-col items-center justify-start gap-16 w-full z-0 min-h-[25rem] text-black py-10'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className={'minMaxWidth px-6 md:px-0'}>
				<h1 className='font-bold md:text-3xl text-xl mb-4'>Liste de mes dons</h1>
				<MyDonations />
			</div>
			{content?.data?.attributes?.FAQ && (
				<div className='w-full mt-80'>
					<NeedHelp list={content.data.attributes.FAQ} />
				</div>
			)}
		</div>
	);
}
