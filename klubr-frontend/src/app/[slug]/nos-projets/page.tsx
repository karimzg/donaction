import React from 'react';
import Link from 'next/link';
import { getClubDetailBySlug, getClubsSlugs } from '@/core/services/club';
import { getProjetsByKlub } from '@/core/services/projet';
import { notFound, redirect } from 'next/navigation';
import { Klub } from '@/core/models/club';
import Breadcrumb from '@/partials/common/breadcrumb';
import Image from 'next/image';
import arrowCircleLeft from '../../../../public/images/icons/arrowCircleLeft.svg';
import LottieAnimation from '@/components/LottieAnimation';
import emptyProjects from '../../../../public/animations/emptyProjects.json';
import PaginatedProjectsList from '@/partials/common/paginatedProjectsList';
import Header from '@/partials/common/header/index';
import Footer from '@/partials/common/footer';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { SITE_URL } from '@/core/services/endpoints';
import srcLoader from '@/core/helpers/srcLoader';

// Todo: Meta data
export async function generateMetadata({ params }: { params: { slug: string } }) {
	const cookieStore = cookies();
	const session = await getServerSession();
	const klub: Klub = await getClubDetailBySlug(
		params.slug,
		!!cookieStore.get('isPreviewMode')?.value,
	).catch((error) => {
		console.error('Error fetching club detail by slug | nos projets/page Metadata', error?.config);
		switch (error?.error?.status) {
			case 401:
				if (session && session?.user) {
					redirect('/forbidden');
				}
				const redirectTo = encodeURIComponent(`/${params.slug}/nos-projets?preview=true`);
				redirect(`/connexion?isUnAuthorized=true&redirect=${redirectTo}`);
				break;
			case 403:
				redirect('/forbidden');
				break;
			case 404:
			default:
				notFound();
		}
	});
	return {
		title: `${klub?.denomination || ''} | Nos projets`,
		openGraph: {
			title: `${klub?.denomination || ''} | Nos projets`,
			url: `${new URL(SITE_URL)}/${params.slug}/nos-projets`,
			siteName: 'Klubr',
			images: [
				{
					url: srcLoader(klub?.logo?.url, 'tr:w-1200,ar-1.91-1'),
					width: klub?.logo?.width,
					height: klub?.logo?.height,
					alt: klub?.logo?.alt,
				},
			],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function OurProjectsPage({ params }: { params: { slug: string } }) {
	const cookieStore = cookies();
	const slugs = await getClubsSlugs(5, cookies().toString()).catch((error) => {
		console.error('Slug Layout: Error fetching clubs slugs', error?.config);
		return [];
	});
	const klub = await getClubDetailBySlug(
		params.slug,
		!!cookieStore.get('isPreviewMode')?.value,
		cookies().toString(),
	).catch((error) => {
		console.error('Error fetching club detail by slug | nos projets/page', error?.config);
		notFound();
	});
	if (!klub) {
		notFound();
	}
	const primaryColor = klub?.klubr_house?.primary_color || '#FFFFFF';
	const secondaryColor = klub?.klubr_house?.secondary_color || '#000000';
	const textColor = klub?.klubr_house?.header_text_color || '#000000';
	const footerTextColor = klub.klubr_house?.footer_text_color || '#FFFFFF';
	const result = await getProjetsByKlub(klub.uuid, 1, 10, undefined, cookies().toString()).catch(
		(error) => {
			console.error('Error fetching projets', error?.config);
			return {
				data: [],
				pagination: {
					page: 1,
					currentPage: 1,
					pageSize: 0,
					pageCount: 1,
					total: 0,
				},
			};
		},
	);
	const session = await getServerSession();

	return (
		<>
			<Header
				session={session}
				slugs={slugs}
				bg1={secondaryColor}
				bg2={primaryColor}
				txtColor={textColor}
			/>
			<div className='text-black py-10 z-10 bg-white w-full min-h-[25rem] flex flex-col items-center'>
				<div className='minMaxWidth flex flex-col gap-6'>
					<Breadcrumb
						params={{
							slug: params.slug,
							denomination: klub.denomination,
						}}
					/>
					<Link href={`/${klub.slug}`} className='flex items-center gap-2 px-6 md:px-0'>
						<Image src={arrowCircleLeft as string} alt='arrow-circle-left' />
						<p className='font-bold md:text-3xl text-xl'>
							{klub?.denomination || 'Klubr'}: Nos projets
						</p>
					</Link>
					{result?.data?.length > 0 ? (
						<div className='flex flex-col gap-10 px-6 md:px-0'>
							<PaginatedProjectsList
								type={'club_projects'}
								data={result.data}
								pagination={result.pagination}
								club={{ uuid: klub.uuid, slug: klub.slug }}
							/>
						</div>
					) : (
						<div className='flex flex-col items-center gap-6 px-6 md:px-0'>
							<LottieAnimation animation={emptyProjects} />
							<p className='md:text-2xl text-lg text-[#727272] max-w-[584px] text-center'>
								"Pour l'instant, pas de projet en vue, mais{' '}
								<b className='text-black'>restez prêts</b> pour ce qui arrive!"
							</p>
						</div>
					)}
				</div>
			</div>
			<Footer bg1={secondaryColor} bg2={primaryColor} textColor={footerTextColor} />
		</>
	);
}
