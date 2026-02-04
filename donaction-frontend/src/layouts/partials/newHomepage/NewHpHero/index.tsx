import Link from 'next/link';
import './index.scss';

interface NewHpHeroProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

const NewHpHero: React.FC<NewHpHeroProps> = ({
  title = 'Donnez du sens à votre générosité',
  subtitle = 'Soutenez les associations qui vous tiennent à cœur et suivez l\'impact de vos dons en toute transparence.',
  primaryCtaText = 'Créer mon club',
  primaryCtaHref = '/new-club',
  secondaryCtaText = 'Découvrir les projets',
  secondaryCtaHref = '/projets',
}) => {
  return (
    <section className="newHpHero">
      <div className="newHpHero__container">
        <div className="newHpHero__content">
          <h1 className="newHpHero__title">{title}</h1>
          <p className="newHpHero__subtitle">{subtitle}</p>
          <div className="newHpHero__ctas">
            <Link href={primaryCtaHref} className="btn btn-primary newHpHero__cta--primary">
              {primaryCtaText}
            </Link>
            <Link href={secondaryCtaHref} className="btn btn-outline-primary newHpHero__cta--secondary">
              {secondaryCtaText}
            </Link>
          </div>
        </div>
        <div className="newHpHero__illustration">
          <div className="newHpHero__illustration-placeholder">
            <svg
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="newHpHero__illustration-svg"
            >
              <rect width="400" height="300" rx="20" fill="#F3F0F0" />
              <circle cx="200" cy="120" r="60" fill="#73cfa8" opacity="0.8" />
              <path
                d="M170 180 Q200 220 230 180"
                stroke="#fb9289"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              <rect x="140" y="200" width="120" height="60" rx="10" fill="#000" opacity="0.1" />
            </svg>
          </div>
        </div>
      </div>
      <div className="newHpHero__scroll-indicator">
        <span className="newHpHero__scroll-text">Découvrir</span>
        <div className="newHpHero__scroll-arrow">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default NewHpHero;
