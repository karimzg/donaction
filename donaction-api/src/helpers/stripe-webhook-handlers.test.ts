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

import { handleWebhookEvent } from './stripe-webhook-handlers';
import { syncAccountStatus } from './stripe-connect-helper';
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

    it('routes account.application.deauthorized to syncAccountStatus', async () => {
        await handleWebhookEvent(
            mockStrapi,
            makeEvent('account.application.deauthorized')
        );
        expect(syncAccountStatus).toHaveBeenCalledWith(
            mockStrapi,
            'acct_test'
        );
    });

    it('routes charge.dispute.created without error', async () => {
        const event = makeEvent('charge.dispute.created');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        // Stub handler — syncAccountStatus not called for disputes
        expect(syncAccountStatus).not.toHaveBeenCalled();
    });

    it('routes charge.dispute.updated without error', async () => {
        const event = makeEvent('charge.dispute.updated');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
    });

    it('routes charge.dispute.closed without error', async () => {
        const event = makeEvent('charge.dispute.closed');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
    });

    it('routes payout.paid without error', async () => {
        const event = makeEvent('payout.paid');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
    });

    it('routes payout.failed without error', async () => {
        const event = makeEvent('payout.failed');
        await expect(
            handleWebhookEvent(mockStrapi, event)
        ).resolves.toBeUndefined();
        expect(syncAccountStatus).not.toHaveBeenCalled();
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
