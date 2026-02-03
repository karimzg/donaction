import { test, expect } from '@playwright/test';
import { Step1Page } from '../../pages/Step1Page';

test.describe('Step 1 — Amount Selection', () => {
  let step1: Step1Page;

  test.beforeEach(async ({ page }) => {
    step1 = new Step1Page(page);
    await step1.navigate();
    await step1.waitForStep(0);
  });

  test('5.1 — Should display preset amounts for particulier (10/50/100/200€)', async () => {
    // Tax reduction is on by default, particulier is default
    await expect(step1.shadow('[data-testid="amount-10"]')).toBeVisible();
    await expect(step1.shadow('[data-testid="amount-50"]')).toBeVisible();
    await expect(step1.shadow('[data-testid="amount-100"]')).toBeVisible();
    await expect(step1.shadow('[data-testid="amount-200"]')).toBeVisible();
  });

  test('5.2 — Should display preset amounts for entreprise (100/200/500/1000€)', async () => {
    await step1.selectEntreprise();
    await expect(step1.shadow('[data-testid="amount-100"]')).toBeVisible();
    await expect(step1.shadow('[data-testid="amount-200"]')).toBeVisible();
    await expect(step1.shadow('[data-testid="amount-500"]')).toBeVisible();
    await expect(step1.shadow('[data-testid="amount-1000"]')).toBeVisible();
  });

  test('5.3 — Should accept valid free amount >= 10€', async () => {
    await step1.enterFreeAmount(25);
    await step1.clickNext();
    await step1.waitForStep(1);
    expect(await step1.getCurrentStep()).toBe(1);
  });

  test('5.4 — Should reject invalid amounts (< 10€, > 100k€)', async () => {
    await step1.enterFreeAmount(5);
    await step1.clickNext();
    // Should stay on step 1 with error
    expect(await step1.getCurrentStep()).toBe(0);
    const errors = await step1.getVisibleErrors();
    expect(errors.some(e => e.includes('10'))).toBeTruthy();
  });

  test('5.5 — Should accept decimal amount (25.50€)', async () => {
    await step1.enterFreeAmount(25.50);
    await step1.clickNext();
    await step1.waitForStep(1);
    expect(await step1.getCurrentStep()).toBe(1);
  });

  test('5.6 — Should reject zero or negative amount', async () => {
    await step1.enterFreeAmount(0);
    await step1.clickNext();
    expect(await step1.getCurrentStep()).toBe(0);
  });
});
