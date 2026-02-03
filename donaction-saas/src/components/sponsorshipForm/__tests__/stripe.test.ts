import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStripe = { elements: vi.fn() };
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe)),
}));

describe('stripe utility', () => {
  beforeEach(() => {
    vi.resetModules();
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
  });

  describe('STRIPE_PUBLISHABLE_KEY', () => {
    it('exports the env variable value', async () => {
      const { STRIPE_PUBLISHABLE_KEY } = await import('../logic/stripe');
      expect(STRIPE_PUBLISHABLE_KEY).toBe('pk_test_123');
    });
  });

  describe('getStripe', () => {
    it('calls loadStripe with the publishable key', async () => {
      const { loadStripe } = await import('@stripe/stripe-js');
      const { getStripe } = await import('../logic/stripe');

      await getStripe();

      expect(loadStripe).toHaveBeenCalledWith('pk_test_123');
    });

    it('returns a promise resolving to Stripe instance', async () => {
      const { getStripe } = await import('../logic/stripe');

      const stripe = await getStripe();

      expect(stripe).toBe(mockStripe);
    });

    it('returns same promise on subsequent calls (singleton)', async () => {
      const { getStripe } = await import('../logic/stripe');

      const promise1 = getStripe();
      const promise2 = getStripe();

      expect(promise1).toBe(promise2);
    });

    it('calls loadStripe only once for multiple getStripe calls', async () => {
      const { loadStripe } = await import('@stripe/stripe-js');
      (loadStripe as ReturnType<typeof vi.fn>).mockClear();
      const { getStripe } = await import('../logic/stripe');

      await getStripe();
      await getStripe();
      await getStripe();

      expect(loadStripe).toHaveBeenCalledTimes(1);
    });
  });
});
