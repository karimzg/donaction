import { describe, it, expect } from 'vitest';
import {
  calculateTaxReduction,
  calculateTaxSavings,
  calculateFeeAmount,
  formatCurrency,
} from '../logic/utils';

describe('utils suite tests', () => {
  describe('calculateTaxReduction', () => {
    it('should return "34" for 100€ individual donation (66% reduction)', () => {
      expect(calculateTaxReduction(100, false)).toBe('34');
    });

    it('should return "40" for 100€ organization donation (60% reduction)', () => {
      expect(calculateTaxReduction(100, true)).toBe('40');
    });

    it('should return "0" for NaN amount', () => {
      expect(calculateTaxReduction(NaN, false)).toBe('0');
      expect(calculateTaxReduction(NaN, true)).toBe('0');
    });

    it('should return "0" for negative amount', () => {
      expect(calculateTaxReduction(-10, false)).toBe('0');
      expect(calculateTaxReduction(-100, true)).toBe('0');
    });

    it('should return "0" for zero amount', () => {
      expect(calculateTaxReduction(0, false)).toBe('0');
      expect(calculateTaxReduction(0, true)).toBe('0');
    });

    it('should return "17" for 50€ individual donation', () => {
      expect(calculateTaxReduction(50, false)).toBe('17');
    });

    it('should handle decimal amounts correctly', () => {
      expect(calculateTaxReduction(33.33, false)).toBe('11.33');
    });

    it('should strip trailing .00 from result', () => {
      expect(calculateTaxReduction(100, false)).not.toContain('.00');
      expect(calculateTaxReduction(50, true)).not.toContain('.00');
    });

    it('should return "20" for 50€ organization donation', () => {
      expect(calculateTaxReduction(50, true)).toBe('20');
    });

    it('should handle large amounts', () => {
      expect(calculateTaxReduction(10000, false)).toBe('3400');
      expect(calculateTaxReduction(10000, true)).toBe('4000');
    });

    it('should handle fractional cents correctly', () => {
      const result = calculateTaxReduction(123.45, false);
      expect(result).toBe('41.97');
    });
  });

  describe('calculateTaxSavings', () => {
    it('should return "66" for 100€ individual donation', () => {
      expect(calculateTaxSavings(100, false)).toBe('66');
    });

    it('should return "60" for 100€ organization donation', () => {
      expect(calculateTaxSavings(100, true)).toBe('60');
    });

    it('should return "0" for NaN amount', () => {
      expect(calculateTaxSavings(NaN, false)).toBe('0');
      expect(calculateTaxSavings(NaN, true)).toBe('0');
    });

    it('should return "0" for zero amount', () => {
      expect(calculateTaxSavings(0, false)).toBe('0');
      expect(calculateTaxSavings(0, true)).toBe('0');
    });

    it('should return "0" for negative amount', () => {
      expect(calculateTaxSavings(-100, false)).toBe('0');
      expect(calculateTaxSavings(-50, true)).toBe('0');
    });

    it('should return "33" for 50€ individual donation', () => {
      expect(calculateTaxSavings(50, false)).toBe('33');
    });

    it('should return "30" for 50€ organization donation', () => {
      expect(calculateTaxSavings(50, true)).toBe('30');
    });

    it('should handle decimal amounts', () => {
      expect(calculateTaxSavings(33.33, false)).toBe('22');
    });

    it('should strip trailing .00 from result', () => {
      expect(calculateTaxSavings(100, false)).not.toContain('.00');
      expect(calculateTaxSavings(100, true)).not.toContain('.00');
    });

    it('should handle large amounts', () => {
      expect(calculateTaxSavings(10000, false)).toBe('6600');
      expect(calculateTaxSavings(10000, true)).toBe('6000');
    });

    it('should handle fractional cents correctly', () => {
      const result = calculateTaxSavings(123.45, false);
      expect(result).toBe('81.48');
    });
  });

  describe('calculateFeeAmount', () => {
    it('should return 4 for 100€ at 4% commission', () => {
      expect(calculateFeeAmount(100, 4)).toBe(4);
    });

    it('should return 0 for 100€ at 0% commission', () => {
      expect(calculateFeeAmount(100, 0)).toBe(0);
    });

    it('should return 0 for NaN amount', () => {
      expect(calculateFeeAmount(NaN, 4)).toBe(0);
    });

    it('should return 0 for zero amount', () => {
      expect(calculateFeeAmount(0, 4)).toBe(0);
    });

    it('should return 0 for negative amount', () => {
      expect(calculateFeeAmount(-100, 4)).toBe(0);
    });

    it('should return 1.33 for 33.33€ at 4% commission', () => {
      expect(calculateFeeAmount(33.33, 4)).toBe(1.33);
    });

    it('should return 400 for 10000€ at 4% commission', () => {
      expect(calculateFeeAmount(10000, 4)).toBe(400);
    });

    it('should handle various commission percentages', () => {
      expect(calculateFeeAmount(100, 2)).toBe(2);
      expect(calculateFeeAmount(100, 5)).toBe(5);
      expect(calculateFeeAmount(100, 10)).toBe(10);
    });

    it('should round correctly to 2 decimal places', () => {
      expect(calculateFeeAmount(50.5, 3)).toBe(1.52);
    });

    it('should handle decimal commission percentages', () => {
      expect(calculateFeeAmount(100, 2.5)).toBe(2.5);
    });

    it('should return rounded value for edge cases', () => {
      const result = calculateFeeAmount(123.45, 4);
      expect(typeof result).toBe('number');
      expect(result).toBeCloseTo(4.94, 2);
    });
  });

  describe('formatCurrency', () => {
    it('should return "100 €" for 100', () => {
      expect(formatCurrency(100)).toBe('100 €');
    });

    it('should return "99.50 €" for 99.50', () => {
      expect(formatCurrency(99.5)).toBe('99.50 €');
    });

    it('should return "0 €" for 0', () => {
      expect(formatCurrency(0)).toBe('0 €');
    });

    it('should return "0 €" for NaN', () => {
      expect(formatCurrency(NaN)).toBe('0 €');
    });

    it('should return "33.33 €" for 33.33', () => {
      expect(formatCurrency(33.33)).toBe('33.33 €');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-10)).toBe('-10 €');
    });

    it('should strip trailing .00 for whole numbers', () => {
      expect(formatCurrency(50)).toBe('50 €');
      expect(formatCurrency(1000)).toBe('1000 €');
    });

    it('should keep decimal places when not .00', () => {
      expect(formatCurrency(50.1)).toBe('50.10 €');
      expect(formatCurrency(50.99)).toBe('50.99 €');
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(10000.5)).toBe('10000.50 €');
    });

    it('should include space before euro symbol', () => {
      const result = formatCurrency(100);
      expect(result).toContain(' €');
      expect(result.endsWith(' €')).toBe(true);
    });

    it('should format fractional amounts to 2 decimal places', () => {
      expect(formatCurrency(12.3456)).toBe('12.35 €');
    });
  });
});
