import type { Page, FrameLocator } from '@playwright/test';

/**
 * Stripe test card numbers for various scenarios
 * Source: https://stripe.com/docs/testing
 */
export const STRIPE_TEST_CARDS = {
  // Valid card - all tests pass
  valid: '4242424242424242',

  // Card declined - generic decline (always declined, regardless of CVC/date)
  declined: '4000000000000002',

  // Card requires 3D Secure authentication
  threeDSecure: '4000000000003220',

  // Card with insufficient funds
  insufficientFunds: '4000000000009995',

  // Card that requires CVV verification
  cvcCheckFails: '4000000000000127',

  // Card that passes all checks
  chargeableCard: '4000002500003155',

  // International card
  internationalCard: '4000004449433403',

  // Visa card (standard)
  visa: '4242424242424242',

  // Mastercard
  mastercard: '5555555555554444',

  // American Express
  amex: '378282246310005',

  // Discover
  discover: '6011111111111117',
};

/**
 * Get the Stripe Payment Element iframe FrameLocator
 * Stripe embeds the payment form in iframes with specific naming patterns
 */
export function getStripeFrame(page: Page): FrameLocator {
  // Stripe typically uses iframes with names starting with __privateStripeFrame
  // or titles containing "Secure payment"
  return page.frameLocator('iframe[name*="__privateStripeFrame"]');
}

/**
 * Get the card number input frame
 */
export function getCardNumberFrame(page: Page): FrameLocator {
  return page.frameLocator('iframe[title*="Card number"]');
}

/**
 * Get the expiry date input frame
 */
export function getExpiryFrame(page: Page): FrameLocator {
  return page.frameLocator('iframe[title*="Expiration date"]');
}

/**
 * Get the CVC input frame
 */
export function getCvcFrame(page: Page): FrameLocator {
  return page.frameLocator('iframe[title*="CVC"]');
}

/**
 * Fill Stripe card details in the Payment Element
 *
 * @param page The Playwright Page object
 * @param cardNumber Card number (defaults to valid test card)
 * @param expiry Expiry date in MM/YY format (defaults to 12/25)
 * @param cvc CVC code (defaults to 123)
 */
export async function fillStripeCard(
  page: Page,
  cardNumber: string = STRIPE_TEST_CARDS.valid,
  expiry: string = '12/25',
  cvc: string = '123'
): Promise<void> {
  // Fill card number
  const cardFrame = getCardNumberFrame(page);
  const cardInput = cardFrame.locator('input[name="cardnumber"], input[placeholder*="Card"]');

  await cardInput.fill(cardNumber);

  // Fill expiry
  const expiryFrame = getExpiryFrame(page);
  const expiryInput = expiryFrame.locator(
    'input[name="exp-date"], input[placeholder*="MM"], input[placeholder*="Expiration"]'
  );

  await expiryInput.fill(expiry);

  // Fill CVC
  const cvcFrame = getCvcFrame(page);
  const cvcInput = cvcFrame.locator('input[name="cvc"], input[placeholder*="CVC"]');

  await cvcInput.fill(cvc);
}

/**
 * Fill card number only (separate from expiry/CVC)
 */
export async function fillCardNumber(page: Page, cardNumber: string): Promise<void> {
  const cardFrame = getCardNumberFrame(page);
  const cardInput = cardFrame.locator('input[name="cardnumber"], input[placeholder*="Card"]');

  await cardInput.fill(cardNumber);
}

/**
 * Fill expiry date only
 */
export async function fillExpiry(page: Page, expiry: string): Promise<void> {
  const expiryFrame = getExpiryFrame(page);
  const expiryInput = expiryFrame.locator(
    'input[name="exp-date"], input[placeholder*="MM"], input[placeholder*="Expiration"]'
  );

  await expiryInput.fill(expiry);
}

/**
 * Fill CVC only
 */
export async function fillCvc(page: Page, cvc: string): Promise<void> {
  const cvcFrame = getCvcFrame(page);
  const cvcInput = cvcFrame.locator('input[name="cvc"], input[placeholder*="CVC"]');

  await cvcInput.fill(cvc);
}

/**
 * Wait for Stripe Payment Element to be ready
 */
export async function waitForStripeElement(page: Page, timeout: number = 10000): Promise<void> {
  // Wait for the main Stripe container to appear
  await page.locator('div[data-testid="payment-element"]').waitFor({
    state: 'visible',
    timeout,
  });

  // Also ensure at least the first iframe is loaded
  const cardFrame = getCardNumberFrame(page);
  await cardFrame.locator('input').first().waitFor({ state: 'attached', timeout });
}

/**
 * Wait for Stripe iframe to load
 */
export async function waitForStripeFrame(
  page: Page,
  timeout: number = 10000
): Promise<FrameLocator> {
  const frame = getStripeFrame(page);
  await frame.locator('input').first().waitFor({ state: 'attached', timeout });
  return frame;
}

/**
 * Check if a specific Stripe test card result matches expected
 * Useful for assertion: if you submit with declined card, you should expect failure
 */
export function getCardBehavior(cardNumber: string): {
  description: string;
  shouldSucceed: boolean;
} {
  switch (cardNumber) {
    case STRIPE_TEST_CARDS.valid:
    case STRIPE_TEST_CARDS.chargeableCard:
      return { description: 'Valid card - payment succeeds', shouldSucceed: true };

    case STRIPE_TEST_CARDS.declined:
    case STRIPE_TEST_CARDS.cvcCheckFails:
      return { description: 'Declined card - payment fails', shouldSucceed: false };

    case STRIPE_TEST_CARDS.threeDSecure:
      return { description: '3D Secure required', shouldSucceed: false };

    case STRIPE_TEST_CARDS.insufficientFunds:
      return { description: 'Insufficient funds', shouldSucceed: false };

    default:
      return { description: 'Unknown card', shouldSucceed: false };
  }
}

/**
 * Focus on Stripe card number field
 */
export async function focusCardNumber(page: Page): Promise<void> {
  const cardFrame = getCardNumberFrame(page);
  const cardInput = cardFrame.locator('input[name="cardnumber"], input[placeholder*="Card"]');

  await cardInput.focus();
}

/**
 * Check if Stripe error message is displayed
 */
export async function getStripeError(page: Page): Promise<string | null> {
  const errorElement = page.locator('[role="alert"]');

  try {
    await errorElement.waitFor({ state: 'visible', timeout: 2000 });
    return await errorElement.textContent();
  } catch {
    return null;
  }
}

/**
 * Clear all Stripe card fields
 */
export async function clearStripeCard(page: Page): Promise<void> {
  // Card number
  const cardFrame = getCardNumberFrame(page);
  const cardInput = cardFrame.locator('input[name="cardnumber"], input[placeholder*="Card"]');
  await cardInput.fill('');

  // Expiry
  const expiryFrame = getExpiryFrame(page);
  const expiryInput = expiryFrame.locator(
    'input[name="exp-date"], input[placeholder*="MM"], input[placeholder*="Expiration"]'
  );
  await expiryInput.fill('');

  // CVC
  const cvcFrame = getCvcFrame(page);
  const cvcInput = cvcFrame.locator('input[name="cvc"], input[placeholder*="CVC"]');
  await cvcInput.fill('');
}
