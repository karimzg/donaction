import HpHero from './HpHero';
import HpReassurance from './HpReassurance';
import HpWhyDonaction from './HpWhyDonaction';
import HpFeatures from './HpFeatures';
import HpTimeline from './HpTimeline';
import HpWidgetDemo from './HpWidgetDemo';
import HpProjects from './HpProjects';
import HpFederations from './HpFederations';
import HpNeedHelp from './HpNeedHelp';
import HpNewsletter from './HpNewsletter';
import HpCta from './HpCta';
import { KlubProjet } from '@/core/models/klub-project';
import { Pagination } from '@/core/models/misc';
import { FaqI } from '@/core/models/hp';

type HomepageContentProps = {
  projets?: { data: Array<KlubProjet>; meta: { pagination: Pagination } };
  faq?: FaqI;
};

export default function HomepageContent({ projets, faq }: HomepageContentProps) {
  return (
    <main className="flex flex-col items-center justify-center text-black w-full">
      <HpHero />
      <HpReassurance />
      <HpWhyDonaction />
      <HpFeatures />
      <HpTimeline />
      <HpWidgetDemo />
      <HpProjects projets={projets?.data || []} />
      <HpFederations />
      <HpNeedHelp faq={faq} />
      <HpNewsletter />
      <HpCta />
    </main>
  );
}
