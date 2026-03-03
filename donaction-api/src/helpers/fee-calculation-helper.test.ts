import { describe, it, expect, vi } from 'vitest';
import { TradePolicyEntity } from '../_types';

// Stub env vars before importing (stripe-connect-helper has top-level guard)
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET_CONNECT', 'whsec_fake');

const { calculateFees } = await import('./fee-calculation-helper');

/** Helper to build a minimal TradePolicyEntity for tests */
const makePolicy = (
    overrides: Partial<{
        fee_model: string;
        commissionPercentage: number;
        fixed_amount: number;
        stripe_fee_percentage: number;
        stripe_fee_fixed: number;
        stripe_connect: boolean;
        donor_pays_fee: boolean;
    }> = {}
): TradePolicyEntity =>
    ({
        fee_model: overrides.fee_model ?? 'percentage_only',
        commissionPercentage: overrides.commissionPercentage ?? 4,
        fixed_amount: overrides.fixed_amount ?? 0,
        stripe_fee_percentage: overrides.stripe_fee_percentage,
        stripe_fee_fixed: overrides.stripe_fee_fixed,
        stripe_connect: overrides.stripe_connect ?? true,
        donor_pays_fee: overrides.donor_pays_fee,
    }) as unknown as TradePolicyEntity;

// ---------------------------------------------------------------------------
// Scénario A — Le donateur paie les frais en supplément (donorPaysFee = true)
// ---------------------------------------------------------------------------

describe('Scénario A — donorPaysFee = true', () => {
    describe('percentage_only 4%', () => {
        it('don=10000, contribution=1000 : calcule les frais corrects', () => {
            // commissionDonaction = Math.round(10000 * 4 / 100) = 400
            // subtotal = 10000 + 400 + 1000 = 11400
            // fraisStripeEstimes = Math.round(11400 * 1.5 / 100 + 0.25 * 100)
            //                    = Math.round(171 + 25) = 196
            // applicationFee = 400 + 196 = 596
            // totalDonateur = 10000 + 400 + 196 + 1000 = 11596
            // netAssociation = 10000
            // montantRecuFiscal = 10000
            const result = calculateFees({
                montantDon: 10000,
                contribution: 1000,
                donorPaysFee: true,
                tradePolicy: makePolicy({ commissionPercentage: 4 }),
            });

            expect(result.commissionDonaction).toBe(400);
            expect(result.fraisStripeEstimes).toBe(196);
            expect(result.applicationFee).toBe(596);
            expect(result.totalDonateur).toBe(11596);
            expect(result.netAssociation).toBe(10000);
            expect(result.montantRecuFiscal).toBe(10000);
        });
    });

    describe('fixed_only 5€', () => {
        it('don=10000, contribution=0 : calcule les frais corrects', () => {
            // commissionDonaction = Math.round(5 * 100) = 500
            // subtotal = 10000 + 500 + 0 = 10500
            // fraisStripeEstimes = Math.round(10500 * 1.5 / 100 + 25)
            //                    = Math.round(157.5 + 25) = Math.round(182.5) = 183
            // applicationFee = 500 + 183 = 683
            // totalDonateur = 10000 + 500 + 183 + 0 = 10683
            // netAssociation = 10000
            // montantRecuFiscal = 10000
            const result = calculateFees({
                montantDon: 10000,
                contribution: 0,
                donorPaysFee: true,
                tradePolicy: makePolicy({
                    fee_model: 'fixed_only',
                    fixed_amount: 5,
                }),
            });

            expect(result.commissionDonaction).toBe(500);
            expect(result.fraisStripeEstimes).toBe(183);
            expect(result.applicationFee).toBe(683);
            expect(result.totalDonateur).toBe(10683);
            expect(result.netAssociation).toBe(10000);
            expect(result.montantRecuFiscal).toBe(10000);
        });
    });

    describe('percentage_plus_fixed 4% + 1€', () => {
        it('don=10000, contribution=1000 : calcule les frais corrects', () => {
            // commissionDonaction = Math.round(10000 * 4 / 100) + Math.round(1 * 100)
            //                     = 400 + 100 = 500
            // subtotal = 10000 + 500 + 1000 = 11500
            // fraisStripeEstimes = Math.round(11500 * 1.5 / 100 + 25)
            //                    = Math.round(172.5 + 25) = Math.round(197.5) = 198
            // applicationFee = 500 + 198 = 698
            // totalDonateur = 10000 + 500 + 198 + 1000 = 11698
            // netAssociation = 10000
            // montantRecuFiscal = 10000
            const result = calculateFees({
                montantDon: 10000,
                contribution: 1000,
                donorPaysFee: true,
                tradePolicy: makePolicy({
                    fee_model: 'percentage_plus_fixed',
                    commissionPercentage: 4,
                    fixed_amount: 1,
                }),
            });

            expect(result.commissionDonaction).toBe(500);
            expect(result.fraisStripeEstimes).toBe(198);
            expect(result.applicationFee).toBe(698);
            expect(result.totalDonateur).toBe(11698);
            expect(result.netAssociation).toBe(10000);
            expect(result.montantRecuFiscal).toBe(10000);
        });
    });
});

// ---------------------------------------------------------------------------
// Scénario B — Les frais sont déduits du don (donorPaysFee = false)
// ---------------------------------------------------------------------------

describe('Scénario B — donorPaysFee = false', () => {
    describe('percentage_only 4%', () => {
        it('don=10000, contribution=1000 : les frais sont déduits du net association', () => {
            // commissionDonaction = 400
            // totalDonateur = 10000 + 1000 = 11000
            // fraisStripeEstimes = Math.round(11000 * 1.5 / 100 + 25)
            //                    = Math.round(165 + 25) = 190
            // applicationFee = 400 + 190 = 590
            // netAssociation = 10000 - 590 = 9410
            // montantRecuFiscal = 9410
            const result = calculateFees({
                montantDon: 10000,
                contribution: 1000,
                donorPaysFee: false,
                tradePolicy: makePolicy({ commissionPercentage: 4 }),
            });

            expect(result.commissionDonaction).toBe(400);
            expect(result.fraisStripeEstimes).toBe(190);
            expect(result.applicationFee).toBe(590);
            expect(result.totalDonateur).toBe(11000);
            expect(result.netAssociation).toBe(9410);
            expect(result.montantRecuFiscal).toBe(9410);
        });
    });

    describe('fixed_only 5€', () => {
        it('don=10000, contribution=0 : les frais sont déduits du net association', () => {
            // commissionDonaction = 500
            // totalDonateur = 10000 + 0 = 10000
            // fraisStripeEstimes = Math.round(10000 * 1.5 / 100 + 25)
            //                    = Math.round(150 + 25) = 175
            // applicationFee = 500 + 175 = 675
            // netAssociation = 10000 - 675 = 9325
            // montantRecuFiscal = 9325
            const result = calculateFees({
                montantDon: 10000,
                contribution: 0,
                donorPaysFee: false,
                tradePolicy: makePolicy({
                    fee_model: 'fixed_only',
                    fixed_amount: 5,
                }),
            });

            expect(result.commissionDonaction).toBe(500);
            expect(result.fraisStripeEstimes).toBe(175);
            expect(result.applicationFee).toBe(675);
            expect(result.totalDonateur).toBe(10000);
            expect(result.netAssociation).toBe(9325);
            expect(result.montantRecuFiscal).toBe(9325);
        });
    });

    describe('percentage_plus_fixed 4% + 1€', () => {
        it('don=10000, contribution=1000 : les frais sont déduits du net association', () => {
            // commissionDonaction = 400 + 100 = 500
            // totalDonateur = 10000 + 1000 = 11000
            // fraisStripeEstimes = Math.round(11000 * 1.5 / 100 + 25) = 190
            // applicationFee = 500 + 190 = 690
            // netAssociation = 10000 - 690 = 9310
            // montantRecuFiscal = 9310
            const result = calculateFees({
                montantDon: 10000,
                contribution: 1000,
                donorPaysFee: false,
                tradePolicy: makePolicy({
                    fee_model: 'percentage_plus_fixed',
                    commissionPercentage: 4,
                    fixed_amount: 1,
                }),
            });

            expect(result.commissionDonaction).toBe(500);
            expect(result.fraisStripeEstimes).toBe(190);
            expect(result.applicationFee).toBe(690);
            expect(result.totalDonateur).toBe(11000);
            expect(result.netAssociation).toBe(9310);
            expect(result.montantRecuFiscal).toBe(9310);
        });
    });
});

// ---------------------------------------------------------------------------
// Mode legacy — stripe_connect désactivé
// ---------------------------------------------------------------------------

describe('Mode legacy (stripe_connect = false)', () => {
    it('retourne des frais à zéro et le net association égal au montant du don', () => {
        const result = calculateFees({
            montantDon: 10000,
            contribution: 1000,
            donorPaysFee: true,
            tradePolicy: makePolicy({ stripe_connect: false }),
        });

        expect(result.applicationFee).toBe(0);
        expect(result.commissionDonaction).toBe(0);
        expect(result.fraisStripeEstimes).toBe(0);
        expect(result.netAssociation).toBe(10000);
        expect(result.montantRecuFiscal).toBe(10000);
        expect(result.totalDonateur).toBe(11000);
    });

    it('le totalDonateur inclut la contribution même en mode legacy', () => {
        const result = calculateFees({
            montantDon: 5000,
            contribution: 500,
            donorPaysFee: false,
            tradePolicy: makePolicy({ stripe_connect: false }),
        });

        expect(result.totalDonateur).toBe(5500);
        expect(result.netAssociation).toBe(5000);
    });
});

// ---------------------------------------------------------------------------
// Vérification DONACTION maintient 4% net (Scénario B)
// ---------------------------------------------------------------------------

describe('Vérification DONACTION 4% net (Scénario B)', () => {
    it('la commission DONACTION représente exactement 4% du montant du don', () => {
        const testCases = [
            { montantDon: 5000, contribution: 500 },
            { montantDon: 10000, contribution: 1000 },
            { montantDon: 50000, contribution: 2500 },
        ];

        const policy = makePolicy({ commissionPercentage: 4 });

        for (const { montantDon, contribution } of testCases) {
            const result = calculateFees({
                montantDon,
                contribution,
                donorPaysFee: false,
                tradePolicy: policy,
            });

            // La commission DONACTION doit être exactement 4% du don
            expect(result.commissionDonaction).toBe(Math.round(montantDon * 4 / 100));

            // L'association reçoit : don - applicationFee
            expect(result.netAssociation).toBe(montantDon - result.applicationFee);

            // Le total prélevé couvre exactement don + contribution
            expect(result.totalDonateur).toBe(montantDon + contribution);
        }
    });
});

// ---------------------------------------------------------------------------
// Cas limites
// ---------------------------------------------------------------------------

describe('Cas limites', () => {
    it('contribution zéro fonctionne en Scénario A', () => {
        const result = calculateFees({
            montantDon: 10000,
            contribution: 0,
            donorPaysFee: true,
            tradePolicy: makePolicy({ commissionPercentage: 4 }),
        });

        // commissionDonaction = 400
        // subtotal = 10000 + 400 + 0 = 10400
        // fraisStripeEstimes = Math.round(10400 * 1.5 / 100 + 25)
        //                    = Math.round(156 + 25) = 181
        // applicationFee = 400 + 181 = 581
        // totalDonateur = 10000 + 400 + 181 + 0 = 10581
        expect(result.commissionDonaction).toBe(400);
        expect(result.fraisStripeEstimes).toBe(181);
        expect(result.applicationFee).toBe(581);
        expect(result.totalDonateur).toBe(10581);
        expect(result.netAssociation).toBe(10000);
        expect(result.montantRecuFiscal).toBe(10000);
    });

    it('contribution zéro fonctionne en Scénario B', () => {
        const result = calculateFees({
            montantDon: 10000,
            contribution: 0,
            donorPaysFee: false,
            tradePolicy: makePolicy({ commissionPercentage: 4 }),
        });

        // commissionDonaction = 400
        // totalDonateur = 10000 + 0 = 10000
        // fraisStripeEstimes = Math.round(10000 * 1.5 / 100 + 25) = 175
        // applicationFee = 400 + 175 = 575
        // netAssociation = 10000 - 575 = 9425
        expect(result.commissionDonaction).toBe(400);
        expect(result.fraisStripeEstimes).toBe(175);
        expect(result.applicationFee).toBe(575);
        expect(result.totalDonateur).toBe(10000);
        expect(result.netAssociation).toBe(9425);
        expect(result.montantRecuFiscal).toBe(9425);
    });

    it('grand montant (100000 centimes = 1000€) sans overflow en Scénario A', () => {
        const result = calculateFees({
            montantDon: 100000,
            contribution: 5000,
            donorPaysFee: true,
            tradePolicy: makePolicy({ commissionPercentage: 4 }),
        });

        // commissionDonaction = Math.round(100000 * 4 / 100) = 4000
        // subtotal = 100000 + 4000 + 5000 = 109000
        // fraisStripeEstimes = Math.round(109000 * 1.5 / 100 + 25)
        //                    = Math.round(1635 + 25) = 1660
        // applicationFee = 4000 + 1660 = 5660
        // totalDonateur = 100000 + 4000 + 1660 + 5000 = 110660
        // netAssociation = 100000
        expect(result.commissionDonaction).toBe(4000);
        expect(result.fraisStripeEstimes).toBe(1660);
        expect(result.applicationFee).toBe(5660);
        expect(result.totalDonateur).toBe(110660);
        expect(result.netAssociation).toBe(100000);
        expect(result.montantRecuFiscal).toBe(100000);
    });

    it('grand montant (100000 centimes = 1000€) sans overflow en Scénario B', () => {
        const result = calculateFees({
            montantDon: 100000,
            contribution: 5000,
            donorPaysFee: false,
            tradePolicy: makePolicy({ commissionPercentage: 4 }),
        });

        // commissionDonaction = 4000
        // totalDonateur = 100000 + 5000 = 105000
        // fraisStripeEstimes = Math.round(105000 * 1.5 / 100 + 25)
        //                    = Math.round(1575 + 25) = 1600
        // applicationFee = 4000 + 1600 = 5600
        // netAssociation = 100000 - 5600 = 94400
        expect(result.commissionDonaction).toBe(4000);
        expect(result.fraisStripeEstimes).toBe(1600);
        expect(result.applicationFee).toBe(5600);
        expect(result.totalDonateur).toBe(105000);
        expect(result.netAssociation).toBe(94400);
        expect(result.montantRecuFiscal).toBe(94400);
    });

    it('netAssociation ne descend pas sous zéro en Scénario B avec petit montant', () => {
        // Petit don avec frais élevés : commission + Stripe > don
        const result = calculateFees({
            montantDon: 100, // 1€
            contribution: 0,
            donorPaysFee: false,
            tradePolicy: makePolicy({
                fee_model: 'fixed_only',
                fixed_amount: 5, // 5€ fixe > 1€ don
            }),
        });

        expect(result.netAssociation).toBe(0);
        expect(result.montantRecuFiscal).toBe(0);
    });

    it('fonctionne avec des frais Stripe personnalisés (taux US)', () => {
        // Stripe US: 2.9% + $0.30
        const result = calculateFees({
            montantDon: 10000,
            contribution: 1000,
            donorPaysFee: true,
            tradePolicy: makePolicy({
                commissionPercentage: 4,
                stripe_fee_percentage: 2.9,
                stripe_fee_fixed: 0.30,
            }),
        });

        // commissionDonaction = 400
        // subtotal = 10000 + 400 + 1000 = 11400
        // fraisStripeEstimes = Math.round(11400 * 2.9 / 100 + 0.30 * 100)
        //                    = Math.round(330.6 + 30) = Math.round(360.6) = 361
        // applicationFee = 400 + 361 = 761
        // totalDonateur = 10000 + 400 + 361 + 1000 = 11761
        expect(result.commissionDonaction).toBe(400);
        expect(result.fraisStripeEstimes).toBe(361);
        expect(result.applicationFee).toBe(761);
        expect(result.totalDonateur).toBe(11761);
        expect(result.netAssociation).toBe(10000);
    });

    it('propage l\'erreur de calculatePlatformCommission si montantDon <= 0', () => {
        expect(() =>
            calculateFees({
                montantDon: 0,
                contribution: 1000,
                donorPaysFee: true,
                tradePolicy: makePolicy({ commissionPercentage: 4 }),
            })
        ).toThrow('Montant de donation invalide');
    });
});
