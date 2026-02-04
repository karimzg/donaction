import NewHpHero from './NewHpHero';
import NewHpReassurance from './NewHpReassurance';
import NewHpWhyDonaction from './NewHpWhyDonaction';
import NewHpWidgetDemo from './NewHpWidgetDemo';

export default function NewHomepageContent() {
	return (
		<main className="flex flex-col items-center w-full">
			<NewHpHero />
			<NewHpReassurance />
			<NewHpWhyDonaction />
			<NewHpWidgetDemo />
		</main>
	);
}
