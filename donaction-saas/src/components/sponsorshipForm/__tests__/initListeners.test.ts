import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDefaultValues: Record<string, unknown> = {
  withTaxReduction: true,
  estOrganisme: false,
};

const mockFormConfig: Record<string, unknown> = {
  dirty: false,
  myLasts: null,
  myLast: null,
};

vi.mock('../logic/useSponsorshipForm.svelte', () => ({
  DEFAULT_VALUES: mockDefaultValues,
  defVals: {},
  FORM_CONFIG: mockFormConfig,
  index: { subscribe: vi.fn(), set: vi.fn() },
  isBeingFilled: { set: vi.fn() },
  SUBSCRIPTION: { klubr: null, project: null },
}));

vi.mock('../../../utils/sendGaEvent', () => ({
  sendGaEvent: vi.fn(),
}));

const individualDonor = {
  donateurType: 'Particulier',
  civilite: 'Madame',
  nom: 'Dupont',
  prenom: 'Marie',
  adresse: '12',
  adresse2: 'Rue Victor Hugo',
  cp: '75001',
  ville: 'Paris',
  pays: 'France',
  tel: '0612345678',
  dateNaissance: '1990-05-15',
  place_id: 'place-123',
  optInAffMontant: true,
  optInAffNom: false,
};

const companyDonor = {
  donateurType: 'Organisme',
  civilite: 'Monsieur',
  nom: 'Martin',
  prenom: 'Paul',
  SIREN: '123456789',
  raisonSocial: 'Company SAS',
  formeJuridique: 'SAS',
  logo: { url: 'http://logo.png' },
  adresse: '5',
  adresse2: 'Avenue des Champs',
  cp: '75008',
  ville: 'Paris',
  pays: 'France',
  tel: '0698765432',
  place_id: 'place-456',
};

const noReductionDonor = {
  donateurType: null,
  nom: 'Sans',
  prenom: 'Reduction',
  civilite: 'Monsieur',
};

describe('initListeners', () => {
  beforeEach(() => {
    Object.keys(mockDefaultValues).forEach((key) => {
      if (key === 'withTaxReduction') {
        mockDefaultValues[key] = true;
      } else if (key === 'estOrganisme') {
        mockDefaultValues[key] = false;
      } else {
        delete mockDefaultValues[key];
      }
    });

    mockFormConfig.dirty = false;
    mockFormConfig.myLasts = null;
    mockFormConfig.myLast = null;
  });

  describe('EVENT_CONTEXT', () => {
    it('should equal KLUBR_SPONSORSHIP_FORM_', async () => {
      const { EVENT_CONTEXT } = await import('../logic/initListeners');
      expect(EVENT_CONTEXT).toBe('KLUBR_SPONSORSHIP_FORM_');
    });
  });

  describe('populateForm', () => {
    let populateForm: () => void;

    beforeEach(async () => {
      const module = await import('../logic/initListeners');
      populateForm = module.populateForm;
    });

    it('should do nothing when FORM_CONFIG.dirty is true', () => {
      mockFormConfig.dirty = true;
      mockFormConfig.myLasts = [individualDonor];

      populateForm();

      expect(mockFormConfig.myLast).toBeNull();
    });

    it('should do nothing when FORM_CONFIG.myLasts is null', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = null;

      populateForm();

      expect(mockFormConfig.myLast).toBeNull();
    });

    it('should do nothing when FORM_CONFIG.myLasts is not an array', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = { not: 'array' };

      populateForm();

      expect(mockFormConfig.myLast).toBeNull();
    });

    it('should populate from individual donor when withTaxReduction=true and estOrganisme=false', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [individualDonor];
      mockDefaultValues.withTaxReduction = true;
      mockDefaultValues.estOrganisme = false;

      populateForm();

      expect(mockFormConfig.myLast.firstName).toBe('Marie');
      expect(mockFormConfig.myLast.lastName).toBe('Dupont');
      expect(mockFormConfig.myLast.civility).toBe('Madame');
      expect(mockFormConfig.myLast.streetNumber).toBe('12');
      expect(mockFormConfig.myLast.streetName).toBe('Rue Victor Hugo');
      expect(mockFormConfig.myLast.postalCode).toBe('75001');
      expect(mockFormConfig.myLast.city).toBe('Paris');
      expect(mockFormConfig.myLast.country).toBe('France');
      expect(mockFormConfig.myLast.tel).toBe('0612345678');
      expect(mockFormConfig.myLast.birthdate).toBe('1990-05-15');
      expect(mockFormConfig.myLast.place_id).toBe('place-123');
      expect(mockFormConfig.myLast.displayAmount).toBe(true);
    });

    it('should populate from company donor when withTaxReduction=true and estOrganisme=true', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [individualDonor, companyDonor];
      mockDefaultValues.withTaxReduction = true;
      mockDefaultValues.estOrganisme = true;

      populateForm();

      expect(mockFormConfig.myLast.siren).toBe('123456789');
      expect(mockFormConfig.myLast.socialReason).toBe('Company SAS');
      expect(mockFormConfig.myLast.legalForm).toBe('SAS');
      expect(mockFormConfig.myLast.logo).toBe('http://logo.png');
      expect(mockFormConfig.myLast.streetNumber).toBe('5');
      expect(mockFormConfig.myLast.streetName).toBe('Avenue des Champs');
    });

    it('should populate from noReduction donor when withTaxReduction=false', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [individualDonor, noReductionDonor];
      mockDefaultValues.withTaxReduction = false;
      mockDefaultValues.estOrganisme = false;

      populateForm();

      expect(mockFormConfig.myLast.firstName).toBe('Reduction');
      expect(mockFormConfig.myLast.lastName).toBe('Sans');
    });

    it('should fall back to individual when withTaxReduction=false and no noReduction donor', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [individualDonor];
      mockDefaultValues.withTaxReduction = false;
      mockDefaultValues.estOrganisme = false;

      populateForm();

      expect(mockFormConfig.myLast.firstName).toBe('Marie');
      expect(mockFormConfig.myLast.lastName).toBe('Dupont');
    });

    it('should copy myLast fields into DEFAULT_VALUES', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [individualDonor];
      mockDefaultValues.withTaxReduction = true;
      mockDefaultValues.estOrganisme = false;

      populateForm();

      expect(mockDefaultValues.firstName).toBe('Marie');
      expect(mockDefaultValues.lastName).toBe('Dupont');
      expect(mockDefaultValues.civility).toBe('Madame');
      expect(mockDefaultValues.streetNumber).toBe('12');
      expect(mockDefaultValues.streetName).toBe('Rue Victor Hugo');
      expect(mockDefaultValues.postalCode).toBe('75001');
      expect(mockDefaultValues.city).toBe('Paris');
      expect(mockDefaultValues.country).toBe('France');
    });

    it('should set default values for missing fields', () => {
      const minimalDonor = {
        donateurType: 'Particulier',
      };
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [minimalDonor];
      mockDefaultValues.withTaxReduction = true;
      mockDefaultValues.estOrganisme = false;

      populateForm();

      expect(mockFormConfig.myLast.country).toBe('France');
      expect(mockFormConfig.myLast.civility).toBe('Monsieur');
      expect(mockFormConfig.myLast.firstName).toBe('');
      expect(mockFormConfig.myLast.lastName).toBe('');
      expect(mockFormConfig.myLast.siren).toBe('');
      expect(mockFormConfig.myLast.logo).toBe('');
      expect(mockFormConfig.myLast.place_id).toBeNull();
    });

    it('should set displayAmount and displayName to true as defaults', () => {
      const donorWithoutDisplayPrefs = {
        donateurType: 'Particulier',
        nom: 'Test',
      };
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [donorWithoutDisplayPrefs];
      mockDefaultValues.withTaxReduction = true;
      mockDefaultValues.estOrganisme = false;

      populateForm();

      expect(mockFormConfig.myLast.displayAmount).toBe(true);
      expect(mockFormConfig.myLast.displayName).toBe(true);
    });

    it('should handle logo missing from company donor', () => {
      const companyWithoutLogo = {
        donateurType: 'Organisme',
        SIREN: '987654321',
        raisonSocial: 'Company Inc',
      };
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [companyWithoutLogo];
      mockDefaultValues.withTaxReduction = true;
      mockDefaultValues.estOrganisme = true;

      populateForm();

      expect(mockFormConfig.myLast.logo).toBe('');
    });

    it('should prioritize noReduction donor over individual when both exist and withTaxReduction=false', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [individualDonor, noReductionDonor];
      mockDefaultValues.withTaxReduction = false;
      mockDefaultValues.estOrganisme = false;

      populateForm();

      expect(mockFormConfig.myLast.firstName).toBe('Reduction');
      expect(mockFormConfig.myLast.lastName).toBe('Sans');
    });

    it('should initialize FORM_CONFIG.myLast as empty object', () => {
      mockFormConfig.dirty = false;
      mockFormConfig.myLasts = [individualDonor];
      mockDefaultValues.withTaxReduction = true;
      mockDefaultValues.estOrganisme = false;

      populateForm();

      expect(mockFormConfig.myLast).toBeDefined();
      expect(typeof mockFormConfig.myLast).toBe('object');
    });
  });
});
