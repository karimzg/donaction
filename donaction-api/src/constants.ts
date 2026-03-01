const TAUX_DEDUCTION_FISCALE_PART = 0.66;
const TAUX_DEDUCTION_FISCALE_PRO = 0.6;
const API_DEFAULT_PAGE_SIZE = 25;
const DEFAULT_CURRENCY = 'eur';

/** Allowed origins for Stripe Connect onboarding redirect URLs */
const ALLOWED_ONBOARDING_DOMAINS = [
    'https://donaction.fr',
    'https://www.donaction.fr',
    'https://re7.donaction.fr',
    ...(process.env.NODE_ENV === 'development'
        ? ['http://localhost:3100', 'http://localhost:3000']
        : []),
];

export {
    TAUX_DEDUCTION_FISCALE_PART,
    TAUX_DEDUCTION_FISCALE_PRO,
    API_DEFAULT_PAGE_SIZE,
    DEFAULT_CURRENCY,
    ALLOWED_ONBOARDING_DOMAINS,
};
