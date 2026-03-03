import { TradePolicyEntity } from '../_types';
import {
    calculatePlatformCommission,
    estimateStripeFees,
} from './stripe-connect-helper';

/**
 * Données d'entrée pour le calcul des frais d'une donation
 */
export interface FeeCalculationInput {
    /** Montant du don en centimes */
    montantDon: number;
    /** Contribution volontaire DONACTION en centimes */
    contribution: number;
    /** Si true, le donateur paie les frais en supplément (Scénario A) */
    donorPaysFee: boolean;
    /** Politique tarifaire de l'association */
    tradePolicy: TradePolicyEntity;
}

/**
 * Résultat du calcul des frais d'une donation
 */
export interface FeeCalculationOutput {
    /** Montant total débité du donateur en centimes */
    totalDonateur: number;
    /** Montant net reçu par l'association en centimes */
    netAssociation: number;
    /** Montant de l'application_fee_amount Stripe en centimes */
    applicationFee: number;
    /** Commission DONACTION en centimes */
    commissionDonaction: number;
    /** Estimation des frais Stripe en centimes */
    fraisStripeEstimes: number;
    /** Montant servant de base au reçu fiscal en centimes */
    montantRecuFiscal: number;
}

/**
 * Orchestrateur principal de calcul des frais pour une donation.
 *
 * Sélectionne automatiquement le scénario adapté selon la politique tarifaire :
 * - Legacy (stripe_connect désactivé) : aucun frais calculé
 * - Scénario A (donorPaysFee = true) : le donateur paie les frais en supplément
 * - Scénario B (donorPaysFee = false) : les frais sont déduits du don
 *
 * Note : le paramètre `donorPaysFee` est une décision déjà résolue en amont
 * (via `determineDonorPaysFee()`). Il prévaut sur `tradePolicy.donor_pays_fee`
 * qui est le champ legacy avant Stripe Connect.
 *
 * @param input - Paramètres de calcul (montant, contribution, choix donateur, politique)
 * @returns Décomposition complète des frais et montants
 */
export function calculateFees(input: FeeCalculationInput): FeeCalculationOutput {
    const { montantDon, contribution, donorPaysFee, tradePolicy } = input;

    if (contribution < 0) {
        throw new Error('Contribution invalide : ne peut pas être négative');
    }

    // Garde : mode legacy sans Stripe Connect
    if (!tradePolicy.stripe_connect) {
        return calculateLegacyFees(input);
    }

    const commissionDonaction = calculatePlatformCommission(montantDon, tradePolicy);

    if (donorPaysFee) {
        return calculateScenarioA(montantDon, contribution, commissionDonaction, tradePolicy);
    }

    return calculateScenarioB(montantDon, contribution, commissionDonaction, tradePolicy);
}

/**
 * Scénario A — Le donateur paie les frais en supplément du montant du don.
 *
 * Le montant du don est intégralement reversé à l'association.
 * Les frais Stripe et la commission DONACTION sont ajoutés au total débité.
 *
 * @param montantDon - Montant du don en centimes
 * @param contribution - Contribution volontaire DONACTION en centimes
 * @param commissionDonaction - Commission DONACTION déjà calculée en centimes
 * @param tradePolicy - Politique tarifaire de l'association
 * @returns Décomposition des frais pour le scénario A
 */
const calculateScenarioA = (
    montantDon: number,
    contribution: number,
    commissionDonaction: number,
    tradePolicy: TradePolicyEntity
): FeeCalculationOutput => {
    const subtotalBeforeStripe = montantDon + commissionDonaction + contribution;
    const fraisStripeEstimes = estimateStripeFees(subtotalBeforeStripe, tradePolicy);

    const applicationFee = commissionDonaction + fraisStripeEstimes;
    const totalDonateur = montantDon + commissionDonaction + fraisStripeEstimes + contribution;
    const netAssociation = montantDon;
    const montantRecuFiscal = montantDon;

    return {
        totalDonateur,
        netAssociation,
        applicationFee,
        commissionDonaction,
        fraisStripeEstimes,
        montantRecuFiscal,
    };
};

/**
 * Scénario B — Les frais sont déduits du montant du don reçu par l'association.
 *
 * Le donateur paie uniquement le montant du don (+ contribution éventuelle).
 * Les frais Stripe et la commission DONACTION sont prélevés sur la part de l'association.
 *
 * Note : les frais Stripe sont estimés sur (montantDon + contribution), sans inclure
 * la commission dans la base de calcul. C'est une simplification volontaire conforme
 * à la spécification US-PAY-002 — la légère sous-estimation est absorbée par la plateforme.
 *
 * @param montantDon - Montant du don en centimes
 * @param contribution - Contribution volontaire DONACTION en centimes
 * @param commissionDonaction - Commission DONACTION déjà calculée en centimes
 * @param tradePolicy - Politique tarifaire de l'association
 * @returns Décomposition des frais pour le scénario B
 */
const calculateScenarioB = (
    montantDon: number,
    contribution: number,
    commissionDonaction: number,
    tradePolicy: TradePolicyEntity
): FeeCalculationOutput => {
    const totalDonateur = montantDon + contribution;
    const fraisStripeEstimes = estimateStripeFees(totalDonateur, tradePolicy);

    const applicationFee = commissionDonaction + fraisStripeEstimes;
    const netAssociation = Math.max(0, montantDon - applicationFee);
    const montantRecuFiscal = netAssociation;

    return {
        totalDonateur,
        netAssociation,
        applicationFee,
        commissionDonaction,
        fraisStripeEstimes,
        montantRecuFiscal,
    };
};

/**
 * Mode legacy — Stripe Connect désactivé, aucun frais de plateforme calculé.
 *
 * Le donateur paie le montant du don et la contribution.
 * L'association reçoit le montant intégral du don sans déduction.
 *
 * @param input - Paramètres de calcul
 * @returns Décomposition des frais en mode legacy (frais à zéro)
 */
const calculateLegacyFees = (input: FeeCalculationInput): FeeCalculationOutput => {
    const { montantDon, contribution } = input;

    return {
        totalDonateur: montantDon + contribution,
        netAssociation: montantDon,
        applicationFee: 0,
        commissionDonaction: 0,
        fraisStripeEstimes: 0,
        montantRecuFiscal: montantDon,
    };
};
