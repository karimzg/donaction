import ScrollAnimator from '@/components/ScrollAnimator';
import ShieldLockIcon from './icons/ShieldLockIcon';
import CerfaDocIcon from './icons/CerfaDocIcon';
import RgpdShieldIcon from './icons/RgpdShieldIcon';
import SpeedIcon from './icons/SpeedIcon';
import './index.scss';

type BadgeStyle = React.CSSProperties & { '--badge-index': number };

const TRUST_BADGES = [
  {
    id: 'secure-payment',
    Icon: ShieldLockIcon,
    title: 'Paiement sécurisé',
    subtitle: 'Stripe',
  },
  {
    id: 'cerfa',
    Icon: CerfaDocIcon,
    title: 'Reçu fiscal',
    subtitle: 'Cerfa',
  },
  {
    id: 'rgpd',
    Icon: RgpdShieldIcon,
    title: 'Conforme',
    subtitle: 'RGPD',
  },
  {
    id: 'fast-setup',
    Icon: SpeedIcon,
    title: 'Activation',
    subtitle: 'en 5 min',
  },
] as const;

export default function NewHpReassurance() {
  return (
    <section className="new-hp-reassurance w-full py-12 md:py-16">
      <div className="max-w-[1320px] mx-auto px-6">
        <ScrollAnimator className="new-hp-reassurance__wrapper">
          <ul
            className="new-hp-reassurance__grid grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            role="list"
            aria-label="Garanties et avantages"
          >
            {TRUST_BADGES.map((badge, index) => (
              <li
                key={badge.id}
                className="new-hp-reassurance__badge"
                style={{ '--badge-index': index } as BadgeStyle}
              >
                <div className="new-hp-reassurance__badge-content flex flex-col items-center text-center gap-3">
                  <div className="new-hp-reassurance__icon-wrapper">
                    <badge.Icon className="new-hp-reassurance__icon text-gray-700" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm md:text-base font-semibold text-gray-800">
                      {badge.title}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500">
                      {badge.subtitle}
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
