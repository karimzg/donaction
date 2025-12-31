import SlideMecenat from '@/partials/mecenatPage/slideMecenat';
import NeedHelp from '@/partials/mecenatPage/needHelp';
import { Metadata } from 'next';
import { getCGU, getHp } from '@/core/services/cms';
import Quote from '@/partials/clubPage/quote/_index';
import React from 'react';
import { getProjets } from '@/core/services/projet';
import PlusProjects from '@/partials/common/plusProjects';
import { getAllClubs } from '@/core/services/club';
import Link from 'next/link';
import ClubCard from '@/partials/clubPage/clubCard';
import { StrapiComponent } from '@/core/models/strapi-component';
import TextImageSection from '@/partials/common/sections/textImageSection';
import PartnersSection from '@/partials/common/sections/partnersSection';
import NewslettersForm from '@/partials/common/newslettersForm';
import { notFound } from 'next/navigation';
import GetServerCookie from '@/core/helpers/getServerCookie';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
	const res = await getHp(cookies().toString()).catch((error) => notFound());
	if (!res) {
		notFound();
	}
	return {
		title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Le sport unit, le don renforce!'}`,
		description: `${res?.data?.attributes?.metaDescription || ''}`,
		openGraph: {
			title: `${res?.data?.attributes?.metaTitle || res?.data?.attributes?.titre || 'Le sport unit, le don renforce!'}`,
			description: `${res?.data?.attributes?.metaDescription || ''}`,
			url: new URL(SITE_URL),
			siteName: 'Donaction',
			images: [
				{
					url: 'https://ik.imagekit.io/donaction/tr:w-1200,ar-1.91-1/Pages/donaction_home_page.jpg',
					width: 800,
					height: 385,
					alt: 'Page home',
				},
			],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function Page() {
	const isPreview = await GetServerCookie('isPreviewMode');
	const hpResult = await getHp(cookies().toString()).catch((error) => notFound());
	if (!hpResult) {
		notFound();
	}
	const projets = await getProjets(1, 3, true, !!isPreview, cookies().toString());
	const clubs = await getAllClubs(1, 4, true, true, !!isPreview, cookies().toString());

	const displaySection = (component: StrapiComponent, index: number) => {
		switch (component.__component) {
			case 'composant-atoms.section-texte-image':
				return <TextImageSection key={index} component={component} />;
			default:
				return <></>;
		}
	};
	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: SITE_URL,
		name: `${hpResult?.data?.attributes?.metaTitle || hpResult?.data?.attributes?.titre || 'Le sport unit, le don renforce!'}`,
		description: `${hpResult?.data?.attributes?.metaDescription || ''}`,
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
		<div className='flex flex-col items-center justify-center gap-16 text-black w-full z-0'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className='w-full'>
				<SlideMecenat
					slides={hpResult?.data?.attributes?.slider || []}
					imageUrl={
						'https://ik.imagekit.io/donaction/Pages/donaction_home_page.jpg'
					}
				/>
			</div>

			<div
				className={
					'minMaxWidth flex flex-col items-center justify-center gap-16 w-full md:px-0 px-6 z-10'
				}
			>
				<p className={'text-center font-semibold text-xl lg:text-3xl xl:text-[42px]'}>
					{hpResult?.data?.attributes?.titre}
				</p>
				{hpResult?.data?.attributes?.contenu?.map((section, index) =>
					displaySection(section, index),
				)}
				{/* TODO: Quotes strapi */}
				<Quote
					primaryColor={'#000'}
					secondaryColor={'#FFF'}
					textColor={'#FFF'}
					owner={''}
					richText={[
						{
							type: 'paragraph',
							children: [{ type: 'text', text: 'Le sport unit, le don renforce !' }],
						},
					]}
					textSize={'text-md md:text-2xl'}
				/>
			</div>
			{projets && process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod' ? (
				<div className='minMaxWidth w-full'>
					<div className='w-full flex flex-col items-start gap-6'>
						<h2 className='font-semibold text-3xl text-black px-6 md:px-0'>Les projets en cours</h2>
						<PlusProjects projets={projets} pageCount={2} />
					</div>
				</div>
			) : null}
			{clubs?.data?.length > 0 && process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod' ? (
				<div
					style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)' }}
					className=' flex items-center w-full bg-[#D9D9D93C] pt-40 pb-72'
				>
					<div className='flex flex-col items-center w-full gap-10 md:px-0 px-6'>
						<h2 className='font-semibold text-3xl'>Ces associations ont besoin de soutiens</h2>
						<div
							className={
								'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center justify-center minMaxWidth'
							}
						>
							{clubs.data.map((_) => (
								<ClubCard club={_} />
							))}
						</div>
						<Link href={'/clubs'} className={'btn btn-primary rounded-xl py-2'}>
							Voir les Clubs
						</Link>
					</div>
				</div>
			) : null}
			<div
				style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)' }}
				className='flex items-center w-full bg-[#FFF] pt-40 pb-72 -mt-52 z-0'
			>
				<div className='flex flex-col items-center w-full gap-10 md:px-0 px-6'>
					{hpResult?.data?.attributes?.partnerList?.length ? (
						<div className={'minMaxWidth'}>
							<PartnersSection list={hpResult?.data?.attributes?.partnerList} />
						</div>
					) : null}
					<div
						className={
							'bg-black p-4 md:px-12 rounded-3xl flex flex-col items-center justify-center gap-6 text-white text-center mt-6 md:minMaxWidth w-full'
						}
					>
						<p className={'font-semibold text-xl mt-4'}>Rejoignez la communauté Klubr</p>
						<p>Abonnez-vous pour recevoir les dernières nouvelles de Klubr;</p>
						<NewslettersForm />
					</div>
				</div>
			</div>
			<NeedHelp list={hpResult?.data?.attributes?.FAQ} />
		</div>
	);
}

// export const revalidate = 3600;
