import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { fillStripeCard, STRIPE_TEST_CARDS } from '../helpers/stripe-helpers';

export class Step4Page extends BasePage {
  readonly paymentForm: Locator;
  readonly paymentLoading: Locator;
  readonly paymentError: Locator;
  readonly btnPay: Locator;
  readonly btnPayMobile: Locator;

  constructor(page: Page) {
    super(page);
    this.paymentForm = this.shadow('[data-testid="payment-form"]');
    this.paymentLoading = this.shadow('[data-testid="payment-loading"]');
    this.paymentError = this.shadow('[data-testid="payment-error"]');
    this.btnPay = this.shadow('[data-testid="btn-pay"]');
    this.btnPayMobile = this.shadow('[data-testid="btn-pay-mobile"]');
  }

  /** Wait for Stripe Payment Element to load */
  async waitForStripeLoaded() {
    await this.paymentForm.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Fill Stripe card and pay */
  async payWithCard(cardNumber = STRIPE_TEST_CARDS.valid) {
    await this.waitForStripeLoaded();
    await fillStripeCard(this.page, cardNumber);
    await this.btnPay.click();
  }

  /** Check if payment error is displayed */
  async hasPaymentError(): Promise<boolean> {
    return this.paymentError.isVisible().catch(() => false);
  }
}
