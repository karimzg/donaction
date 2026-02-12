import ScrollAnimator from '@/components/ScrollAnimator';
import Link from 'next/link';
import './index.scss';

export default function NewHpCta() {
  return (
    <section className="new-hp-cta w-full py-20 md:py-24 lg:py-28">
      <ScrollAnimator className="new-hp-cta__wrapper">
      {/* Decorative floating shapes */}
      <div className="new-hp-cta__shapes" aria-hidden="true">
        <div className="new-hp-cta__shape new-hp-cta__shape--1" />
        <div className="new-hp-cta__shape new-hp-cta__shape--2" />
        <div className="new-hp-cta__shape new-hp-cta__shape--3" />
      </div>

      {/* Dot grid overlay (echoes Hero pattern) */}
      <div className="new-hp-cta__grid" aria-hidden="true" />

      <div className="max-w-[1320px] mx-auto px-6 text-center relative z-10">
        <h2 className="new-hp-cta__title text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-gray-900 mb-5 leading-tight">
          Prêt à lancer votre collecte ?
        </h2>
        <p className="new-hp-cta__subtitle text-gray-500 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          Créez votre espace association en quelques minutes et commencez à recevoir des dons.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/new-club"
            className="new-hp-cta__button inline-block rounded-xl font-bold text-white text-base md:text-lg px-10 py-4 md:px-12 md:py-[1.125rem] transition-all duration-200"
          >
            Créer mon compte
          </Link>
          <span className="new-hp-cta__reassurance text-gray-400 text-sm">
            Gratuit, sans engagement
          </span>
        </div>
      </div>
      </ScrollAnimator>
    </section>
  );
}
