import React from 'react';
import { getCGU } from '@/core/services/cms';
import RichTextBlock from '@/components/RichTextBlock';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
	const res = await getCGU(cookies().toString()).catch((error) => notFound());
	if (!res) {
		notFound();
	}
	return {
		title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || "Conditions Générales d'Utilisation"}`,
		description: `${res?.data?.attributes?.metaDescription || ''}`,
		openGraph: {
			title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || "Conditions Générales d'Utilisation"}`,
			description: `${res?.data?.attributes?.metaDescription || ''}`,
			url: `${new URL(SITE_URL)}/conditions-generales-d-utilisation`,
			siteName: 'Klubr',
			images: [
				{
					url: 'https://ik.imagekit.io/klubr/tr:w-1200,ar-1.91-1/Pages/klubr_home_page_a7944e5376_gyyKlN99P.jpg?updatedAt=1717622748902',
					width: 800,
					height: 385,
					alt: "Conditions Générales d'Utilisation",
				},
			],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function Page() {
	const res = await getCGU(cookies().toString()).catch((error) => notFound());
	if (!res) {
		notFound();
	}

	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/conditions-generales-d-utilisation`,
		name: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || "Conditions Générales d'Utilisation"}`,
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
					{res?.data?.attributes?.titre || "Conditions Générales d'Utilisation"}
				</h1>
				<RichTextBlock data={res?.data?.attributes?.content} />
			</div>
		</div>
	);
}

// export const revalidate = 3600;
