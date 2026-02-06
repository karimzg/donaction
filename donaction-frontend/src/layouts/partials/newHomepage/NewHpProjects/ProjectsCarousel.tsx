'use client';

import { KlubProjet } from '@/core/models/klub-project';
import { useRef, useState, useCallback, useEffect } from 'react';
import NewHpProjectCard from './NewHpProjectCard';

type ProjectsCarouselProps = {
  projets: Array<KlubProjet>;
};

export default function ProjectsCarousel({ projets }: ProjectsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / (clientWidth * 0.82));
    setActiveIndex(Math.min(index, projets.length - 1));
  }, [projets.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.children[index] as HTMLElement | undefined;
    if (!slide) return;
    el.scrollTo({
      left: slide.offsetLeft - el.offsetLeft,
      behavior: 'smooth',
    });
  };

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < projets.length - 1;

  return (
    <div className="new-hp-projects__carousel relative">
      <div
        ref={scrollRef}
        className="new-hp-projects__carousel-track flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6"
        role="region"
        aria-label="Projets à la une"
      >
        {projets.map((projet, index) => (
          <div
            key={projet.uuid || index}
            className="new-hp-projects__carousel-slide flex-none w-[82%] snap-start"
          >
            <NewHpProjectCard projet={projet} index={index} />
          </div>
        ))}
      </div>

      {/* Navigation: arrows + dots */}
      {projets.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          {/* Prev arrow */}
          <button
            className={`new-hp-projects__arrow flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 transition-all duration-200 ${
              canGoPrev
                ? 'text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                : 'text-gray-300 cursor-default'
            }`}
            onClick={() => canGoPrev && scrollTo(activeIndex - 1)}
            disabled={!canGoPrev}
            aria-label="Projet précédent"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2" role="tablist" aria-label="Navigation projets">
            {projets.map((_, index) => (
              <button
                key={index}
                className={`new-hp-projects__dot w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-gray-900 w-6'
                    : 'bg-gray-300'
                }`}
                onClick={() => scrollTo(index)}
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Projet ${index + 1}`}
              />
            ))}
          </div>

          {/* Next arrow */}
          <button
            className={`new-hp-projects__arrow flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 transition-all duration-200 ${
              canGoNext
                ? 'text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                : 'text-gray-300 cursor-default'
            }`}
            onClick={() => canGoNext && scrollTo(activeIndex + 1)}
            disabled={!canGoNext}
            aria-label="Projet suivant"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
