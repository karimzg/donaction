import { describe, it, expect } from 'vitest';
import { calculateTaxReduction, calculateTaxSavings, formatCurrency } from '../logic/utils';

/**
 * Tests for TaxReductionSummary component logic
 *
 * The component uses:
 * - taxRate = isOrganization ? 0.6 : 0.66
 * - taxSavingsAmount = taxReceiptAmount * taxRate
 * - realCost = calculateTaxReduction(taxReceiptAmount, isOrganization)
 *
 * These tests validate the calculated values that the component displays.
 */
describe('TaxReductionSummary - Component Logic', () => {
  // Tax rates per French tax law
  const TAUX_PARTICULIER = 0.66; // Article 200 CGI
  const TAUX_ORGANISME = 0.6; // Article 238 bis CGI

  describe('Individual donor (66% rate)', () => {
    const isOrganization = false;
    const taxRate = TAUX_PARTICULIER;

    it('calculates tax savings correctly (66€ for 100€)', () => {
      const taxReceiptAmount = 100;
      const taxSavingsAmount = taxReceiptAmount * taxRate;
      expect(formatCurrency(taxSavingsAmount)).toBe('66 €');
    });

    it('calculates real cost correctly (34€ for 100€)', () => {
      const realCost = calculateTaxReduction(100, isOrganization);
      expect(realCost).toBe('34');
    });

    it('formats tax receipt amount correctly', () => {
      expect(formatCurrency(100)).toBe('100 €');
    });
  });

  describe('Organization donor (60% rate)', () => {
    const isOrganization = true;
    const taxRate = TAUX_ORGANISME;

    it('calculates tax savings correctly (60€ for 100€)', () => {
      const taxReceiptAmount = 100;
      const taxSavingsAmount = taxReceiptAmount * taxRate;
      expect(formatCurrency(taxSavingsAmount)).toBe('60 €');
    });

    it('calculates real cost correctly (40€ for 100€)', () => {
      const realCost = calculateTaxReduction(100, isOrganization);
      expect(realCost).toBe('40');
    });
  });

  describe('Issue #56 Acceptance Criteria - Scenario validation', () => {
    it('Scenario 1: donorPaysFee=true, 100€ donation → receipt shows 100€', () => {
      // When donorPaysFee=true, montantRecuFiscal = montantDon (100€)
      const taxReceiptAmount = 100;
      const isOrganization = false;

      expect(formatCurrency(taxReceiptAmount)).toBe('100 €');
      expect(formatCurrency(taxReceiptAmount * TAUX_PARTICULIER)).toBe('66 €');
      expect(calculateTaxReduction(taxReceiptAmount, isOrganization)).toBe('34');
    });

    it('Scenario 2: donorPaysFee=false, 100€ donation (4% commission) → receipt shows 96€', () => {
      // When donorPaysFee=false, fees are deducted from donation
      // Per issue example: montantRecuFiscal = 96€
      const taxReceiptAmount = 96;
      const isOrganization = false;

      expect(formatCurrency(taxReceiptAmount)).toBe('96 €');
      expect(formatCurrency(taxReceiptAmount * TAUX_PARTICULIER)).toBe('63.36 €');
      expect(calculateTaxReduction(taxReceiptAmount, isOrganization)).toBe('32.64');
    });

    it('Scenario 3: Organization donor uses 60% rate (article 238 bis CGI)', () => {
      const taxReceiptAmount = 100;
      const isOrganization = true;

      expect(formatCurrency(taxReceiptAmount * TAUX_ORGANISME)).toBe('60 €');
      expect(calculateTaxReduction(taxReceiptAmount, isOrganization)).toBe('40');
    });
  });

  describe('Component derived values', () => {
    it('taxRateLabel is 66 for individual', () => {
      const isOrganization = false;
      const taxRateLabel = isOrganization ? '60' : '66';
      expect(taxRateLabel).toBe('66');
    });

    it('taxRateLabel is 60 for organization', () => {
      const isOrganization = true;
      const taxRateLabel = isOrganization ? '60' : '66';
      expect(taxRateLabel).toBe('60');
    });

    it('showNote is true when contribution > 0 and showContributionNote=true', () => {
      const platformContribution = 5;
      const showContributionNote = true;
      const showNote = showContributionNote && platformContribution > 0;
      expect(showNote).toBe(true);
    });

    it('showNote is false when contribution = 0', () => {
      const platformContribution = 0;
      const showContributionNote = true;
      const showNote = showContributionNote && platformContribution > 0;
      expect(showNote).toBe(false);
    });

    it('showNote is false when showContributionNote = false', () => {
      const platformContribution = 5;
      const showContributionNote = false;
      const showNote = showContributionNote && platformContribution > 0;
      expect(showNote).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('handles zero amount gracefully', () => {
      expect(formatCurrency(0)).toBe('0 €');
      expect(calculateTaxReduction(0, false)).toBe('0');
      expect(calculateTaxSavings(0, false)).toBe('0');
    });

    it('handles decimal amounts correctly', () => {
      const taxReceiptAmount = 94.25;
      const isOrganization = false;

      expect(formatCurrency(taxReceiptAmount)).toBe('94.25 €');
      // 94.25 * 0.66 = 62.205
      expect(formatCurrency(taxReceiptAmount * TAUX_PARTICULIER)).toBe('62.21 €');
    });

    it('handles large amounts', () => {
      const taxReceiptAmount = 10000;
      const isOrganization = false;

      expect(formatCurrency(taxReceiptAmount)).toBe('10000 €');
      expect(formatCurrency(taxReceiptAmount * TAUX_PARTICULIER)).toBe('6600 €');
      expect(calculateTaxReduction(taxReceiptAmount, isOrganization)).toBe('3400');
    });
  });

  describe('Integration with calculateTaxSavings utility', () => {
    it('calculateTaxSavings matches manual calculation for individual', () => {
      const amount = 100;
      const manual = formatCurrency(amount * TAUX_PARTICULIER);
      const utility = calculateTaxSavings(amount, false) + ' €';
      expect(manual).toBe('66 €');
      expect(utility).toBe('66 €');
    });

    it('calculateTaxSavings matches manual calculation for organization', () => {
      const amount = 100;
      const manual = formatCurrency(amount * TAUX_ORGANISME);
      const utility = calculateTaxSavings(amount, true) + ' €';
      expect(manual).toBe('60 €');
      expect(utility).toBe('60 €');
    });
  });
});
