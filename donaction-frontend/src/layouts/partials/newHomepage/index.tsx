import NewHpHero from './NewHpHero';
import NewHpReassurance from './NewHpReassurance';
import NewHpWhyDonaction from './NewHpWhyDonaction';
import NewHpFeatures from './NewHpFeatures';
import NewHpTimeline from './NewHpTimeline';
import NewHpWidgetDemo from './NewHpWidgetDemo';
import NewHpProjects from './NewHpProjects';
import NewHpFederations from './NewHpFederations';
import NewHpNeedHelp from './NewHpNeedHelp';
import NewHpCta from './NewHpCta';
import { KlubProjet } from '@/core/models/klub-project';
import { Pagination } from '@/core/models/misc';
import { FaqI } from '@/core/models/hp';

type NewHomepageContentProps = {
  projets?: { data: Array<KlubProjet>; meta: { pagination: Pagination } };
  faq?: FaqI;
};

export default function NewHomepageContent({ projets, faq }: NewHomepageContentProps) {
  return (
    <main className="flex flex-col items-center justify-center text-black w-full">
      <NewHpHero />
      <NewHpReassurance />
      <NewHpWhyDonaction />
      <NewHpFeatures />
      <NewHpTimeline />
      <NewHpWidgetDemo />
      <NewHpProjects projets={projets?.data || []} />
      <NewHpFederations />
      <NewHpNeedHelp faq={faq} />
      <NewHpCta />
    </main>
  );
}
