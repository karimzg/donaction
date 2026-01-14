export function calculateTaxReduction(amount: number, isOrganization: boolean) {
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

export function calculateFeeAmount(montant: number, commissionPercentage: number): number {
  if (isNaN(montant) || montant <= 0) return 0;
  return Math.round(montant * (commissionPercentage / 100) * 100) / 100;
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0 €';
  return amount.toFixed(2).replace(/\.00$/, '') + ' €';
}
