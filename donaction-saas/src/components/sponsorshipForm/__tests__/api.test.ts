import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn(() => Promise.resolve({}));
vi.mock('../../../utils/fetch', () => ({
  Fetch: (...args: unknown[]) => mockFetch(...args),
}));

const mockFormConfig: Record<string, unknown> = {
  donUuid: 'don-uuid-1',
  donatorUuid: 'donator-uuid-1',
};

const mockSubscription: Record<string, unknown> = {
  klubr: { uuid: 'klubr-uuid-1', logo: null },
  project: { uuid: 'project-uuid-1' },
};

vi.mock('../logic/useSponsorshipForm.svelte', () => ({
  FORM_CONFIG: mockFormConfig,
  SUBSCRIPTION: mockSubscription,
  DEFAULT_VALUES: {},
  defVals: {},
  index: { subscribe: vi.fn(), set: vi.fn() },
  isBeingFilled: { set: vi.fn(), subscribe: vi.fn() },
  triggerValidation: { subscribe: vi.fn(), set: vi.fn() },
}));

describe('api', () => {
  let api: typeof import('../logic/api');

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset().mockResolvedValue({});
    mockFormConfig.donUuid = 'don-uuid-1';
    mockFormConfig.donatorUuid = 'donator-uuid-1';
    mockSubscription.klubr = { uuid: 'klubr-uuid-1', logo: null };
    mockSubscription.project = { uuid: 'project-uuid-1' };
    api = await import('../logic/api');
  });

  describe('createPaymentIntent', () => {
    it('calls Fetch with correct endpoint, method and data', async () => {
      await api.createPaymentIntent(5000, 'idem-key', true);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/klub-don-payments/create-payment-intent',
          method: 'POST',
          data: expect.objectContaining({
            price: 5000,
            idempotencyKey: 'idem-key',
            donorPaysFee: true,
            metadata: expect.objectContaining({
              donUuid: 'don-uuid-1',
              klubUuid: 'klubr-uuid-1',
              projectUuid: 'project-uuid-1',
              donorUuid: 'donator-uuid-1',
            }),
          }),
        }),
      );
    });

    it('handles optional parameters', async () => {
      await api.createPaymentIntent(1000);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            price: 1000,
            idempotencyKey: undefined,
            donorPaysFee: undefined,
          }),
        }),
      );
    });
  });

  describe('checkKlubDonPayment', () => {
    it('calls Fetch with GET and correct endpoint', async () => {
      await api.checkKlubDonPayment('cs_test_123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/klub-don-payments/check?clientSecret=cs_test_123&donUuid=don-uuid-1',
          method: 'GET',
        }),
      );
    });

    it('handles empty donUuid', async () => {
      mockFormConfig.donUuid = null;
      api = await import('../logic/api');
      await api.checkKlubDonPayment('cs_test_456');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: expect.stringContaining('donUuid='),
        }),
      );
    });
  });

  describe('putPostDon', () => {
    it('uses PUT when uuid is provided', async () => {
      await api.putPostDon({ montant: 100 }, 'existing-uuid');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/klub-dons/existing-uuid',
          method: 'PUT',
          data: { data: { montant: 100 } },
        }),
      );
    });

    it('uses POST when uuid is null', async () => {
      await api.putPostDon({ montant: 200 }, null);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/klub-dons/',
          method: 'POST',
          data: { data: { montant: 200 } },
        }),
      );
    });
  });

  describe('putPostDonator', () => {
    it('uses PUT when uuid is provided', async () => {
      await api.putPostDonator({ nom: 'Dupont' }, 'donator-uuid');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/klubr-donateurs/donator-uuid',
          method: 'PUT',
          data: { data: { nom: 'Dupont' } },
        }),
      );
    });

    it('uses POST when uuid is null', async () => {
      await api.putPostDonator({ nom: 'Martin' }, null);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/klubr-donateurs/',
          method: 'POST',
          data: { data: { nom: 'Martin' } },
        }),
      );
    });
  });

  describe('uploadCompanyLogo', () => {
    it('calls Fetch with POST, blob flag and FormData', async () => {
      const formData = new FormData();
      formData.set('logo', new Blob(['test']));

      await api.uploadCompanyLogo('donator-uuid-1', formData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/medias/klubr-donateur/donator-uuid-1/files',
          method: 'POST',
          data: formData,
          isBlob: true,
        }),
      );
    });
  });

  describe('getKlubrCGU', () => {
    it('calls Fetch with GET on /api/cgu', async () => {
      await api.getKlubrCGU();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/cgu',
          method: 'GET',
        }),
      );
    });
  });

  describe('getProjectsList', () => {
    it('calls Fetch with GET and correct klub uuid', async () => {
      await api.getProjectsList();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: expect.stringContaining('/api/klub-projets/byKlub/klubr-uuid-1'),
          method: 'GET',
        }),
      );
    });

    it('includes sort and pagination params', async () => {
      await api.getProjectsList();

      const call = mockFetch.mock.calls[0][0] as { endpoint: string };
      expect(call.endpoint).toContain('sort[0]=createdAt:desc');
      expect(call.endpoint).toContain('pagination[page]=1');
      expect(call.endpoint).toContain('pagination[pageSize]=20');
      expect(call.endpoint).toContain('filters[status][$eq]=published');
    });
  });

  describe('createKlubDonPayment', () => {
    it('calls Fetch with POST and wrapped data', async () => {
      const paymentData = { donUuid: 'don-1', clientSecret: 'cs_123' };

      await api.createKlubDonPayment(paymentData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/klub-don-payments',
          method: 'POST',
          data: { data: paymentData },
        }),
      );
    });
  });

  describe('createReCaptchaToken', () => {
    it('resolves with token when grecaptcha succeeds', async () => {
      const mockToken = 'recaptcha-token-xyz';
      (globalThis as any).grecaptcha = {
        enterprise: {
          ready: (cb: () => void) => cb(),
          execute: vi.fn(() => Promise.resolve(mockToken)),
        },
      };
      import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY = 'test-site-key';

      const token = await api.createReCaptchaToken('CREATE_DONATION');

      expect(token).toBe(mockToken);
      expect((globalThis as any).grecaptcha.enterprise.execute).toHaveBeenCalledWith(
        'test-site-key',
        { action: 'CREATE_DONATION' },
      );
    });

    it('rejects when grecaptcha throws', async () => {
      (globalThis as any).grecaptcha = {
        enterprise: {
          ready: () => {
            throw new Error('reCAPTCHA not available');
          },
        },
      };

      await expect(api.createReCaptchaToken('CREATE_DONATION')).rejects.toBe(null);
    });
  });
});
