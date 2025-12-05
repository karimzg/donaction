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
