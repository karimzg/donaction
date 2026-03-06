import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';
import type { Core } from '@strapi/strapi';
import { TradePolicyEntity } from '../_types';

// Stub env vars before importing module (top-level guard throws without them)
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET_CONNECT', 'whsec_fake');
vi.stubEnv('SUPER_ADMIN_EMAIL', 'admin-test@donaction.fr');

// Mock Stripe client as a class (Stripe SDK uses `new Stripe(...)`)
vi.mock('stripe', () => {
    return {
        default: class MockStripe {
            accounts = {
                create: vi.fn(),
                retrieve: vi.fn(),
            };
            accountLinks = { create: vi.fn() };
            transfers = { create: vi.fn() };
            events = { retrieve: vi.fn() };
        },
    };
});

// Mock logger to suppress output
vi.mock('./logger', () => ({
    logBlock: vi.fn(),
    logSimple: vi.fn(),
    strapiLog: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    COLORS: { reset: '', green: '', blue: '', yellow: '', red: '', gray: '' },
}));

// Mock Brevo email
vi.mock('./emails/sendBrevoTransacEmail', () => ({
    sendBrevoTransacEmail: vi.fn().mockResolvedValue({}),
    BREVO_TEMPLATES: { ADMIN_ALERT: 27 },
}));

const {
    calculateApplicationFee,
    calculatePlatformCommission,
    estimateStripeFees,
    determineDonorPaysFee,
    determineAccountStatus,
    determineVerificationStatus,
    syncAccountStatus,
    sendAccountRestrictedAlert,
    stripe,
} = await import('./stripe-connect-helper');

const { sendBrevoTransacEmail } = await import(
    './emails/sendBrevoTransacEmail'
);
const { strapiLog } = await import('./logger');

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
        donor_pays_fee_project: boolean;
        donor_pays_fee_club: boolean;
        allow_donor_fee_choice: boolean;
    }> = {}
): TradePolicyEntity =>
    ({
        fee_model: overrides.fee_model ?? 'percentage_only',
        commissionPercentage: overrides.commissionPercentage ?? 0,
        fixed_amount: overrides.fixed_amount ?? 0,
        stripe_fee_percentage: overrides.stripe_fee_percentage,
        stripe_fee_fixed: overrides.stripe_fee_fixed,
        stripe_connect: overrides.stripe_connect,
        donor_pays_fee: overrides.donor_pays_fee,
        donor_pays_fee_project: overrides.donor_pays_fee_project,
        donor_pays_fee_club: overrides.donor_pays_fee_club,
        allow_donor_fee_choice: overrides.allow_donor_fee_choice,
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

    // --- unknown fee_model is rejected ---
    describe('unknown fee_model throws', () => {
        it('throws on invalid fee model', () => {
            expect(() =>
                calculatePlatformCommission(
                    10000,
                    makePolicy({
                        fee_model: 'unknown_model' as any,
                        commissionPercentage: 10,
                    })
                )
            ).toThrow('Modèle de frais invalide');
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

    it('uses custom stripe_fee_percentage from policy (fixed fee falls back to default €0.25)', () => {
        const fees = estimateStripeFees(
            10000,
            makePolicy({ stripe_fee_percentage: 2.9 })
        );
        // (10000 * 2.9 / 100) + (0.25 * 100) = 290 + 25 = 315
        expect(fees).toBe(315);
    });

    it('uses custom stripe_fee_fixed from policy (percentage falls back to default 1.5%)', () => {
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

    it('throws on negative stripe_fee_percentage', () => {
        expect(() =>
            estimateStripeFees(10000, makePolicy({ stripe_fee_percentage: -1 }))
        ).toThrow('Pourcentage de frais Stripe invalide');
    });

    it('throws on stripe_fee_percentage > 100', () => {
        expect(() =>
            estimateStripeFees(10000, makePolicy({ stripe_fee_percentage: 101 }))
        ).toThrow('Pourcentage de frais Stripe invalide');
    });

    it('throws on negative stripe_fee_fixed', () => {
        expect(() =>
            estimateStripeFees(10000, makePolicy({ stripe_fee_fixed: -0.5 }))
        ).toThrow('Frais fixes Stripe invalides');
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

describe('determineDonorPaysFee', () => {
    describe('Stripe Connect mode (stripe_connect = true)', () => {
        it('uses project default for project donations', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: true,
                    donor_pays_fee_project: true,
                    allow_donor_fee_choice: true,
                }),
                isProjectDon: true,
                donorChoice: null,
            });
            expect(result).toBe(true);
        });

        it('uses club default for club donations', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: true,
                    donor_pays_fee_club: false,
                    allow_donor_fee_choice: true,
                }),
                isProjectDon: false,
                donorChoice: null,
            });
            expect(result).toBe(false);
        });

        it('respects donor choice when allowed', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: true,
                    donor_pays_fee_project: true,
                    allow_donor_fee_choice: true,
                }),
                isProjectDon: true,
                donorChoice: false,
            });
            expect(result).toBe(false);
        });

        it('ignores donor choice when not allowed', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: true,
                    donor_pays_fee_project: true,
                    allow_donor_fee_choice: false,
                }),
                isProjectDon: true,
                donorChoice: false,
            });
            expect(result).toBe(true);
        });

        it('returns default when donorChoice is undefined', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: true,
                    donor_pays_fee_club: true,
                    allow_donor_fee_choice: true,
                }),
                isProjectDon: false,
                donorChoice: undefined,
            });
            expect(result).toBe(true);
        });

        it('defaults donor_pays_fee_project to true when not set', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: true,
                    allow_donor_fee_choice: false,
                }),
                isProjectDon: true,
                donorChoice: null,
            });
            expect(result).toBe(true);
        });

        it('defaults donor_pays_fee_club to false when not set', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: true,
                    allow_donor_fee_choice: false,
                }),
                isProjectDon: false,
                donorChoice: null,
            });
            expect(result).toBe(false);
        });

        it('respects donor opt-in for club donation when allowed', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: true,
                    donor_pays_fee_club: false,
                    allow_donor_fee_choice: true,
                }),
                isProjectDon: false,
                donorChoice: true,
            });
            expect(result).toBe(true);
        });
    });

    describe('Legacy mode (stripe_connect = false)', () => {
        it('returns donor_pays_fee when set to true', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: false,
                    donor_pays_fee: true,
                }),
                isProjectDon: true,
                donorChoice: null,
            });
            expect(result).toBe(true);
        });

        it('returns donor_pays_fee when set to false', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: false,
                    donor_pays_fee: false,
                }),
                isProjectDon: false,
                donorChoice: true,
            });
            expect(result).toBe(false);
        });

        it('defaults to false when donor_pays_fee is undefined', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: false,
                }),
                isProjectDon: true,
                donorChoice: null,
            });
            expect(result).toBe(false);
        });

        it('ignores donor opt-out in legacy mode (policy enforced)', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    stripe_connect: false,
                    donor_pays_fee: true,
                }),
                isProjectDon: false,
                donorChoice: false,
            });
            expect(result).toBe(true);
        });

        it('falls back to legacy mode when stripe_connect is undefined', () => {
            const result = determineDonorPaysFee({
                tradePolicy: makePolicy({
                    donor_pays_fee: true,
                }),
                isProjectDon: true,
                donorChoice: null,
            });
            expect(result).toBe(true);
        });
    });
});

// ============================
// Test helpers for account status tests
// ============================

/** Build a partial Stripe.Account for testing */
const makeStripeAccount = (
    overrides: Partial<Stripe.Account> = {}
): Stripe.Account =>
    ({
        id: 'acct_test_123',
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
        capabilities: {},
        requirements: {
            currently_due: [],
            disabled_reason: null,
            pending_verification: [],
        },
        ...overrides,
    }) as unknown as Stripe.Account;

/** Build a mock connected account DB record */
const makeConnectedAccount = (overrides: Record<string, any> = {}) => ({
    id: 1,
    documentId: 'doc_abc123',
    stripe_account_id: 'acct_test_123',
    account_status: 'pending',
    klubr: { id: 42, denomination: 'Club Test', uuid: 'klubr-uuid-123' },
    ...overrides,
});

/** Build a mock Strapi instance */
const makeMockStrapi = (overrides: Record<string, any> = {}) => {
    const mockStrapiInstance = {
        db: {
            query: vi.fn().mockReturnValue({
                findOne: vi.fn().mockResolvedValue(makeConnectedAccount()),
            }),
        },
        documents: vi.fn().mockReturnValue({
            update: vi.fn().mockResolvedValue({}),
            create: vi.fn().mockResolvedValue({}),
        }),
        ...overrides,
    };
    return mockStrapiInstance as unknown as Core.Strapi;
};

// ============================
// determineAccountStatus
// ============================

describe('determineAccountStatus', () => {
    it('returns "active" when charges and payouts are enabled', () => {
        const account = makeStripeAccount({
            charges_enabled: true,
            payouts_enabled: true,
        });
        expect(determineAccountStatus(account)).toBe('active');
    });

    it('returns "disabled" when disabled_reason exists', () => {
        const account = makeStripeAccount({
            charges_enabled: false,
            payouts_enabled: false,
            requirements: {
                disabled_reason: 'requirements.past_due',
                currently_due: ['individual.verification.document'],
                pending_verification: [],
            } as any,
        });
        expect(determineAccountStatus(account)).toBe('disabled');
    });

    it('returns "restricted" when currently_due has items but no disabled_reason', () => {
        const account = makeStripeAccount({
            charges_enabled: false,
            payouts_enabled: false,
            requirements: {
                disabled_reason: null,
                currently_due: ['individual.verification.document'],
                pending_verification: [],
            } as any,
        });
        expect(determineAccountStatus(account)).toBe('restricted');
    });

    it('returns "pending" when no special conditions', () => {
        const account = makeStripeAccount({
            charges_enabled: false,
            payouts_enabled: false,
            requirements: {
                disabled_reason: null,
                currently_due: [],
                pending_verification: [],
            } as any,
        });
        expect(determineAccountStatus(account)).toBe('pending');
    });

    it('returns "active" even when currently_due has items if both are enabled', () => {
        const account = makeStripeAccount({
            charges_enabled: true,
            payouts_enabled: true,
            requirements: {
                disabled_reason: null,
                currently_due: ['some_field'],
                pending_verification: [],
            } as any,
        });
        expect(determineAccountStatus(account)).toBe('active');
    });
});

// ============================
// determineVerificationStatus
// ============================

describe('determineVerificationStatus', () => {
    it('returns "unverified" when details not submitted', () => {
        const account = makeStripeAccount({ details_submitted: false });
        expect(determineVerificationStatus(account)).toBe('unverified');
    });

    it('returns "verified" when details submitted and both enabled', () => {
        const account = makeStripeAccount({
            details_submitted: true,
            charges_enabled: true,
            payouts_enabled: true,
        });
        expect(determineVerificationStatus(account)).toBe('verified');
    });

    it('returns "pending" when details submitted but not fully enabled', () => {
        const account = makeStripeAccount({
            details_submitted: true,
            charges_enabled: true,
            payouts_enabled: false,
        });
        expect(determineVerificationStatus(account)).toBe('pending');
    });
});

// ============================
// syncAccountStatus
// ============================

describe('syncAccountStatus', () => {
    let mockStrapiInstance: Core.Strapi;

    beforeEach(() => {
        vi.clearAllMocks();
        mockStrapiInstance = makeMockStrapi();

        // Mock stripe.accounts.retrieve
        vi.mocked(stripe.accounts.retrieve).mockResolvedValue(
            makeStripeAccount({
                charges_enabled: true,
                payouts_enabled: true,
                details_submitted: true,
                capabilities: { card_payments: 'active' } as any,
                requirements: {
                    currently_due: [],
                    disabled_reason: null,
                    pending_verification: [],
                } as any,
            })
        );
    });

    it('syncs active account with correct fields', async () => {
        await syncAccountStatus(mockStrapiInstance, 'acct_test_123');

        const updateCall = vi.mocked(mockStrapiInstance.documents).mock
            .results[0].value.update;
        expect(updateCall).toHaveBeenCalledWith(
            expect.objectContaining({
                documentId: 'doc_abc123',
                data: expect.objectContaining({
                    account_status: 'active',
                    verification_status: 'verified',
                    onboarding_completed: true,
                    charges_enabled: true,
                    payouts_enabled: true,
                }),
            })
        );
    });

    it('does not send admin alert for active accounts', async () => {
        await syncAccountStatus(mockStrapiInstance, 'acct_test_123');
        expect(sendBrevoTransacEmail).not.toHaveBeenCalled();
    });

    it('sends admin alert for restricted accounts (status transition)', async () => {
        vi.mocked(stripe.accounts.retrieve).mockResolvedValue(
            makeStripeAccount({
                charges_enabled: false,
                payouts_enabled: false,
                details_submitted: true,
                requirements: {
                    disabled_reason: null,
                    currently_due: ['individual.verification.document'],
                    pending_verification: [],
                } as any,
            })
        );

        // Connected account was previously 'pending' → now 'restricted' (status changed)
        await syncAccountStatus(mockStrapiInstance, 'acct_test_123');

        // Flush fire-and-forget promise
        await new Promise((r) => setTimeout(r, 0));

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: expect.stringContaining('restricted'),
                params: expect.objectContaining({
                    ACCOUNT_STATUS: 'restricted',
                    STRIPE_ACCOUNT_ID: 'acct_test_123',
                    CLUB_NAME: 'Club Test',
                }),
                tags: expect.arrayContaining([
                    'admin-alert',
                    'stripe-connect',
                    'account-restricted',
                ]),
            })
        );
    });

    it('sends admin alert for disabled accounts (status transition)', async () => {
        vi.mocked(stripe.accounts.retrieve).mockResolvedValue(
            makeStripeAccount({
                charges_enabled: false,
                payouts_enabled: false,
                details_submitted: true,
                requirements: {
                    disabled_reason: 'requirements.past_due',
                    currently_due: [],
                    pending_verification: [],
                } as any,
            })
        );

        // Connected account was previously 'pending' → now 'disabled' (status changed)
        await syncAccountStatus(mockStrapiInstance, 'acct_test_123');

        // Flush fire-and-forget promise
        await new Promise((r) => setTimeout(r, 0));

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({
                    ACCOUNT_STATUS: 'disabled',
                    DISABLED_REASON: 'requirements.past_due',
                }),
                tags: expect.arrayContaining(['account-disabled']),
            })
        );
    });

    it('does not send alert when status remains restricted (deduplication)', async () => {
        // Account is already restricted in DB
        vi.mocked(mockStrapiInstance.db.query).mockReturnValue({
            findOne: vi
                .fn()
                .mockResolvedValue(
                    makeConnectedAccount({ account_status: 'restricted' })
                ),
        } as any);

        vi.mocked(stripe.accounts.retrieve).mockResolvedValue(
            makeStripeAccount({
                charges_enabled: false,
                payouts_enabled: false,
                details_submitted: true,
                requirements: {
                    disabled_reason: null,
                    currently_due: ['individual.verification.document'],
                    pending_verification: [],
                } as any,
            })
        );

        await syncAccountStatus(mockStrapiInstance, 'acct_test_123');

        // Status unchanged → no alert
        expect(sendBrevoTransacEmail).not.toHaveBeenCalled();
    });

    it('sends alert when transitioning from restricted to disabled', async () => {
        // Account was restricted, now disabled (status changed → alert expected)
        vi.mocked(mockStrapiInstance.db.query).mockReturnValue({
            findOne: vi
                .fn()
                .mockResolvedValue(
                    makeConnectedAccount({ account_status: 'restricted' })
                ),
        } as any);

        vi.mocked(stripe.accounts.retrieve).mockResolvedValue(
            makeStripeAccount({
                charges_enabled: false,
                payouts_enabled: false,
                details_submitted: true,
                requirements: {
                    disabled_reason: 'requirements.past_due',
                    currently_due: [],
                    pending_verification: [],
                } as any,
            })
        );

        await syncAccountStatus(mockStrapiInstance, 'acct_test_123');

        // Wait for fire-and-forget alert to complete
        await new Promise((r) => setTimeout(r, 0));

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({
                    ACCOUNT_STATUS: 'disabled',
                }),
            })
        );
    });

    it('does not send alert for pending accounts', async () => {
        vi.mocked(stripe.accounts.retrieve).mockResolvedValue(
            makeStripeAccount({
                charges_enabled: false,
                payouts_enabled: false,
                details_submitted: false,
                requirements: {
                    disabled_reason: null,
                    currently_due: [],
                    pending_verification: [],
                } as any,
            })
        );

        await syncAccountStatus(mockStrapiInstance, 'acct_test_123');
        expect(sendBrevoTransacEmail).not.toHaveBeenCalled();
    });

    it('throws when connected account not found in database', async () => {
        const strapiNoAccount = makeMockStrapi();
        vi.mocked(strapiNoAccount.db.query).mockReturnValue({
            findOne: vi.fn().mockResolvedValue(null),
        } as any);

        await expect(
            syncAccountStatus(strapiNoAccount, 'acct_missing')
        ).rejects.toThrow('Compte connecté introuvable');
    });

    it('updates last_sync timestamp', async () => {
        const before = new Date();
        await syncAccountStatus(mockStrapiInstance, 'acct_test_123');
        const after = new Date();

        const updateCall = vi.mocked(mockStrapiInstance.documents).mock
            .results[0].value.update;
        const lastSync = updateCall.mock.calls[0][0].data.last_sync as Date;
        expect(lastSync.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(lastSync.getTime()).toBeLessThanOrEqual(after.getTime());
    });
});

// ============================
// sendAccountRestrictedAlert
// ============================

describe('sendAccountRestrictedAlert', () => {
    let mockStrapiInstance: Core.Strapi;

    beforeEach(() => {
        vi.clearAllMocks();
        mockStrapiInstance = makeMockStrapi();

        // Mock klubr query for fallback (numeric ID) case
        vi.mocked(mockStrapiInstance.db.query).mockReturnValue({
            findOne: vi.fn().mockResolvedValue({
                denomination: 'Club Test',
                uuid: 'klubr-uuid-123',
            }),
        } as any);
    });

    it('sends email with correct parameters using pre-populated klubr', async () => {
        const stripeAccount = makeStripeAccount({
            charges_enabled: false,
            payouts_enabled: false,
            requirements: {
                disabled_reason: 'requirements.past_due',
                currently_due: ['identity_document', 'bank_account'],
                pending_verification: [],
            } as any,
        });

        await sendAccountRestrictedAlert(
            mockStrapiInstance,
            'acct_test_123',
            'disabled',
            stripeAccount,
            makeConnectedAccount()
        );

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: '[ALERTE] Compte Stripe disabled: Club Test',
                templateId: 27,
                to: [{ email: 'admin-test@donaction.fr', name: 'Admin Donaction' }],
                params: expect.objectContaining({
                    ALERT_TYPE: 'Compte Stripe Connect disabled',
                    CLUB_NAME: 'Club Test',
                    KLUBR_UUID: 'klubr-uuid-123',
                    STRIPE_ACCOUNT_ID: 'acct_test_123',
                    ACCOUNT_STATUS: 'disabled',
                    DISABLED_REASON: 'requirements.past_due',
                    CURRENTLY_DUE: 'identity_document, bank_account',
                }),
            })
        );

        // Should NOT query DB since klubr is already a populated object
        expect(mockStrapiInstance.db.query).not.toHaveBeenCalledWith(
            'api::klubr.klubr'
        );
    });

    it('falls back to DB query when klubr is numeric ID and uses result in email', async () => {
        await sendAccountRestrictedAlert(
            mockStrapiInstance,
            'acct_test_123',
            'restricted',
            makeStripeAccount(),
            makeConnectedAccount({ klubr: 42 })
        );

        // Should have queried for klubr by id
        expect(mockStrapiInstance.db.query).toHaveBeenCalledWith(
            'api::klubr.klubr'
        );
        // And used the result in the email
        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({
                    CLUB_NAME: 'Club Test',
                    KLUBR_UUID: 'klubr-uuid-123',
                }),
            })
        );
    });

    it('handles missing klubr gracefully', async () => {
        await sendAccountRestrictedAlert(
            mockStrapiInstance,
            'acct_test_123',
            'restricted',
            makeStripeAccount(),
            makeConnectedAccount({ klubr: null })
        );

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({
                    CLUB_NAME: 'Inconnu',
                    KLUBR_UUID: 'N/A',
                }),
            })
        );
    });

    it('does not send when SUPER_ADMIN_EMAIL env var is missing', async () => {
        const originalEmail = process.env.SUPER_ADMIN_EMAIL;
        delete process.env.SUPER_ADMIN_EMAIL;

        await sendAccountRestrictedAlert(
            mockStrapiInstance,
            'acct_test_123',
            'restricted',
            makeStripeAccount(),
            makeConnectedAccount()
        );

        expect(sendBrevoTransacEmail).not.toHaveBeenCalled();
        expect(strapiLog.error).toHaveBeenCalledWith(
            expect.stringContaining('SUPER_ADMIN_EMAIL')
        );

        // Restore env
        process.env.SUPER_ADMIN_EMAIL = originalEmail;
    });

    it('does not throw when email sending fails', async () => {
        vi.mocked(sendBrevoTransacEmail).mockRejectedValueOnce(
            new Error('Email service down')
        );

        await expect(
            sendAccountRestrictedAlert(
                mockStrapiInstance,
                'acct_test_123',
                'restricted',
                makeStripeAccount(),
                makeConnectedAccount()
            )
        ).resolves.toBeUndefined();

        // Should log the error
        expect(strapiLog.error).toHaveBeenCalledWith(
            expect.stringContaining('acct_test_123'),
            expect.any(Error)
        );
    });
});
