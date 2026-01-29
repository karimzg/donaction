import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class Step3Page extends BasePage {
  readonly recapAmount: Locator;
  readonly recapAssociation: Locator;
  readonly recapTotal: Locator;
  readonly feeDonorPays: Locator;
  readonly feeIncluded: Locator;
  readonly btnModifyContribution: Locator;
  readonly checkboxCgu: Locator;
  readonly checkboxDisplayName: Locator;
  readonly checkboxDisplayAmount: Locator;
  readonly checkboxAcceptCondition1: Locator;
  readonly contributionModal: Locator;
  readonly contributionRange: Locator;
  readonly contributionValue: Locator;
  readonly btnRejectContribution: Locator;
  readonly btnValidateContribution: Locator;

  constructor(page: Page) {
    super(page);
    this.recapAmount = this.shadow('[data-testid="recap-amount"]');
    this.recapAssociation = this.shadow('[data-testid="recap-association"]');
    this.recapTotal = this.shadow('[data-testid="recap-total"]');
    this.feeDonorPays = this.shadow('[data-testid="fee-donor-pays"]');
    this.feeIncluded = this.shadow('[data-testid="fee-included"]');
    this.btnModifyContribution = this.shadow('[data-testid="btn-modify-contribution"]');
    this.checkboxCgu = this.shadow('[data-testid="checkbox-cgu"]');
    this.checkboxDisplayName = this.shadow('[data-testid="checkbox-display-name"]');
    this.checkboxDisplayAmount = this.shadow('[data-testid="checkbox-display-amount"]');
    this.checkboxAcceptCondition1 = this.shadow('[data-testid="checkbox-accept-condition1"]');
    this.contributionModal = this.shadow('[data-testid="contribution-modal"]');
    this.contributionRange = this.shadow('[data-testid="contribution-range"]');
    this.contributionValue = this.shadow('[data-testid="contribution-value"]');
    this.btnRejectContribution = this.shadow('[data-testid="btn-reject-contribution"]');
    this.btnValidateContribution = this.shadow('[data-testid="btn-validate-contribution"]');
  }

  /** Accept CGU + conditions to proceed */
  async acceptConditions(options?: { isStripeConnect?: boolean }) {
    // acceptCondition1 only visible when NOT stripe connect
    if (!options?.isStripeConnect) {
      const cond1 = this.checkboxAcceptCondition1;
      if (await cond1.isVisible().catch(() => false)) {
        await cond1.check();
      }
    }
    await this.checkboxCgu.check();
  }

  /** Select "Je couvre les frais" */
  async selectDonorPaysFees() {
    await this.feeDonorPays.click();
  }

  /** Select "Frais inclus dans le don" */
  async selectFeesIncluded() {
    await this.feeIncluded.click();
  }

  /** Open contribution modal and set value */
  async modifyContribution(value: number) {
    await this.btnModifyContribution.click();
    await this.contributionModal.waitFor({ state: 'visible' });
    // Fill range input
    await this.contributionRange.fill(String(value));
    await this.btnValidateContribution.click();
  }

  /** Reject contribution (set to 0) */
  async rejectContribution() {
    await this.btnModifyContribution.click();
    await this.contributionModal.waitFor({ state: 'visible' });
    await this.btnRejectContribution.click();
    await this.btnValidateContribution.click();
  }

  /** Get displayed total amount text */
  async getTotalAmount(): Promise<string> {
    return (await this.recapTotal.textContent()) ?? '';
  }

  /** Get displayed donation amount text */
  async getDonationAmount(): Promise<string> {
    return (await this.recapAmount.textContent()) ?? '';
  }

  /** Uncheck display name */
  async uncheckDisplayName() {
    await this.checkboxDisplayName.uncheck();
  }

  /** Uncheck display amount */
  async uncheckDisplayAmount() {
    await this.checkboxDisplayAmount.uncheck();
  }
}
