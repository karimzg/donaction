import Link from "next/link";
import PageIcon from "./icons/PageIcon";
import NotificationIcon from "./icons/NotificationIcon";
import ReceiptIcon from "./icons/ReceiptIcon";
import PoolIcon from "./icons/PoolIcon";
import WidgetIcon from "./icons/WidgetIcon";
import ExportIcon from "./icons/ExportIcon";
import TransferIcon from "./icons/TransferIcon";
import DashboardIcon from "../NewHpWhyDonaction/icons/DashboardIcon";
import "./index.scss";

interface IconProps {
  className?: string;
}

interface FeatureItem {
  id: string;
  Icon: React.ComponentType<IconProps>;
  title: string;
  subtitle: string;
}

type CardStyle = React.CSSProperties & { "--card-index": number };

const PRICING = {
  PREMIUM_MONTHLY: "29€",
} as const;

const LABELS = {
  PREMIUM_BADGE: "⭐ Bientôt disponible",
} as const;

const FREE_FEATURES: FeatureItem[] = [
  {
    id: "page",
    Icon: PageIcon,
    title: "Page club",
    subtitle: "Vitrine + formulaire de don intégré",
  },
  {
    id: "dashboard",
    Icon: DashboardIcon,
    title: "Tableau de bord",
    subtitle: "Suivi des dons en temps réel",
  },
  {
    id: "notifications",
    Icon: NotificationIcon,
    title: "Notifications",
    subtitle: "Alertes sur les donations",
  },
  {
    id: "tax-receipts",
    Icon: ReceiptIcon,
    title: "Reçus fiscaux",
    subtitle: "Génération automatique Cerfa",
  },
];

const PREMIUM_FEATURES: FeatureItem[] = [
  {
    id: "pools",
    Icon: PoolIcon,
    title: "Cagnottes",
    subtitle: "Projets de financement participatif",
  },
  {
    id: "widget",
    Icon: WidgetIcon,
    title: "Widget",
    subtitle: "Intégration sur votre site",
  },
  {
    id: "export",
    Icon: ExportIcon,
    title: "Export",
    subtitle: "Données comptables complètes",
  },
  {
    id: "transfer",
    Icon: TransferIcon,
    title: "Virement",
    subtitle: "Transferts automatiques",
  },
];

interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
  isFree: boolean;
}

function CheckmarkIcon() {
  return (
    <svg
      className="new-hp-features__badge-icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      className="new-hp-features__badge-icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function FeatureCard({ feature, index, isFree }: FeatureCardProps) {
  return (
    <li
      className="new-hp-features__card"
      style={{ "--card-index": index } as CardStyle}
    >
      <div
        className={`new-hp-features__card-content ${
          isFree
            ? "new-hp-features__card-content--free"
            : "new-hp-features__card-content--premium"
        }`}
      >
        <div
          className={`new-hp-features__icon-wrapper ${
            isFree
              ? "new-hp-features__icon-wrapper--free"
              : "new-hp-features__icon-wrapper--premium"
          }`}
        >
          <feature.Icon
            className={`new-hp-features__icon ${
              isFree
                ? "new-hp-features__icon--free"
                : "new-hp-features__icon--premium"
            }`}
          />
        </div>
        <div className="new-hp-features__card-text">
          <span className="new-hp-features__card-title">{feature.title}</span>
          <span className="new-hp-features__card-subtitle">
            {feature.subtitle}
          </span>
        </div>
      </div>
    </li>
  );
}

export default function NewHpFeatures() {
  return (
    <section className="new-hp-features">
      <div className="new-hp-features__container">
        <div className="new-hp-features__header">
          <h2 className="new-hp-features__title">Fonctionnalités par offre</h2>
          <p className="new-hp-features__subtitle">
            Choisissez l&apos;offre qui correspond à vos besoins
          </p>
        </div>

        <div className="new-hp-features__grid">
          {/* Free Tier */}
          <Link
            href="/inscription"
            className="new-hp-features__tier new-hp-features__tier--free"
            aria-label="S'inscrire à l'offre Gratuite"
          >
            <div className="new-hp-features__tier-container">
              <div className="new-hp-features__tier-header">
                <div className="new-hp-features__tier-badge-wrapper">
                  <span className="new-hp-features__badge new-hp-features__badge--free">
                    <CheckmarkIcon />
                    Gratuit
                  </span>
                </div>
                <h3 className="new-hp-features__tier-title">Pour commencer</h3>
                <p className="new-hp-features__tier-description">
                  Tout ce dont vous avez besoin
                </p>
              </div>
              <ul
                className="new-hp-features__cards"
                role="list"
                aria-label="Fonctionnalités gratuites"
              >
                {FREE_FEATURES.map((feature, index) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    index={index}
                    isFree={true}
                  />
                ))}
              </ul>
            </div>
          </Link>

          {/* Premium Tier */}
          <Link
            href="/inscription?plan=premium"
            className="new-hp-features__tier new-hp-features__tier--premium"
            aria-label="S'inscrire à l'offre Premium"
          >
            <div className="new-hp-features__tier-badge-highlight">
              {LABELS.PREMIUM_BADGE}
            </div>
            <div className="new-hp-features__tier-container new-hp-features__tier-container--premium">
              <div className="new-hp-features__tier-header">
                <div className="new-hp-features__tier-badge-wrapper">
                  <span className="new-hp-features__badge new-hp-features__badge--premium">
                    <StarIcon />
                    Premium
                  </span>
                </div>
                <h3 className="new-hp-features__tier-title">Pour progresser</h3>
                <div className="new-hp-features__pricing">
                  <span className="new-hp-features__price">
                    {PRICING.PREMIUM_MONTHLY}
                  </span>
                  <span className="new-hp-features__price-period">/mois</span>
                </div>
                <p className="new-hp-features__tier-description">
                  Fonctionnalités avancées
                </p>
              </div>
              <ul
                className="new-hp-features__cards"
                role="list"
                aria-label="Fonctionnalités premium"
              >
                {PREMIUM_FEATURES.map((feature, index) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    index={index}
                    isFree={false}
                  />
                ))}
              </ul>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
