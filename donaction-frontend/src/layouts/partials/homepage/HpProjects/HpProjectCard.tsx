import { KlubProjet } from '@/core/models/klub-project';
import { formatCurrency } from '@/core/helpers/currency/CurrencyHelpers';
import ImageHtml from '@/components/media/ImageHtml';
import Link from 'next/link';
import { getProjectDeadlineInfo } from './helpers';

type CardStyle = React.CSSProperties & { '--card-index': number };

type HpProjectCardProps = {
  projet: KlubProjet;
  index: number;
  className?: string;
};

export default function HpProjectCard({ projet, index, className }: HpProjectCardProps) {
  const klubSlug = projet.klubr?.slug;
  const projectUrl = klubSlug ? `/${klubSlug}/nos-projets/${projet.slug}` : null;
  const progress = projet.montantAFinancer > 0
    ? Math.min((projet.montantTotalDonations / projet.montantAFinancer) * 100, 100)
    : 0;
  const progressWidth = progress > 0 ? Math.max(progress, 3) : 0;
  const { isExpired, daysLeft } = getProjectDeadlineInfo(projet.dateLimiteFinancementProjet);

  const CardWrapper = projectUrl
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={projectUrl} className="hp-projects__card-link block h-full">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="hp-projects__card-link block h-full">{children}</div>
      );

  return (
    <article
      className={`hp-projects__card ${className || ''}`}
      style={{ '--card-index': index } as CardStyle}
    >
      <CardWrapper>
        <div className="hp-projects__card-content flex flex-col h-full">
          {/* Cover image */}
          <div className="hp-projects__card-image relative overflow-hidden rounded-t-2xl aspect-video">
            {projet.couverture?.url && (
              <ImageHtml
                className="w-full h-full object-cover"
                width={420}
                height={236}
                src={projet.couverture.url}
                alt={projet.couverture.alternativeText || projet.titre}
                namedtransformation="project_card"
                nosizes={true}
                loading="lazy"
              />
            )}

            {/* Status badge */}
            <span
              className={`hp-projects__status-badge absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm ${
                isExpired
                  ? 'bg-gray-800/70 text-white'
                  : 'bg-emerald-500/80 text-white'
              }`}
            >
              {isExpired ? 'Terminé' : 'En cours'}
            </span>

            {/* Days left badge */}
            {daysLeft !== null && daysLeft >= 0 && (
              <span className="hp-projects__deadline-badge absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                J-{daysLeft}
              </span>
            )}

            {/* Sport badge */}
            {projet.sportType && (
              <span className="hp-projects__badge absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-3 py-1 rounded-full">
                {projet.sportType}
              </span>
            )}
          </div>

          {/* Card body */}
          <div className="hp-projects__card-body flex flex-col flex-1 p-5">
            {/* Club info */}
            {projet.klubr && (
              <div className="flex items-center gap-2 mb-3">
                {projet.klubr.logo?.url && (
                  <ImageHtml
                    className="w-8 h-8 rounded-full object-contain"
                    width={32}
                    height={32}
                    src={projet.klubr.logo.url}
                    alt={projet.klubr.logo.alt || projet.klubr.denomination}
                    namedtransformation="logo"
                    nosizes={true}
                    loading="lazy"
                  />
                )}
                <span className="text-xs text-gray-500 truncate">
                  {projet.klubr.denomination}
                </span>
              </div>
            )}

            {/* Title */}
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
              {projet.titre}
            </h3>

            {/* Progress section - pushed to bottom */}
            <div className="mt-auto">
              {/* Progress bar */}
              <div className="hp-projects__progress relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  className="hp-projects__progress-fill absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>

              {/* Amounts */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(projet.montantTotalDonations)}
                </span>
                <span className="text-gray-400">
                  sur {formatCurrency(projet.montantAFinancer)}
                </span>
              </div>

              {/* Social proof */}
              {projet.nbDons > 0 && (
                <div className="hp-projects__social-proof flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14 12.5c0 1.38-2.69 2.5-6 2.5S2 13.88 2 12.5 4.69 10 8 10s6 1.12 6 2.5Z" fill="currentColor" />
                  </svg>
                  <span>
                    <strong className="font-semibold text-gray-700">{projet.nbDons}</strong>{' '}
                    {projet.nbDons > 1 ? 'mécènes' : 'mécène'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardWrapper>
    </article>
  );
}
