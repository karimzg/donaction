import { describe, it, expect } from 'vitest';
import { STRIPE_FEES, calculateFees, FeeCalculationInput } from '../logic/fee-calculation-helper';

describe('fee-calculation-helper test suite', () => {
  describe('STRIPE_FEES constants', () => {
    it('should have PERCENTAGE of 0.015 (1.5%)', () => {
      expect(STRIPE_FEES.PERCENTAGE).toBe(0.015);
    });

    it('should have FIXED fee of 0.25 euros', () => {
      expect(STRIPE_FEES.FIXED).toBe(0.25);
    });
  });

  describe('calculateFees - invalid inputs', () => {
    it('should return zeros when montantDon is NaN', () => {
      const input: FeeCalculationInput = {
        montantDon: NaN,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.totalDonateur).toBe(0);
      expect(result.netAssociation).toBe(0);
      expect(result.applicationFee).toBe(0);
      expect(result.commissionDonaction).toBe(0);
      expect(result.fraisStripeEstimes).toBe(0);
      expect(result.montantRecuFiscal).toBe(0);
    });

    it('should return zeros when montantDon is 0', () => {
      const input: FeeCalculationInput = {
        montantDon: 0,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.totalDonateur).toBe(0);
      expect(result.netAssociation).toBe(0);
      expect(result.applicationFee).toBe(0);
      expect(result.commissionDonaction).toBe(0);
      expect(result.fraisStripeEstimes).toBe(0);
      expect(result.montantRecuFiscal).toBe(0);
    });

    it('should return zeros when montantDon is negative', () => {
      const input: FeeCalculationInput = {
        montantDon: -100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.totalDonateur).toBe(0);
      expect(result.netAssociation).toBe(0);
      expect(result.applicationFee).toBe(0);
      expect(result.commissionDonaction).toBe(0);
      expect(result.fraisStripeEstimes).toBe(0);
      expect(result.montantRecuFiscal).toBe(0);
    });

    it('should return contribution as totalDonateur when montantDon is invalid and contribution exists', () => {
      const input: FeeCalculationInput = {
        montantDon: NaN,
        contribution: 5,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.totalDonateur).toBe(5);
      expect(result.netAssociation).toBe(0);
    });

    it('should return 0 as totalDonateur when montantDon is invalid and no contribution', () => {
      const input: FeeCalculationInput = {
        montantDon: NaN,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.totalDonateur).toBe(0);
    });
  });

  describe('calculateFees - Scenario A (donorPaysFee=true)', () => {
    it('should calculate Scenario A correctly with 100€ donation, 4% commission, 2€ contribution', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 2,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedCommission = 4;
      const expectedStripeFees = 100 * 0.015 + 0.25; // 1.75
      const expectedApplicationFee = expectedCommission + expectedStripeFees; // 5.75
      const expectedTotal = 100 + expectedCommission + 2 + expectedStripeFees; // 107.75

      expect(result.commissionDonaction).toBe(expectedCommission);
      expect(result.fraisStripeEstimes).toBe(expectedStripeFees);
      expect(result.applicationFee).toBe(expectedApplicationFee);
      expect(result.totalDonateur).toBe(expectedTotal);
      expect(result.netAssociation).toBe(100);
      expect(result.montantRecuFiscal).toBe(100);
    });

    it('should result in association receiving 100% of donation amount', () => {
      const input: FeeCalculationInput = {
        montantDon: 250,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.netAssociation).toBe(input.montantDon);
    });

    it('should result in montantRecuFiscal equal to donation amount', () => {
      const input: FeeCalculationInput = {
        montantDon: 500,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.montantRecuFiscal).toBe(input.montantDon);
    });

    it('should include contribution in totalDonateur but not in netAssociation', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 5,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedStripeFees = 1.75;
      const expectedTotal = 100 + 4 + 5 + expectedStripeFees;
      expect(result.totalDonateur).toBe(expectedTotal);
      expect(result.netAssociation).toBe(100);
    });

    it('should calculate with zero contribution', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedStripeFees = 1.75;
      const expectedTotal = 100 + 4 + expectedStripeFees; // 105.75

      expect(result.totalDonateur).toBe(expectedTotal);
      expect(result.netAssociation).toBe(100);
    });
  });

  describe('calculateFees - Scenario B (donorPaysFee=false)', () => {
    it('should calculate Scenario B correctly with 100€ donation, 4% commission, 2€ contribution', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 2,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedCommission = 4;
      const expectedStripeFees = 1.75;
      const expectedApplicationFee = expectedCommission + expectedStripeFees; // 5.75
      const expectedNetAssociation = 100 - expectedApplicationFee; // 94.25
      const expectedTotal = 100 + 2; // 102

      expect(result.commissionDonaction).toBe(expectedCommission);
      expect(result.fraisStripeEstimes).toBe(expectedStripeFees);
      expect(result.applicationFee).toBe(expectedApplicationFee);
      expect(result.totalDonateur).toBe(expectedTotal);
      expect(result.netAssociation).toBe(expectedNetAssociation);
      expect(result.montantRecuFiscal).toBe(expectedNetAssociation);
    });

    it('should result in montantRecuFiscal equal to netAssociation', () => {
      const input: FeeCalculationInput = {
        montantDon: 300,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.montantRecuFiscal).toBe(result.netAssociation);
    });

    it('should deduct fees from donation', () => {
      const input: FeeCalculationInput = {
        montantDon: 200,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.netAssociation).toBeLessThan(input.montantDon);
      expect(result.netAssociation).toBe(input.montantDon - result.applicationFee);
    });

    it('should not include fees in totalDonateur', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.totalDonateur).toBe(100);
    });

    it('should calculate with zero contribution', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedStripeFees = 1.75;
      const expectedApplicationFee = 4 + expectedStripeFees; // 5.75
      const expectedNetAssociation = 100 - expectedApplicationFee; // 94.25

      expect(result.totalDonateur).toBe(100);
      expect(result.netAssociation).toBe(expectedNetAssociation);
      expect(result.montantRecuFiscal).toBe(expectedNetAssociation);
    });
  });

  describe('calculateFees - small donation (10€)', () => {
    it('should calculate Scenario A with 10€ donation', () => {
      const input: FeeCalculationInput = {
        montantDon: 10,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedCommission = 0.4;
      const expectedStripeFees = 10 * 0.015 + 0.25; // 0.40
      const expectedApplicationFee = expectedCommission + expectedStripeFees;

      expect(result.commissionDonaction).toBe(expectedCommission);
      expect(result.netAssociation).toBe(10);
      expect(result.applicationFee).toBe(expectedApplicationFee);
    });

    it('should calculate Scenario B with 10€ donation', () => {
      const input: FeeCalculationInput = {
        montantDon: 10,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedStripeFees = 0.4;
      const expectedApplicationFee = 0.4 + expectedStripeFees; // 0.80
      const expectedNetAssociation = 10 - expectedApplicationFee; // 9.20

      expect(result.totalDonateur).toBe(10);
      expect(result.netAssociation).toBe(expectedNetAssociation);
    });
  });

  describe('calculateFees - large donation (10000€)', () => {
    it('should calculate Scenario A with 10000€ donation', () => {
      const input: FeeCalculationInput = {
        montantDon: 10000,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedCommission = 400;
      const expectedStripeFees = 10000 * 0.015 + 0.25; // 150.25
      const expectedApplicationFee = expectedCommission + expectedStripeFees;
      const expectedTotal = 10000 + expectedCommission + expectedStripeFees;

      expect(result.commissionDonaction).toBe(expectedCommission);
      expect(result.fraisStripeEstimes).toBe(expectedStripeFees);
      expect(result.applicationFee).toBe(expectedApplicationFee);
      expect(result.totalDonateur).toBe(expectedTotal);
      expect(result.netAssociation).toBe(10000);
    });

    it('should calculate Scenario B with 10000€ donation', () => {
      const input: FeeCalculationInput = {
        montantDon: 10000,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expectedStripeFees = 150.25;
      const expectedApplicationFee = 400 + expectedStripeFees; // 550.25
      const expectedNetAssociation = 10000 - expectedApplicationFee; // 9449.75

      expect(result.totalDonateur).toBe(10000);
      expect(result.netAssociation).toBe(expectedNetAssociation);
      expect(result.montantRecuFiscal).toBe(expectedNetAssociation);
    });
  });

  describe('calculateFees - rounding precision', () => {
    it('should round correctly with 33.33€ donation in Scenario A', () => {
      const input: FeeCalculationInput = {
        montantDon: 33.33,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.totalDonateur).toBe(Math.round(result.totalDonateur * 100) / 100);
      expect(result.netAssociation).toBe(Math.round(result.netAssociation * 100) / 100);
      expect(result.applicationFee).toBe(Math.round(result.applicationFee * 100) / 100);
      expect(result.fraisStripeEstimes).toBe(Math.round(result.fraisStripeEstimes * 100) / 100);
    });

    it('should round correctly with 33.33€ donation in Scenario B', () => {
      const input: FeeCalculationInput = {
        montantDon: 33.33,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.totalDonateur).toBe(Math.round(result.totalDonateur * 100) / 100);
      expect(result.netAssociation).toBe(Math.round(result.netAssociation * 100) / 100);
      expect(result.applicationFee).toBe(Math.round(result.applicationFee * 100) / 100);
    });

    it('should handle 99.99€ with proper rounding', () => {
      const input: FeeCalculationInput = {
        montantDon: 99.99,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const allValues = [
        result.totalDonateur,
        result.netAssociation,
        result.applicationFee,
        result.fraisStripeEstimes,
        result.commissionDonaction,
        result.montantRecuFiscal,
      ];

      allValues.forEach((value) => {
        const rounded = Math.round(value * 100) / 100;
        expect(value).toBe(rounded);
      });
    });

    it('should maintain two decimal places for all amounts', () => {
      const input: FeeCalculationInput = {
        montantDon: 77.77,
        contribution: 3.33,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const checkDecimals = (value: number) => {
        const decimals = String(value).split('.')[1]?.length || 0;
        return decimals <= 2;
      };

      Object.values(result).forEach((value) => {
        expect(checkDecimals(value)).toBe(true);
      });
    });
  });

  describe('calculateFees - edge cases and comparisons', () => {
    it('should have different totalDonateur between Scenario A and B', () => {
      const baseInput: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };

      const resultA = calculateFees(baseInput);

      const inputB: FeeCalculationInput = {
        ...baseInput,
        donorPaysFee: false,
      };

      const resultB = calculateFees(inputB);

      expect(resultA.totalDonateur).toBeGreaterThan(resultB.totalDonateur);
    });

    it('should have different netAssociation between Scenario A and B', () => {
      const baseInput: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };

      const resultA = calculateFees(baseInput);

      const inputB: FeeCalculationInput = {
        ...baseInput,
        donorPaysFee: false,
      };

      const resultB = calculateFees(inputB);

      expect(resultA.netAssociation).toBeGreaterThan(resultB.netAssociation);
    });

    it('should have same applicationFee in both scenarios', () => {
      const baseInput: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };

      const resultA = calculateFees(baseInput);

      const inputB: FeeCalculationInput = {
        ...baseInput,
        donorPaysFee: false,
      };

      const resultB = calculateFees(inputB);

      expect(resultA.applicationFee).toBe(resultB.applicationFee);
    });

    it('should have same commissionDonaction in both scenarios', () => {
      const baseInput: FeeCalculationInput = {
        montantDon: 250,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };

      const resultA = calculateFees(baseInput);

      const inputB: FeeCalculationInput = {
        ...baseInput,
        donorPaysFee: false,
      };

      const resultB = calculateFees(inputB);

      expect(resultA.commissionDonaction).toBe(resultB.commissionDonaction);
    });

    it('should have same fraisStripeEstimes in both scenarios', () => {
      const baseInput: FeeCalculationInput = {
        montantDon: 500,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };

      const resultA = calculateFees(baseInput);

      const inputB: FeeCalculationInput = {
        ...baseInput,
        donorPaysFee: false,
      };

      const resultB = calculateFees(inputB);

      expect(resultA.fraisStripeEstimes).toBe(resultB.fraisStripeEstimes);
    });
  });

  describe('calculateFees - output structure', () => {
    it('should return all required fields in output', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 2,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result).toHaveProperty('totalDonateur');
      expect(result).toHaveProperty('netAssociation');
      expect(result).toHaveProperty('applicationFee');
      expect(result).toHaveProperty('commissionDonaction');
      expect(result).toHaveProperty('fraisStripeEstimes');
      expect(result).toHaveProperty('montantRecuFiscal');
    });

    it('should have all output values as numbers', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(typeof result.totalDonateur).toBe('number');
      expect(typeof result.netAssociation).toBe('number');
      expect(typeof result.applicationFee).toBe('number');
      expect(typeof result.commissionDonaction).toBe('number');
      expect(typeof result.fraisStripeEstimes).toBe('number');
      expect(typeof result.montantRecuFiscal).toBe('number');
    });

    it('should have all output values as finite numbers', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(isFinite(result.totalDonateur)).toBe(true);
      expect(isFinite(result.netAssociation)).toBe(true);
      expect(isFinite(result.applicationFee)).toBe(true);
      expect(isFinite(result.commissionDonaction)).toBe(true);
      expect(isFinite(result.fraisStripeEstimes)).toBe(true);
      expect(isFinite(result.montantRecuFiscal)).toBe(true);
    });
  });

  describe('calculateFees - different commission percentages', () => {
    it('should calculate correctly with 0% commission', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0,
      };
      const result = calculateFees(input);

      expect(result.commissionDonaction).toBe(0);
      expect(result.applicationFee).toBe(result.fraisStripeEstimes);
    });

    it('should calculate correctly with 3% commission', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.03,
      };
      const result = calculateFees(input);

      expect(result.commissionDonaction).toBe(3);
    });

    it('should calculate correctly with 5% commission', () => {
      const input: FeeCalculationInput = {
        montantDon: 200,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.05,
      };
      const result = calculateFees(input);

      expect(result.commissionDonaction).toBe(10);
    });
  });

  describe('calculateFees - consistency checks', () => {
    it('should maintain Scenario A equation: netAssociation = montantDon', () => {
      const donations = [10, 50, 100, 500, 1000];

      donations.forEach((amount) => {
        const input: FeeCalculationInput = {
          montantDon: amount,
          contribution: 0,
          donorPaysFee: true,
          commissionPercentage: 0.04,
        };
        const result = calculateFees(input);

        expect(result.netAssociation).toBe(amount);
      });
    });

    it('should maintain Scenario B equation: netAssociation + applicationFee = montantDon', () => {
      const donations = [10, 50, 100, 500, 1000];

      donations.forEach((amount) => {
        const input: FeeCalculationInput = {
          montantDon: amount,
          contribution: 0,
          donorPaysFee: false,
          commissionPercentage: 0.04,
        };
        const result = calculateFees(input);

        const calculated = result.netAssociation + result.applicationFee;
        expect(Math.abs(calculated - amount) < 0.01).toBe(true);
      });
    });

    it('should maintain Scenario A equation: totalDonateur = montantDon + commissionDonaction + contribution + fraisStripeEstimes', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 5,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expected =
        input.montantDon +
        result.commissionDonaction +
        input.contribution +
        result.fraisStripeEstimes;

      expect(Math.abs(result.totalDonateur - expected) < 0.01).toBe(true);
    });

    it('should maintain Scenario B equation: totalDonateur = montantDon + contribution', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 5,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      const expected = input.montantDon + input.contribution;
      expect(result.totalDonateur).toBe(expected);
    });

    it('should maintain Scenario B equation: montantRecuFiscal = netAssociation', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: false,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.montantRecuFiscal).toBe(result.netAssociation);
    });

    it('should maintain Scenario A equation: montantRecuFiscal = netAssociation = montantDon', () => {
      const input: FeeCalculationInput = {
        montantDon: 100,
        contribution: 0,
        donorPaysFee: true,
        commissionPercentage: 0.04,
      };
      const result = calculateFees(input);

      expect(result.montantRecuFiscal).toBe(result.netAssociation);
      expect(result.montantRecuFiscal).toBe(input.montantDon);
    });
  });
});
