import { test, expect } from '@playwright/test';
import { Step1Page } from '../../pages/Step1Page';
import { Step2Page } from '../../pages/Step2Page';
import { Step3Page } from '../../pages/Step3Page';

test.describe('Step 3 — Fee Choice ("Comment maximiser votre impact")', () => {
  /** Navigate to step 3 with Stripe Connect + choice enabled */
  async function goToStep3WithFeeChoice(page, options?: { amount?: number; entreprise?: boolean }) {
    const step1 = new Step1Page(page);
    await step1.navigate({ klubrConfig: 'stripe-connect-choice-enabled' });
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

  // ─── Section visibility ──────────────────────────────────────────────

  test('8.1 — Fee choice section is visible with Stripe Connect + choice enabled', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page);
    await expect(step3.feeChoiceSection).toBeVisible();
  });

  test('8.2 — Fee choice section is NOT visible without Stripe Connect', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({ klubrConfig: 'standard' });
    await step1.waitForStep(0);
    await step1.selectAmount(100);
    await step1.clickNext();
    await step1.waitForStep(1);

    const step2 = new Step2Page(page);
    await step2.fillParticulier();
    await step2.clickNext();
    await step2.waitForStep(2);

    const step3 = new Step3Page(page);
    await expect(step3.feeChoiceSection).not.toBeVisible();
  });

  // ─── Badge "Recommandé" ──────────────────────────────────────────────

  test('8.3 — "Recommandé" badge is visible on "Je couvre les frais" card', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page);
    await expect(step3.feeBadgeRecommended).toBeVisible();
    await expect(step3.feeBadgeRecommended).toContainText('Recommandé');
  });

  test('8.4 — "Recommandé" badge is inside the donor-pays card, not the included card', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page);
    // Badge should be a child of the donor-pays card
    const badgeInDonorPays = step3.feeDonorPays.locator('[data-testid="fee-badge-recommended"]');
    await expect(badgeInDonorPays).toBeVisible();

    // Badge should NOT be in the included card
    const badgeInIncluded = step3.feeIncluded.locator('[data-testid="fee-badge-recommended"]');
    await expect(badgeInIncluded).not.toBeVisible();
  });

  // ─── Check mark on selected option ───────────────────────────────────

  test('8.5 — Check mark appears on selected option only', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page);

    // Select donor pays
    await step3.selectDonorPaysFees();
    const checkDonorPays = step3.feeDonorPays.locator('.don-option-card__check');
    const checkIncluded = step3.feeIncluded.locator('.don-option-card__check');
    await expect(checkDonorPays).toBeVisible();
    await expect(checkIncluded).not.toBeVisible();

    // Switch to fees included
    await step3.selectFeesIncluded();
    await expect(checkDonorPays).not.toBeVisible();
    await expect(checkIncluded).toBeVisible();
  });

  // ─── Card metric values ──────────────────────────────────────────────

  test('8.6 — "Je couvre les frais" card shows association receives 100% of donation', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectDonorPaysFees();

    const metrics = await step3.getCardMetrics(step3.feeDonorPays);
    // First metric: "Association reçoit 100,00 €"
    const associationMetric = metrics.find((m) => m.includes('Association reçoit'));
    expect(associationMetric).toBeDefined();
    expect(associationMetric).toContain('100');
  });

  test('8.7 — "Je couvre les frais" card shows "Vous payez" higher than donation', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectDonorPaysFees();

    const metrics = await step3.getCardMetrics(step3.feeDonorPays);
    const youPayMetric = metrics.find((m) => m.includes('Vous payez'));
    expect(youPayMetric).toBeDefined();

    // Extract amount — should be > 100 (includes fees)
    const amount = parseFloat(youPayMetric!.replace(/[^\d,.]/g, '').replace(',', '.'));
    expect(amount).toBeGreaterThan(100);
  });

  test('8.8 — "Frais inclus" card shows association receives less than donation', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectFeesIncluded();

    const metrics = await step3.getCardMetrics(step3.feeIncluded);
    const associationMetric = metrics.find((m) => m.includes('Association reçoit'));
    expect(associationMetric).toBeDefined();

    const amount = parseFloat(associationMetric!.replace(/[^\d,.]/g, '').replace(',', '.'));
    expect(amount).toBeLessThan(100);
  });

  test('8.9 — "Frais inclus" card shows "Vous payez" equals donation amount', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectFeesIncluded();

    const metrics = await step3.getCardMetrics(step3.feeIncluded);
    const youPayMetric = metrics.find((m) => m.includes('Vous payez'));
    expect(youPayMetric).toBeDefined();
    expect(youPayMetric).toContain('100');
  });

  test('8.10 — "Reçu fiscal" metric is visible in cards when tax reduction enabled', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });

    // Both cards should show "Reçu fiscal"
    const donorPaysMetrics = await step3.getCardMetrics(step3.feeDonorPays);
    const includedMetrics = await step3.getCardMetrics(step3.feeIncluded);

    expect(donorPaysMetrics.some((m) => m.includes('Reçu fiscal'))).toBe(true);
    expect(includedMetrics.some((m) => m.includes('Reçu fiscal'))).toBe(true);
  });

  test('8.11 — "Reçu fiscal" metric is NOT visible when tax reduction disabled', async ({ page }) => {
    const step1 = new Step1Page(page);
    await step1.navigate({ klubrConfig: 'stripe-connect-choice-enabled' });
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
    const donorPaysMetrics = await step3.getCardMetrics(step3.feeDonorPays);
    expect(donorPaysMetrics.some((m) => m.includes('Reçu fiscal'))).toBe(false);
  });

  // ─── Fee details toggle ──────────────────────────────────────────────

  test('8.12 — Fee details panel is hidden by default', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page);
    await expect(step3.feeDetailsPanel).not.toBeVisible();
    await expect(step3.feeDetailsToggle).toBeVisible();
    await expect(step3.feeDetailsToggle).toContainText('En savoir plus');
  });

  test('8.13 — Clicking toggle opens fee details panel', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page);
    await step3.toggleFeeDetails();
    await expect(step3.feeDetailsPanel).toBeVisible();
  });

  test('8.14 — Fee details panel shows commission percentage and transaction fees', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page);
    await step3.toggleFeeDetails();

    const panelText = await step3.feeDetailsPanel.textContent();
    expect(panelText).toContain('Commission plateforme');
    expect(panelText).toContain('4%');
    expect(panelText).toContain('Frais de transaction');
  });

  test('8.15 — Clicking toggle again closes fee details panel', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page);
    await step3.toggleFeeDetails();
    await expect(step3.feeDetailsPanel).toBeVisible();

    await step3.toggleFeeDetails();
    await expect(step3.feeDetailsPanel).not.toBeVisible();
  });

  // ─── Impact card ─────────────────────────────────────────────────────

  test('8.16 — Impact card shows "100% de votre don" badge when donor pays fees', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectDonorPaysFees();

    await expect(step3.impactCardBadge100).toBeVisible();
    await expect(step3.impactCardBadge100).toContainText('100%');
  });

  test('8.17 — Impact card hides "100%" badge when fees included', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectFeesIncluded();

    await expect(step3.impactCardBadge100).not.toBeVisible();
  });

  test('8.18 — Impact card value equals donation amount when donor pays fees', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectDonorPaysFees();

    const impactValue = await step3.getImpactCardValue();
    expect(impactValue).toContain('100');
  });

  test('8.19 — Impact card value is less than donation when fees included', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectFeesIncluded();

    const impactText = await step3.getImpactCardValue();
    const impactAmount = parseFloat(impactText.replace(/[^\d,.]/g, '').replace(',', '.'));
    expect(impactAmount).toBeLessThan(100);
  });

  // ─── Recap fees line ─────────────────────────────────────────────────

  test('8.20 — Fees line in recap visible when donor pays fees', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectDonorPaysFees();

    await expect(step3.recapFeesLine).toBeVisible();
    const feesText = await step3.recapFeesLine.textContent();
    expect(feesText).toContain('Frais de traitement');
  });

  test('8.21 — Fees line in recap hidden when fees included', async ({ page }) => {
    const step3 = await goToStep3WithFeeChoice(page, { amount: 100 });
    await step3.selectFeesIncluded();

    await expect(step3.recapFeesLine).not.toBeVisible();
  });
});
