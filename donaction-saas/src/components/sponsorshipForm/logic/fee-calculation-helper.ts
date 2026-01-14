/**
 * Fee Calculation Helper for Stripe Connect
 * Implements US-PAY-002 specification for fee model calculations
 */

/** Stripe fees for European cards (France) */
export const STRIPE_FEES = {
  PERCENTAGE: 0.015, // 1.5% for European cards
  FIXED: 0.25 // 0.25€ per transaction
} as const;

export interface FeeCalculationInput {
  montantDon: number; // In euros
  contribution: number; // In euros (voluntary DONACTION contribution)
  donorPaysFee: boolean;
  commissionPercentage: number; // As decimal (0.04 = 4%)
}

export interface FeeCalculationOutput {
  totalDonateur: number; // What donor pays
  netAssociation: number; // What association receives
  applicationFee: number; // application_fee_amount for Stripe
  commissionDonaction: number; // Platform commission (4%)
  fraisStripeEstimes: number; // Estimated Stripe fees
  montantRecuFiscal: number; // Tax receipt amount
}

/**
 * Calculate fees for Stripe Connect donations
 *
 * Scenario A (donorPaysFee=true): Donor pays commission + Stripe fees on top
 * Scenario B (donorPaysFee=false): Fees deducted from donation, association receives less
 *
 * @param input - Fee calculation input parameters
 * @returns Full fee breakdown
 */
export function calculateFees(input: FeeCalculationInput): FeeCalculationOutput {
  const { montantDon, contribution, donorPaysFee, commissionPercentage } = input;

  // Handle invalid inputs
  if (isNaN(montantDon) || montantDon <= 0) {
    return {
      totalDonateur: contribution || 0,
      netAssociation: 0,
      applicationFee: 0,
      commissionDonaction: 0,
      fraisStripeEstimes: 0,
      montantRecuFiscal: 0
    };
  }

  // Calculate DONACTION commission
  const commissionDonaction = roundToCents(montantDon * commissionPercentage);

  if (donorPaysFee) {
    return calculateScenarioA(montantDon, contribution, commissionDonaction);
  } else {
    return calculateScenarioB(montantDon, contribution, commissionDonaction);
  }
}

/**
 * Scenario A: Donor pays fees on top of donation
 * - Association receives 100% of donation amount
 * - Donor pays: donation + commission + Stripe fees + contribution
 */
function calculateScenarioA(
  montantDon: number,
  contribution: number,
  commissionDonaction: number
): FeeCalculationOutput {
  // Subtotal before Stripe fees
  const subtotal = montantDon + commissionDonaction + contribution;

  // Stripe fees on total charged amount
  const fraisStripeEstimes = calculateStripeFees(montantDon);

  // Total donor pays
  const totalDonateur = roundToCents(subtotal + fraisStripeEstimes);

  // Application fee includes commission + Stripe fees
  const applicationFee = roundToCents(commissionDonaction + fraisStripeEstimes);

  return {
    totalDonateur,
    netAssociation: montantDon, // Association receives 100%
    applicationFee, 
    commissionDonaction,
    fraisStripeEstimes,
    montantRecuFiscal: montantDon // Tax receipt = full donation amount
  };
}

/**
 * Scenario B: Fees deducted from donation
 * - Donor pays only: donation + contribution
 * - Association receives: donation - (commission + Stripe fees)
 *
 * CRITICAL: application_fee includes Stripe fees to maintain 4% net commission for DONACTION
 */
function calculateScenarioB(
  montantDon: number,
  contribution: number,
  commissionDonaction: number
): FeeCalculationOutput {
  // Total charged to donor (no visible fees)
  const totalDonateur = roundToCents(montantDon + contribution);

  // Stripe fees calculated on total charged
  const fraisStripeEstimes = calculateStripeFees(montantDon);

  // Application fee INCLUDES Stripe fees to ensure DONACTION maintains 4% net
  const applicationFee = roundToCents(commissionDonaction + fraisStripeEstimes);

  // Association receives donation minus application fee
  const netAssociation = roundToCents(montantDon - applicationFee);

  return {
    totalDonateur,
    netAssociation,
    applicationFee,
    commissionDonaction,
    fraisStripeEstimes,
    montantRecuFiscal: netAssociation // Tax receipt = actual amount received
  };
}

/**
 * Calculate Stripe fees for a given amount
 * Formula: (amount × 1.5%) + 0.25€
 */
function calculateStripeFees(amount: number): number {
  return roundToCents(amount * STRIPE_FEES.PERCENTAGE + STRIPE_FEES.FIXED);
}

/**
 * Round to 2 decimal places (cents)
 */
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
