import TimelineAnimator from './TimelineAnimator';
import UserIcon from './icons/UserIcon';
import StripeIcon from './icons/StripeIcon';
import DocumentIcon from './icons/DocumentIcon';
import PaletteIcon from './icons/PaletteIcon';
import './index.scss';

/**
 * CSS variable type for staggered animation delays.
 * --step-index is used in SCSS to calculate transition-delay per step.
 */
type StepStyle = React.CSSProperties & { '--step-index': number };

const TIMELINE_STEPS = [
  {
    id: 'create-account',
    Icon: UserIcon,
    title: 'Créer votre compte',
    duration: '2 min',
    description: 'Inscription rapide avec email ou Google',
  },
  {
    id: 'activate-stripe',
    Icon: StripeIcon,
    title: 'Activer Stripe',
    duration: '5 min',
    description: 'Configuration de votre compte de paiement',
  },
  {
    id: 'upload-documents',
    Icon: DocumentIcon,
    title: 'Télécharger vos documents',
    duration: 'Variable',
    description: 'Statuts, récépissé et justificatifs',
  },
  {
    id: 'customize',
    Icon: PaletteIcon,
    title: 'Personnaliser',
    duration: '5 min',
    description: 'Logo, couleurs et description',
  },
] as const;

/**
 * Timeline activation steps component with scroll-triggered animations.
 *
 * Features:
 * - Hybrid architecture: Server Component for static content + Client TimelineAnimator
 * - Staggered entrance animations via CSS --step-index variable
 * - Line draw animation using stroke-dashoffset
 * - Responsive horizontal (desktop) / vertical (mobile) layouts
 * - Reduced motion and SSR-safe fallbacks
 */
export default function HpTimeline() {
  return (
    <section className="hp-timeline w-full py-16 md:py-20 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-6">
        <TimelineAnimator className="hp-timeline__wrapper">
          <h2 className="hp-timeline__title text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12 md:mb-16">
            Activez votre club en 4 étapes simples
          </h2>

          <div className="hp-timeline__container relative">
            {/* Connecting Line - Desktop (horizontal) */}
            <svg
              className="hp-timeline__line hp-timeline__line--desktop"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                className="hp-timeline__line-bg"
                x1="0"
                y1="2"
                x2="100%"
                y2="2"
              />
              <line
                className="hp-timeline__line-progress"
                x1="0"
                y1="2"
                x2="100%"
                y2="2"
              />
            </svg>

            {/* Connecting Line - Mobile (vertical) */}
            <svg
              className="hp-timeline__line hp-timeline__line--mobile"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                className="hp-timeline__line-bg"
                x1="2"
                y1="0"
                x2="2"
                y2="100%"
              />
              <line
                className="hp-timeline__line-progress"
                x1="2"
                y1="0"
                x2="2"
                y2="100%"
              />
            </svg>

            {/* Steps */}
            <div
              className="hp-timeline__steps grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4"
              role="list"
              aria-label="Étapes d'activation"
            >
              {TIMELINE_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="hp-timeline__step relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center"
                  style={{ '--step-index': index } as StepStyle}
                  role="listitem"
                >
                  {/* Step marker with opaque background to mask connecting line */}
                  <div className="hp-timeline__step-marker relative z-10">
                    <div className="hp-timeline__step-bg" />
                    <div className="hp-timeline__step-circle">
                      <step.Icon className="hp-timeline__step-icon" />
                    </div>
                    <span className="hp-timeline__step-number">
                      {index + 1}
                    </span>
                  </div>

                  {/* Step content card */}
                  <div className="hp-timeline__step-content">
                    <span className="hp-timeline__step-duration">
                      {step.duration}
                    </span>
                    <span className="hp-timeline__step-title">
                      {step.title}
                    </span>
                    <span className="hp-timeline__step-description">
                      {step.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TimelineAnimator>
      </div>
    </section>
  );
}
