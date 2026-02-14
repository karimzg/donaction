import { MetadataRoute } from 'next';
import { SITE_URL } from '@/core/services/endpoints';

export default function robots(): MetadataRoute.Robots {
	const robots: MetadataRoute.Robots =
		process.env.ENVIRONMENT === 'prod'
			? {
					rules: {
						userAgent: '*',
						allow: '/',
						disallow: ['/private/', '/profile', '/mes-dons', '/forbidden', '/new-club/congratulations', '/google-signin'],
					},
					sitemap: `${SITE_URL}/sitemap.xml`,
				}
			: {
					rules: {
						userAgent: '*',
						disallow: '/',
					},
					sitemap: `${SITE_URL}/sitemap.xml`,
				};
	return robots;
}
