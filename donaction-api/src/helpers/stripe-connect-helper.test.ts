import { describe, it, expect } from 'vitest';
import { calculateApplicationFee } from './stripe-connect-helper';
import { TradePolicyEntity } from '../_types';

/** Helper to build a minimal TradePolicyEntity for tests */
const makePolicy = (
    overrides: Partial<{
        fee_model: string;
        commissionPercentage: number;
        fixed_amount: number;
    }> = {}
): TradePolicyEntity =>
    ({
        fee_model: overrides.fee_model ?? 'percentage_only',
        commissionPercentage: overrides.commissionPercentage ?? 0,
        fixed_amount: overrides.fixed_amount ?? 0,
    }) as unknown as TradePolicyEntity;

describe('calculateApplicationFee', () => {
    // --- percentage_only ---
    describe('percentage_only model', () => {
        it('calculates 10% of 10000 cents = 1000', () => {
            const fee = calculateApplicationFee(
                10000,
                makePolicy({ commissionPercentage: 10 })
            );
            expect(fee).toBe(1000);
        });

        it('calculates 5% of 999 cents with rounding', () => {
            const fee = calculateApplicationFee(
                999,
                makePolicy({ commissionPercentage: 5 })
            );
            // 999 * 5 / 100 = 49.95 → Math.round = 50
            expect(fee).toBe(50);
        });

        it('returns 0 when percentage is 0', () => {
            const fee = calculateApplicationFee(
                5000,
                makePolicy({ commissionPercentage: 0 })
            );
            expect(fee).toBe(0);
        });

        it('handles 100% commission', () => {
            const fee = calculateApplicationFee(
                5000,
                makePolicy({ commissionPercentage: 100 })
            );
            expect(fee).toBe(5000);
        });
    });

    // --- fixed_only ---
    describe('fixed_only model', () => {
        it('converts fixed_amount euros to cents', () => {
            const fee = calculateApplicationFee(
                10000,
                makePolicy({ fee_model: 'fixed_only', fixed_amount: 2.5 })
            );
            // 2.5 * 100 = 250 cents
            expect(fee).toBe(250);
        });

        it('returns 0 when fixed_amount is 0', () => {
            const fee = calculateApplicationFee(
                10000,
                makePolicy({ fee_model: 'fixed_only', fixed_amount: 0 })
            );
            expect(fee).toBe(0);
        });
    });

    // --- percentage_plus_fixed ---
    describe('percentage_plus_fixed model', () => {
        it('adds percentage and fixed fees', () => {
            const fee = calculateApplicationFee(
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
            const fee = calculateApplicationFee(
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
                calculateApplicationFee(
                    10000,
                    makePolicy({ commissionPercentage: -1 })
                )
            ).toThrow('Pourcentage de commission invalide');
        });

        it('throws on percentage > 100', () => {
            expect(() =>
                calculateApplicationFee(
                    10000,
                    makePolicy({ commissionPercentage: 101 })
                )
            ).toThrow('Pourcentage de commission invalide');
        });

        it('throws on negative fixed_amount', () => {
            expect(() =>
                calculateApplicationFee(
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
                calculateApplicationFee(
                    0,
                    makePolicy({ commissionPercentage: 10 })
                )
            ).toThrow('Montant de donation invalide');
        });

        it('throws on negative amount', () => {
            expect(() =>
                calculateApplicationFee(
                    -100,
                    makePolicy({ commissionPercentage: 10 })
                )
            ).toThrow('Montant de donation invalide');
        });
    });
});
