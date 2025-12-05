'use server';
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { SITE_URL } from '@/core/services/endpoints';

const getUnHyphenatedName = (str: string, capAll?: boolean) => {
	return str
		.split('-')
		.map((_, _index) => {
			if (capAll || _index === 0) return _.charAt(0).toUpperCase() + _.slice(1);
			return _;
		})
		.join(' ');
};

const getPathname = () => {
	try {
		const headersList = headers();
		return headersList.get('x-custom-pathname') || '';
	} catch (e: any) {
		return typeof window !== 'undefined' ? document?.location.pathname : '';
	}
};

const Breadcrumb: React.FC<{
	params: { slug?: string; denomination?: string; projectSlug?: string; projectName?: string };
}> = ({ params }) => {
	const pathname = getPathname();
	let links: Array<{ title: string; url: string }> = [
		{
			title: 'Accueil',
			url: '/',
		},
	];

	if (params.slug) {
		links = [
			...links,
			{
				title: params?.denomination || getUnHyphenatedName(params.slug, true),
				url: `/${params.slug}`,
			},
		];
		if (pathname.includes('nos-projets')) {
			links = [
				...links,
				{
					title: 'Nos projets',
					url: `/${params.slug}/nos-projets`,
				},
			];
			if (params.projectSlug) {
				links = [
					...links,
					{
						title: params?.projectName || getUnHyphenatedName(params.projectSlug),
						url: `/${params.slug}/nos-projets/${params.projectSlug}`,
					},
				];
			}
		}
	} else if (pathname.includes('/projets')) {
		links = [
			...links,
			{
				title: 'Projets',
				url: `/projets`,
			},
		];
	} else if (pathname.includes('/clubs')) {
		links = [
			...links,
			{
				title: 'Clubs',
				url: `/clubs`,
			},
		];
	}

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		url: `${SITE_URL}/${pathname}`,
		itemListElement: [
			...links.map((_, _index) => ({
				'@type': 'ListItem',
				position: _index + 1,
				name: _.title,
				item: `${SITE_URL}${_.url}`,
			})),
		],
	};

	return (
		<div className='flex flex-wrap items-center text-black text-sm font-medium px-6 md:px-0 w-full'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			{links.map((_, _index) => (
				<React.Fragment key={_index}>
					{_index !== 0 && <span className='px-[4px]'>/</span>}
					<Link className='' href={_.url}>
						{_.title}
					</Link>
				</React.Fragment>
			))}
		</div>
	);
};

export default Breadcrumb;
