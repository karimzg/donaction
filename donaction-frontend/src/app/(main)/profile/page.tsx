import React from 'react';
import { getAvatars } from '@/core/services/auth';
import ProfilePage from '@/partials/profilePage';
import { WebPage, WithContext } from 'schema-dts';
import { SITE_URL } from '@/core/services/endpoints';
import { cookies } from 'next/headers';

export default async function Page() {
	const womenAvatars = await getAvatars('women', 1, 10, cookies().toString());
	const menAvatars = await getAvatars('men', 1, 10, cookies().toString());

	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/profile`,
		// name: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || "Conditions Générales d'Utilisation"}`,
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
			url: 'https://ik.imagekit.io/donaction/tr:w-1200,ar-1.91-1/Pages/donaction_home_page.jpg',
			width: '800',
			height: '385',
		},
	};

	return (
		<div className='flex flex-col items-center justify-start gap-16 text-black w-full min-h-[25rem] bg-white mb-20 mt-10 z-0'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<ProfilePage avatars={{ womenAvatars, menAvatars }} />
		</div>
	);
}
