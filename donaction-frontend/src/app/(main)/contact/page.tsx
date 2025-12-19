import NeedHelp from '@/partials/mecenatPage/needHelp';
import ContactUsForm from '@/partials/authentication/contactUsForm';
import React from 'react';
import { getContactPage } from '@/core/services/cms';
import Image from 'next/image';
import contactUS from '../../../../public/images/icons/contact/contact.svg';
import './page.scss';
import { Metadata } from 'next';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';
import { cookies } from 'next/headers';
import srcLoader from '@/core/helpers/srcLoader';

export async function generateMetadata(): Promise<Metadata> {
	const res = await getContactPage(cookies().toString());
	const imageUrl = res?.data?.attributes?.visuel?.data?.attributes?.url || '';
	return {
		title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Contactez-nous'}`,
		description: `${res?.data?.attributes?.metaDescription || 'Laissez-nous vos coordonnées et votre message et nous vous recontacterons rapidement.'}`,
		openGraph: {
			title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Contactez-nous'}`,
			description: `${res?.data?.attributes?.metaDescription || 'Laissez-nous vos coordonnées et votre message et nous vous recontacterons rapidement.'}`,
			url: `${new URL(SITE_URL)}/contact`,
			siteName: 'Donaction',
			images: [
				{
					url: srcLoader(imageUrl, 'tr:w-1200,ar-1.91-1'),
					width: 427,
					height: 374,
					alt: 'Contactez-nous',
				},
			],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function Page() {
	const content = await getContactPage(cookies().toString());
	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/contact`,
		name: `${content?.data?.attributes?.metaTitle || content?.data?.attributes?.titre || 'Contactez-nous'}`,
		description: `${content?.data?.attributes?.metaDescription || 'Laissez-nous vos coordonnées et votre message et nous vous recontacterons rapidement.'}`,
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
			url: content?.data?.attributes?.visuel?.data?.attributes?.url,
			width: '427',
			height: '374',
		},
	};
	return (
		<div className='flex flex-col items-center justify-center gap-16 text-black w-full min-h-[25rem] bg-white z-0 mb-20 mt-10'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full minMaxWidth items-center px-6 md:px-0 md:mt-10'>
				{/*contactMaxWidth grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-center px-6 md:px-0 md:mt-10 mx-auto*/}
				{/*// TODO: implement ImageHtml namedtransformation*/}
				<Image className='md:block hidden mx-auto' src={contactUS as string} alt='contact-us' />
				<ContactUsForm
					title={content.data.attributes.titre}
					content={content.data.attributes.contenu[0].children[0].text}
					imageUrl={content.data.attributes.visuel.data.attributes.url}
				/>
			</div>

			{content?.data?.attributes?.FAQ && (
				<div className='w-full mt-80'>
					<NeedHelp list={content.data.attributes.FAQ} />
				</div>
			)}
		</div>
	);
}

// export const revalidate = 3600;
