import { describe, it, expect } from 'vitest';
import { isDuplicateStatus, DUPLICATE_STATUSES } from './webhook-log-helpers';
import type { WebhookLogStatus } from '../../../_types';

/**
 * Unit tests for webhook-log idempotence logic (US-WH-001)
 *
 * Tests the exported pure helper `isDuplicateStatus` which determines
 * whether a webhook event should be skipped based on its current status.
 */
describe('isDuplicateStatus', () => {
    it('returns true for processed events', () => {
        expect(isDuplicateStatus('processed')).toBe(true);
    });

    it('returns true for ignored events', () => {
        expect(isDuplicateStatus('ignored')).toBe(true);
    });

    it('returns true for events currently being processed (prevents concurrent double-processing)', () => {
        expect(isDuplicateStatus('processing')).toBe(true);
    });

    it('returns false for received events (allows first processing)', () => {
        expect(isDuplicateStatus('received')).toBe(false);
    });

    it('returns false for failed events (allows retry)', () => {
        expect(isDuplicateStatus('failed')).toBe(false);
    });

    it('covers all WebhookLogStatus values', () => {
        const allStatuses: WebhookLogStatus[] = [
            'received',
            'processing',
            'processed',
            'failed',
            'ignored',
        ];
        const duplicates = allStatuses.filter(isDuplicateStatus);
        const retryable = allStatuses.filter((s) => !isDuplicateStatus(s));

        expect(duplicates).toEqual(['processing', 'processed', 'ignored']);
        expect(retryable).toEqual(['received', 'failed']);
    });
});

describe('DUPLICATE_STATUSES', () => {
    it('contains exactly processed, processing, and ignored', () => {
        expect([...DUPLICATE_STATUSES]).toEqual([
            'processed',
            'processing',
            'ignored',
        ]);
    });
});
