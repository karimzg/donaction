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
  // Type safety: validate amount is a finite positive number
  if (!Number.isFinite(amount) || amount < MIN_DONATION_AMOUNT) {
    const safeAmount = MIN_DONATION_AMOUNT;
    const taxRate = isOrganization
      ? TAUX_DEDUCTION_FISCALE_PRO
      : TAUX_DEDUCTION_FISCALE_PART;
    return {
      originalAmount: safeAmount,
      taxReduction: Math.round(safeAmount * taxRate * 100) / 100,
      costAfterTax: Math.round(safeAmount * (1 - taxRate) * 100) / 100,
      taxRate,
      donorType: isOrganization ? 'entreprise' : 'particulier',
    };
  }

  const clampedAmount = Math.min(amount, MAX_DONATION_AMOUNT);
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
