import { describe, it, expect } from 'vitest';
import { resolveDonorPaysFee } from './resolveDonorPaysFee';

/**
 * Tests for resolveDonorPaysFee — the exported module-level function.
 * This tests the real production code, not a copy.
 */

describe('resolveDonorPaysFee', () => {
    // Branch 1: stripe_connect = false (Legacy mode) → always null
    describe('Legacy mode (stripe_connect = false)', () => {
        it('returns null regardless of donorPaysFee value', () => {
            expect(resolveDonorPaysFee(true, false)).toBeNull();
            expect(resolveDonorPaysFee(false, false)).toBeNull();
            expect(resolveDonorPaysFee(null, false)).toBeNull();
            expect(resolveDonorPaysFee(undefined, false)).toBeNull();
        });
    });

    // Branch 2: stripe_connect = null/undefined (unknown) → always null
    describe('Unknown mode (stripe_connect = null/undefined)', () => {
        it('returns null when stripe_connect is null', () => {
            expect(resolveDonorPaysFee(true, null)).toBeNull();
        });

        it('returns null when stripe_connect is undefined', () => {
            expect(resolveDonorPaysFee(true, undefined)).toBeNull();
        });
    });

    // Branch 3: stripe_connect = true (Connect mode) → passes through donor choice
    describe('Connect mode (stripe_connect = true)', () => {
        it('returns true when donorPaysFee is true', () => {
            expect(resolveDonorPaysFee(true, true)).toBe(true);
        });

        it('returns false when donorPaysFee is false', () => {
            expect(resolveDonorPaysFee(false, true)).toBe(false);
        });

        it('returns null when donorPaysFee is null', () => {
            expect(resolveDonorPaysFee(null, true)).toBeNull();
        });

        it('returns null when donorPaysFee is undefined', () => {
            expect(resolveDonorPaysFee(undefined, true)).toBeNull();
        });
    });
});
