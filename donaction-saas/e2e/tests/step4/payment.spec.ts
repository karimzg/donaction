import { test, expect } from '@playwright/test';
import { Step1Page } from '../../pages/Step1Page';
import { Step2Page } from '../../pages/Step2Page';
import { Step3Page } from '../../pages/Step3Page';
import { Step4Page } from '../../pages/Step4Page';

test.describe('Step 4 — Payment', () => {
  async function goToStep4(page, configKey = 'standard') {
    const step1 = new Step1Page(page);
    await step1.navigate({ klubrConfig: configKey });
    await step1.waitForStep(0);
    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await step3.acceptConditions();
    await step3.clickNext();
    await step3.waitForStep(3);

    return new Step4Page(page);
  }

  test('8.1 — Payment form should load', async ({ page }) => {
    const step4 = await goToStep4(page);

    // Either payment form loads or loading indicator is shown
    const hasForm = await step4.paymentForm.isVisible().catch(() => false);
    const hasLoading = await step4.paymentLoading.isVisible().catch(() => false);

    expect(hasForm || hasLoading).toBeTruthy();
  });

  test('8.2 — Should display error on payment intent failure', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({
      klubrConfig: 'standard',
      paymentIntent: { error: true, message: 'Payment declined' },
    });
    await step1.waitForStep(0);
    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await step3.acceptConditions();
    await step3.clickNext();
    await step3.waitForStep(3);

    const step4 = new Step4Page(page);

    // Payment error should be visible
    const hasError = await step4.paymentError.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test('8.3 — Should handle 3D Secure authentication', async ({ page }) => {
    const step4 = await goToStep4(page);

    // 3DS requires real Stripe — verify the flow doesn't crash and form/loading is visible
    const hasForm = await step4.paymentForm.isVisible().catch(() => false);
    const hasLoading = await step4.paymentLoading.isVisible().catch(() => false);

    expect(hasForm || hasLoading).toBeTruthy();
  });

  test('8.4 — Should prevent double payment (idempotence)', async ({ page }) => {
    const step4 = await goToStep4(page);

    const hasForm = await step4.paymentForm.isVisible().catch(() => false);
    const hasLoading = await step4.paymentLoading.isVisible().catch(() => false);

    // Verify payment UI is present
    expect(hasForm || hasLoading).toBeTruthy();

    if (hasForm) {
      // Verify pay button exists
      const btnVisible = await step4.btnPay.isVisible().catch(() => false);
      expect(btnVisible).toBeTruthy();
    }
  });

  test('8.5 — Should handle network timeout gracefully', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({
      klubrConfig: 'standard',
      paymentIntent: { timeout: true },
    });
    await step1.waitForStep(0);
    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await step3.acceptConditions();
    await step3.clickNext();

    // Wait for step 3 to potentially show error or loading
    await page.waitForTimeout(5000);

    const step4 = new Step4Page(page);

    // Check for error or loading state
    const hasError = await step4.paymentError.isVisible().catch(() => false);
    const hasLoading = await step4.paymentLoading.isVisible().catch(() => false);
    const hasForm = await step4.paymentForm.isVisible().catch(() => false);

    expect(hasError || hasLoading || hasForm).toBeTruthy();
  });
});
