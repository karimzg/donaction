import { test, expect } from '@playwright/test';
import { Step1Page } from '../../pages/Step1Page';
import { Step2Page } from '../../pages/Step2Page';
import { Step3Page } from '../../pages/Step3Page';

test.describe('Step 3 — Summary', () => {
  async function goToStep3(page, options?: { amount?: number; entreprise?: boolean }) {
    const step1 = new Step1Page(page);
    await step1.navigate();
    await step1.waitForStep(0);

    const amount = options?.amount ?? 100;
    await step1.selectAmount(amount);
    if (options?.entreprise) {
      await step1.selectEntreprise();
    }
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    if (options?.entreprise) {
      await step2.fillEntreprise();
    } else {
      await step2.fillParticulier();
    }
    await step2.clickNext();
    await step2.waitForStep(2);
    return new Step3Page(page);
  }

  test('7.1 — Should display summary without tax reduction', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate();
    await step1.waitForStep(0);
    await step1.selectAmount(100);
    await step1.disableTaxReduction();
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await expect(step3.recapAmount).toContainText('100');
    // Tax section should not be visible
    await expect(step3.shadow('.don-tax-section')).not.toBeVisible();
  });

  test('7.2 — Should display 66% reduction for particulier', async ({ page }) => {
    const step3 = await goToStep3(page, { amount: 100 });
    await expect(step3.recapAmount).toContainText('100');
    await expect(step3.shadow('.don-tax-section')).toBeVisible();
    await expect(step3.shadow('.don-tax-item__label')).toContainText('66%');
  });

  test('7.3 — Should display 60% reduction for entreprise', async ({ page }) => {
    const step3 = await goToStep3(page, { amount: 200, entreprise: true });
    await expect(step3.recapAmount).toContainText('200');
    await expect(step3.shadow('.don-tax-section')).toBeVisible();
    // The reduction label should mention 60%
    const taxLabels = step3.shadow('.don-tax-item__label');
    const count = await taxLabels.count();
    let found60 = false;
    for (let i = 0; i < count; i++) {
      const text = await taxLabels.nth(i).textContent();
      if (text?.includes('60')) found60 = true;
    }
    expect(found60).toBeTruthy();
  });

  test('7.4 — Should toggle fee options (donor pays vs included)', async ({ page }) => {
    // Need stripe connect config
    const step1 = new Step1Page(page);
    await step1.navigate({
      klubrConfig: 'stripe-connect-choice-enabled',
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
    // Fee choice should be visible
    await expect(step3.feeDonorPays).toBeVisible();
    await expect(step3.feeIncluded).toBeVisible();

    // Toggle between options
    await step3.selectDonorPaysFees();
    const total1 = await step3.getTotalAmount();

    await step3.selectFeesIncluded();
    const total2 = await step3.getTotalAmount();

    // Totals should differ (donor pays = higher total)
    expect(total1).not.toBe(total2);
  });

  test('7.5 — Should block progression when CGU not accepted', async ({ page }) => {
    const step3 = await goToStep3(page);
    // Don't accept CGU
    await step3.clickNext();
    // Should stay on step 3
    expect(await step3.getCurrentStep()).toBe(2);
  });

  test('7.6 — Should allow toggling display name/amount', async ({ page }) => {
    const step3 = await goToStep3(page);
    await expect(step3.checkboxDisplayName).toBeChecked();
    await expect(step3.checkboxDisplayAmount).toBeChecked();

    await step3.uncheckDisplayName();
    await expect(step3.checkboxDisplayName).not.toBeChecked();
    // Display amount should disappear when name is unchecked
    await expect(step3.checkboxDisplayAmount).not.toBeVisible();
  });
});
