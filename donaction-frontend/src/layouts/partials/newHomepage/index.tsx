import NewHpHero from './NewHpHero';
import NewHpReassurance from './NewHpReassurance';
import NewHpWhyDonaction from './NewHpWhyDonaction';
import NewHpFeatures from './NewHpFeatures';
import NewHpTimeline from './NewHpTimeline';
import NewHpWidgetDemo from './NewHpWidgetDemo';

export default function NewHomepageContent() {
  return (
    <main className="flex flex-col items-center justify-center text-black w-full">
      <NewHpHero />
      <NewHpReassurance />
      <NewHpWhyDonaction />
      <NewHpFeatures />
      <NewHpTimeline />
      <NewHpWidgetDemo />
    </main>
  );
}
