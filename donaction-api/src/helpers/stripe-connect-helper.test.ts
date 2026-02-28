import { describe, it, expect, vi } from 'vitest';
import { TradePolicyEntity } from '../_types';

// Stub env vars before importing module (top-level guard throws without them)
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET_CONNECT', 'whsec_fake');

const {
    calculateApplicationFee,
    calculatePlatformCommission,
    estimateStripeFees,
} = await import('./stripe-connect-helper');

/** Helper to build a minimal TradePolicyEntity for tests */
const makePolicy = (
    overrides: Partial<{
        fee_model: string;
        commissionPercentage: number;
        fixed_amount: number;
        stripe_fee_percentage: number;
        stripe_fee_fixed: number;
    }> = {}
): TradePolicyEntity =>
    ({
        fee_model: overrides.fee_model ?? 'percentage_only',
        commissionPercentage: overrides.commissionPercentage ?? 0,
        fixed_amount: overrides.fixed_amount ?? 0,
        stripe_fee_percentage: overrides.stripe_fee_percentage,
        stripe_fee_fixed: overrides.stripe_fee_fixed,
    }) as unknown as TradePolicyEntity;

describe('calculatePlatformCommission', () => {
    // --- percentage_only ---
    describe('percentage_only model', () => {
        it('calculates 10% of 10000 cents = 1000', () => {
            const fee = calculatePlatformCommission(
                10000,
                makePolicy({ commissionPercentage: 10 })
            );
            expect(fee).toBe(1000);
        });

        it('calculates 5% of 999 cents with rounding', () => {
            const fee = calculatePlatformCommission(
                999,
                makePolicy({ commissionPercentage: 5 })
            );
            // 999 * 5 / 100 = 49.95 → Math.round = 50
            expect(fee).toBe(50);
        });

        it('returns 0 when percentage is 0', () => {
            const fee = calculatePlatformCommission(
                5000,
                makePolicy({ commissionPercentage: 0 })
            );
            expect(fee).toBe(0);
        });

        it('handles 100% commission', () => {
            const fee = calculatePlatformCommission(
                5000,
                makePolicy({ commissionPercentage: 100 })
            );
            expect(fee).toBe(5000);
        });
    });

    // --- fixed_only ---
    describe('fixed_only model', () => {
        it('converts fixed_amount euros to cents', () => {
            const fee = calculatePlatformCommission(
                10000,
                makePolicy({ fee_model: 'fixed_only', fixed_amount: 2.5 })
            );
            // 2.5 * 100 = 250 cents
            expect(fee).toBe(250);
        });

        it('returns 0 when fixed_amount is 0', () => {
            const fee = calculatePlatformCommission(
                10000,
                makePolicy({ fee_model: 'fixed_only', fixed_amount: 0 })
            );
            expect(fee).toBe(0);
        });
    });

    // --- percentage_plus_fixed ---
    describe('percentage_plus_fixed model', () => {
        it('adds percentage and fixed fees', () => {
            const fee = calculatePlatformCommission(
                10000,
                makePolicy({
                    fee_model: 'percentage_plus_fixed',
                    commissionPercentage: 5,
                    fixed_amount: 1,
                })
            );
            // (10000 * 5 / 100) + (1 * 100) = 500 + 100 = 600
            expect(fee).toBe(600);
        });
    });

    // --- default (unknown model) falls back to percentage ---
    describe('unknown fee_model defaults to percentage', () => {
        it('falls back to percentage calculation', () => {
            const fee = calculatePlatformCommission(
                10000,
                makePolicy({
                    fee_model: 'unknown_model' as any,
                    commissionPercentage: 10,
                })
            );
            expect(fee).toBe(1000);
        });
    });

    // --- validation / edge cases ---
    describe('validation', () => {
        it('throws on negative percentage', () => {
            expect(() =>
                calculatePlatformCommission(
                    10000,
                    makePolicy({ commissionPercentage: -1 })
                )
            ).toThrow('Pourcentage de commission invalide');
        });

        it('throws on percentage > 100', () => {
            expect(() =>
                calculatePlatformCommission(
                    10000,
                    makePolicy({ commissionPercentage: 101 })
                )
            ).toThrow('Pourcentage de commission invalide');
        });

        it('throws on negative fixed_amount', () => {
            expect(() =>
                calculatePlatformCommission(
                    10000,
                    makePolicy({
                        fee_model: 'fixed_only',
                        fixed_amount: -5,
                    })
                )
            ).toThrow('Montant fixe invalide');
        });

        it('throws on zero amount', () => {
            expect(() =>
                calculatePlatformCommission(
                    0,
                    makePolicy({ commissionPercentage: 10 })
                )
            ).toThrow('Montant de donation invalide');
        });

        it('throws on negative amount', () => {
            expect(() =>
                calculatePlatformCommission(
                    -100,
                    makePolicy({ commissionPercentage: 10 })
                )
            ).toThrow('Montant de donation invalide');
        });
    });
});

describe('estimateStripeFees', () => {
    it('uses default Stripe fees (1.5% + €0.25) when not set in policy', () => {
        const fees = estimateStripeFees(10000, makePolicy());
        // (10000 * 1.5 / 100) + (0.25 * 100) = 150 + 25 = 175
        expect(fees).toBe(175);
    });

    it('uses custom stripe_fee_percentage from policy', () => {
        const fees = estimateStripeFees(
            10000,
            makePolicy({ stripe_fee_percentage: 2.9 })
        );
        // (10000 * 2.9 / 100) + (0.25 * 100) = 290 + 25 = 315
        expect(fees).toBe(315);
    });

    it('uses custom stripe_fee_fixed from policy', () => {
        const fees = estimateStripeFees(
            10000,
            makePolicy({ stripe_fee_fixed: 0.50 })
        );
        // (10000 * 1.5 / 100) + (0.50 * 100) = 150 + 50 = 200
        expect(fees).toBe(200);
    });

    it('uses both custom Stripe fee params from policy', () => {
        const fees = estimateStripeFees(
            10000,
            makePolicy({ stripe_fee_percentage: 2.9, stripe_fee_fixed: 0.30 })
        );
        // (10000 * 2.9 / 100) + (0.30 * 100) = 290 + 30 = 320
        expect(fees).toBe(320);
    });

    it('rounds to nearest cent', () => {
        const fees = estimateStripeFees(
            999,
            makePolicy({ stripe_fee_percentage: 1.5, stripe_fee_fixed: 0.25 })
        );
        // (999 * 1.5 / 100) + 25 = 14.985 + 25 = 39.985 → 40
        expect(fees).toBe(40);
    });
});

describe('calculateApplicationFee (combined)', () => {
    it('returns platform commission + estimated Stripe fees', () => {
        const total = calculateApplicationFee(
            10000,
            makePolicy({ commissionPercentage: 4 })
        );
        // Commission: (10000 * 4 / 100) = 400
        // Stripe: (10000 * 1.5 / 100) + 25 = 175
        // Total: 400 + 175 = 575
        expect(total).toBe(575);
    });

    it('returns only Stripe fees when commission is 0', () => {
        const total = calculateApplicationFee(
            10000,
            makePolicy({ commissionPercentage: 0 })
        );
        // Commission: 0
        // Stripe: 175
        expect(total).toBe(175);
    });

    it('uses custom Stripe fees from trade policy', () => {
        const total = calculateApplicationFee(
            10000,
            makePolicy({
                commissionPercentage: 4,
                stripe_fee_percentage: 2.9,
                stripe_fee_fixed: 0.30,
            })
        );
        // Commission: 400
        // Stripe: (10000 * 2.9 / 100) + 30 = 290 + 30 = 320
        // Total: 400 + 320 = 720
        expect(total).toBe(720);
    });

    it('equals calculatePlatformCommission + estimateStripeFees', () => {
        const policy = makePolicy({ commissionPercentage: 4 });
        const total = calculateApplicationFee(10000, policy);
        const commission = calculatePlatformCommission(10000, policy);
        const stripe = estimateStripeFees(10000, policy);

        expect(total).toBe(commission + stripe);
    });

    it('throws on invalid amount (delegates to calculatePlatformCommission)', () => {
        expect(() =>
            calculateApplicationFee(0, makePolicy({ commissionPercentage: 4 }))
        ).toThrow('Montant de donation invalide');
    });
});
