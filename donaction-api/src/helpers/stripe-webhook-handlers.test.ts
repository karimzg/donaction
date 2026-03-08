import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock stripe-connect-helper before importing handlers
vi.mock('./stripe-connect-helper', () => ({
    syncAccountStatus: vi.fn().mockResolvedValue({}),
    stripe: {
        events: { retrieve: vi.fn() },
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
    BREVO_TEMPLATES: { SUPER_ADMIN_ALERT_ASSO_CREATE_FAILED: 27, SUPER_ADMIN_ALERT_STRIPE: 29, LEADER_ALERT: 30 },
}));

import {
    handleWebhookEvent,
    handleAccountDeauthorized,
} from './stripe-webhook-handlers';
import { syncAccountStatus } from './stripe-connect-helper';
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

    it('routes charge.dispute.created and logs dispute info', async () => {
        const event = makeEvent('charge.dispute.created');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(logSimple).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('charge.dispute.created'),
            })
        );
    });

    it('routes charge.dispute.updated and logs dispute info', async () => {
        const event = makeEvent('charge.dispute.updated');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(logSimple).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('charge.dispute.updated'),
            })
        );
    });

    it('routes charge.dispute.closed and logs dispute info', async () => {
        const event = makeEvent('charge.dispute.closed');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(logSimple).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('charge.dispute.closed'),
            })
        );
    });

    it('routes charge.dispute.funds_withdrawn and logs dispute info', async () => {
        const event = makeEvent('charge.dispute.funds_withdrawn');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(logSimple).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    'charge.dispute.funds_withdrawn'
                ),
            })
        );
    });

    it('routes charge.dispute.funds_reinstated and logs dispute info', async () => {
        const event = makeEvent('charge.dispute.funds_reinstated');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
        expect(logSimple).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    'charge.dispute.funds_reinstated'
                ),
            })
        );
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
