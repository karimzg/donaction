import { Metadata } from 'next';
import NewHomepageContent from '@/partials/newHomepage';
import { getProjets } from '@/core/services/projet';
import { getHp } from '@/core/services/cms';
import { cookies } from 'next/headers';
import GetServerCookie from '@/core/helpers/getServerCookie';
import { SITE_URL } from '@/core/services/endpoints';
import { WebPage, WithContext } from 'schema-dts';

export async function generateMetadata(): Promise<Metadata> {
	const cookieStr = cookies().toString();
	const res = await getHp(cookieStr).catch(() => undefined);

	const title = res?.data?.attributes?.metaTitle
		|| res?.data?.attributes?.titre
		|| 'Le sport unit, le don renforce!';
	const description = res?.data?.attributes?.metaDescription || '';

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
		getProjets(1, 3, true, !!isPreview, cookieStr).catch(() => undefined),
		getHp(cookieStr).catch(() => undefined),
	]);

	const jsonLd: WithContext<WebPage> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: SITE_URL,
		name: hpResult?.data?.attributes?.metaTitle
			|| hpResult?.data?.attributes?.titre
			|| 'Le sport unit, le don renforce!',
		description: hpResult?.data?.attributes?.metaDescription || '',
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
			<NewHomepageContent
				projets={projets}
				faq={hpResult?.data?.attributes?.FAQ}
			/>
		</>
	);
}
