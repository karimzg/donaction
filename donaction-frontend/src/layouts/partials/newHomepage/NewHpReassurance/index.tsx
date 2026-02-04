import './index.scss';

const TRUST_BADGES = [
	{
		icon: '🔒',
		title: 'Paiement sécurisé',
		subtitle: 'Stripe',
	},
	{
		icon: '📄',
		title: 'Reçu fiscal',
		subtitle: 'Cerfa',
	},
	{
		icon: '🇫🇷',
		title: 'Conforme',
		subtitle: 'RGPD',
	},
	{
		icon: '⚡',
		title: 'Activation',
		subtitle: 'en 5 min',
	},
];

export default function NewHpReassurance() {
	return (
		<section className="new-hp-reassurance w-full py-8 md:py-12 bg-gray-50">
			<div className="w-full max-w-screen-xl mx-auto px-6">
				<ul className="new-hp-reassurance__grid" role="list">
					{TRUST_BADGES.map((badge, index) => (
						<li key={index} className="new-hp-reassurance__badge">
							<span className="new-hp-reassurance__icon" aria-hidden="true">
								{badge.icon}
							</span>
							<div className="new-hp-reassurance__text">
								<span className="new-hp-reassurance__title">{badge.title}</span>
								<span className="new-hp-reassurance__subtitle">{badge.subtitle}</span>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
