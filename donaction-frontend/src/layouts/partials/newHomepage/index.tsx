import NewHpHero from './NewHpHero';
import NewHpReassurance from './NewHpReassurance';

export default function NewHomepageContent() {
	return (
		<main className="flex flex-col items-center w-full">
			<NewHpHero />
			<NewHpReassurance />
		</main>
	);
}
