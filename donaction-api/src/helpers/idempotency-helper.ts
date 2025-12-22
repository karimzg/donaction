/**
 * Idempotency helper for payment intent deduplication
 * Prevents duplicate payment intents on retry scenarios
 */

import { KlubDonPaymentEntity } from '../_types';

/**
 * Finds an existing payment intent by idempotency key
 * @param idempotencyKey - Unique key for the payment request
 * @returns Existing payment record with client_secret or null
 */
export async function findExistingPaymentByIdempotencyKey(
    idempotencyKey: string
): Promise<KlubDonPaymentEntity | null> {
    if (!idempotencyKey) {
        return null;
    }

    const existingPayment = await strapi.db
        .query('api::klub-don-payment.klub-don-payment')
        .findOne({
            where: { idempotency_key: idempotencyKey },
            populate: { klub_don: true },
        });

    return existingPayment as KlubDonPaymentEntity | null;
}

/**
 * Validates idempotency key format
 * @param idempotencyKey - Key to validate
 * @returns True if valid UUID v4 format
 */
export function isValidIdempotencyKey(idempotencyKey: string): boolean {
    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
        return false;
    }
    const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(idempotencyKey);
}
