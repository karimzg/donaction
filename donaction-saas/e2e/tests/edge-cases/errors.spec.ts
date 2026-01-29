import { test, expect } from '@playwright/test';
import { Step1Page } from '../../pages/Step1Page';
import { Step2Page } from '../../pages/Step2Page';
import { Step3Page } from '../../pages/Step3Page';

test.describe('Edge Cases & Errors', () => {
  test('10.1 — Should handle API unavailable gracefully', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({ apiError: true });

    // Form should show error state
    const errorVisible = await step1.shadow('[data-testid="form-error"]').isVisible({ timeout: 10_000 }).catch(() => false);
    expect(errorVisible).toBeTruthy();
  });

  test('10.2 — Should handle invalid token', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({ invalidToken: true });

    const errorVisible = await step1.shadow('[data-testid="form-error"]').isVisible({ timeout: 10_000 }).catch(() => false);
    expect(errorVisible).toBeTruthy();
  });

  test('10.3 — Should preserve data on backward navigation', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate();
    await step1.waitForStep(0);
    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    const testEmail = 'preserved@test.com';
    const testFirstname = 'Preserved';

    await step2.inputEmail.fill(testEmail);
    await step2.inputFirstname.fill(testFirstname);

    // Go back to step 1
    await step2.clickPrevious();
    await step2.waitForStep(0);

    // Go forward to step 2 again
    await step1.clickNext();
    await step1.waitForStep(1);

    // Data should be preserved
    const emailValue = await step2.inputEmail.inputValue();
    const firstnameValue = await step2.inputFirstname.inputValue();

    expect(emailValue).toBe(testEmail);
    expect(firstnameValue).toBe(testFirstname);
  });

  test('10.4 — Should be responsive on mobile viewport', async ({ page }) => {
    const step1 = new Step1Page(page);
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14

    await step1.navigate();
    await step1.waitForStep(0);

    // Form should be visible and usable
    const step1Visible = await step1.shadow('[data-testid="step1"]').isVisible();
    expect(step1Visible).toBeTruthy();

    await step1.selectAmount(50);

    // Selected button should be highlighted
    const selectedVisible = await step1.shadow('.don-btn-amount--selected').isVisible();
    expect(selectedVisible).toBeTruthy();
  });

  test('10.5 — Should mock reCAPTCHA token correctly', async ({ page }) => {
    // reCAPTCHA is mocked in navigate(). Verify form loads (meaning mock works)
    const step1 = new Step1Page(page);
    await step1.navigate();
    await step1.waitForStep(0);

    const step1Visible = await step1.shadow('[data-testid="step1"]').isVisible();
    expect(step1Visible).toBeTruthy();
  });

  test('10.6 — Should handle club with no published projects', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({ projects: { data: [] } });
    await step1.waitForStep(0);

    // No project carousel should be visible
    const projectCarouselVisible = await step1.projectSelection.isVisible().catch(() => false);
    expect(projectCarouselVisible).toBeFalsy();

    // Amount selection should work
    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    expect(await step1.getCurrentStep()).toBe(1);
  });

  test('10.7 — Should recalculate step 3 when amount modified', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate();
    await step1.waitForStep(0);
    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    const amount1Text = await step3.getDonationAmount();
    const amount1 = parseFloat(amount1Text.replace(/[^\d.]/g, ''));

    // Go back to step 1 and change amount
    await step3.clickPrevious();
    await step3.waitForStep(1);
    await step2.clickPrevious();
    await step2.waitForStep(0);

    await step1.selectAmount(200);
    await step1.clickNext();
    await step1.waitForStep(1);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const amount2Text = await step3.getDonationAmount();
    const amount2 = parseFloat(amount2Text.replace(/[^\d.]/g, ''));

    // Amounts should differ
    expect(amount1).not.toBe(amount2);

    // New amount should reflect the change
    await expect(step3.recapAmount).toContainText('200');
  });
});
