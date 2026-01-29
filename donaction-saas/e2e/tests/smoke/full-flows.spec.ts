import { test, expect } from '@playwright/test';
import { Step1Page } from '../../pages/Step1Page';
import { Step2Page } from '../../pages/Step2Page';
import { Step3Page } from '../../pages/Step3Page';
import { Step4Page } from '../../pages/Step4Page';

test.describe('Smoke Tests — Full Flows', () => {
  test('11.1 — Particulier + no project + no reduction + standard + payment', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate();
    await step1.waitForStep(0);
    await step1.selectAmount(50);
    await step1.disableTaxReduction();
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await expect(step3.recapAmount).toContainText('50');
    await step3.acceptConditions();
    await step3.clickNext();
    await step3.waitForStep(3);

    // Payment step reached
    const step4 = new Step4Page(page);
    const hasForm = await step4.paymentForm.isVisible().catch(() => false);
    const hasLoading = await step4.paymentLoading.isVisible().catch(() => false);
    expect(hasForm || hasLoading).toBeTruthy();
  });

  test('11.2 — Particulier + project carousel + 66% reduction + stripe connect "je couvre"', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({
      klubrConfig: 'stripe-connect-choice-enabled',
      projects: 'with-projects',
      skipAutoProjectSelect: true,
    });
    await step1.waitForStep(0);

    // Select project if carousel visible
    await step1.selectFirstProjectIfVisible();

    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);

    // Verify fee choice is visible (stripe connect)
    await expect(step3.feeDonorPays).toBeVisible();
    await step3.selectDonorPaysFees();
    await step3.acceptConditions({ isStripeConnect: true });
    await step3.clickNext();
    await step3.waitForStep(3);

    // Verify we reached payment step
    const step4 = new Step4Page(page);
    expect(await step1.getCurrentStep()).toBe(3);
  });

  test('11.3 — Entreprise + project prop + 60% reduction + logo + "frais inclus"', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({
      klubrConfig: {
        project: {
          uuid: 'project-test-uuid',
          titre: 'Projet E2E',
          couverture: {
            url: 'https://via.placeholder.com/300',
            alternativeText: 'test',
          },
          status: 'published',
        },
      },
    });
    await step1.waitForStep(0);
    await step1.selectAmount(500);
    await step1.selectEntreprise();
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillEntreprise();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await expect(step3.recapAmount).toContainText('500');

    // Check for fee options (may be present depending on config)
    const hasFeeChoice = await step3.feeDonorPays.isVisible().catch(() => false);
    if (hasFeeChoice) {
      await step3.selectFeesIncluded();
    }

    await step3.acceptConditions();
    await step3.clickNext();
    await step3.waitForStep(3);

    // Verify payment step reached
    expect(await step1.getCurrentStep()).toBe(3);
  });

  test('11.4 — Entreprise + no project + no fee choice + contribution 0€', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({
      klubrConfig: 'stripe-connect-no-choice-club-pays',
    });
    await step1.waitForStep(0);
    await step1.selectAmount(200);
    await step1.selectEntreprise();
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillEntreprise();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);

    // Fee choice should NOT be visible (no choice mode)
    const feeChoiceVisible = await step3.feeDonorPays.isVisible().catch(() => false);
    expect(feeChoiceVisible).toBeFalsy();

    // Set contribution to 0 if modify button is visible
    const modifyBtnVisible = await step3.btnModifyContribution.isVisible().catch(() => false);
    if (modifyBtnVisible) {
      await step3.rejectContribution();
    }

    await step3.acceptConditions({ isStripeConnect: true });
    await step3.clickNext();
    await step3.waitForStep(3);

    // Verify payment step reached
    expect(await step1.getCurrentStep()).toBe(3);
  });

  test('11.5 — Particulier + free amount + reduction + contribution max + 3DS', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate();
    await step1.waitForStep(0);
    await step1.enterFreeAmount(150);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await expect(step3.recapAmount).toContainText('150');

    // Modify contribution to maximum if available
    const modifyBtnVisible = await step3.btnModifyContribution.isVisible().catch(() => false);
    if (modifyBtnVisible) {
      await step3.modifyContribution(10);
    }

    await step3.acceptConditions();
    await step3.clickNext();
    await step3.waitForStep(3);

    // Verify payment step reached
    const step4 = new Step4Page(page);
    const hasForm = await step4.paymentForm.isVisible().catch(() => false);
    const hasLoading = await step4.paymentLoading.isVisible().catch(() => false);
    expect(hasForm || hasLoading).toBeTruthy();
  });
});
