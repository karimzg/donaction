import { test, expect } from '@playwright/test';
import { Step1Page } from '../../pages/Step1Page';
import { Step2Page } from '../../pages/Step2Page';
import { Step3Page } from '../../pages/Step3Page';

test.describe('Step 3 — Contribution', () => {
  async function goToStep3(page) {
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
    return new Step3Page(page);
  }

  test('4.1 — Should display contribution enabled by default', async ({ page }) => {
    const step3 = await goToStep3(page);
    // Contribution row should be visible (default config has allowKlubrContribution=true)
    await expect(step3.shadow('.don-support-row')).toBeVisible();
    await expect(step3.btnModifyContribution).toBeVisible();
  });

  test('4.2 — Should not show contribution when disabled', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({ klubrConfig: 'no-contribution' });
    await step1.waitForStep(0);
    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await expect(step3.shadow('.don-support-row')).not.toBeVisible();
  });

  test('4.3 — Should allow modifying contribution (0-25€)', async ({ page }) => {
    const step3 = await goToStep3(page);
    await step3.btnModifyContribution.click();
    // Contribution modal should open
    await expect(step3.contributionModal).toBeVisible();
    // Value should be displayed
    await expect(step3.contributionValue).toBeVisible();
    // Range should be usable
    await expect(step3.contributionRange).toBeVisible();
  });
});
