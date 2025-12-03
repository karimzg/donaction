import Breadcrumb from '@/partials/common/breadcrumb';
import Link from 'next/link';
import Image from 'next/image';
import arrowCircleLeft from '../../../../public/images/icons/arrowCircleLeft.svg';
import LottieAnimation from '@/components/LottieAnimation';
import emptyProjects from '../../../../public/animations/emptyProjects.json';
import React from 'react';
import { getAllClubs } from '@/core/services/club';
import PaginatedKlubsList from '@/partials/common/paginatedKlubsList';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import GetServerCookie from '@/core/helpers/getServerCookie';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
	title: 'Des clubs sportifs à soutenir',
	description:
		'Découvrez tous les clubs sportifs inscrits sur Klubr et soutenez-les en faisant un don. Votre contribution aide les clubs à grandir et à offrir de meilleures activités à leurs membres.',
	openGraph: {
		title: `Des clubs sportifs à soutenir`,
		description: `Découvrez tous les clubs sportifs inscrits sur Klubr et soutenez-les en faisant un don. Votre contribution aide les clubs à grandir et à offrir de meilleures activités à leurs membres.`,
		url: `${new URL(SITE_URL)}/clubs`,
		siteName: 'Klubr',
		images: [
			{
				url: 'https://ik.imagekit.io/klubr/tr:w-1200,ar-1.91-1/Pages/klubr_home_page_a7944e5376_gyyKlN99P.jpg?updatedAt=1717622748902',
				width: 800,
				height: 385,
				alt: 'Des clubs sportifs à soutenir',
			},
		],
		locale: 'fr_FR',
		type: 'website',
	},
};

export default async function page() {
	const isPreview = await GetServerCookie('isPreviewMode');
	const result = await getAllClubs(1, 10, true, false, !!isPreview, cookies().toString()).catch(
		(error) => notFound(),
	);
	if (!result) {
		notFound();
	}
	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${SITE_URL}/clubs`,
		name: `Des clubs sportifs à soutenir`,
		description:
			'Découvrez tous les clubs sportifs inscrits sur Klubr et soutenez-les en faisant un don. Votre contribution aide les clubs à grandir et à offrir de meilleures activités à leurs membres.',
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
		<div className='text-black py-10 z-10 bg-white w-full min-h-[25rem] flex flex-col items-center'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className='minMaxWidth flex flex-col gap-6'>
				<Breadcrumb params={{}} />
				<Link href={`/`} className='flex items-center gap-2 px-6 md:px-0'>
					<Image src={arrowCircleLeft as string} alt='arrow-circle-left' />
					<p className='font-bold md:text-3xl text-xl'>Découvrez les klubs :</p>
				</Link>
				{result?.data?.length > 0 ? (
					<div
						className={
							'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center justify-center minMaxWidth px-6 md:px-0'
						}
					>
						<PaginatedKlubsList
							type={'all_clubs'}
							data={result.data}
							pagination={result.meta.pagination}
						/>
					</div>
				) : (
					<div className='flex flex-col items-center gap-6 px-6 md:px-0'>
						<LottieAnimation animation={emptyProjects} />
						<p className='md:text-2xl text-lg text-[#727272] max-w-[584px] text-center'>
							"Pour l'instant, pas de projet en vue, mais <b className='text-black'>restez prêts</b>{' '}
							pour ce qui arrive!"
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

// export const revalidate = 3600;
