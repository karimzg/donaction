import {
  TAUX_DEDUCTION_FISCALE_PART,
  TAUX_DEDUCTION_FISCALE_PRO,
} from '@/core/constants/dons';
import { TaxCalculationResult } from './types';

export const MIN_DONATION_AMOUNT = 1;
export const MAX_DONATION_AMOUNT = 100000;
export const DEFAULT_DONATION_AMOUNT = 50;

export function calculateDemoTaxReduction(
  amount: number,
  isOrganization: boolean
): TaxCalculationResult {
  // Clamp amount to valid range, defaulting to MIN if invalid
  const clampedAmount =
    Number.isFinite(amount) && amount >= MIN_DONATION_AMOUNT
      ? Math.min(amount, MAX_DONATION_AMOUNT)
      : MIN_DONATION_AMOUNT;

  const taxRate = isOrganization
    ? TAUX_DEDUCTION_FISCALE_PRO
    : TAUX_DEDUCTION_FISCALE_PART;
  const taxReduction = clampedAmount * taxRate;
  const costAfterTax = clampedAmount - taxReduction;

  return {
    originalAmount: clampedAmount,
    taxReduction: Math.round(taxReduction * 100) / 100,
    costAfterTax: Math.round(costAfterTax * 100) / 100,
    taxRate,
    donorType: isOrganization ? 'entreprise' : 'particulier',
  };
}

export const SUGGESTED_AMOUNTS_INDIVIDUAL = [10, 20, 50, 100] as const;
export const SUGGESTED_AMOUNTS_ORGANIZATION = [100, 200, 500, 1000] as const;
