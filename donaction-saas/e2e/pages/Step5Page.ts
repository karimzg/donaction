import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class Step5Page extends BasePage {
  readonly container: Locator;
  readonly thankYouText: Locator;
  readonly linkMyDonations: Locator;

  constructor(page: Page) {
    super(page);
    this.container = this.shadow('[data-testid="step5"]');
    this.thankYouText = this.shadow('[data-testid="thank-you-text"]');
    this.linkMyDonations = this.shadow('[data-testid="link-my-donations"]');
  }

  /** Verify the confirmation page is displayed */
  async verifyConfirmation() {
    await this.container.waitFor({ state: 'visible', timeout: 10_000 });
    await expect(this.thankYouText).toBeVisible();
  }

  /** Get "Mes dons" link href */
  async getMyDonationsHref(): Promise<string | null> {
    return this.linkMyDonations.getAttribute('href');
  }
}
