import { WebhookLogSource, WebhookLogStatus } from '../../../_types';

/**
 * Parameters for creating a webhook log entry
 */
export interface LogWebhookEventParams {
    eventId: string;
    eventType: string;
    source: WebhookLogSource;
    payload: Record<string, unknown>;
    stripeAccountId?: string;
}

/**
 * Represents an existing webhook log record for idempotence checks
 */
export interface ExistingWebhookLog {
    id: number;
    event_id: string;
    status: WebhookLogStatus;
}

/**
 * Result of an idempotence check
 */
export interface IdempotenceResult {
    isDuplicate: boolean;
    action: 'create' | 'mark_ignored' | 'skip';
}

/**
 * Determine the idempotence action for an incoming webhook event.
 *
 * Rules:
 * - If no existing log → create new entry
 * - If existing log with status !== 'ignored' → mark as ignored
 * - If existing log already ignored → skip (no-op)
 */
export const checkIdempotence = (
    existing: ExistingWebhookLog | null
): IdempotenceResult => {
    if (!existing) {
        return { isDuplicate: false, action: 'create' };
    }

    if (existing.status === 'ignored') {
        return { isDuplicate: true, action: 'skip' };
    }

    return { isDuplicate: true, action: 'mark_ignored' };
};

/**
 * Build the data object for creating a new webhook log entry
 */
export const buildWebhookLogData = (params: LogWebhookEventParams) => ({
    event_id: params.eventId,
    event_type: params.eventType,
    source: params.source,
    payload: params.payload,
    stripe_account_id: params.stripeAccountId,
    status: 'received' as const,
    retry_count: 0,
});

/**
 * Validate webhook event parameters
 */
export const validateWebhookEventParams = (
    params: Partial<LogWebhookEventParams>
): string[] => {
    const errors: string[] = [];

    if (!params.eventId) errors.push('eventId is required');
    if (!params.eventType) errors.push('eventType is required');
    if (!params.source) errors.push('source is required');
    if (!['platform', 'connect'].includes(params.source || '')) {
        errors.push('source must be "platform" or "connect"');
    }
    if (!params.payload) errors.push('payload is required');

    return errors;
};
