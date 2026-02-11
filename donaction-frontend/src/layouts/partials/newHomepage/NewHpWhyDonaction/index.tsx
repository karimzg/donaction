import ScrollAnimator from '@/components/ScrollAnimator';
import TransparentIcon from './icons/TransparentIcon';
import NoSubscriptionIcon from './icons/NoSubscriptionIcon';
import QuickSetupIcon from './icons/QuickSetupIcon';
import TaxReceiptIcon from './icons/TaxReceiptIcon';
import SportsFocusedIcon from './icons/SportsFocusedIcon';
import DashboardIcon from './icons/DashboardIcon';
import './index.scss';

type CardStyle = React.CSSProperties & { '--card-index': number };

const ADVANTAGES = [
  {
    id: 'transparent',
    Icon: TransparentIcon,
    title: '100% Transparent',
    subtitle: 'Suivi des dons en temps réel',
  },
  {
    id: 'no-subscription',
    Icon: NoSubscriptionIcon,
    title: 'Zéro abonnement',
    subtitle: "Paiement uniquement à l'usage",
  },
  {
    id: 'quick-setup',
    Icon: QuickSetupIcon,
    title: 'Prêt en 5 min',
    subtitle: 'Configuration ultra-rapide',
  },
  {
    id: 'tax-receipts',
    Icon: TaxReceiptIcon,
    title: 'Reçus fiscaux auto',
    subtitle: 'Génération automatique Cerfa',
  },
  {
    id: 'sports-focused',
    Icon: SportsFocusedIcon,
    title: 'Pensé pour le sport',
    subtitle: 'Adapté aux clubs sportifs',
  },
  {
    id: 'dashboard',
    Icon: DashboardIcon,
    title: 'Tableau de bord',
    subtitle: 'Statistiques complètes',
  },
] as const;

export default function NewHpWhyDonaction() {
  return (
    <section className="new-hp-why-donaction w-full py-16 md:py-20 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-6">
        <ScrollAnimator className="new-hp-why-donaction__wrapper">
          <h2 className="new-hp-why-donaction__title text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12 md:mb-16">
            Pourquoi choisir DONACTION ?
          </h2>
          <ul
            className="new-hp-why-donaction__grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            role="list"
            aria-label="Avantages de DONACTION"
          >
            {ADVANTAGES.map((advantage, index) => (
              <li
                key={advantage.id}
                className="new-hp-why-donaction__card"
                style={{ '--card-index': index } as CardStyle}
              >
                <div className="new-hp-why-donaction__card-content flex flex-col items-center text-center gap-4">
                  <div className="new-hp-why-donaction__icon-wrapper">
                    <advantage.Icon className="new-hp-why-donaction__icon text-gray-700" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base md:text-lg font-semibold text-gray-800">
                      {advantage.title}
                    </span>
                    <span className="text-sm md:text-base text-gray-500">
                      {advantage.subtitle}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollAnimator>
      </div>
    </section>
  );
}
