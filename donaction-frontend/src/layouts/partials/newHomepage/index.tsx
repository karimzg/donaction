import NewHpHero from './NewHpHero';
import NewHpReassurance from './NewHpReassurance';
import NewHpWhyDonaction from './NewHpWhyDonaction';
import NewHpFeatures from './NewHpFeatures';
import NewHpTimeline from './NewHpTimeline';
import NewHpWidgetDemo from './NewHpWidgetDemo';
import NewHpProjects from './NewHpProjects';
import { KlubProjet } from '@/core/models/klub-project';
import { Pagination } from '@/core/models/misc';

type NewHomepageContentProps = {
  projets?: { data: Array<KlubProjet>; meta: { pagination: Pagination } };
};

export default function NewHomepageContent({ projets }: NewHomepageContentProps) {
  return (
    <main className="flex flex-col items-center justify-center text-black w-full">
      <NewHpHero />
      <NewHpReassurance />
      <NewHpWhyDonaction />
      <NewHpFeatures />
      <NewHpTimeline />
      <NewHpWidgetDemo />
      <NewHpProjects projets={projets?.data || []} />
    </main>
  );
}
