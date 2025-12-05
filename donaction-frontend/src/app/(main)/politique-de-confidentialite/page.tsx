import React from 'react';
import { getCookies } from '@/core/services/cms';
import RichTextBlock from '@/components/RichTextBlock';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';
import { cookies } from 'next/headers';

export async function generateMetadata() {
	const res = await getCookies(cookies().toString()).catch((error) => notFound());
	if (!res) {
		notFound();
	}
	return {
		title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Politique de confidentialité'}`,
		description: `${res?.data?.attributes?.metaDescription || ''}`,
		openGraph: {
			title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Politique de confidentialité'}`,
			description: `${res?.data?.attributes?.metaDescription || ''}`,
			url: `${new URL(SITE_URL)}/politique-de-confidentialite`,
			siteName: 'Klubr',
			images: [
				{
					url: 'https://ik.imagekit.io/klubr/tr:w-1200,ar-1.91-1/Pages/klubr_home_page_a7944e5376_gyyKlN99P.jpg?updatedAt=1717622748902',
					width: 800,
					height: 385,
					alt: 'Politique de confidentialité',
				},
			],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function Page() {
	const res = await getCookies(cookies().toString()).catch((error) => notFound());
	if (!res) {
		notFound();
	}

	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/politique-de-confidentialite`,
		name: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Politique de confidentialité'}`,
		description: `${res?.data?.attributes?.metaDescription || ''}`,
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
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className={'minMaxWidth px-6 md:px-0 flex flex-col items-center justify-center gap-10'}>
				<h1 className={'sm:text-3xl text-xl'}>
					{res?.data?.attributes?.titre || 'Politique de confidentialité'}
				</h1>
				<RichTextBlock data={res?.data?.attributes?.contenu} />
			</div>
		</div>
	);
}

// export const revalidate = 3600;
