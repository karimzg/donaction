import type { Page } from '@playwright/test';

/**
 * Mock Google reCAPTCHA Enterprise on the page
 * Injects a fake grecaptcha.enterprise object that returns mock tokens
 *
 * @param page The Playwright Page object
 */
export async function mockRecaptcha(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).grecaptcha = {
      enterprise: {
        /**
         * Mock implementation of grecaptcha.enterprise.ready()
         * Immediately calls the callback without waiting
         */
        ready: (cb: () => void) => {
          cb();
        },

        /**
         * Mock implementation of grecaptcha.enterprise.execute()
         * Returns a mock token string
         *
         * @param siteKey The reCAPTCHA site key (ignored in mock)
         * @param options Options object with action property
         * @returns Promise that resolves with a mock token
         */
        execute: async (siteKey: string, options?: { action?: string }) => {
          const action = options?.action || 'default';
          // Generate a consistent mock token based on action
          return `mock-recaptcha-token-${action}-${Date.now()}`;
        },
      },
    };
  });
}

/**
 * Mock reCAPTCHA with a specific custom token response
 * Useful for testing specific token validation scenarios
 *
 * @param page The Playwright Page object
 * @param customToken The custom token to return from grecaptcha.enterprise.execute()
 */
export async function mockRecaptchaWithToken(page: Page, customToken: string): Promise<void> {
  await page.addInitScript((token: string) => {
    (window as any).grecaptcha = {
      enterprise: {
        ready: (cb: () => void) => {
          cb();
        },
        execute: async () => token,
      },
    };
  }, customToken);
}

/**
 * Mock reCAPTCHA to fail (reject the promise)
 * Useful for testing error handling when reCAPTCHA fails
 *
 * @param page The Playwright Page object
 */
export async function mockRecaptchaFailure(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).grecaptcha = {
      enterprise: {
        ready: (cb: () => void) => {
          cb();
        },
        execute: async () => {
          throw new Error('reCAPTCHA execution failed');
        },
      },
    };
  });
}

/**
 * Verify that reCAPTCHA was called with correct parameters
 * This stores call history in window.__grecaptchaHistory
 *
 * @param page The Playwright Page object
 */
export async function mockRecaptchaWithHistory(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__grecaptchaHistory = [];

    (window as any).grecaptcha = {
      enterprise: {
        ready: (cb: () => void) => {
          cb();
        },
        execute: async (siteKey: string, options?: { action?: string }) => {
          const call = {
            siteKey,
            action: options?.action || 'default',
            timestamp: Date.now(),
          };
          (window as any).__grecaptchaHistory.push(call);
          return `mock-recaptcha-token-${options?.action || 'default'}`;
        },
      },
    };
  });
}

/**
 * Get reCAPTCHA call history from the page
 * Requires mockRecaptchaWithHistory to be called first
 *
 * @param page The Playwright Page object
 * @returns Array of reCAPTCHA execute calls
 */
export async function getRecaptchaHistory(
  page: Page
): Promise<Array<{ siteKey: string; action: string; timestamp: number }>> {
  const history = await page.evaluate(() => (window as any).__grecaptchaHistory || []);
  return history;
}

/**
 * Verify reCAPTCHA was called with a specific action
 *
 * @param page The Playwright Page object
 * @param action The action name to search for
 * @returns True if the action was found in call history
 */
export async function verifyRecaptchaAction(page: Page, action: string): Promise<boolean> {
  const history = await getRecaptchaHistory(page);
  return history.some((call) => call.action === action);
}

/**
 * Clear reCAPTCHA call history
 *
 * @param page The Playwright Page object
 */
export async function clearRecaptchaHistory(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).__grecaptchaHistory = [];
  });
}

/**
 * Get the last reCAPTCHA token that was generated
 * Useful for manual token capture in tests
 *
 * @param page The Playwright Page object
 * @returns The mock token string
 */
export async function getLastRecaptchaToken(page: Page): Promise<string> {
  const history = await getRecaptchaHistory(page);
  if (history.length === 0) {
    throw new Error('No reCAPTCHA tokens generated');
  }
  const lastCall = history[history.length - 1];
  return `mock-recaptcha-token-${lastCall.action}`;
}

/**
 * Wait for reCAPTCHA to be called a specific number of times
 *
 * @param page The Playwright Page object
 * @param count The number of calls to wait for
 * @param timeout Maximum time to wait in milliseconds
 */
export async function waitForRecaptchaCall(
  page: Page,
  count: number = 1,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const history = await getRecaptchaHistory(page);
    if (history.length >= count) {
      return;
    }
    await page.waitForTimeout(100);
  }

  throw new Error(`reCAPTCHA was not called ${count} times within ${timeout}ms`);
}
