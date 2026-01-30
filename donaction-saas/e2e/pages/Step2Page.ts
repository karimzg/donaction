import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { triggerPlaceSelection } from '../helpers/google-maps-mock';

export class Step2Page extends BasePage {
  readonly inputEmail: Locator;
  readonly inputFirstname: Locator;
  readonly inputLastname: Locator;
  readonly selectCivility: Locator;
  readonly inputBirthdate: Locator;
  readonly inputPhone: Locator;

  // Company fields
  readonly inputSocialReason: Locator;
  readonly inputSiren: Locator;
  readonly inputLegalForm: Locator;
  readonly inputLogoUpload: Locator;

  // Address (Google Places autocomplete)
  readonly addressInput: Locator;

  constructor(page: Page) {
    super(page);
    this.inputEmail = this.shadow('[data-testid="input-email"]');
    this.inputFirstname = this.shadow('[data-testid="input-firstname"]');
    this.inputLastname = this.shadow('[data-testid="input-lastname"]');
    this.selectCivility = this.shadow('[data-testid="select-civility"]');
    this.inputBirthdate = this.shadow('[data-testid="input-birthdate"]');
    this.inputPhone = this.shadow('#phoneNumber');
    this.inputSocialReason = this.shadow('[data-testid="input-social-reason"]');
    this.inputSiren = this.shadow('[data-testid="input-siren"]');
    this.inputLegalForm = this.shadow('[data-testid="input-legal-form"]');
    this.inputLogoUpload = this.shadow('[data-testid="input-logo-upload"]');
    this.addressInput = this.shadow('.address-field input[type="text"]');
  }

  /** Fill individual donor form */
  async fillParticulier(data?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    birthdate?: string;
    tel?: string;
    civility?: string;
  }) {
    const d = {
      email: 'test@e2e.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      birthdate: '15/05/1990',
      tel: '+33600000000',
      civility: 'Monsieur',
      ...data,
    };

    await this.inputEmail.fill(d.email);
    if (d.civility === 'Madame') {
      await this.selectCivility.selectOption('Madame');
    }
    await this.inputFirstname.fill(d.firstName);
    await this.inputLastname.fill(d.lastName);
    await this.fillBirthdate(d.birthdate);
    if (d.tel) {
      await this.inputPhone.fill(d.tel);
    }
    // Trigger Google Places address selection
    // Wait for Google Maps Autocomplete to be initialized
    await this.page.waitForFunction(
      () => typeof (window as any).__gmapsPlaceHandler === 'function',
      { timeout: 5_000 },
    );
    await this.addressInput.click();
    await triggerPlaceSelection(this.page);
    // Wait for autofill section to become active (isEditable = true)
    await this.shadow('.don-autofill-section--active').waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  }

  /** Fill company donor form */
  async fillEntreprise(data?: {
    email?: string;
    socialReason?: string;
    siren?: string;
    legalForm?: string;
    firstName?: string;
    lastName?: string;
    birthdate?: string;
  }) {
    const d = {
      email: 'contact@entreprise-test.com',
      socialReason: 'Entreprise Test SAS',
      siren: '123456789',
      legalForm: 'SAS',
      firstName: 'Marie',
      lastName: 'Martin',
      birthdate: '20/03/1985',
      ...data,
    };

    await this.inputEmail.fill(d.email);
    await this.inputSocialReason.fill(d.socialReason);
    await this.inputSiren.fill(d.siren);
    await this.inputLegalForm.fill(d.legalForm);
    // Address for company
    // Wait for Google Maps Autocomplete to be initialized
    await this.page.waitForFunction(
      () => typeof (window as any).__gmapsPlaceHandler === 'function',
      { timeout: 5_000 },
    );
    await this.addressInput.click();
    await triggerPlaceSelection(this.page);
    // Wait for autofill section to become active (isEditable = true)
    await this.shadow('.don-autofill-section--active').waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    // Personal info
    await this.inputFirstname.fill(d.firstName);
    await this.inputLastname.fill(d.lastName);
    await this.fillBirthdate(d.birthdate);
  }

  /** Fill birthdate using the DatePicker component */
  async fillBirthdate(date: string) {
    // Date format: "DD/MM/YYYY"
    const parts = date.split('/');
    if (parts.length !== 3) return;
    const [dd, mm, yyyy] = parts;

    // Desktop mode: 3 separate inputs
    const dayInput = this.shadow('.date-picker__field--day');
    const monthInput = this.shadow('.date-picker__field--month');
    const yearInput = this.shadow('.date-picker__field--year');

    if (await dayInput.isVisible().catch(() => false)) {
      await dayInput.fill(dd);
      await monthInput.fill(mm);
      await yearInput.fill(yyyy);
      // Trigger blur to validate
      await yearInput.blur();
      return;
    }

    // Mobile mode: native date input (YYYY-MM-DD format)
    const nativeInput = this.inputBirthdate;
    if (await nativeInput.isVisible().catch(() => false)) {
      await nativeInput.fill(`${yyyy}-${mm}-${dd}`);
    }
  }

  /** Upload a logo file */
  async uploadLogo(filePath: string) {
    await this.inputLogoUpload.setInputFiles(filePath);
  }
}
