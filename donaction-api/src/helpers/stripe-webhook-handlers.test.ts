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
import { logSimple, strapiLog } from './logger';
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
