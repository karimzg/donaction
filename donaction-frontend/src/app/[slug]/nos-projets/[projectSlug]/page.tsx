import React from 'react';
import './index.scss';
import ProjectDescription from '@/partials/projectPage/projectDecription';
import ClubIntroduction from '@/partials/clubPage/clubIntroduction';
import { getClubDetailBySlug, getClubHouse, getClubsSlugs } from '@/core/services/club';
import {
	getAllProjetsSlugsWithClubSlug,
	getProjetDetail,
	getProjetsByKlub,
} from '@/core/services/projet';
import { notFound, redirect } from 'next/navigation';
import RichTextBlock from '@/components/RichTextBlock';
import { getMecenatReassurance } from '@/core/services/cms';
import Link from 'next/link';
import { KlubProjet } from '@/core/models/klub-project';
import { Klub, KlubHouse } from '@/core/models/club';
import Breadcrumb from '@/partials/common/breadcrumb';
import { ResolvingMetadata } from 'next';
import PlusProjects from '@/partials/common/plusProjects';
import KlubrSupportSection from '@/partials/common/sections/klubrSupportSection';
import PartnersSection from '@/partials/common/sections/partnersSection';
import TextImageSection from '@/partials/common/sections/textImageSection';
import Header from '@/partials/common/header/index';
import Footer from '@/partials/common/footer';
import { cookies } from 'next/headers';
import StatusIndicator from '@/partials/common/statusIndicator';
import { getServerSession } from 'next-auth';
import { SITE_URL } from '@/core/services/endpoints';
import { getDonsByKlubOrProjet } from '@/core/services/don';
import { SportsEvent, WithContext } from 'schema-dts';
import { endOfDay, format, isAfter } from 'date-fns';
import frLocale from 'date-fns/locale/fr';
import SponsorshipForm from '@/partials/_sponsorshipForm';
import DonateButton from '@/partials/common/donateButton';
import srcLoader from '@/core/helpers/srcLoader';

export async function generateStaticParams(): Promise<
	Array<{ slug: string; projectSlug: string }>
> {
	const slugsResp: Array<{ slug: string; updatedAt: string; klubSlug: string }> =
		await getAllProjetsSlugsWithClubSlug(undefined, true).catch((error) => {
			console.error('Error fetching projets slugs', error);
			return [];
		});
	return slugsResp.map((resp) => ({ slug: resp.klubSlug, projectSlug: resp.slug }));
}

export async function generateMetadata(
	{ params }: { params: { projectSlug: string; slug: string } },
	parent: ResolvingMetadata,
) {
	const cookieStore = cookies();
	const session = await getServerSession();
	const klub: Klub = await getClubDetailBySlug(
		params.slug,
		!!cookieStore.get('isPreviewMode')?.value,
		cookies().toString(),
	).catch((error) => {
		console.error('Error fetching club detail by slug | project/page Metadata', error?.config);
		switch (error?.error?.status) {
			case 401:
				if (session && session?.user) {
					redirect('/forbidden');
				}
				const redirectTo = encodeURIComponent(`/${params.slug}/nos-projets/${params.projectSlug}`);
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
	const projet: KlubProjet = await getProjetDetail(params.projectSlug, cookies().toString()).catch(
		(error) => {
			console.error('Error fetching projet detail by slug', error);
			redirect(`/${klub.slug}`);
		},
	);
	const parentMetadata = (await parent).title;
	return {
		title: `${klub.denomination} | ${projet.titre}`,
		description:
			projet.metaDescription ||
			`${projet.klubr.denomination} - Soutenez le projet "${projet.titre}"`,
		openGraph: {
			title: `${klub.denomination} | ${projet.titre}`,
			description:
				projet.metaDescription ||
				`${projet.klubr.denomination} - Soutenez le projet "${projet.titre}"`,
			url: `${new URL(SITE_URL)}/${params.slug}/nos-projets/${params.projectSlug}`,
			siteName: 'Donaction',
			images: [
				{
					url: srcLoader(projet?.couverture?.url, 'tr:w-1200,ar-1.91-1'),
					width: projet?.couverture?.width,
					height: projet?.couverture?.height,
					alt: projet?.couverture?.alt,
				},
			],
			locale: 'fr_FR',
			type: 'website',
		},
	};
}

export default async function ProjectPage({
	params,
}: {
	params: { projectSlug: string; slug: string };
}) {
	const cookieStore = cookies();
	const slugs = await getClubsSlugs(5, cookies().toString()).catch((error) => {
		console.error('Slug Layout: Error fetching clubs slugs', error?.config);
		return [];
	});
	const klub: Klub = await getClubDetailBySlug(
		params.slug,
		!!cookieStore.get('isPreviewMode')?.value,
		cookies().toString(),
	).catch((error) => {
		console.error('Error fetching club detail by slug | project/page', error?.config);
		notFound();
	});
	const klubHouse: KlubHouse = await getClubHouse(
		klub.klubr_house?.uuid,
		cookies().toString(),
	).catch((error) => {
		console.error('Error fetching klub house', error?.config);
		redirect(`/${klub.slug}`);
	});
	const projet: KlubProjet = await getProjetDetail(params.projectSlug, cookies().toString()).catch(
		(error) => {
			console.error('Error fetching projet detail by slug', error?.config);
			redirect(`/${klub.slug}`);
		},
	);
    const status = isAfter(new Date(), endOfDay(new Date(projet.dateLimiteFinancementProjet)));
	const primaryColor = klub?.klubr_house?.primary_color || '#FFFFFF';
	const secondaryColor = klub?.klubr_house?.secondary_color || '#000000';
	const textColor = klub?.klubr_house?.header_text_color || '#000000';
	const footerTextColor = klub.klubr_house?.footer_text_color || '#FFFFFF';
	const projets = await getProjetsByKlub(klub.uuid, 1, 3, projet.uuid, cookies().toString()).catch(
		(error) => {
			console.error('Error fetching last 3 projets', error?.config);
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
	const reinsurance = await getMecenatReassurance(cookies().toString()).catch((error) => {
		console.error('Error fetching mecenat reassurance', error?.config);
		return null;
	});

	/* ClubIntroduction */
	const category =
		klub.associationType +
		(klub.sportType && klub.sportType !== 'Autre' ? ' - ' + klub.sportType : '');

	const displaySection = (component: any, index: number) => {
		switch (component.__component) {
			case 'composant-atoms.section-texte-image':
				return <TextImageSection key={index} component={component} />;
			case 'composant-atoms.slider':
				// TODO: to check response
				// return <Slides slides={component.media} key={index} />;
				return <></>;
		}
	};

	const displayKlubHouseSection = (component: any, index: number) => {
		switch (component.__component) {
			case 'club-presentation.pourquoi-klubr-accompagne':
				return (
					<KlubrSupportSection
						key={index}
						component={component}
						primaryColor={primaryColor}
						klubHouse={klubHouse}
						klub={klub}
					/>
				);
			// case 'club-presentation.partners':
			// 	return <PartnersSection key={index} component={component} primaryColor={primaryColor} />;
			default:
				return <></>;
		}
	};
	const session = await getServerSession();
	const ourSponsors = await getDonsByKlubOrProjet(projet?.uuid, 'byProject', 1, 3);

	const dateLimite = format(new Date(projet.dateLimiteFinancementProjet), 'yyyy-MM-dd', {
		locale: frLocale,
	});
	const startDate = format(new Date(projet.startDate), 'yyyy-MM-dd', {
		locale: frLocale,
	});
	const localisation = klubHouse.club_presentation.find(
		(_) => _.__component === 'club-presentation.localisation',
	);

	const jsonLd: WithContext<SportsEvent> = {
		'@context': 'https://schema.org',
		'@type': 'SportsEvent',
		name: `${klub.denomination} | ${projet.titre}`,
		description:
			projet.metaDescription ||
			`${projet.klubr.denomination} - Soutenez le projet "${projet.titre}"`,
		url: `${SITE_URL}/${params.slug}/${params.projectSlug}`,
		keywords: [
			klub.federation,
			klub.associationType,
			klub.denomination,
			projet.sportType,
			klub.acronyme,
			projet.titre,
			projet.presentationTitre,
		],
		startDate,
		endDate: dateLimite,
		location: {
			'@type': 'Place',
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
		},
		sport: projet.sportType,
		organizer: [
			{
				'@type': 'Person',
				name: `${projet.klubr_membre?.prenom} ${projet.klubr_membre?.nom}`,
				image: {
					'@type': 'ImageObject',
					url: projet.klubr_membre?.avatar?.url,
					width: `${projet.klubr_membre?.avatar?.width}`,
					height: `${projet.klubr_membre?.avatar?.height}`,
				},
			},
			{
				'@type': 'SportsClub',
				name: klub.denomination,
				description: klubHouse.metaDescription,
				url: `${SITE_URL}/${params.slug}`,
				logo: {
					'@type': 'ImageObject',
					url: klub?.logo?.url,
					width: `${klub?.logo?.width}`,
					height: `${klub?.logo?.height}`,
				},
				contactPoint: {
					'@type': 'ContactPoint',
					telephone: localisation?.telContact,
					email: localisation?.emailContact,
				},
				address: {
					'@type': 'PostalAddress',
					streetAddress: klub.siegeSocialAdresse,
					addressLocality: klub.siegeSocialVille,
					postalCode: klub.siegeSocialCP,
					addressCountry: klub.siegeSocialPays,
					description: localisation?.googleMap?.description,
				},
			},
		],
		potentialAction: {
			'@type': 'DonateAction',
			name: `Contribuez au financement du projet ${projet.titre}`,
			url: `${SITE_URL}/${params.slug}/${params.projectSlug}?PAYEMENT_FORM=true`,
			target: `${SITE_URL}/${params.slug}/${params.projectSlug}?PAYEMENT_FORM=true`,
			recipient: [
				{
					'@type': 'Project',
					name: projet.titre,
					description: projet.metaDescription,
					url: `${SITE_URL}/${params.slug}/${params.projectSlug}`,
				},
				{
					'@type': 'SportsClub',
					name: klub.denomination,
					description: klubHouse.metaDescription,
					url: `${SITE_URL}/${params.slug}`,
					logo: {
						'@type': 'ImageObject',
						url: klub?.logo?.url,
						width: `${klub?.logo?.width}`,
						height: `${klub?.logo?.height}`,
					},
					contactPoint: {
						'@type': 'ContactPoint',
						telephone: localisation?.telContact,
						email: localisation?.emailContact,
					},
					address: {
						'@type': 'PostalAddress',
						streetAddress: klub.siegeSocialAdresse,
						addressLocality: klub.siegeSocialVille,
						postalCode: klub.siegeSocialCP,
						addressCountry: klub.siegeSocialPays,
						description: localisation?.googleMap?.description,
					},
				},
			],
		},
	};

	return (
		<>
			<Header session={session} slugs={slugs} txtColor={'#000'} />
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<StatusIndicator
				status={projet.status || ''}
				uuid={klub.uuid}
				css={String(
					'px-4 py-2 bg-white rounded-full absolute right-[10px] top-[65px] z-10 boxBoxShadow',
				)}
			/>
            {klub?.donationEligible && !status && (
                <DonateButton color={klubHouse.primary_color} color2={klubHouse.secondary_color} />
            )}
			<div className='projectPageContainer flex flex-col items-center justify-center gap-4 text-black'>
				<div className='minMaxWidth flex flex-col gap-2'>
					<Breadcrumb
						params={{
							slug: params.slug,
							denomination: klub.denomination,
							projectSlug: params.projectSlug,
							projectName: projet.titre,
						}}
					/>
				</div>
				<div className='minMaxWidth'>
					<div className={'lg:max-w-[70%]'}>
						<ClubIntroduction
							uuid={klub.uuid}
							slug={klub.slug}
							name={klub.denomination}
							category={category}
							slogan={klub.slogan}
							introMedia={projet.couverture}
							logo={klub.logo}
							titleLevel={2}
							isProject={projet}
						/>
					</div>
					<div className='minMaxWidth'>
                        <ProjectDescription projet={projet} ourSponsors={ourSponsors} donationEligible={klub?.donationEligible && !status} />
					</div>
				</div>

                {klub?.donationEligible && !status && (
                    <div className='w-full md:minMaxWidth mt-20' id='PAYEMENT_FORM_ID'>
                        <h2 className={'w-full text-center text-xl font-semibold mb-8'}>
                            Soutenez-nous en 3 clics ! <br /> Simple et rapide
                        </h2>
                        <SponsorshipForm
                            club={klub}
                            project={projet}
                            klubrUuid={klub.uuid}
                            projectUuid={projet.uuid}
                        />
                    </div>
                )}
				{!!projet?.contenu.length ? (
					<div className='minMaxWidth mt-20'>
						{projet.contenu.map((section, index) => displaySection(section, index))}
					</div>
				) : null}

				{!!projet?.realisations.length ? (
					<div className='minMaxWidth flex flex-col gap-6 mt-20'>
						<h2 className='font-semibold text-3xl text-black px-4 md:px-0'>
							Réalisations grâce à vos dons
						</h2>
						{projet.realisations.map((section, index) => displaySection(section, index))}
					</div>
				) : null}

				{!!projets?.data.length ? (
					<div className='minMaxWidth flex flex-col gap-6 mt-20'>
						<h2 className='font-semibold text-3xl text-black px-4 md:px-0'>
							Nos autres projets à soutenir
						</h2>
						<PlusProjects projets={projets} klub={klub} />
					</div>
				) : null}

				<div className={'minMaxWidth flex flex-col gap-10 px-4 md:p-0 w-full mt-20'}>
					{klubHouse?.club_presentation?.map((section, index) =>
						displayKlubHouseSection(section, index),
					)}
					{klubHouse?.partnerList?.length ? (
						<PartnersSection list={klubHouse?.partnerList} primaryColor={primaryColor} />
					) : null}
				</div>

				{reinsurance ? (
					<div className='w-full flex justify-center relative mt-4'>
						<div className='minMaxWidth z-10 pt-32 pb-10 flex flex-col gap-20 px-4'>
							<h2 className='md:text-2xl text-xl font-semibold'>
								{reinsurance.data.attributes.titre}
							</h2>
							<div className='flex md:flex-row flex-col items-start gap-4'>
								<div className='flex flex-col gap-4 basis-4/12'>
									<h3 className='font-semibold text-lg'>
										{reinsurance.data.attributes.bloc1Titre}
									</h3>
									<RichTextBlock
										data={reinsurance.data.attributes.bloc1Text}
										classCss={'text-sm'}
									/>
								</div>
								<div className='flex flex-col gap-4 basis-4/12'>
									<h3 className='font-semibold text-lg'>
										{reinsurance.data.attributes.bloc2Titre}
									</h3>
									<RichTextBlock
										data={reinsurance.data.attributes.bloc2Text}
										classCss={'text-sm'}
									/>
								</div>
								<div className='flex flex-col gap-4 basis-4/12'>
									<h3 className='font-semibold text-lg'>
										{reinsurance.data.attributes.bloc3Titre}
									</h3>
									<RichTextBlock
										data={reinsurance.data.attributes.bloc3Text}
										classCss={'text-sm'}
									/>
								</div>
							</div>
							<div className='flex flex-col items-center justify-center gap-3'>
								<Link
									href={`${reinsurance.data.attributes.ctaUri}`}
									className='btn btn-outline-primary shadow-button buttonInput valid md:text-center rounded-xl border-none'
								>
									<span className='font-medium text-lg'>
										{reinsurance.data.attributes.ctaLabel}
									</span>
								</Link>
							</div>
						</div>
						<div
							style={{
								clipPath: 'polygon(0 100%, 100% 100%, 100% 90px, 24% 0, 0 90px)',
								backgroundColor: primaryColor,
								opacity: 0.1,
								height: 'calc(100% + 200px)',
							}}
							className='absolute top-0 left-0 w-full z-0'
						/>
					</div>
				) : null}
			</div>
			<Footer bg1={secondaryColor} bg2={primaryColor} textColor={footerTextColor} />
		</>
	);
}
