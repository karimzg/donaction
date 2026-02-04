import {
  TAUX_DEDUCTION_FISCALE_PART,
  TAUX_DEDUCTION_FISCALE_PRO,
} from '@/core/constants/dons';
import { TaxCalculationResult } from './types';

export function calculateDemoTaxReduction(
  amount: number,
  isOrganization: boolean
): TaxCalculationResult {
  const taxRate = isOrganization
    ? TAUX_DEDUCTION_FISCALE_PRO
    : TAUX_DEDUCTION_FISCALE_PART;
  const taxReduction = amount * taxRate;
  const costAfterTax = amount - taxReduction;

  return {
    originalAmount: amount,
    taxReduction: Math.round(taxReduction * 100) / 100,
    costAfterTax: Math.round(costAfterTax * 100) / 100,
    taxRate,
    donorType: isOrganization ? 'entreprise' : 'particulier',
  };
}

export const SUGGESTED_AMOUNTS_INDIVIDUAL = [10, 20, 50, 100] as const;
export const SUGGESTED_AMOUNTS_ORGANIZATION = [100, 200, 500, 1000] as const;
