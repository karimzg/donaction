/** Statuses that indicate the event should not be reprocessed */
export const DUPLICATE_STATUSES = ['processed', 'processing', 'ignored'] as const;

/**
 * Check if a webhook log status indicates a duplicate event.
 * Includes 'processing' to prevent concurrent double-processing
 * (complementary to the optimistic lock in the controller).
 */
export const isDuplicateStatus = (status: string): boolean =>
    (DUPLICATE_STATUSES as readonly string[]).includes(status);
