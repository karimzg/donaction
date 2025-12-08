import ClubIntroduction from '@/partials/clubPage/clubIntroduction';
import Counter, { ICounter } from '@/components/Counter';
import ClubDescription from '@/partials/clubPage/clubDescription';
import React from 'react';
import {
	getAllClubsSlugs,
	getClubDetailBySlug,
	getClubHouse,
	getClubsSlugs,
} from '@/core/services/club';
import { notFound, redirect } from 'next/navigation';
import { getProjetsByKlub } from '@/core/services/projet';
import { Klub, KlubHouse } from '@/core/models/club';
import Breadcrumb from '@/partials/common/breadcrumb';
import PlusProjects from '@/partials/common/plusProjects';
import './index.scss';
import ManagersWordSection from '@/partials/common/sections/managersWordSection';
import QuoteSection from '@/partials/common/sections/quoteSection';
import KlubrSupportSection from '@/partials/common/sections/klubrSupportSection';
import TextImageSection from '@/partials/common/sections/textImageSection';
import PartnersSection from '@/partials/common/sections/partnersSection';
import LocalizationSection from '@/partials/common/sections/localizationSection';
import { StrapiComponent } from '@/core/models/strapi-component';
import Header from '@/partials/common/header/index';
import Footer from '@/partials/common/footer';
import Script from 'next/script';
import { cookies } from 'next/headers';
import StatusIndicator from '@/partials/common/statusIndicator';
import { getServerSession } from 'next-auth';
import { SITE_URL } from '@/core/services/endpoints';
import { getDonsByKlubOrProjet } from '@/core/services/don';
import SponsorshipForm from '@/partials/_sponsorshipForm';
import DonateButton from '@/partials/common/donateButton';
import srcLoader from '@/core/helpers/srcLoader';

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
	const slugsResp: Array<{ slug: string; updatedAt: string }> = await getAllClubsSlugs(
		undefined,
		true,
	).catch((error) => {
		console.error('Error fetching clubs slugs', error);
		return [];
	});
	return slugsResp;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
	const cookieStore = cookies();
	const session = await getServerSession();
	const klub: Klub = await getClubDetailBySlug(
		params.slug,
		!!cookieStore.get('isPreviewMode')?.value,
		cookieStore.toString(),
	).catch((error) => {
		switch (error?.error?.status) {
			case 401:
				if (session && session?.user) {
					redirect('/forbidden');
				}
				const redirectTo = encodeURIComponent(`/${params.slug}`);
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
	if (!klub) {
		notFound();
	}
	const klubHouse: KlubHouse = await getClubHouse(
		klub?.klubr_house?.uuid,
		cookies().toString(),
	).catch((error) => notFound());
	const getOgAsset = () => {
		const isImage = /\.(jpg|jpeg|png|gif|svg)$/i.test(klubHouse?.couvertureMedia?.url);
		return [
			{
				url:
					srcLoader(
						klubHouse[isImage ? 'couvertureMedia' : 'poster_media']?.url || klub?.logo?.url,
						'tr:w-1200,ar-1.91-1',
					) || '',
				width: klubHouse[isImage ? 'couvertureMedia' : 'poster_media']?.width || klub?.logo?.width,
				height:
					klubHouse[isImage ? 'couvertureMedia' : 'poster_media']?.height || klub?.logo?.height,
				alt: klubHouse[isImage ? 'couvertureMedia' : 'poster_media']?.alt || klub?.logo?.alt,
			},
		];
	};
	return {
		title: klub.denomination,
		description:
			klubHouse.metaDescription || `${klub.denomination} - Soutenez nous grâce au mécénat!`,
		openGraph: {
			title: klub.denomination,
			description:
				klubHouse.metaDescription || `${klub.denomination} - Soutenez nous grâce au mécénat!`,
			url: `${new URL(SITE_URL)}/${params.slug}`,
			siteName: 'Donaction',
			images: [...getOgAsset()],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function club({ params }: { params: { slug: string } }) {
	const cookieStore = cookies();
	const slugs = await getClubsSlugs(5, cookies().toString()).catch((error) => {
		console.error('Slug Layout: Error fetching clubs slugs', error?.config);
		return [];
	});
	const klub: Klub = await getClubDetailBySlug(
		params.slug,
		!!cookieStore.get('isPreviewMode')?.value,
		cookieStore.toString(),
	).catch((error) => notFound());
	if (!klub || !klub?.klubr_house) {
		notFound();
	}
	const klubHouse: KlubHouse = await getClubHouse(
		klub.klubr_house.uuid,
		cookieStore.toString(),
	).catch(() => notFound());
	if (!klubHouse) {
		notFound();
	}
	const projets = await getProjetsByKlub(
		klub.uuid,
		undefined,
		undefined,
		undefined,
		cookies().toString(),
	).catch((error) => {
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
	});
	const primaryColor = klub.klubr_house?.primary_color || '#F17424';
	const secondaryColor = klub.klubr_house?.secondary_color || '#000000';
	const textColor = klub.klubr_house?.header_text_color || '#000000';
	const footerTextColor = klub.klubr_house?.footer_text_color || '#FFFFFF';

	/* ClubIntroduction */
	const category =
		klub.associationType +
		(klub.sportType && klub.sportType !== 'Autre' ? ' - ' + klub.sportType : '');

	/* ClubInfos */
	const clubInfos: Array<ICounter> | undefined = !!klubHouse.chiffres?.length
		? klubHouse.chiffres.map((chiffre) => ({
				count: +chiffre.chiffre,
				desc: chiffre.label,
				unit: '',
			}))
		: undefined;

	const displaySection = (component: StrapiComponent, index: number) => {
		switch (component.__component) {
			case 'club-presentation.mot-du-dirigeant':
				return (
					<ManagersWordSection
						key={index}
						component={component}
						textColor={textColor}
						primaryColor={primaryColor}
						secondaryColor={secondaryColor}
					/>
				);
			case 'club-presentation.section-citation':
				return (
					<QuoteSection key={index} component={component} primaryColor={primaryColor} klub={klub} />
				);
			case 'club-presentation.pourquoi-klubr-accompagne':
				return (
					<KlubrSupportSection
						key={index}
						component={component}
						primaryColor={primaryColor}
						klub={klub}
						klubHouse={klubHouse}
					/>
				);
			case 'composant-atoms.section-texte-image':
				return <TextImageSection key={index} component={component} />;

			default:
				return <></>;
		}
	};

	const displaySectionLocalisation = (component: StrapiComponent, index: number) => {
		if (component.__component === 'club-presentation.localisation') {
			return <LocalizationSection key={index} component={component} />;
		}
		return <></>;
	};

	const session = await getServerSession();
	const ourSponsors = await getDonsByKlubOrProjet(klub.uuid, 'byKlub', 1, 8);

	const localisation = klubHouse.club_presentation.find(
		(_) => _.__component === 'club-presentation.localisation',
	);

	const potentialAction = klub.donationEligible
		? {
				'@type': 'DonateAction',
				name: `Contribuez au développement de ${klub.denomination}`,
				url: `${SITE_URL}/${params.slug}?PAYEMENT_FORM=true`,
				target: `${SITE_URL}/${params.slug}?PAYEMENT_FORM=true`,
				recipient: {
					'@type': 'SportsClub',
					name: klub.denomination,
					url: `${SITE_URL}/${params.slug}`,
					address: {
						'@type': 'PostalAddress',
						streetAddress: klub.siegeSocialAdresse,
						addressLocality: klub.siegeSocialVille,
						postalCode: klub.siegeSocialCP,
						addressCountry: klub.siegeSocialPays,
						description: localisation?.googleMap?.description,
					},
				},
			}
		: [];
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'SportsClub',
		name: klub.denomination,
		description:
			klubHouse.metaDescription || `${klub.denomination} - Soutenez nous grâce au mécénat!`,
		url: `${SITE_URL}/${params.slug}`,
		slogan: klub.slogan,
		keywords: [
			klub.federation,
			klub.associationType,
			klub.denomination,
			klub.sportType,
			klub.acronyme,
		],
		logo: {
			'@type': 'ImageObject',
			url: klub?.logo?.url,
			width: `${klub?.logo?.width}`,
			height: `${klub?.logo?.height}`,
		},
		address: {
			'@type': 'PostalAddress',
			streetAddress: klub.siegeSocialAdresse,
			addressLocality: klub.siegeSocialVille,
			postalCode: klub.siegeSocialCP,
			addressCountry: klub.siegeSocialPays,
			description: localisation?.googleMap?.description,
		},
		longitude: localisation?.googleMap?.lng,
		latitude: localisation?.googleMap?.lat,
		contactPoint: {
			'@type': 'ContactPoint',
			telephone: localisation?.telContact,
			email: localisation?.emailContact,
		},
		foundingDate: klubHouse.chiffres.find((_) => _.label === 'Année de fondation')?.chiffre,
		potentialAction,
	};

	return (
		<>
			<Script
				id='mapScript'
				async={true}
				defer={true}
				src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&loading=async&libraries=marker`}
			></Script>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<Header
				session={session}
				slugs={slugs}
				bg1={secondaryColor}
				bg2={primaryColor}
				txtColor={textColor}
			/>
			<StatusIndicator
				status={klub.status || ''}
				uuid={klub.uuid}
				css={String(
					'px-4 py-2 bg-white rounded-full absolute left-unset right-[10px] top-[65px] z-10 boxBoxShadow text-[#8312C8]',
				)}
			/>
			<DonateButton color={klubHouse.primary_color} color2={klubHouse.secondary_color} />
			<div className='clubPageContainer flex flex-col items-center justify-center gap-10 md:mt-10'>
				<ClubIntroduction
					uuid={klub.uuid}
					slug={klub.slug}
					name={klub.denomination}
					category={category}
					slogan={klub.slogan}
					introMedia={klubHouse.couvertureMedia}
					logo={klub.logo}
				/>
				{!!clubInfos && (
					<div className='grid grid-cols-3 w-full'>
						{clubInfos.map((_, index) => (
							<div
								className='clubPageContainer__counterCont flex flex-col items-center justify-start'
								key={index}
							>
								<Counter {..._} />
							</div>
						))}
					</div>
				)}

				<Breadcrumb
					params={{
						slug: params.slug,
						denomination: klub.denomination,
					}}
				/>

				<ClubDescription
					uuid={klub.uuid}
					klubSlug={klub.slug}
					klubName={klub.denomination}
					title={klubHouse.title}
					description={klubHouse.description}
					ourSponsors={ourSponsors}
				/>

				{klubHouse.club_presentation
					?.filter((_) => _.__component === 'composant-atoms.section-texte-image')
					?.map((component, _index) => displaySection(component, _index))}

				<div className='w-full flex flex-col items-start gap-6'>
					<h2 className='font-semibold text-[32px] text-black px-6 md:px-0'>Nos Projets</h2>
					<PlusProjects projets={projets} klub={klub} pageCount={projets.pagination.pageCount} />
				</div>

				{klubHouse.club_presentation
					?.filter((_) => _.__component !== 'composant-atoms.section-texte-image')
					?.map((component, _index) => displaySection(component, _index))}

				{/*{klub?.donationEligible && (*/}
				<div className='w-full md:minMaxWidth mb-20' id='PAYEMENT_FORM_ID'>
					<SponsorshipForm club={klub} klubrUuid={klub.uuid} />
				</div>
				{/*)}*/}

				{klubHouse?.partnerList?.length ? (
					<PartnersSection list={klubHouse?.partnerList} primaryColor={primaryColor} />
				) : null}
				{klubHouse.club_presentation.map((section, index) =>
					displaySectionLocalisation(section, index),
				)}
			</div>
			<Footer bg1={secondaryColor} bg2={primaryColor} textColor={footerTextColor} />
		</>
	);
}
