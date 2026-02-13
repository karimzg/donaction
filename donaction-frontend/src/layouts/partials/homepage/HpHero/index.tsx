import Link from 'next/link';
import HeroIllustration from './HeroIllustration';
import './index.scss';

const TRUST_INDICATORS = ['100% Gratuit', 'Reçu fiscal', 'Sécurisé'] as const;

function CheckmarkIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#73cfa8]"
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

export default function HpHero() {
  return (
    <section className="hp-hero min-h-[auto] md:min-h-[80vh] w-full relative flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="hp-hero__pattern absolute inset-0 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-[1320px] mx-auto px-6 gap-8 md:gap-12 relative z-10">
        {/* Text Content - 60% */}
        <div className="md:w-[55%] lg:w-[60%] flex flex-col gap-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-tight">
            Transformez vos idées en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#73cfa8] to-[#5bb892]">
              actions solidaires
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-[540px] mx-auto lg:mx-0">
            Créez des collectes de dons pour votre association et mobilisez
            votre communauté autour de vos projets. Simple, transparent et
            efficace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center md:justify-start">
            <Link href="/new-club" className="btn btn-primary">
              Créer mon club
            </Link>
            <Link href="/projets" className="btn btn-outline-primary">
              Voir les projets
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 text-sm text-gray-500 justify-center md:justify-start">
            {TRUST_INDICATORS.map((text) => (
              <span key={text} className="flex items-center gap-2">
                <CheckmarkIcon />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Illustration - 40% */}
        <div className="order-first md:order-none md:w-[45%] lg:w-[40%] flex items-center justify-center">
          <div className="hp-hero__illustration relative">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        role="img"
        aria-label="Défiler vers le bas"
        className="hp-hero__scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <svg
          width="28"
          height="44"
          viewBox="0 0 28 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1"
            y="1"
            width="26"
            height="42"
            rx="13"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            className="hp-hero__scroll-dot"
            cx="14"
            cy="14"
            r="5"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
