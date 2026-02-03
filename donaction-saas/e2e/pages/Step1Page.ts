import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class Step1Page extends BasePage {
  // Amount buttons
  readonly amountButtons: Locator;
  readonly freeAmountInput: Locator;

  // Tax reduction toggles
  readonly taxYes: Locator;
  readonly taxNo: Locator;

  // Donor type
  readonly donorParticulier: Locator;
  readonly donorEntreprise: Locator;

  // Tax info
  readonly taxReductionValue: Locator;
  readonly taxSavings: Locator;
  readonly taxDetail: Locator;

  // Project selection
  readonly projectSelection: Locator;
  readonly btnSelectProject: Locator;

  constructor(page: Page) {
    super(page);
    this.amountButtons = this.shadow('.don-btn-amount');
    this.freeAmountInput = this.shadow('[data-testid="amount-free"]');
    this.taxYes = this.shadow('[data-testid="tax-yes"]');
    this.taxNo = this.shadow('[data-testid="tax-no"]');
    this.donorParticulier = this.shadow('[data-testid="donor-type-particulier"]');
    this.donorEntreprise = this.shadow('[data-testid="donor-type-entreprise"]');
    this.taxReductionValue = this.shadow('[data-testid="tax-reduction-value"]');
    this.taxSavings = this.shadow('[data-testid="tax-savings"]');
    this.taxDetail = this.shadow('[data-testid="tax-detail"]');
    this.projectSelection = this.shadow('[data-testid="project-selection"]');
    this.btnSelectProject = this.shadow('[data-testid="btn-select-project"]');
  }

  /** Select a preset amount */
  async selectAmount(amount: number) {
    await this.shadow(`[data-testid="amount-${amount}"]`).click();
  }

  /** Enter a free amount */
  async enterFreeAmount(amount: number) {
    await this.freeAmountInput.fill(String(amount));
  }

  /** Enable tax reduction */
  async enableTaxReduction() {
    await this.taxYes.click();
  }

  /** Disable tax reduction */
  async disableTaxReduction() {
    await this.taxNo.click();
  }

  /** Select "Particulier" donor type */
  async selectParticulier() {
    await this.donorParticulier.click();
  }

  /** Select "Entreprise" donor type */
  async selectEntreprise() {
    await this.donorEntreprise.click();
  }

  /** Get the selected amount button */
  async getSelectedAmount(): Promise<string | null> {
    const selected = this.shadow('.don-btn-amount--selected');
    if (await selected.isVisible().catch(() => false)) {
      return selected.textContent();
    }
    return null;
  }

  /** Complete Step 1 with defaults: select amount, keep tax yes, particulier */
  async completeAsParticulier(amount = 100) {
    await this.selectAmount(amount);
    // Tax reduction is enabled by default (Oui)
    // Particulier is default
  }

  /** Complete Step 1 as entreprise */
  async completeAsEntreprise(amount = 200) {
    await this.selectAmount(amount);
    await this.selectEntreprise();
  }

  /** Complete Step 1 without tax reduction */
  async completeWithoutTaxReduction(amount = 100) {
    await this.selectAmount(amount);
    await this.disableTaxReduction();
  }

  /** Select first project in carousel (if visible) */
  async selectFirstProjectIfVisible() {
    const isVisible = await this.projectSelection.isVisible().catch(() => false);
    if (isVisible) {
      const firstSlide = this.shadow('swiper-slide').first();
      await firstSlide.click();
      await this.btnSelectProject.click();
      // Wait for carousel to dismiss
      await this.projectSelection
        .waitFor({ state: 'hidden', timeout: 5_000 })
        .catch(() => {});
    }
  }
}
