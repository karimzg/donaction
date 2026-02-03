import { vi } from 'vitest';

/**
 * Mock for useSponsorshipForm.svelte.ts
 *
 * This mock is necessary because the original module uses Svelte 5 $state() runes
 * which are compiler primitives and don't work in Vitest's Node.js environment.
 */

export const SUBSCRIPTION = {
  token: null as string | null,
  klubr: null as any,
  project: null as any,
  allowKlubrContribution: false as boolean | null,
  allowProjectSelection: false,
};

export const FORM_CONFIG = {
  donatorUuid: null as string | null,
  donUuid: null as string | null,
  clubUuid: null as string | null,
  projectUuid: null as string | null,
  myLasts: null as any[] | null,
  myLast: null as any,
  authEmail: null as string | null,
  dirty: false,
};

export const DEFAULT_VALUES = {
  estOrganisme: false,
  withTaxReduction: true,
  montant: NaN,
  contributionAKlubr: NaN,
  donorPaysFee: false,
  socialReason: '',
  siren: '',
  legalForm: '',
  logo: '',
  civility: 'Monsieur',
  firstName: '',
  lastName: '',
  birthdate: '',
  tel: '',
  email: '',
  streetNumber: '',
  streetName: '',
  postalCode: '',
  city: '',
  country: 'France',
  place_id: null,
  displayName: true,
  displayAmount: true,
  acceptConditions2: false,
};

export const defVals = { ...DEFAULT_VALUES };

export const isBeingFilled = {
  set: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
  update: vi.fn(),
};

export const isLoading = {
  set: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
  update: vi.fn(),
};

export const index = {
  set: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
  update: vi.fn(),
};

export const triggerValidation = {
  set: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
  update: vi.fn(),
};

export const isCguShown = {
  set: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
  update: vi.fn(),
};

export const isContributionShown = {
  set: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
  update: vi.fn(),
};

export const submitForm = vi.fn();
export const goToStep = vi.fn();

/**
 * Reset all mocked state to initial values.
 * Call this in beforeEach to ensure clean state between tests.
 */
export function resetMocks() {
  SUBSCRIPTION.token = null;
  SUBSCRIPTION.klubr = null;
  SUBSCRIPTION.project = null;
  SUBSCRIPTION.allowKlubrContribution = false;
  SUBSCRIPTION.allowProjectSelection = false;

  FORM_CONFIG.donatorUuid = null;
  FORM_CONFIG.donUuid = null;
  FORM_CONFIG.clubUuid = null;
  FORM_CONFIG.projectUuid = null;
  FORM_CONFIG.myLasts = null;
  FORM_CONFIG.myLast = null;
  FORM_CONFIG.authEmail = null;
  FORM_CONFIG.dirty = false;

  vi.clearAllMocks();
}
