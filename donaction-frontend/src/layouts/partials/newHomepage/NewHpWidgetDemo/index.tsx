import DemoWidget from './DemoWidget';
import './index.scss';

const SECTION_CONTENT = {
  title: 'Essayez notre widget de don',
  subtitle: 'Découvrez en direct le fonctionnement de notre plateforme',
  description:
    'Simulez un don et visualisez instantanément votre réduction fiscale. Interface simple, transparente et 100% sécurisée.',
  benefits: [
    'Calcul fiscal en temps réel',
    'Paiement sécurisé par Stripe',
    'Reçu fiscal automatique',
  ],
} as const;

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-donaction-primary flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function NewHpWidgetDemo() {
  return (
    <section className="new-hp-widget-demo w-full py-16 md:py-20 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-12 lg:gap-16">
          {/* Text Content - Left side */}
          <div className="new-hp-widget-demo__content md:w-[45%] text-center md:text-left">
            <span className="inline-block bg-donaction-primary/10 text-donaction-primary-dark px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              Démo interactive
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
              {SECTION_CONTENT.title}
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-[480px] mx-auto lg:mx-0">
              {SECTION_CONTENT.description}
            </p>

            <ul className="flex flex-col gap-4 mb-8">
              {SECTION_CONTENT.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 justify-center md:justify-start"
                >
                  <CheckIcon />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Widget Demo - Right side */}
          <div className="new-hp-widget-demo__widget-container md:w-[50%] w-full max-w-[500px]">
            <DemoWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
