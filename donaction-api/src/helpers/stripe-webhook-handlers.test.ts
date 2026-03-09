import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock stripe-connect-helper before importing handlers
vi.mock('./stripe-connect-helper', () => ({
    syncAccountStatus: vi.fn().mockResolvedValue({}),
    logFinancialAction: vi.fn().mockResolvedValue({}),
    createTransferToConnectedAccount: vi.fn().mockResolvedValue({ id: 'tr_new_transfer', amount: 5000 }),
    stripe: {
        events: { retrieve: vi.fn() },
        charges: {
            retrieve: vi.fn(),
        },
        transfers: {
            list: vi.fn().mockResolvedValue({ data: [] }),
            retrieve: vi.fn(),
            createReversal: vi.fn().mockResolvedValue({ id: 'trr_test', amount: 5000 }),
            listReversals: vi.fn().mockResolvedValue({ data: [] }),
        },
    },
}));

// Mock logger to suppress output
vi.mock('./logger', () => ({
    logBlock: vi.fn(),
    logSimple: vi.fn(),
    strapiLog: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    COLORS: { reset: '', green: '', blue: '', yellow: '', red: '', gray: '' },
}));

// Mock email sending
vi.mock('./emails/sendBrevoTransacEmail', () => ({
    sendBrevoTransacEmail: vi.fn().mockResolvedValue(undefined),
    BREVO_TEMPLATES: { SUPER_ADMIN_ALERT: 28, SUPER_ADMIN_ALERT_ASSO_CREATE_FAILED: 27, SUPER_ADMIN_ALERT_STRIPE: 29, LEADER_ALERT: 30 },
}));

import {
    handleWebhookEvent,
    handleAccountDeauthorized,
    handleDispute,
} from './stripe-webhook-handlers';
import { syncAccountStatus, logFinancialAction, createTransferToConnectedAccount, stripe as mockStripeClient } from './stripe-connect-helper';
import { logSimple, strapiLog } from './logger';
import { sendBrevoTransacEmail, BREVO_TEMPLATES } from './emails/sendBrevoTransacEmail';
import Stripe from 'stripe';
import { Core } from '@strapi/strapi';

const mockStrapi = {} as Core.Strapi;

/** Build a minimal Stripe event for testing */
const makeEvent = (
    type: string,
    overrides: Partial<Stripe.Event> = {}
): Stripe.Event =>
    ({
        id: 'evt_test_123',
        type,
        data: { object: { id: 'acct_test' } },
        account: 'acct_test',
        ...overrides,
    }) as unknown as Stripe.Event;

/** Build a dispute-specific Stripe event */
const makeDisputeEvent = (
    type: string,
    overrides: Record<string, any> = {}
): Stripe.Event =>
    ({
        id: 'evt_dispute_123',
        type,
        data: {
            object: {
                id: 'dp_test_123',
                charge: 'ch_test_123',
                payment_intent: 'pi_test_456',
                status: 'needs_response',
                reason: 'fraudulent',
                amount: 5000,
                evidence_details: { due_by: Math.floor(Date.now() / 1000) + 86400 },
                ...overrides,
            },
        },
        account: 'acct_connect_test',
    }) as unknown as Stripe.Event;

/** Mock Stripe charge+transfer lookup used by reverseTransferForDispute and reTransferForDisputeWon */
const mockChargeTransferLookup = (opts: { withReversals?: boolean; rejectReversal?: Error } = {}) => {
    vi.mocked(mockStripeClient.charges.retrieve).mockResolvedValue({
        id: 'ch_test_123',
        transfer: 'tr_test_789',
    } as any);
    vi.mocked(mockStripeClient.transfers.retrieve).mockResolvedValue({
        id: 'tr_test_789',
        amount: 5000,
        metadata: { payment_intent_id: 'pi_test_456' },
    } as any);
    vi.mocked(mockStripeClient.transfers.listReversals).mockResolvedValue({
        data: opts.withReversals
            ? [{ id: 'trr_existing', metadata: { dispute_id: 'dp_test_123' } }]
            : [],
    } as any);
    if (opts.rejectReversal) {
        vi.mocked(mockStripeClient.transfers.createReversal).mockRejectedValueOnce(
            opts.rejectReversal
        );
    }
};

/** Build a mock Strapi instance for dispute tests */
const makeDisputeMockStrapi = (overrides: Record<string, any> = {}) => {
    const mockUpdateDoc = overrides.mockUpdateDoc || vi.fn().mockResolvedValue({});
    const mockFindOnePayment = overrides.mockFindOnePayment || vi.fn().mockResolvedValue({
        intent_id: 'pi_test_456',
        klub_don: {
            id: 1,
            documentId: 'doc_don_123',
            klubr: {
                id: 10,
                documentId: 'doc_klubr_456',
                denomination: 'Mon Association',
                uuid: 'klubr-uuid-789',
            },
        },
    });
    const mockGetKlubMembres = overrides.mockGetKlubMembres || vi.fn().mockResolvedValue([]);

    return {
        db: {
            query: vi.fn().mockImplementation((uid: string) => {
                if (uid === 'api::klub-don-payment.klub-don-payment') {
                    return { findOne: mockFindOnePayment };
                }
                if (uid === 'api::connected-account.connected-account') {
                    return { findOne: vi.fn().mockResolvedValue(null) };
                }
                return { findOne: vi.fn() };
            }),
        },
        documents: vi.fn().mockReturnValue({
            update: mockUpdateDoc,
            create: vi.fn().mockResolvedValue({}),
        }),
        service: vi.fn().mockImplementation((uid: string) => {
            if (uid === 'api::klubr-membre.klubr-membre') {
                return { getKlubMembres: mockGetKlubMembres };
            }
            return {};
        }),
    } as unknown as Core.Strapi;
};

describe('handleWebhookEvent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('routes account.updated to syncAccountStatus', async () => {
        await handleWebhookEvent(mockStrapi, makeEvent('account.updated'));
        expect(syncAccountStatus).toHaveBeenCalledWith(
            mockStrapi,
            'acct_test'
        );
    });

    it('routes account.external_account.created to syncAccountStatus', async () => {
        await handleWebhookEvent(
            mockStrapi,
            makeEvent('account.external_account.created')
        );
        expect(syncAccountStatus).toHaveBeenCalledWith(
            mockStrapi,
            'acct_test'
        );
    });

    it('routes account.external_account.updated to syncAccountStatus', async () => {
        await handleWebhookEvent(
            mockStrapi,
            makeEvent('account.external_account.updated')
        );
        expect(syncAccountStatus).toHaveBeenCalledWith(
            mockStrapi,
            'acct_test'
        );
    });

    it('routes capability.updated to syncAccountStatus', async () => {
        await handleWebhookEvent(
            mockStrapi,
            makeEvent('capability.updated')
        );
        expect(syncAccountStatus).toHaveBeenCalledWith(
            mockStrapi,
            'acct_test'
        );
    });

    it('routes person.created to syncAccountStatus', async () => {
        await handleWebhookEvent(mockStrapi, makeEvent('person.created'));
        expect(syncAccountStatus).toHaveBeenCalledWith(
            mockStrapi,
            'acct_test'
        );
    });

    it('routes person.updated to syncAccountStatus', async () => {
        await handleWebhookEvent(mockStrapi, makeEvent('person.updated'));
        expect(syncAccountStatus).toHaveBeenCalledWith(
            mockStrapi,
            'acct_test'
        );
    });

    it('routes account.application.deauthorized (does NOT call syncAccountStatus)', async () => {
        // handleAccountDeauthorized does direct DB updates, not syncAccountStatus
        // We need a mock strapi with db.query and documents for this handler
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockStrapiForDeauth = {
            db: {
                query: vi.fn().mockReturnValue({
                    findOne: vi.fn().mockResolvedValue(null),
                }),
            },
            documents: vi.fn().mockReturnValue({
                update: mockUpdateDoc,
            }),
        } as unknown as Core.Strapi;

        await handleWebhookEvent(
            mockStrapiForDeauth,
            makeEvent('account.application.deauthorized')
        );
        expect(syncAccountStatus).not.toHaveBeenCalled();
    });

    it('routes charge.dispute.created to handleDispute and updates klub_don', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });
        const event = makeDisputeEvent('charge.dispute.created');
        await handleWebhookEvent(mockDisputeStrapi, event);
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                documentId: 'doc_don_123',
                data: expect.objectContaining({ disputeId: 'dp_test_123' }),
            })
        );
    });

    it('routes charge.dispute.updated to handleDispute and updates klub_don', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });
        const event = makeDisputeEvent('charge.dispute.updated');
        await handleWebhookEvent(mockDisputeStrapi, event);
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('routes charge.dispute.closed to handleDispute and updates klub_don', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });
        const event = makeDisputeEvent('charge.dispute.closed', { status: 'won' });
        await handleWebhookEvent(mockDisputeStrapi, event);
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ disputeStatus: 'won' }),
            })
        );
    });

    it('routes charge.dispute.funds_withdrawn to handleDispute and updates klub_don', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });
        const event = makeDisputeEvent('charge.dispute.funds_withdrawn');
        await handleWebhookEvent(mockDisputeStrapi, event);
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('routes charge.dispute.funds_reinstated to handleDispute and updates klub_don', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });
        const event = makeDisputeEvent('charge.dispute.funds_reinstated');
        await handleWebhookEvent(mockDisputeStrapi, event);
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('routes payout.paid and logs payout info', async () => {
        const event = makeEvent('payout.paid');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(logSimple).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('payé'),
            })
        );
    });

    it('routes payout.failed and logs error', async () => {
        const event = makeEvent('payout.failed');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(strapiLog.error).toHaveBeenCalledWith(
            expect.stringContaining('échoué')
        );
    });

    it('does not call syncAccountStatus for unknown event types', async () => {
        await handleWebhookEvent(mockStrapi, makeEvent('charge.succeeded'));
        expect(syncAccountStatus).not.toHaveBeenCalled();
    });

    it('propagates errors from syncAccountStatus', async () => {
        vi.mocked(syncAccountStatus).mockRejectedValueOnce(
            new Error('sync failed')
        );

        await expect(
            handleWebhookEvent(mockStrapi, makeEvent('account.updated'))
        ).rejects.toThrow('sync failed');
    });
});

// ---------- handleAccountDeauthorized ----------

describe('handleAccountDeauthorized', () => {
    const makeDeauthEvent = (
        accountId?: string
    ): Stripe.Event =>
        ({
            id: 'evt_deauth_123',
            type: 'account.application.deauthorized',
            data: { object: { id: accountId || 'acct_deauth' } },
            account: accountId,
        }) as unknown as Stripe.Event;

    const makeConnectedAccount = (overrides: Record<string, any> = {}) => ({
        id: 1,
        documentId: 'doc_connected_123',
        stripe_account_id: 'acct_deauth_test',
        account_status: 'active',
        klubr: {
            id: 10,
            documentId: 'doc_klubr_456',
            denomination: 'Mon Association',
            uuid: 'klubr-uuid-789',
        },
        ...overrides,
    });

    let mockUpdateDoc: ReturnType<typeof vi.fn>;
    let mockFindOne: ReturnType<typeof vi.fn>;
    let mockGetKlubMembres: ReturnType<typeof vi.fn>;
    let mockStrapiDeauth: Core.Strapi;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUpdateDoc = vi.fn().mockResolvedValue({});
        mockFindOne = vi.fn().mockResolvedValue(makeConnectedAccount());
        mockGetKlubMembres = vi.fn().mockResolvedValue([
            {
                email: 'leader@monasso.fr',
                nom: 'Dupont',
                prenom: 'Jean',
                role: 'KlubMemberLeader',
                users_permissions_user: { email: 'leader-user@monasso.fr' },
            },
        ]);

        mockStrapiDeauth = {
            db: {
                query: vi.fn().mockImplementation((uid: string) => {
                    if (uid === 'api::connected-account.connected-account') {
                        return { findOne: mockFindOne };
                    }
                    return { findOne: vi.fn() };
                }),
            },
            documents: vi.fn().mockReturnValue({
                update: mockUpdateDoc,
            }),
            service: vi.fn().mockImplementation((uid: string) => {
                if (uid === 'api::klubr-membre.klubr-membre') {
                    return { getKlubMembres: mockGetKlubMembres };
                }
                return {};
            }),
        } as unknown as Core.Strapi;
    });

    it('returns early when event has no account id', async () => {
        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent(undefined)
        );

        expect(strapiLog.error).toHaveBeenCalledWith(
            expect.stringContaining('sans account id')
        );
        expect(mockFindOne).not.toHaveBeenCalled();
    });

    it('returns early when connected account not found', async () => {
        mockFindOne.mockResolvedValue(null);

        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent('acct_unknown')
        );

        expect(strapiLog.error).toHaveBeenCalledWith(
            expect.stringContaining('introuvable')
        );
        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('disables connected account (status, charges, payouts)', async () => {
        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent('acct_deauth_test')
        );

        // Verify connected-account update
        expect(mockStrapiDeauth.documents).toHaveBeenCalledWith(
            'api::connected-account.connected-account'
        );
        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                documentId: 'doc_connected_123',
                data: expect.objectContaining({
                    account_status: 'disabled',
                    charges_enabled: false,
                    payouts_enabled: false,
                    last_sync: expect.any(Date),
                }),
            })
        );
    });

    it('disables klubr donationEligible', async () => {
        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent('acct_deauth_test')
        );

        // Verify klubr update
        expect(mockStrapiDeauth.documents).toHaveBeenCalledWith(
            'api::klubr.klubr'
        );
        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                documentId: 'doc_klubr_456',
                data: { donationEligible: false },
            })
        );
    });

    it('sends admin alert email', async () => {
        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent('acct_deauth_test')
        );

        // Flush async fire-and-forget chains
        await new Promise(process.nextTick);

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                destIsAdmin: true,
                tags: expect.arrayContaining(['admin-alert', 'account-deauthorized']),
                params: expect.objectContaining({
                    CLUB_NAME: 'Mon Association',
                    STRIPE_ACCOUNT_ID: 'acct_deauth_test',
                    ACCOUNT_STATUS: 'disabled',
                }),
            })
        );
    });

    it('sends LEADER_ALERT to KlubMemberLeader members', async () => {
        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent('acct_deauth_test')
        );

        // Flush async fire-and-forget chains
        await new Promise(process.nextTick);

        expect(mockGetKlubMembres).toHaveBeenCalledWith(
            'doc_klubr_456',
            ['KlubMemberLeader'],
        );
        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                templateId: BREVO_TEMPLATES.LEADER_ALERT,
                to: [{ email: 'leader@monasso.fr', name: 'Jean Dupont' }],
                tags: expect.arrayContaining([
                    'klubr-notification',
                    'account-deauthorized',
                ]),
                params: expect.objectContaining({
                    CLUB_NAME: 'Mon Association',
                }),
            })
        );
    });

    it('skips klubr notification when no leaders found', async () => {
        mockGetKlubMembres.mockResolvedValue([]);

        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent('acct_deauth_test')
        );

        // Flush async fire-and-forget chains
        await new Promise(process.nextTick);

        // Admin alert should still be sent, but not klubr notification
        const calls = vi.mocked(sendBrevoTransacEmail).mock.calls;
        const klubrNotifCalls = calls.filter((c) =>
            (c[0] as any).tags?.includes('klubr-notification')
        );
        expect(klubrNotifCalls).toHaveLength(0);
    });

    it('does not call syncAccountStatus (direct DB update)', async () => {
        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent('acct_deauth_test')
        );

        expect(syncAccountStatus).not.toHaveBeenCalled();
    });

    it('throws on DB error during connected account update', async () => {
        mockUpdateDoc.mockRejectedValueOnce(new Error('DB connection lost'));

        await expect(
            handleAccountDeauthorized(
                mockStrapiDeauth,
                makeDeauthEvent('acct_deauth_test')
            )
        ).rejects.toThrow('DB connection lost');
    });

    it('skips klubr update when klubr has no documentId', async () => {
        mockFindOne.mockResolvedValue(
            makeConnectedAccount({ klubr: { id: 10 } })
        );

        await handleAccountDeauthorized(
            mockStrapiDeauth,
            makeDeauthEvent('acct_deauth_test')
        );

        // Only connected-account update should happen, not klubr
        const docsCalls = (mockStrapiDeauth.documents as any).mock.calls;
        const klubrCalls = docsCalls.filter(
            (c: string[]) => c[0] === 'api::klubr.klubr'
        );
        expect(klubrCalls).toHaveLength(0);
    });
});

// ---------- handleDispute ----------

describe('handleDispute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns early when dispute has no payment_intent', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        const event = makeDisputeEvent('charge.dispute.created', {
            payment_intent: null,
        });

        await handleDispute(mockDisputeStrapi, event);

        expect(strapiLog.error).toHaveBeenCalledWith(
            expect.stringContaining('sans payment_intent')
        );
    });

    it('returns early when payment/don not found', async () => {
        const mockFindOnePayment = vi.fn().mockResolvedValue(null);
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockFindOnePayment });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.created')
        );

        expect(strapiLog.warn).toHaveBeenCalledWith(
            expect.stringContaining('Don non trouvé')
        );
    });

    it('updates klub_don with dispute status (charge.dispute.created)', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.created')
        );

        expect(mockDisputeStrapi.documents).toHaveBeenCalledWith(
            'api::klub-don.klub-don'
        );
        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                documentId: 'doc_don_123',
                data: expect.objectContaining({
                    disputeStatus: 'open',
                    disputeId: 'dp_test_123',
                    disputeReason: 'fraudulent',
                }),
            })
        );
    });

    it('maps dispute status correctly for "under_review"', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.updated', { status: 'under_review' })
        );

        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    disputeStatus: 'under_review',
                }),
            })
        );
    });

    it('sets disputeClosedAt when dispute is won', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.closed', { status: 'won' })
        );

        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    disputeStatus: 'won',
                    disputeClosedAt: expect.any(Date),
                }),
            })
        );
    });

    it('sets disputeClosedAt when dispute is lost', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.closed', { status: 'lost' })
        );

        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    disputeStatus: 'lost',
                    disputeClosedAt: expect.any(Date),
                }),
            })
        );
    });

    it('sends admin alert on charge.dispute.created', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.created')
        );

        // Flush async fire-and-forget
        await new Promise(process.nextTick);

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                destIsAdmin: true,
                tags: expect.arrayContaining(['admin-alert', 'dispute-created']),
                params: expect.objectContaining({
                    CLUB_NAME: 'Mon Association',
                    STRIPE_ACCOUNT_ID: 'acct_connect_test',
                }),
            })
        );
    });

    it('attempts reverse transfer on charge.dispute.funds_withdrawn when amount > 0', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        expect(mockStripeClient.charges.retrieve).toHaveBeenCalledWith('ch_test_123');
        expect(mockStripeClient.transfers.retrieve).toHaveBeenCalledWith('tr_test_789');
        expect(mockStripeClient.transfers.listReversals).toHaveBeenCalledWith(
            'tr_test_789',
            { limit: 100 },
        );
        expect(mockStripeClient.transfers.createReversal).toHaveBeenCalledWith(
            'tr_test_789',
            expect.objectContaining({
                amount: 5000,
                metadata: expect.objectContaining({
                    dispute_id: 'dp_test_123',
                }),
            })
        );
    });

    it('skips when charge has no transfer', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();

        vi.mocked(mockStripeClient.charges.retrieve).mockResolvedValue({
            id: 'ch_test_123',
            transfer: null,
        } as any);

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        expect(mockStripeClient.transfers.createReversal).not.toHaveBeenCalled();
    });

    it('does NOT reverse transfer on charge.dispute.created (waits for funds_withdrawn)', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.created')
        );

        expect(mockStripeClient.charges.retrieve).not.toHaveBeenCalled();
        expect(mockStripeClient.transfers.createReversal).not.toHaveBeenCalled();
    });

    it('sends LEADER_ALERT notification when dispute is lost', async () => {
        const mockGetKlubMembres = vi.fn().mockResolvedValue([
            {
                email: 'leader@asso.fr',
                nom: 'Martin',
                prenom: 'Pierre',
                users_permissions_user: { email: 'leader-user@asso.fr' },
            },
        ]);
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockGetKlubMembres });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.closed', { status: 'lost' })
        );

        // Flush async fire-and-forget
        await new Promise(process.nextTick);

        expect(mockGetKlubMembres).toHaveBeenCalledWith('doc_klubr_456', [
            'KlubMemberLeader',
            'AdminEditor',
        ]);
        // Club leaders notification
        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                templateId: BREVO_TEMPLATES.LEADER_ALERT,
                to: [{ email: 'leader@asso.fr', name: 'Pierre Martin' }],
                tags: expect.arrayContaining(['klubr-notification', 'dispute-lost']),
            })
        );
        // Platform super admin notification
        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                templateId: BREVO_TEMPLATES.LEADER_ALERT,
                destIsAdmin: true,
                tags: expect.arrayContaining(['admin-alert', 'dispute-lost']),
            })
        );
    });

    it('does NOT send LEADER_ALERT when dispute is won', async () => {
        const mockGetKlubMembres = vi.fn().mockResolvedValue([]);
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockGetKlubMembres });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.closed', { status: 'won' })
        );

        // Flush async fire-and-forget
        await new Promise(process.nextTick);

        // Leaders should NOT be queried for won disputes
        expect(mockGetKlubMembres).not.toHaveBeenCalled();
    });

    it('logs financial audit on dispute closure', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.closed', { status: 'lost' })
        );

        // Flush async fire-and-forget
        await new Promise(process.nextTick);

        expect(logFinancialAction).toHaveBeenCalledWith(
            mockDisputeStrapi,
            'dispute_lost',
            'doc_klubr_456',
            'doc_don_123',
            5000,
            'dp_test_123',
            expect.objectContaining({
                dispute_status: 'lost',
                dispute_reason: 'fraudulent',
            }),
        );
    });

    it('does not reverse transfer when amount is 0', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn', { amount: 0 })
        );

        expect(mockStripeClient.charges.retrieve).not.toHaveBeenCalled();
    });

    it('skips processing on duplicate charge.dispute.created (idempotency)', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockFindOnePayment = vi.fn().mockResolvedValue({
            intent_id: 'pi_test_456',
            klub_don: {
                id: 1,
                documentId: 'doc_don_123',
                disputeId: 'dp_test_123', // Already processed
                klubr: {
                    id: 10,
                    documentId: 'doc_klubr_456',
                    denomination: 'Mon Association',
                    uuid: 'klubr-uuid-789',
                },
            },
        });
        const mockDisputeStrapi = makeDisputeMockStrapi({
            mockUpdateDoc,
            mockFindOnePayment,
        });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.created')
        );

        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('logs dispute_opened audit on charge.dispute.created', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.created')
        );

        await new Promise(process.nextTick);

        expect(logFinancialAction).toHaveBeenCalledWith(
            mockDisputeStrapi,
            'dispute_opened',
            'doc_klubr_456',
            'doc_don_123',
            5000,
            'dp_test_123',
            expect.objectContaining({
                dispute_status: 'needs_response',
                dispute_reason: 'fraudulent',
            }),
        );
    });

    it('catches and logs reversal Stripe API errors without throwing', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup({ rejectReversal: new Error('Stripe API failure') });

        // Should not throw — error is caught and logged
        await expect(
            handleDispute(
                mockDisputeStrapi,
                makeDisputeEvent('charge.dispute.funds_withdrawn')
            )
        ).resolves.toBeUndefined();

        expect(strapiLog.error).toHaveBeenCalledWith(
            expect.stringContaining('Echec du reversal'),
            expect.any(Error),
        );
    });

    it('sends admin alert on charge.dispute.closed', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.closed', { status: 'won' })
        );

        await new Promise(process.nextTick);

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                destIsAdmin: true,
                tags: expect.arrayContaining(['admin-alert', 'dispute-won']),
            })
        );
    });

    it('skips reversal when already reversed for this dispute (idempotency)', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup({ withReversals: true });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        expect(mockStripeClient.transfers.createReversal).not.toHaveBeenCalled();
    });

    it('does NOT set disputeClosedAt on non-terminal status', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.updated', { status: 'under_review' })
        );

        const updateCall = mockUpdateDoc.mock.calls[0][0];
        expect(updateCall.data).not.toHaveProperty('disputeClosedAt');
    });

    it('maps warning_under_review to distinct status', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.updated', { status: 'warning_under_review' })
        );

        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    disputeStatus: 'warning_under_review',
                }),
            })
        );
    });

    it('skips reversal on funds_withdrawn when accountId is unknown', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        const event = {
            ...makeDisputeEvent('charge.dispute.funds_withdrawn'),
            account: undefined,
        } as unknown as Stripe.Event;

        await handleDispute(mockDisputeStrapi, event);

        expect(mockStripeClient.charges.retrieve).not.toHaveBeenCalled();
    });

    it('logs transfer_reversed audit after successful reversal', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        expect(logFinancialAction).toHaveBeenCalledWith(
            mockDisputeStrapi,
            'transfer_reversed',
            'doc_klubr_456',
            'doc_don_123',
            5000,
            'trr_test',
            expect.objectContaining({
                dispute_id: 'dp_test_123',
                original_transfer_id: 'tr_test_789',
            }),
        );
    });

    it('logs failed reversal audit when createReversal throws', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup({ rejectReversal: new Error('Insufficient funds') });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        // Should log a failed transfer_reversal_failed audit
        expect(logFinancialAction).toHaveBeenCalledWith(
            mockDisputeStrapi,
            'transfer_reversal_failed',
            'doc_klubr_456',
            'doc_don_123',
            5000,
            'failed_dp_test_123',
            expect.objectContaining({
                dispute_id: 'dp_test_123',
                status: 'failed',
                error: 'Insufficient funds',
            }),
        );
    });

    it('warns on unknown dispute status', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.updated', { status: 'some_future_status' })
        );

        expect(strapiLog.warn).toHaveBeenCalledWith(
            expect.stringContaining("Statut dispute inconnu: 'some_future_status'")
        );
    });

    it('handles expanded payment_intent object', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });

        // payment_intent as expanded object instead of string
        const event = makeDisputeEvent('charge.dispute.created', {
            payment_intent: { id: 'pi_test_456', object: 'payment_intent' },
        });

        await handleDispute(mockDisputeStrapi, event);

        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                documentId: 'doc_don_123',
            })
        );
    });

    it('skips duplicate closed event when disputeClosedAt already set', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockFindOnePayment = vi.fn().mockResolvedValue({
            intent_id: 'pi_test_456',
            klub_don: {
                id: 1,
                documentId: 'doc_don_123',
                disputeId: 'dp_test_123',
                disputeClosedAt: '2026-03-08T10:00:00Z', // Already closed
                klubr: {
                    id: 10,
                    documentId: 'doc_klubr_456',
                    denomination: 'Mon Association',
                    uuid: 'klubr-uuid-789',
                },
            },
        });
        const mockDisputeStrapi = makeDisputeMockStrapi({
            mockUpdateDoc,
            mockFindOnePayment,
        });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.closed', { status: 'lost' })
        );

        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('maps funds_reinstated to won status', async () => {
        const mockUpdateDoc = vi.fn().mockResolvedValue({});
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockUpdateDoc });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_reinstated', { status: 'won' })
        );

        expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    disputeStatus: 'won',
                }),
            })
        );
    });

    it('re-transfers funds on charge.dispute.funds_reinstated', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_reinstated', { status: 'won' })
        );

        expect(mockStripeClient.charges.retrieve).toHaveBeenCalledWith('ch_test_123');
        expect(mockStripeClient.transfers.retrieve).toHaveBeenCalledWith('tr_test_789');
        expect(logFinancialAction).toHaveBeenCalledWith(
            mockDisputeStrapi,
            'transfer_created',
            'doc_klubr_456',
            'doc_don_123',
            5000,
            'tr_new_transfer',
            expect.objectContaining({
                reason: 'dispute_funds_reinstated',
            }),
        );
    });

    it('sends admin alert when reversal fails', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup({ rejectReversal: new Error('Stripe API failure') });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        await new Promise(process.nextTick);

        expect(sendBrevoTransacEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                destIsAdmin: true,
                tags: expect.arrayContaining(['admin-alert', 'dispute-reversal_failed']),
            })
        );
    });

    it('uses transfer_reversal_failed audit type on failed reversal', async () => {
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup({ rejectReversal: new Error('Insufficient funds') });

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        expect(logFinancialAction).toHaveBeenCalledWith(
            mockDisputeStrapi,
            'transfer_reversal_failed',
            'doc_klubr_456',
            'doc_don_123',
            5000,
            'failed_dp_test_123',
            expect.objectContaining({
                status: 'failed',
            }),
        );
    });

    // ---------- storedTransferId fast path (issue #192) ----------

    it('uses stored transfer_id for O(1) lookup on funds_withdrawn (skips charges.retrieve)', async () => {
        const mockFindOnePayment = vi.fn().mockResolvedValue({
            intent_id: 'pi_test_456',
            transfer_id: 'tr_stored_123',
            klub_don: {
                id: 1,
                documentId: 'doc_don_123',
                klubr: {
                    id: 10,
                    documentId: 'doc_klubr_456',
                    denomination: 'Mon Association',
                    uuid: 'klubr-uuid-789',
                },
            },
        });
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockFindOnePayment });

        vi.mocked(mockStripeClient.transfers.retrieve).mockResolvedValue({
            id: 'tr_stored_123',
            amount: 5000,
            metadata: {},
        } as any);
        vi.mocked(mockStripeClient.transfers.listReversals).mockResolvedValue({
            data: [],
        } as any);

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        // Should use stored transfer_id directly — no charge lookup
        expect(mockStripeClient.charges.retrieve).not.toHaveBeenCalled();
        expect(mockStripeClient.transfers.retrieve).toHaveBeenCalledWith('tr_stored_123');
        expect(mockStripeClient.transfers.createReversal).toHaveBeenCalledWith(
            'tr_stored_123',
            expect.objectContaining({
                amount: 5000,
                metadata: expect.objectContaining({ dispute_id: 'dp_test_123' }),
            }),
        );
    });

    it('uses stored transfer_id for O(1) lookup on funds_reinstated (skips charges.retrieve)', async () => {
        const mockFindOnePayment = vi.fn().mockResolvedValue({
            intent_id: 'pi_test_456',
            transfer_id: 'tr_stored_456',
            klub_don: {
                id: 1,
                documentId: 'doc_don_123',
                klubr: {
                    id: 10,
                    documentId: 'doc_klubr_456',
                    denomination: 'Mon Association',
                    uuid: 'klubr-uuid-789',
                },
            },
        });
        const mockDisputeStrapi = makeDisputeMockStrapi({ mockFindOnePayment });

        vi.mocked(mockStripeClient.transfers.retrieve).mockResolvedValue({
            id: 'tr_stored_456',
            amount: 5000,
            metadata: {},
        } as any);

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_reinstated', { status: 'won' })
        );

        // Should use stored transfer_id directly — no charge lookup
        expect(mockStripeClient.charges.retrieve).not.toHaveBeenCalled();
        expect(mockStripeClient.transfers.retrieve).toHaveBeenCalledWith('tr_stored_456');
        expect(createTransferToConnectedAccount).toHaveBeenCalledWith(
            5000,
            'acct_connect_test',
            expect.objectContaining({
                dispute_id: 'dp_test_123',
                original_transfer_id: 'tr_stored_456',
            }),
        );
    });

    it('falls back to charge→transfer chain when transfer_id is not stored', async () => {
        // Default mock has no transfer_id
        const mockDisputeStrapi = makeDisputeMockStrapi();
        mockChargeTransferLookup();

        await handleDispute(
            mockDisputeStrapi,
            makeDisputeEvent('charge.dispute.funds_withdrawn')
        );

        // Should fallback to charge retrieval
        expect(mockStripeClient.charges.retrieve).toHaveBeenCalledWith('ch_test_123');
        expect(mockStripeClient.transfers.retrieve).toHaveBeenCalledWith('tr_test_789');
    });
});
