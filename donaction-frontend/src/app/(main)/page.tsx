import { Metadata } from 'next';
import HomepageContent from '@/partials/homepage';
import { getProjets } from '@/core/services/projet';
import { getHp } from '@/core/services/cms';
import { cookies } from 'next/headers';
import GetServerCookie from '@/core/helpers/getServerCookie';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
	const cookieStr = cookies().toString();
	const res = await getHp(cookieStr).catch((error) => {
		console.error('Failed to fetch homepage CMS data:', error);
		return undefined;
	});

	const title = res?.data?.attributes?.metaTitle
		|| res?.data?.attributes?.titre
		|| 'Donaction - Soutenez les associations qui vous tiennent à cœur';
	const description = res?.data?.attributes?.metaDescription
		|| 'Plateforme de dons et mécénat pour les associations sportives, humanitaires, sociales et culturelles.';

	return {
		title,
		description,
		openGraph: {
			title,
			description,
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
	const cookieStr = cookies().toString();

	const [projets, hpResult] = await Promise.all([
		getProjets(1, 3, true, !!isPreview, cookieStr).catch((error) => {
			console.error('Failed to fetch projects:', error);
			return undefined;
		}),
		getHp(cookieStr).catch((error) => {
			console.error('Failed to fetch homepage CMS data:', error);
			return undefined;
		}),
	]);

	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: SITE_URL,
		name: hpResult?.data?.attributes?.metaTitle
			|| hpResult?.data?.attributes?.titre
			|| 'Donaction - Soutenez les associations qui vous tiennent à cœur',
		description: hpResult?.data?.attributes?.metaDescription
			|| 'Plateforme de dons et mécénat pour les associations sportives, humanitaires, sociales et culturelles.',
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
		<>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<HomepageContent projets={projets} faq={hpResult?.data?.attributes?.FAQ} />
		</>
	);
}
