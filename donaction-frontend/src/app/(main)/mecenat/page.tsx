import SlideMecenat from '@/partials/mecenatPage/slideMecenat';
import DescriptionMecenat from '@/partials/mecenatPage/descriptionMecenat';
import AvantageMecenat from '@/partials/mecenatPage/avantageMecenat';
import StatsMecenat from '@/partials/mecenatPage/statsMecenat';
import ManifestMecenat from '@/partials/mecenatPage/manifestMecenat';
import Conclusion from '@/partials/mecenatPage/conclusion';
import NeedHelp from '@/partials/mecenatPage/needHelp';
import { Metadata } from 'next';
import { getMecenat } from '@/core/services/cms';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';
import React from 'react';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
	const res = await getMecenat(cookies().toString()).catch((error) => notFound());
	if (!res) {
		notFound();
	}
	return {
		title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Politique de confidentialité'}`,
		description: `${res?.data?.attributes?.metaDescription || ''}`,
		openGraph: {
			title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Politique de confidentialité'}`,
			description: `${res?.data?.attributes?.metaDescription || ''}`,
			url: `${new URL(SITE_URL)}/mecenat`,
			siteName: 'Donaction',
			images: [
				{
					url: 'https://ik.imagekit.io/donaction/tr:w-1200,ar-1.91-1/Pages/mecenat-donaction.png',
					width: 800,
					height: 385,
					alt: 'Le mécénat simplifié',
				},
			],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function Page() {
	const mecenatResult = await getMecenat(cookies().toString()).catch((error) => notFound());
	if (!mecenatResult) {
		notFound();
	}
	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/mecenat`,
		name: `${mecenatResult?.data?.attributes?.metaTitle || mecenatResult?.data?.attributes?.titre || 'Politique de confidentialité'}`,
		description: `${mecenatResult?.data?.attributes?.metaDescription || ''}`,
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
			url: 'https://ik.imagekit.io/donaction/tr:w-1200,ar-1.91-1/Pages/mecenat-donaction.png',
			width: '800',
			height: '385',
		},
	};
	return (
		<div className='flex flex-col items-center justify-center gap-16 text-black w-full z-0'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className='minMaxWidth mt-10'>
				<SlideMecenat
					isRounded
					slides={mecenatResult?.data?.attributes?.slider || []}
					imageUrl={'https://ik.imagekit.io/donaction/Pages/mecenat-donaction.png'}
				/>
			</div>
			<DescriptionMecenat />
			<AvantageMecenat />
			<StatsMecenat />
			<ManifestMecenat />
			<Conclusion />
			<NeedHelp list={mecenatResult.data.attributes.FAQ} bgColor={'#FFFAF7'} />
		</div>
	);
}

// export const revalidate = 3600;
