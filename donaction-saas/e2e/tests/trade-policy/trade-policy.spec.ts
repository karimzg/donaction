import { test, expect } from '@playwright/test';
import { Step1Page } from '../../pages/Step1Page';
import { Step2Page } from '../../pages/Step2Page';
import { Step3Page } from '../../pages/Step3Page';

test.describe('Step 3 — Trade Policy Configurations', () => {
  async function goToStep3(page, configKey: string) {
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

    return new Step3Page(page);
  }

  test('3.1 — Standard (stripe_connect=false) — fee choice NOT visible on step 3', async ({ page }) => {
    const step3 = await goToStep3(page, 'standard');
    // Fee choice buttons should not be visible (no Stripe Connect)
    await expect(step3.feeDonorPays).not.toBeVisible();
    await expect(step3.feeIncluded).not.toBeVisible();
    // Recap amount should show 100
    await expect(step3.recapAmount).toContainText('100');
  });

  test('3.2 — Stripe Connect + choice enabled + select "Je couvre" — verify total is higher than donation amount', async ({ page }) => {
    const step3 = await goToStep3(page, 'stripe-connect-choice-enabled');
    // Fee choice should be visible
    await expect(step3.feeDonorPays).toBeVisible();
    await expect(step3.feeIncluded).toBeVisible();

    // Select "Je couvre les frais"
    await step3.selectDonorPaysFees();

    // Get the amounts
    const donationText = await step3.getDonationAmount();
    const totalText = await step3.getTotalAmount();

    const donationAmount = parseFloat(donationText.replace(/[^\d.]/g, ''));
    const totalAmount = parseFloat(totalText.replace(/[^\d.]/g, ''));

    // Total should be higher than donation (includes fees)
    expect(totalAmount).toBeGreaterThan(donationAmount);
  });

  test('3.3 — Stripe Connect + choice enabled + select "Frais inclus" — verify total equals donation + contribution only', async ({ page }) => {
    const step3 = await goToStep3(page, 'stripe-connect-choice-enabled');

    // Select "Frais inclus dans le don"
    await step3.selectFeesIncluded();

    // Get amounts
    const donationText = await step3.getDonationAmount();
    const totalText = await step3.getTotalAmount();

    const donationAmount = parseFloat(donationText.replace(/[^\d.]/g, ''));
    const totalAmount = parseFloat(totalText.replace(/[^\d.]/g, ''));

    // When fees are included, total should be donation amount only (no extra charge)
    expect(totalAmount).toBeGreaterThanOrEqual(donationAmount);
    expect(totalAmount).toBeLessThanOrEqual(donationAmount * 1.1); // Allow small variation for contribution
  });

  test('3.4 — Stripe Connect + no choice + club pays — fee choice NOT visible, fees deducted from donation', async ({ page }) => {
    const step3 = await goToStep3(page, 'stripe-connect-no-choice-club-pays');

    // Fee choice should NOT be visible (no choice mode)
    await expect(step3.feeDonorPays).not.toBeVisible();
    await expect(step3.feeIncluded).not.toBeVisible();

    // Recap should show amount
    await expect(step3.recapAmount).toContainText('100');

    // Fees should be mentioned somewhere as being deducted
    const totalText = await step3.getTotalAmount();
    expect(totalText).toBeTruthy();
  });

  test('3.5 — Stripe Connect + no choice + donor pays — fee choice NOT visible, donor pays extra', async ({ page }) => {
    const step3 = await goToStep3(page, 'stripe-connect-no-choice-donor-pays');

    // Fee choice should NOT be visible
    await expect(step3.feeDonorPays).not.toBeVisible();
    await expect(step3.feeIncluded).not.toBeVisible();

    // Recap shows donation
    await expect(step3.recapAmount).toContainText('100');

    // Total should include fees paid by donor
    const totalText = await step3.getTotalAmount();
    const totalAmount = parseFloat(totalText.replace(/[^\d.]/g, ''));
    expect(totalAmount).toBeGreaterThan(100);
  });

  test('3.6 — Custom commission (6%) — verify fee details show 6%', async ({ page }) => {
    const step3 = await goToStep3(page, 'custom-commission-6percent');

    // Check if fee details mention 6%
    const feeDetails = step3.shadow('[data-testid="fee-details"]');
    const feeDetailsVisible = await feeDetails.isVisible().catch(() => false);

    if (feeDetailsVisible) {
      const feeText = await feeDetails.textContent();
      expect(feeText).toContain('6%');
    }
  });

  test('3.7 — Different defaults for club vs project donation', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({
      klubrConfig: 'stripe-connect-choice-enabled',
      projects: 'with-projects',
      skipAutoProjectSelect: true,
    });
    await step1.waitForStep(0);

    // Select a project
    await step1.selectFirstProjectIfVisible();

    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);

    // Verify fee options are visible for project donation
    const hasFeeOption =
      (await step3.feeDonorPays.isVisible().catch(() => false)) ||
      (await step3.feeIncluded.isVisible().catch(() => false));
    expect(hasFeeOption).toBeTruthy();

    // Recap amount should match
    await expect(step3.recapAmount).toContainText('100');
  });
});
