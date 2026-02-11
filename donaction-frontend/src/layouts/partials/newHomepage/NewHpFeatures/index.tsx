import ScrollAnimator from '@/components/ScrollAnimator';
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

const CURRENCY = "€";

/** Format a number using French locale (e.g. 1.75 → "1,75") */
const formatFr = (value: number, decimals = 2): string =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);

/** Round to 2 decimals to avoid floating-point drift */
const round2 = (value: number): number =>
  Math.round(value * 100) / 100;

/** Transaction fee rates applied per donation (not subscription fees) */
const FEE_RATES = {
  FREE: 6,
  PREMIUM: 1.75,
} as const;

/** Monthly subscription price per tier */
const PRICING = {
  FREE_MONTHLY: `0${CURRENCY}`,
  PREMIUM_MONTHLY: `69${CURRENCY}`,
} as const;

const FEES = {
  FREE_RATE: `${FEE_RATES.FREE}%`,
  FREE_LABEL: "Frais plateforme*",
  PREMIUM_RATE: `${formatFr(FEE_RATES.PREMIUM)}%`,
  PREMIUM_LABEL: "Frais plateforme*",
} as const;

const LABELS = {
  PREMIUM_BADGE: "⭐ Bientôt disponible",
  FREE_FOOTNOTE: "*Frais bancaires + frais de fonctionnement Donaction",
  PREMIUM_FOOTNOTE: "*Uniquement les frais bancaires",
} as const;

const DONATION_AMOUNT = 100;

interface DonationExampleTier {
  id: string;
  name: string;
  feeAmount: number;
  netAmount: number;
}

const DONATION_EXAMPLE = {
  amount: DONATION_AMOUNT,
  currency: CURRENCY,
  tiers: [
    {
      id: "free",
      name: "Gratuit",
      feeAmount: round2(DONATION_AMOUNT * (FEE_RATES.FREE / 100)),
      netAmount: round2(DONATION_AMOUNT * (1 - FEE_RATES.FREE / 100)),
    },
    {
      id: "premium",
      name: "Premium",
      feeAmount: round2(DONATION_AMOUNT * (FEE_RATES.PREMIUM / 100)),
      netAmount: round2(DONATION_AMOUNT * (1 - FEE_RATES.PREMIUM / 100)),
    },
  ] as DonationExampleTier[],
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

function ArrowIcon() {
  return (
    <svg
      className="new-hp-features__arrow-icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
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

function DonationExampleBox() {
  const { amount, currency, tiers } = DONATION_EXAMPLE;

  return (
    <div className="new-hp-features__example" aria-label="Exemple de don">
      <h3 className="new-hp-features__example-title">
        Exemple concret : pour un don de {amount}{currency}
      </h3>
      <div className="new-hp-features__example-grid">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`new-hp-features__example-card new-hp-features__example-card--${tier.id}`}
          >
            <span className="new-hp-features__example-tier">{tier.name}</span>
            <div className="new-hp-features__example-row">
              <span className="new-hp-features__example-label">Frais plateforme</span>
              <span className="new-hp-features__example-value">
                {tier.feeAmount}{currency}
              </span>
            </div>
            <div className="new-hp-features__example-row new-hp-features__example-row--result">
              <span className="new-hp-features__example-label">Votre club reçoit</span>
              <span className={`new-hp-features__example-amount new-hp-features__example-amount--${tier.id}`}>
                {tier.netAmount}{currency}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NewHpFeatures() {
  return (
    <section className="new-hp-features">
      <ScrollAnimator className="new-hp-features__wrapper">
        <div className="new-hp-features__container">
          <div className="new-hp-features__header">
            <h2 className="new-hp-features__title">Nos offres</h2>
            <p className="new-hp-features__subtitle">
              Fonctionnalités et tarifs en toute transparence
            </p>
          </div>

        <div className="new-hp-features__grid">
          {/* Free Tier */}
          <div className="new-hp-features__tier new-hp-features__tier--free">
            <div className="new-hp-features__tier-container">
              <div className="new-hp-features__tier-header">
                <div className="new-hp-features__tier-badge-wrapper">
                  <span className="new-hp-features__badge new-hp-features__badge--free">
                    <CheckmarkIcon />
                    Gratuit
                  </span>
                </div>
                <h3 className="new-hp-features__tier-title">Pour commencer</h3>
                <div className="new-hp-features__pricing">
                  <span className="new-hp-features__price new-hp-features__price--free">
                    {PRICING.FREE_MONTHLY}
                  </span>
                  <span className="new-hp-features__price-period">/mois</span>
                </div>
                <div className="new-hp-features__fee new-hp-features__fee--free">
                  <span className="new-hp-features__fee-rate">{FEES.FREE_RATE}</span>
                  <span className="new-hp-features__fee-label">{FEES.FREE_LABEL}</span>
                </div>
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
              <p className="new-hp-features__footnote new-hp-features__footnote--free">
                {LABELS.FREE_FOOTNOTE}
              </p>
              <Link
                href="/inscription"
                className="new-hp-features__cta new-hp-features__cta--free"
                aria-label="S'inscrire à l'offre Gratuite"
              >
                Commencer gratuitement
                <ArrowIcon />
              </Link>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="new-hp-features__tier new-hp-features__tier--premium">
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
                <div className="new-hp-features__fee new-hp-features__fee--premium">
                  <span className="new-hp-features__fee-rate">{FEES.PREMIUM_RATE}</span>
                  <span className="new-hp-features__fee-label">{FEES.PREMIUM_LABEL}</span>
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
              <p className="new-hp-features__footnote new-hp-features__footnote--premium">
                {LABELS.PREMIUM_FOOTNOTE}
              </p>
              <Link
                href="/inscription?plan=premium"
                className="new-hp-features__cta new-hp-features__cta--premium"
                aria-label="S'inscrire à l'offre Premium"
              >
                Choisir Premium
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>

        <DonationExampleBox />
        </div>
      </ScrollAnimator>
    </section>
  );
}
