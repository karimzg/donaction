import ScrollAnimator from '@/components/ScrollAnimator';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/core/constants/contact';
import MultiClubIcon from './icons/MultiClubIcon';
import ReportingIcon from './icons/ReportingIcon';
import DedicatedSupportIcon from './icons/DedicatedSupportIcon';
import './index.scss';

const DEMO_CTA_URL = `/contact?${new URLSearchParams({ objet: 'Demande de Démo' }).toString()}`;

const FEDERATION_ADVANTAGES = [
  {
    id: 'multi-club',
    Icon: MultiClubIcon,
    title: 'Gestion multi-clubs',
    subtitle: 'Pilotez tous vos clubs depuis une seule interface',
  },
  {
    id: 'consolidated-reporting',
    Icon: ReportingIcon,
    title: 'Reporting consolidé',
    subtitle: 'Tableaux de bord et exports pour vos instances',
  },
  {
    id: 'dedicated-support',
    Icon: DedicatedSupportIcon,
    title: 'Accompagnement dédié',
    subtitle: 'Un interlocuteur unique pour votre fédération',
  },
] as const;

export default function HpFederations() {
  return (
    <section className="hp-federations w-full py-16 md:py-20 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-6">
        <ScrollAnimator className="hp-federations__wrapper">
          <h2 className="hp-federations__title text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-4 md:mb-6">
          Pour les fédérations et comités
        </h2>
        <p className="hp-federations__subtitle text-center text-gray-200 mb-12 md:mb-16 max-w-2xl mx-auto">
          Une solution complète pour accompagner vos clubs dans leur développement et vos actions de financement
        </p>
        <ul
          className="hp-federations__grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16"
          role="list"
          aria-label="Avantages pour les fédérations"
        >
          {FEDERATION_ADVANTAGES.map((advantage, index) => (
            <li
              key={advantage.id}
              className="hp-federations__card"
              style={{ '--card-index': index }}
            >
              <div className="hp-federations__card-content flex flex-col items-center text-center gap-4">
                <div className="hp-federations__icon-wrapper">
                  <advantage.Icon className="hp-federations__icon text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-base md:text-lg font-semibold text-white">
                    {advantage.title}
                  </span>
                  <span className="text-sm md:text-base text-gray-300">
                    {advantage.subtitle}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="hp-federations__cta flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
          <Link
            href={DEMO_CTA_URL}
            className="hp-federations__cta-button bg-[#73cfa8] hover:bg-[#5ec497] text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
          >
            Demander une démo
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            rel="noopener noreferrer"
            aria-label="Contacter par email"
            className="hp-federations__cta-email text-[#73cfa8] hover:text-[#5ec497] font-medium transition-colors duration-300"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        </ScrollAnimator>
      </div>
    </section>
  );
}
