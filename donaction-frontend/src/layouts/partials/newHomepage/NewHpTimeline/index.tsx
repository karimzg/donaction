import TimelineAnimator from './TimelineAnimator';
import UserIcon from './icons/UserIcon';
import StripeIcon from './icons/StripeIcon';
import DocumentIcon from './icons/DocumentIcon';
import PaletteIcon from './icons/PaletteIcon';
import './index.scss';

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

export default function NewHpTimeline() {
  return (
    <section className="new-hp-timeline w-full py-16 md:py-20 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-6">
        <TimelineAnimator className="new-hp-timeline__wrapper">
          <h2 className="new-hp-timeline__title text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12 md:mb-16">
            Activez votre club en 4 étapes simples
          </h2>

          <div className="new-hp-timeline__container relative">
            {/* Connecting Line - Desktop (horizontal) - positioned to connect circles */}
            <svg
              className="new-hp-timeline__line new-hp-timeline__line--desktop hidden md:block absolute top-[36px] left-[12.5%] w-[75%] h-[4px] z-0"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                className="new-hp-timeline__line-bg"
                x1="0"
                y1="2"
                x2="100%"
                y2="2"
                stroke="#e5e7eb"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                className="new-hp-timeline__line-progress"
                x1="0"
                y1="2"
                x2="100%"
                y2="2"
                stroke="#73cfa8"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            {/* Connecting Line - Mobile (vertical) */}
            <svg
              className="new-hp-timeline__line new-hp-timeline__line--mobile md:hidden absolute top-[36px] left-[47px] w-[4px] h-[calc(100%-72px)] z-0"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                className="new-hp-timeline__line-bg"
                x1="2"
                y1="0"
                x2="2"
                y2="100%"
                stroke="#e5e7eb"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                className="new-hp-timeline__line-progress"
                x1="2"
                y1="0"
                x2="2"
                y2="100%"
                stroke="#73cfa8"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            {/* Steps */}
            <div
              className="new-hp-timeline__steps grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4"
              role="list"
              aria-label="Étapes d'activation"
            >
              {TIMELINE_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="new-hp-timeline__step relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center"
                  style={{ '--step-index': index } as StepStyle}
                  role="listitem"
                >
                  {/* Step marker with opaque background to hide line */}
                  <div className="new-hp-timeline__step-marker relative z-10">
                    {/* White background circle to mask the line */}
                    <div className="new-hp-timeline__step-bg absolute inset-[-4px] rounded-full bg-[#f6f7f9]" />
                    <div className="new-hp-timeline__step-circle relative w-[72px] h-[72px] rounded-full flex items-center justify-center">
                      <step.Icon className="new-hp-timeline__step-icon w-9 h-9 text-gray-700" />
                    </div>
                    <span className="new-hp-timeline__step-number absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#73cfa8] text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {index + 1}
                    </span>
                  </div>

                  {/* Step content card */}
                  <div className="new-hp-timeline__step-content flex flex-col gap-1.5 md:mt-4 md:p-4 md:rounded-xl md:bg-white/60 md:backdrop-blur-sm md:border md:border-gray-100 md:shadow-sm md:min-h-[120px] md:w-full">
                    <span className="new-hp-timeline__step-duration inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#73cfa8]/15 text-[#3d8a6a] w-fit md:mx-auto">
                      {step.duration}
                    </span>
                    <span className="new-hp-timeline__step-title text-base md:text-lg font-semibold text-gray-800 mt-0.5">
                      {step.title}
                    </span>
                    <span className="new-hp-timeline__step-description text-sm text-gray-500 leading-relaxed">
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
