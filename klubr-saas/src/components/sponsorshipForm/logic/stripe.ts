export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise;
export const getStripe = (): Promise<Stripe> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
