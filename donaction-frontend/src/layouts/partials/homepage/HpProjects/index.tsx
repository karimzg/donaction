import ScrollAnimator from '@/components/ScrollAnimator';
import { KlubProjet } from '@/core/models/klub-project';
import Link from 'next/link';
import HpProjectCard from './HpProjectCard';
import ProjectsCarousel from './ProjectsCarousel';
import './index.scss';

type HpProjectsProps = {
  projets: Array<KlubProjet>;
};

export default function HpProjects({ projets }: HpProjectsProps) {
  if (!projets.length) return null;

  return (
    <section className="hp-projects w-full py-16 md:py-20 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-6">
        <ScrollAnimator className="hp-projects__wrapper">
          <div className="hp-projects__header text-center mb-12 md:mb-16">
          <h2 className="hp-projects__title text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Projets à la une
          </h2>
          <p className="hp-projects__subtitle text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
            Découvrez les projets qui font vibrer le sport associatif
          </p>
        </div>

        {/* Desktop/Tablet grid: 2 cols on tablet, 3 on desktop */}
        <div className="hp-projects__grid hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projets.map((projet, index) => (
            <HpProjectCard
              key={projet.uuid || index}
              projet={projet}
              index={index}
              className={index >= 2 ? 'hidden lg:block' : ''}
            />
          ))}
        </div>

        {/* Mobile: horizontal scroll carousel */}
        <div className="md:hidden">
          <ProjectsCarousel projets={projets} />
        </div>

        <div className="hp-projects__cta flex justify-center mt-10 md:mt-14">
          <Link
            href="/projets"
            className="btn btn-outline-primary py-[10px] px-8 rounded-xl font-semibold"
          >
            Voir tous les projets
          </Link>
        </div>
        </ScrollAnimator>
      </div>
    </section>
  );
}
