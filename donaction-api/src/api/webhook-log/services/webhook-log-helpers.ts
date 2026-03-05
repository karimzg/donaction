import type { WebhookLogStatus } from '../../../_types';

/** Statuses that indicate the event should not be reprocessed */
export const DUPLICATE_STATUSES: readonly WebhookLogStatus[] = [
    'processed',
    'processing',
    'ignored',
];

/**
 * Check if a webhook log status indicates a duplicate event.
 * Includes 'processing' to prevent concurrent double-processing
 * (complementary to the optimistic lock in the controller).
 *
 * Accepts `string` to support untyped DB query results.
 */
export const isDuplicateStatus = (status: WebhookLogStatus | string): boolean =>
    (DUPLICATE_STATUSES as readonly string[]).includes(status);
