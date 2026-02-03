import { Metadata } from 'next';
import NewHomepageContent from '@/partials/newHomepage';

export const metadata: Metadata = {
  title: 'Donaction - New Homepage',
  description: 'Nouvelle page d\'accueil Donaction',
};

export default async function NewHpPage() {
  return <NewHomepageContent />;
}
