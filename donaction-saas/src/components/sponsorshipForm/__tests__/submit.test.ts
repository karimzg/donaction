import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../logic/api');
vi.mock('../../../utils/sendGaEvent');
vi.mock('../logic/useSponsorshipForm.svelte');

import * as apiModule from '../logic/api';
import * as gaModule from '../../../utils/sendGaEvent';
import * as formModule from '../logic/useSponsorshipForm.svelte';
import { handleSubmitStepTwo, updateKlubrDonStatus } from '../logic/submit';

const mockCreateReCaptchaToken = vi.fn(() => Promise.resolve('recaptcha-token'));
const mockPutPostDon = vi.fn(() => Promise.resolve({ uuid: 'don-uuid-1', montant: 100 }));
const mockPutPostDonator = vi.fn(() => Promise.resolve({ uuid: 'donator-uuid-1' }));
const mockUploadCompanyLogo = vi.fn(() =>
  Promise.resolve({ logo: { uuid: 'logo-1', url: 'http://logo.png' } }),
);
const mockSendGaEvent = vi.fn();

vi.mocked(apiModule.createReCaptchaToken).mockImplementation(mockCreateReCaptchaToken);
vi.mocked(apiModule.putPostDon).mockImplementation(mockPutPostDon);
vi.mocked(apiModule.putPostDonator).mockImplementation(mockPutPostDonator);
vi.mocked(apiModule.uploadCompanyLogo).mockImplementation(mockUploadCompanyLogo);
vi.mocked(gaModule.sendGaEvent).mockImplementation(mockSendGaEvent);

// eslint-disable-next-line no-import-assign
Object.defineProperty(formModule, 'DEFAULT_VALUES', {
  value: {
    estOrganisme: false,
    withTaxReduction: true,
    montant: 100,
    contributionAKlubr: 2,
    donorPaysFee: false,
    socialReason: 'Test Corp',
    siren: '123456789',
    legalForm: 'SAS',
    logo: '',
    civility: 'Monsieur',
    firstName: 'Jean',
    lastName: 'Dupont',
    birthdate: '1990-01-01',
    tel: '0612345678',
    email: 'test@test.com',
    streetNumber: '12',
    streetName: 'Rue Test',
    postalCode: '75001',
    city: 'Paris',
    country: 'France',
    place_id: 'abc123',
    displayName: true,
    displayAmount: true,
    acceptConditions2: true,
  },
  writable: true,
});

// eslint-disable-next-line no-import-assign
Object.defineProperty(formModule, 'FORM_CONFIG', {
  value: {
    donatorUuid: null,
    donUuid: null,
    clubUuid: 'club-uuid-1',
    projectUuid: 'project-uuid-1',
    myLasts: null,
    myLast: null,
    authEmail: null,
    dirty: false,
  },
  writable: true,
});

describe('submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateReCaptchaToken.mockResolvedValue('recaptcha-token');
    mockPutPostDon.mockResolvedValue({ uuid: 'don-uuid-1', montant: 100 });
    mockPutPostDonator.mockResolvedValue({ uuid: 'donator-uuid-1' });
    mockUploadCompanyLogo.mockResolvedValue({ logo: { uuid: 'logo-1', url: 'http://logo.png' } });
    mockSendGaEvent.mockClear();

    formModule.DEFAULT_VALUES.estOrganisme = false;
    formModule.DEFAULT_VALUES.withTaxReduction = true;
    formModule.DEFAULT_VALUES.montant = 100;
    formModule.DEFAULT_VALUES.contributionAKlubr = 2;
    formModule.DEFAULT_VALUES.logo = '';

    formModule.FORM_CONFIG.donatorUuid = null;
    formModule.FORM_CONFIG.donUuid = null;
    formModule.FORM_CONFIG.clubUuid = 'club-uuid-1';
    formModule.FORM_CONFIG.projectUuid = 'project-uuid-1';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('updateKlubrDonStatus', () => {
    it('calls createReCaptchaToken with UPDATE_DONATION', async () => {
      await updateKlubrDonStatus('success', new Date(), 'don-uuid-1');
      expect(mockCreateReCaptchaToken).toHaveBeenCalledWith('UPDATE_DONATION');
    });

    it('calls putPostDon with status and formToken', async () => {
      const paymentDate = new Date('2025-01-30');
      await updateKlubrDonStatus('success', paymentDate, 'don-uuid-1');

      expect(mockPutPostDon).toHaveBeenCalledWith(
        expect.objectContaining({
          formToken: 'recaptcha-token',
          statusPaiment: 'success',
        }),
        'don-uuid-1',
      );
    });

    it('includes datePaiment when status is success', async () => {
      const paymentDate = new Date('2025-01-30T12:00:00Z');
      await updateKlubrDonStatus('success', paymentDate, 'don-uuid-1');

      expect(mockPutPostDon).toHaveBeenCalledWith(
        expect.objectContaining({
          datePaiment: paymentDate.toISOString(),
        }),
        'don-uuid-1',
      );
    });

    it('includes datePaiment when status is error', async () => {
      const paymentDate = new Date('2025-01-30T12:00:00Z');
      await updateKlubrDonStatus('error', paymentDate, 'don-uuid-1');

      expect(mockPutPostDon).toHaveBeenCalledWith(
        expect.objectContaining({
          datePaiment: paymentDate.toISOString(),
        }),
        'don-uuid-1',
      );
    });

    it('does NOT include datePaiment when status is pending', async () => {
      const paymentDate = new Date('2025-01-30T12:00:00Z');
      await updateKlubrDonStatus('pending', paymentDate, 'don-uuid-1');

      const callArgs = mockPutPostDon.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('datePaiment');
    });

    it('sends GA event on success', async () => {
      await updateKlubrDonStatus('success', new Date(), 'don-uuid-1');

      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'donation',
          label: expect.stringContaining('Update Klub Don status'),
        }),
      );
    });

    it('sends GA error event on putPostDon failure and re-throws', async () => {
      mockPutPostDon.mockRejectedValueOnce(new Error('API failure'));

      await expect(updateKlubrDonStatus('success', new Date(), 'don-uuid-1')).rejects.toThrow(
        'API failure',
      );

      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'donation_error',
          label: expect.stringContaining('Update Klub Don status'),
        }),
      );
    });

    it('handles reCAPTCHA failure and re-throws', async () => {
      mockCreateReCaptchaToken.mockRejectedValueOnce(new Error('reCAPTCHA failed'));

      await expect(updateKlubrDonStatus('success', new Date(), 'don-uuid-1')).rejects.toThrow(
        'reCAPTCHA failed',
      );

      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'donation_error',
        }),
      );
      expect(mockPutPostDon).not.toHaveBeenCalled();
    });

    it('uses default date when paymentDate not provided', async () => {
      const beforeCall = new Date();
      await updateKlubrDonStatus('success', undefined, 'don-uuid-1');
      const afterCall = new Date();

      const callArgs = mockPutPostDon.mock.calls[0][0];
      const callDate = new Date(callArgs.datePaiment);

      expect(callDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(callDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });

  describe('handleSubmitStepTwo', () => {
    it('resolves with createDonationRes and createDonatorRes', async () => {
      const result = await handleSubmitStepTwo();

      expect(result).toHaveProperty('createDonationRes');
      expect(result).toHaveProperty('createDonatorRes');
    });

    it('calls sendGaEvent with category donation', async () => {
      await handleSubmitStepTwo();

      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'donation',
          label: 'Submit step 2',
        }),
      );
    });

    it('creates donation with correct request body', async () => {
      await handleSubmitStepTwo();

      const callArgs = mockPutPostDon.mock.calls[0][0];
      expect(callArgs.montant).toBe(100);
      expect(callArgs.contributionAKlubr).toBe(2);
      expect(callArgs.statusPaiment).toBe('notDone');
      expect(callArgs.klubr).toBe('club-uuid-1');
    });

    it('sets klub_projet to null when projectUuid equals clubUuid', async () => {
      formModule.FORM_CONFIG.projectUuid = formModule.FORM_CONFIG.clubUuid;

      await handleSubmitStepTwo();

      const callArgs = mockPutPostDon.mock.calls[0][0];
      expect(callArgs.klub_projet).toBe(null);

      formModule.FORM_CONFIG.projectUuid = 'project-uuid-1';
    });

    it('creates donator with correct donateurType when estOrganisme is true', async () => {
      formModule.DEFAULT_VALUES.estOrganisme = true;

      await handleSubmitStepTwo();

      const callArgs = mockPutPostDonator.mock.calls[0][0];
      expect(callArgs.donateurType).toBe('Organisme');

      formModule.DEFAULT_VALUES.estOrganisme = false;
    });

    it('creates donator with donateurType Particulier when estOrganisme is false', async () => {
      formModule.DEFAULT_VALUES.estOrganisme = false;

      await handleSubmitStepTwo();

      const callArgs = mockPutPostDonator.mock.calls[0][0];
      expect(callArgs.donateurType).toBe('Particulier');
    });

    it('calls putPostDonator with correct uuid parameter', async () => {
      formModule.FORM_CONFIG.donatorUuid = 'existing-donator-uuid';

      await handleSubmitStepTwo();

      expect(mockPutPostDonator).toHaveBeenCalledWith(expect.any(Object), 'existing-donator-uuid');

      formModule.FORM_CONFIG.donatorUuid = null;
    });

    it('sends GA events for donation and donator creation', async () => {
      await handleSubmitStepTwo();

      const gaCalls = mockSendGaEvent.mock.calls;
      expect(gaCalls.length).toBeGreaterThanOrEqual(3);
      expect(gaCalls.some((call) => call[0].category === 'donation')).toBe(true);
    });

    it('rejects on reCAPTCHA error', async () => {
      mockCreateReCaptchaToken.mockRejectedValueOnce(new Error('reCAPTCHA failed'));

      await expect(handleSubmitStepTwo()).rejects.toThrow('reCAPTCHA failed');
    });

    it('rejects on putPostDon error', async () => {
      mockPutPostDon.mockRejectedValueOnce(new Error('API error'));

      await expect(handleSubmitStepTwo()).rejects.toThrow('API error');
    });

    it('rejects on putPostDonator error', async () => {
      mockPutPostDonator.mockRejectedValueOnce(new Error('Donator API error'));

      await expect(handleSubmitStepTwo()).rejects.toThrow('Donator API error');
    });

    it('updates FORM_CONFIG.donUuid after creation', async () => {
      formModule.FORM_CONFIG.donUuid = null;

      mockPutPostDon.mockResolvedValueOnce({ uuid: 'new-don-uuid', montant: 100 });

      await handleSubmitStepTwo();

      expect(formModule.FORM_CONFIG.donUuid).toBe('new-don-uuid');

      formModule.FORM_CONFIG.donUuid = null;
    });

    it('updates FORM_CONFIG.donatorUuid after creation', async () => {
      formModule.FORM_CONFIG.donatorUuid = null;

      mockPutPostDonator.mockResolvedValueOnce({ uuid: 'new-donator-uuid' });

      await handleSubmitStepTwo();

      expect(formModule.FORM_CONFIG.donatorUuid).toBe('new-donator-uuid');

      formModule.FORM_CONFIG.donatorUuid = null;
    });

    it('calls createReCaptchaToken with CREATE_DONATION when donUuid is null', async () => {
      formModule.FORM_CONFIG.donUuid = null;

      await handleSubmitStepTwo();

      const calls = mockCreateReCaptchaToken.mock.calls;
      expect(calls.some((call) => call[0] === 'CREATE_DONATION')).toBe(true);

      formModule.FORM_CONFIG.donUuid = null;
    });

    it('calls createReCaptchaToken with UPDATE_DONATION when donUuid exists', async () => {
      formModule.FORM_CONFIG.donUuid = 'existing-don-uuid';

      await handleSubmitStepTwo();

      const calls = mockCreateReCaptchaToken.mock.calls;
      expect(calls.some((call) => call[0] === 'UPDATE_DONATION')).toBe(true);

      formModule.FORM_CONFIG.donUuid = null;
    });

    it('does not upload logo when withTaxReduction is false', async () => {
      formModule.DEFAULT_VALUES.withTaxReduction = false;

      await handleSubmitStepTwo();

      expect(mockUploadCompanyLogo).not.toHaveBeenCalled();

      formModule.DEFAULT_VALUES.withTaxReduction = true;
    });

    it('does not upload logo when estOrganisme is false', async () => {
      formModule.DEFAULT_VALUES.estOrganisme = false;
      formModule.DEFAULT_VALUES.withTaxReduction = true;

      await handleSubmitStepTwo();

      expect(mockUploadCompanyLogo).not.toHaveBeenCalled();
    });

    it('does not upload logo when logo is empty', async () => {
      formModule.DEFAULT_VALUES.withTaxReduction = true;
      formModule.DEFAULT_VALUES.estOrganisme = true;
      formModule.DEFAULT_VALUES.logo = '';

      await handleSubmitStepTwo();

      expect(mockUploadCompanyLogo).not.toHaveBeenCalled();

      formModule.DEFAULT_VALUES.logo = '';
    });
  });
});
