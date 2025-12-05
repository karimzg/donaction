import config from '@/config/config.json';
import theme from '@/config/theme.json';
import Providers from '@/app/Providers';
import '@/styles/main.scss';
import { Metadata } from 'next';
import { SITE_URL } from '@/core/services/endpoints';
import PopAuth from '@/partials/authentication/popAuth';
import Toaster from 'src/layouts/components/toaster';
import React from 'react';
import CookiesConsent from '@/partials/common/cookiesConsent';
import { WebSite, WithContext } from 'schema-dts';
import * as process from 'node:process';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		template: '%s | Klubr',
		default: 'Klubr', // a default is required when creating a template
	},
	generator: 'Klubr Website',
	applicationName: 'Klubr Website',
	// referrer: 'origin-when-cross-origin',
	authors: [{ name: 'Karim Z.', url: 'https://nakaa.fr' }],
	creator: 'Klubr',
	publisher: 'Karim Z.',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	// viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
	icons: {
		icon: [
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '128x128',
				url: config.site.favicon_png,
			},
			// {
			// 	rel: "icon",
			// 	type: "image/ico",
			// 	url: config.site.favicon,
			// },
		],
	},
	// locale: 'fr_FR',
	// type: 'website',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	// import google font css
	const pf = theme.fonts.font_family.primary;
	const jsonLd: WithContext<WebSite> = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		url: SITE_URL,
		name: 'Klubr website',
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
		author: {
			'@type': 'Person',
			name: 'Karim Z.',
			email: 'karim@nakaa.fr',
		},
		datePublished: '2024-10-16',
		image: {
			'@type': 'ImageObject',
			url: config.site.favicon_png,
			width: '128',
			height: '128',
		},
	};

	return (
		<html suppressHydrationWarning={false} lang='fr'>
			<head>
				<meta httpEquiv='Accept-CH' content='DPR, Viewport-Width, Width' />
				{/* theme meta */}
				<meta name='msapplication-TileColor' content='#000000' />
				{/* google font css */}
				<link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
				<link
					href={`https://fonts.googleapis.com/css2?family=${pf}&display=swap`}
					rel='stylesheet'
				/>
				<script
					defer
					async
					src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY}`}
				></script>
				{/*<script*/}
				{/*	async*/}
				{/*	src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_GA_TRACKING_ID}`}*/}
				{/*></script>*/}
				{/*if (${process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://')}) {*/}
				{/*}*/}

				{/*<script*/}
				{/*	dangerouslySetInnerHTML={{*/}
				{/*		__html: `*/}
				{/*				window.dataLayer = window.dataLayer || [];*/}
				{/*    			function gtag(){dataLayer.push(arguments);}*/}
				{/*    			gtag('js', new Date());*/}
				{/*    			gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_GA_TRACKING_ID}');	*/}
				{/*		`,*/}
				{/*	}}*/}
				{/*></script>*/}
				{/*<GoogleAnalytics gaId={`${process.env.NEXT_PUBLIC_GOOGLE_GA_TRACKING_ID}`} />*/}
				{process.env.NEXT_PUBLIC_ACTIVATE_ANALYTICS === 'true' && (
					<script
						defer
						data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN}
						src={
							process.env.NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN === 'klubr.fr-local'
								? 'https://plausible.io/js/script.revenue.local.js'
								: 'https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js'
						}
					/>
				)}
				{process.env.NEXT_PUBLIC_ACTIVATE_ANALYTICS === 'true' && (
					<script
						dangerouslySetInnerHTML={{
							__html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`,
						}}
					/>
				)}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body suppressHydrationWarning={false}>
				<Providers>
					<CookiesConsent />
					<PopAuth />
					<Toaster />
					{children}
				</Providers>
			</body>
		</html>
	);
}
