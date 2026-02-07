import { Metadata } from 'next';
import NewHomepageContent from '@/partials/newHomepage';
import { getProjets } from '@/core/services/projet';
import { cookies } from 'next/headers';
import GetServerCookie from '@/core/helpers/getServerCookie';

export const metadata: Metadata = {
  title: 'Donaction - New Homepage',
  description: 'Nouvelle page d\'accueil Donaction',
};

export default async function NewHpPage() {
  const isPreview = await GetServerCookie('isPreviewMode');
  const projets = await getProjets(1, 3, true, !!isPreview, cookies().toString())
    .catch(() => undefined);

  return <NewHomepageContent projets={projets} />;
}
