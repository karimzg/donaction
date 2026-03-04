import { describe, it, expect } from 'vitest';
import {
    checkIdempotence,
    buildWebhookLogData,
    validateWebhookEventParams,
    ExistingWebhookLog,
    LogWebhookEventParams,
} from './webhookLogHelpers';

describe('checkIdempotence', () => {
    describe('when no existing log', () => {
        it('returns create action', () => {
            const result = checkIdempotence(null);
            expect(result).toEqual({ isDuplicate: false, action: 'create' });
        });
    });

    describe('when existing log with status "received"', () => {
        it('returns mark_ignored action', () => {
            const existing: ExistingWebhookLog = {
                id: 1,
                event_id: 'evt_123',
                status: 'received',
            };
            const result = checkIdempotence(existing);
            expect(result).toEqual({ isDuplicate: true, action: 'mark_ignored' });
        });
    });

    describe('when existing log with status "processed"', () => {
        it('returns mark_ignored action', () => {
            const existing: ExistingWebhookLog = {
                id: 2,
                event_id: 'evt_456',
                status: 'processed',
            };
            const result = checkIdempotence(existing);
            expect(result).toEqual({ isDuplicate: true, action: 'mark_ignored' });
        });
    });

    describe('when existing log with status "failed"', () => {
        it('returns mark_ignored action', () => {
            const existing: ExistingWebhookLog = {
                id: 3,
                event_id: 'evt_789',
                status: 'failed',
            };
            const result = checkIdempotence(existing);
            expect(result).toEqual({ isDuplicate: true, action: 'mark_ignored' });
        });
    });

    describe('when existing log already "ignored"', () => {
        it('returns skip action (no-op)', () => {
            const existing: ExistingWebhookLog = {
                id: 4,
                event_id: 'evt_dup',
                status: 'ignored',
            };
            const result = checkIdempotence(existing);
            expect(result).toEqual({ isDuplicate: true, action: 'skip' });
        });
    });

    describe('when existing log with status "processing"', () => {
        it('returns mark_ignored action', () => {
            const existing: ExistingWebhookLog = {
                id: 5,
                event_id: 'evt_proc',
                status: 'processing',
            };
            const result = checkIdempotence(existing);
            expect(result).toEqual({ isDuplicate: true, action: 'mark_ignored' });
        });
    });
});

describe('buildWebhookLogData', () => {
    it('builds correct data object with all fields', () => {
        const params: LogWebhookEventParams = {
            eventId: 'evt_test_123',
            eventType: 'payment_intent.succeeded',
            source: 'connect',
            payload: { id: 'pi_123', amount: 1000 },
            stripeAccountId: 'acct_abc',
        };

        const data = buildWebhookLogData(params);

        expect(data).toEqual({
            event_id: 'evt_test_123',
            event_type: 'payment_intent.succeeded',
            source: 'connect',
            payload: { id: 'pi_123', amount: 1000 },
            stripe_account_id: 'acct_abc',
            status: 'received',
            retry_count: 0,
        });
    });

    it('builds data without optional stripeAccountId', () => {
        const params: LogWebhookEventParams = {
            eventId: 'evt_platform_1',
            eventType: 'charge.succeeded',
            source: 'platform',
            payload: { id: 'ch_123' },
        };

        const data = buildWebhookLogData(params);

        expect(data.stripe_account_id).toBeUndefined();
        expect(data.source).toBe('platform');
        expect(data.status).toBe('received');
        expect(data.retry_count).toBe(0);
    });
});

describe('validateWebhookEventParams', () => {
    const validParams: LogWebhookEventParams = {
        eventId: 'evt_123',
        eventType: 'payment_intent.succeeded',
        source: 'platform',
        payload: { test: true },
    };

    it('returns no errors for valid params', () => {
        const errors = validateWebhookEventParams(validParams);
        expect(errors).toHaveLength(0);
    });

    it('returns error when eventId is missing', () => {
        const errors = validateWebhookEventParams({ ...validParams, eventId: '' });
        expect(errors).toContain('eventId is required');
    });

    it('returns error when eventType is missing', () => {
        const errors = validateWebhookEventParams({ ...validParams, eventType: '' });
        expect(errors).toContain('eventType is required');
    });

    it('returns error when source is invalid', () => {
        const errors = validateWebhookEventParams({
            ...validParams,
            source: 'invalid' as any,
        });
        expect(errors).toContain('source must be "platform" or "connect"');
    });

    it('returns error when payload is missing', () => {
        const errors = validateWebhookEventParams({
            ...validParams,
            payload: undefined as any,
        });
        expect(errors).toContain('payload is required');
    });

    it('returns multiple errors for multiple missing fields', () => {
        const errors = validateWebhookEventParams({});
        expect(errors.length).toBeGreaterThanOrEqual(3);
    });
});
