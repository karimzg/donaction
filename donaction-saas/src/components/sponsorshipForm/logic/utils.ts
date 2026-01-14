/**
 * Calculate the cost after tax reduction for a donation
 * @param amount - Donation amount in euros
 * @param isOrganization - Whether the donor is an organization (60% reduction) or individual (66% reduction)
 * @returns Formatted string of the cost after tax reduction
 */
export function calculateTaxReduction(amount: number, isOrganization: boolean): string {
  const TAUX_DEDUCTION_FISCALE_PART = 0.66;
  const TAUX_DEDUCTION_FISCALE_PRO = 0.6;

  if (isNaN(amount) || amount < +0) return '0';
  return (
    amount -
    amount * (isOrganization ? TAUX_DEDUCTION_FISCALE_PRO : TAUX_DEDUCTION_FISCALE_PART)
  )
    .toFixed(2)
    .replace(/\.00$/, '');
}

/**
 * Calculate processing fees for a donation (platform commission only)
 * @param montant - Donation amount in euros
 * @param commissionPercentage - Platform commission percentage (e.g., 4 for 4%)
 * @returns Fee amount in euros, rounded to 2 decimal places
 */
export function calculateFeeAmount(montant: number, commissionPercentage: number): number {
  if (isNaN(montant) || montant <= 0) return 0;
  return Math.round(montant * (commissionPercentage / 100) * 100) / 100;
}

/**
 * Format a number as currency in euros
 * @param amount - Amount to format
 * @returns Formatted string with € symbol (e.g., "100 €" or "99.50 €")
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0 €';
  return amount.toFixed(2).replace(/\.00$/, '') + ' €';
}
