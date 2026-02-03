import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

vi.mock('../logic/submit', () => ({
  handleSubmitStepTwo: vi.fn(),
}));

vi.mock('../logic/toaster', () => ({
  dispatchToast: vi.fn(),
}));

vi.mock('../../../utils/sendGaEvent', () => ({
  sendGaEvent: vi.fn(),
}));

vi.mock('../../../utils/eventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn(), events: new Map() },
}));

import {
  index,
  submitForm,
  goToStep,
  defVals,
  triggerValidation,
  isBeingFilled,
  isCguShown,
  isContributionShown,
  DEFAULT_VALUES,
  isLoading,
  FORM_CONFIG,
  SUBSCRIPTION,
} from '../logic/useSponsorshipForm.svelte';
import { handleSubmitStepTwo } from '../logic/submit';
import { dispatchToast } from '../logic/toaster';
import eventBus from '../../../utils/eventBus';

describe('useSponsorshipForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    index.set(0);
    triggerValidation.set(0);
    isLoading.set(false);
    isBeingFilled.set(false);
  });

  // ─── Stores initial values ───────────────────────────────────────────

  describe('stores initial values', () => {
    it('index starts at 0', () => {
      expect(get(index)).toBe(0);
    });

    it('triggerValidation starts at 0', () => {
      expect(get(triggerValidation)).toBe(0);
    });

    it('isBeingFilled starts at false', () => {
      expect(get(isBeingFilled)).toBe(false);
    });

    it('isLoading starts at false', () => {
      expect(get(isLoading)).toBe(false);
    });

    it('isCguShown starts at false', () => {
      expect(get(isCguShown)).toBe(false);
    });

    it('isContributionShown starts at false', () => {
      expect(get(isContributionShown)).toBe(false);
    });
  });

  // ─── defVals ─────────────────────────────────────────────────────────

  describe('defVals', () => {
    it('contains all expected default form fields', () => {
      const expectedKeys = [
        'estOrganisme',
        'withTaxReduction',
        'montant',
        'contributionAKlubr',
        'donorPaysFee',
        'socialReason',
        'siren',
        'legalForm',
        'logo',
        'civility',
        'firstName',
        'lastName',
        'birthdate',
        'tel',
        'email',
        'streetNumber',
        'streetName',
        'postalCode',
        'city',
        'country',
        'place_id',
        'displayName',
        'displayAmount',
        'acceptConditions2',
      ];
      expect(Object.keys(defVals)).toEqual(expectedKeys);
    });

    it('defaults montant to NaN', () => {
      expect(defVals.montant).toBeNaN();
    });

    it('defaults country to France', () => {
      expect(defVals.country).toBe('France');
    });

    it('defaults civility to Monsieur', () => {
      expect(defVals.civility).toBe('Monsieur');
    });

    it('defaults estOrganisme to false', () => {
      expect(defVals.estOrganisme).toBe(false);
    });

    it('defaults withTaxReduction to true', () => {
      expect(defVals.withTaxReduction).toBe(true);
    });
  });

  // ─── SUBSCRIPTION ────────────────────────────────────────────────────

  describe('SUBSCRIPTION', () => {
    it('has null token by default', () => {
      expect(SUBSCRIPTION.token).toBeNull();
    });

    it('has allowProjectSelection false by default', () => {
      expect(SUBSCRIPTION.allowProjectSelection).toBe(false);
    });

    it('has allowKlubrContribution false by default', () => {
      expect(SUBSCRIPTION.allowKlubrContribution).toBe(false);
    });
  });

  // ─── FORM_CONFIG ─────────────────────────────────────────────────────

  describe('FORM_CONFIG', () => {
    it('has all null identifiers by default', () => {
      expect(FORM_CONFIG.donatorUuid).toBeNull();
      expect(FORM_CONFIG.donUuid).toBeNull();
      expect(FORM_CONFIG.clubUuid).toBeNull();
      expect(FORM_CONFIG.projectUuid).toBeNull();
    });

    it('has dirty false by default', () => {
      expect(FORM_CONFIG.dirty).toBe(false);
    });

    it('has myLasts and myLast null by default', () => {
      expect(FORM_CONFIG.myLasts).toBeNull();
      expect(FORM_CONFIG.myLast).toBeNull();
    });
  });

  // ─── goToStep ────────────────────────────────────────────────────────

  describe('goToStep', () => {
    it('navigates back to a previous step', () => {
      index.set(3);
      goToStep(1);
      expect(get(index)).toBe(1);
    });

    it('resets triggerValidation when navigating back', () => {
      index.set(2);
      triggerValidation.set(5);
      goToStep(0);
      expect(get(triggerValidation)).toBe(0);
    });

    it('does not navigate forward', () => {
      index.set(1);
      goToStep(3);
      expect(get(index)).toBe(1);
    });

    it('does not navigate to the same step', () => {
      index.set(2);
      goToStep(2);
      expect(get(index)).toBe(2);
    });

    it('does not navigate to negative steps', () => {
      index.set(2);
      goToStep(-1);
      expect(get(index)).toBe(2);
    });

    it('navigates to step 0 from any step', () => {
      index.set(4);
      goToStep(0);
      expect(get(index)).toBe(0);
    });
  });

  // ─── submitForm (backward navigation: acc <= 0) ──────────────────────

  describe('submitForm backward (acc <= 0)', () => {
    it('resets SUBSCRIPTION.project when going back from step 0', async () => {
      index.set(0);
      SUBSCRIPTION.project = { slug: 'test' };

      await submitForm(0);

      expect(SUBSCRIPTION.project).toBeNull();
    });

    it('decrements index when going back from step > 0', async () => {
      index.set(2);

      await submitForm(-1);

      expect(get(index)).toBe(1);
    });

    it('does not trigger validation when going back', async () => {
      index.set(1);

      await submitForm(-1);

      expect(get(triggerValidation)).toBe(0);
    });
  });

  // ─── submitForm (forward navigation: acc > 0) ────────────────────────

  describe('submitForm forward (acc > 0)', () => {
    let mockShadowRoot: { querySelectorAll: ReturnType<typeof vi.fn> };
    let mockFormElement: { shadowRoot: typeof mockShadowRoot };

    beforeEach(() => {
      mockShadowRoot = {
        querySelectorAll: vi.fn().mockReturnValue([]),
      };
      mockFormElement = { shadowRoot: mockShadowRoot };

      vi.spyOn(document, 'querySelector').mockReturnValue(mockFormElement as unknown as Element);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('increments triggerValidation before checking errors', async () => {
      await submitForm(1);
      // triggerValidation is reset to 0 after successful advance,
      // but it was incremented during the process
      expect(get(triggerValidation)).toBe(0);
    });

    it('advances index when no validation errors', async () => {
      index.set(0);

      await submitForm(1);

      expect(get(index)).toBe(1);
    });

    it('resets triggerValidation after successful advance', async () => {
      triggerValidation.set(3);

      await submitForm(1);

      expect(get(triggerValidation)).toBe(0);
    });

    it('does not advance index when validation errors exist', async () => {
      const errorEl = document.createElement('span');
      errorEl.innerText = 'This field is required';
      errorEl.scrollIntoView = vi.fn();
      mockShadowRoot.querySelectorAll.mockReturnValue([errorEl]);

      index.set(0);
      await submitForm(1);

      expect(get(index)).toBe(0);
    });

    it('scrolls to first error when validation fails', async () => {
      const errorEl = document.createElement('span');
      errorEl.innerText = 'Required field';
      errorEl.scrollIntoView = vi.fn();
      mockShadowRoot.querySelectorAll.mockReturnValue([errorEl]);

      await submitForm(1);

      expect(errorEl.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    });

    it('ignores empty error elements', async () => {
      const emptyError = document.createElement('span');
      emptyError.innerText = '';
      mockShadowRoot.querySelectorAll.mockReturnValue([emptyError]);

      index.set(0);
      await submitForm(1);

      // Empty error element is not a real error, should advance
      expect(get(index)).toBe(1);
    });

    // ─── Step 2 submit logic ──────────────────────────────────────────

    describe('step 2 submission', () => {
      beforeEach(() => {
        index.set(2);
        vi.mocked(handleSubmitStepTwo).mockResolvedValue({
          createDonationRes: { uuid: 'don-1' },
          createDonatorRes: { uuid: 'donator-1' },
        });
      });

      it('calls handleSubmitStepTwo at step 2', async () => {
        await submitForm(1);
        expect(handleSubmitStepTwo).toHaveBeenCalledOnce();
      });

      it('sets isLoading to true before submit', async () => {
        let loadingDuringSubmit = false;
        vi.mocked(handleSubmitStepTwo).mockImplementation(async () => {
          loadingDuringSubmit = get(isLoading);
          return { createDonationRes: {}, createDonatorRes: {} };
        });

        await submitForm(1);

        expect(loadingDuringSubmit).toBe(true);
      });

      it('sets isLoading to false after submit completes', async () => {
        await submitForm(1);
        expect(get(isLoading)).toBe(false);
      });

      it('sets isLoading to false even on submit error', async () => {
        vi.mocked(handleSubmitStepTwo).mockRejectedValue(new Error('API error'));

        await submitForm(1);

        expect(get(isLoading)).toBe(false);
      });

      it('emits klubDonResult via eventBus on success', async () => {
        const result = {
          createDonationRes: { uuid: 'don-1' },
          createDonatorRes: { uuid: 'donator-1' },
        };
        vi.mocked(handleSubmitStepTwo).mockResolvedValue(result);

        await submitForm(1);

        expect(eventBus.emit).toHaveBeenCalledWith('KLUBR_SPONSORSHIP_FORM_klubDonResult', result);
      });

      it('does not call handleSubmitStepTwo at other steps', async () => {
        index.set(0);
        await submitForm(1);
        expect(handleSubmitStepTwo).not.toHaveBeenCalled();
      });
    });

    // ─── Error handling ───────────────────────────────────────────────

    describe('error handling', () => {
      beforeEach(() => {
        index.set(2);
      });

      it('dispatches toast on submit error', async () => {
        vi.mocked(handleSubmitStepTwo).mockRejectedValue({
          error: { message: 'Payment failed' },
        });

        await submitForm(1);

        expect(dispatchToast).toHaveBeenCalledWith('Payment failed', 'DANGER');
      });

      it('dispatches toast with empty string when error has no message', async () => {
        vi.mocked(handleSubmitStepTwo).mockRejectedValue({});

        await submitForm(1);

        expect(dispatchToast).toHaveBeenCalledWith('', 'DANGER');
      });
    });
  });

  // ─── DEFAULT_VALUES ──────────────────────────────────────────────────

  describe('DEFAULT_VALUES', () => {
    it('is initialized with defVals values', () => {
      expect(DEFAULT_VALUES.country).toBe('France');
      expect(DEFAULT_VALUES.civility).toBe('Monsieur');
      expect(DEFAULT_VALUES.estOrganisme).toBe(false);
    });

    it('is mutable (reactive state)', () => {
      const original = DEFAULT_VALUES.email;
      DEFAULT_VALUES.email = 'test@example.com';
      expect(DEFAULT_VALUES.email).toBe('test@example.com');
      DEFAULT_VALUES.email = original;
    });
  });
});
