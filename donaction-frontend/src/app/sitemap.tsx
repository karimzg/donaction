import { MetadataRoute } from 'next';
import { SITE_URL } from '@/core/services/endpoints';
import { getAllClubsSlugs } from '@/core/services/club';
import { getAllProjetsSlugsWithClubSlug } from '@/core/services/projet';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const klubsSlugs: Array<{ slug: string; updatedAt: string }> = await getAllClubsSlugs(
		undefined,
		true,
	).catch((error) => {
		console.error('Error fetching clubs slugs', error?.config);
		return [];
	});
	const klubs: MetadataRoute.Sitemap = klubsSlugs.flatMap((klubSlugs) => {
		return [
			{
				url: `${SITE_URL}/${klubSlugs.slug}`,
				lastModified: klubSlugs.updatedAt,
				// changeFrequency: 'monthly',
				// priority: 1,
			},
			{
				url: `${SITE_URL}/${klubSlugs.slug}/nos-projets`,
				lastModified: klubSlugs.updatedAt,
				// changeFrequency: 'monthly',
				// priority: 0.5,
			},
		];
	});

	const projectsSugs: Array<{ slug: string; updatedAt: string; klubSlug: string }> =
		await getAllProjetsSlugsWithClubSlug(undefined, true).catch((error) => {
			console.error('Error fetching projets slugs', error);
			return [];
		});
	const projects: MetadataRoute.Sitemap = projectsSugs.map((projectSlugs) => ({
		url: `${SITE_URL}/${projectSlugs.klubSlug}/nos-projets/${projectSlugs.slug}`,
		lastModified: projectSlugs.updatedAt,
		// changeFrequency: 'weekly',
		// priority: 0.8,
	}));

	return [
		{
			url: `${SITE_URL}`,
			lastModified: new Date(),
			// changeFrequency: 'yearly',
			// priority: 1,
		},
		{
			url: `${SITE_URL}/mecenat`,
			lastModified: new Date(),
			// changeFrequency: 'monthly',
			// priority: 1,
		},
		{
			url: `${SITE_URL}/contact`,
			lastModified: new Date(),
			// changeFrequency: 'yearly',
			// priority: 1,
		},
		...klubs,
		...projects,
	];
}
