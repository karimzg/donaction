import './index.scss';

const ADVANTAGES = [
	{
		id: 'transparent',
		icon: '💯',
		title: '100% Transparent',
		description: 'Aucun frais caché, vous savez exactement où va chaque euro.',
	},
	{
		id: 'no-subscription',
		icon: '🎯',
		title: 'Zéro abonnement',
		description: "Payez uniquement sur les dons reçus, pas d'engagement.",
	},
	{
		id: 'quick-setup',
		icon: '📱',
		title: 'Prêt en 5 min',
		description: 'Créez votre page de collecte en quelques clics.',
	},
	{
		id: 'tax-receipts',
		icon: '🧾',
		title: 'Reçus fiscaux auto',
		description: 'Génération automatique des Cerfa pour vos donateurs.',
	},
	{
		id: 'sport-focused',
		icon: '🏆',
		title: 'Pensé pour le sport',
		description: 'Des outils adaptés aux associations sportives.',
	},
	{
		id: 'dashboard',
		icon: '📊',
		title: 'Tableau de bord',
		description: 'Suivez vos collectes et donateurs en temps réel.',
	},
];

export default function NewHpWhyDonaction() {
	return (
		<section className="new-hp-why-donaction w-full py-16 md:py-24">
			<div className="w-full max-w-screen-xl mx-auto px-6">
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
					Pourquoi choisir DONACTION ?
				</h2>
				<p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
					Tout ce dont votre association a besoin pour réussir ses collectes.
				</p>

				<ul className="new-hp-why-donaction__grid" role="list">
					{ADVANTAGES.map((advantage) => (
						<li key={advantage.id} className="new-hp-why-donaction__card">
							<span className="new-hp-why-donaction__icon" aria-hidden="true">
								{advantage.icon}
							</span>
							<h3 className="new-hp-why-donaction__title">{advantage.title}</h3>
							<p className="new-hp-why-donaction__description">{advantage.description}</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
