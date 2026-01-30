import { type Page, type Locator, expect } from '@playwright/test';
import { ApiMocker } from '../helpers/api-mocker';
import { mockRecaptcha } from '../helpers/recaptcha-mock';
import { mockGoogleMaps } from '../helpers/google-maps-mock';

/**
 * Playwright auto-pierces shadow DOM by default.
 * No need for >>> CSS piercing combinator — direct selectors work.
 */

export interface NavigateOptions extends Record<string, any> {
  /** Set to true to skip auto-selecting the first project when carousel is visible */
  skipAutoProjectSelect?: boolean;
}

export class BasePage {
  readonly page: Page;
  readonly apiMocker: ApiMocker;

  // Common locators
  readonly formComponent: Locator;
  readonly btnNext: Locator;
  readonly btnPrevious: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.apiMocker = new ApiMocker(page);
    this.formComponent = page.locator('klubr-sponsorship-form');
    this.btnNext = page.locator('[data-testid="btn-next"]');
    this.btnPrevious = page.locator('[data-testid="btn-previous"], [data-testid="btn-previous-mobile"]');
    this.loadingSpinner = page.locator('.don-spinner');
  }

  /** Navigate to the form page and set up all mocks */
  async navigate(options?: NavigateOptions) {
    await mockRecaptcha(this.page);
    await mockGoogleMaps(this.page);
    await this.apiMocker.setupAllMocks(options);
    await this.page.goto('/');

    // For error scenarios, the form may show an error state instead of loading normally
    if (options?.apiError || options?.invalidToken) {
      await this.formComponent.waitFor({ state: 'attached', timeout: 10_000 });
      return;
    }

    await this.formComponent.waitFor({ state: 'visible', timeout: 10_000 });

    // Auto-select first project if carousel is visible (unless opted out)
    if (!options?.skipAutoProjectSelect) {
      await this.autoSelectProjectIfVisible();
    }
  }

  /** Auto-select first project in carousel if visible */
  private async autoSelectProjectIfVisible() {
    const projectSelection = this.page.locator('[data-testid="project-selection"]');
    const isVisible = await projectSelection.isVisible().catch(() => false);
    if (isVisible) {
      const firstSlide = this.page.locator('swiper-slide').first();
      await firstSlide.click();
      const btnSelect = this.page.locator('[data-testid="btn-select-project"]');
      await btnSelect.click();
      // Wait for carousel to be replaced by amount section
      await this.page
        .locator('[data-testid="project-selection"]')
        .waitFor({ state: 'hidden', timeout: 5_000 })
        .catch(() => {});
    }
  }

  /** Click the "Étape suivante" button */
  async clickNext() {
    await this.btnNext.click();
  }

  /** Click the "Étape précédente" button (desktop or mobile variant) */
  async clickPrevious() {
    const desktop = this.page.locator('[data-testid="btn-previous"]');
    const mobile = this.page.locator('[data-testid="btn-previous-mobile"]');
    if (await desktop.isVisible().catch(() => false)) {
      await desktop.click();
    } else {
      await mobile.click();
    }
  }

  /** Get current step index by checking which step element is visible */
  async getCurrentStep(): Promise<number> {
    const steps = [
      '[data-testid="step1"]',
      '[data-testid="step2"]',
      '[data-testid="step3"]',
      '[data-testid="payment-form"], [data-testid="payment-loading"], [data-testid="payment-error"]',
      '[data-testid="step5"]',
    ];
    for (let i = 0; i < steps.length; i++) {
      if (await this.page.locator(steps[i]).isVisible().catch(() => false)) {
        return i;
      }
    }
    return -1;
  }

  /** Wait for a specific step to be visible */
  async waitForStep(stepIndex: number) {
    const selectors: Record<number, string> = {
      0: '[data-testid="step1"]',
      1: '[data-testid="step2"]',
      2: '[data-testid="step3"]',
      3: '[data-testid="payment-form"], [data-testid="payment-loading"], [data-testid="payment-error"]',
      4: '[data-testid="step5"]',
    };
    const sel = selectors[stepIndex];
    if (sel) {
      await this.page.locator(sel).first().waitFor({ state: 'visible', timeout: 10_000 });
    }
  }

  /** Locate element (Playwright auto-pierces shadow DOM) */
  shadow(selector: string): Locator {
    return this.page.locator(selector);
  }

  /** Get all visible error messages */
  async getVisibleErrors(): Promise<string[]> {
    const errors = this.shadow('.don-form-error');
    const texts: string[] = [];
    const count = await errors.count();
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text?.trim()) texts.push(text.trim());
    }
    return texts;
  }
}
