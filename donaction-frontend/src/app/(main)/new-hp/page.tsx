import { Metadata } from 'next';
import HomepageContent from '@/partials/homepage';
import { getProjets } from '@/core/services/projet';
import { getHp } from '@/core/services/cms';
import { cookies } from 'next/headers';
import GetServerCookie from '@/core/helpers/getServerCookie';

export const metadata: Metadata = {
  title: 'Donaction - New Homepage',
  description: 'Nouvelle page d\'accueil Donaction',
};

export default async function HomePage() {
  const isPreview = await GetServerCookie('isPreviewMode');
  const cookieStr = cookies().toString();

  const [projets, hpResult] = await Promise.all([
    getProjets(1, 3, true, !!isPreview, cookieStr).catch(() => undefined),
    getHp(cookieStr).catch(() => undefined),
  ]);

  return (
    <HomepageContent
      projets={projets}
      faq={hpResult?.data?.attributes?.FAQ}
    />
  );
}
