/**
 * Resolves the donorPaysFee value based on Stripe Connect mode.
 * Returns null when the klubr uses Legacy mode (stripe_connect = false),
 * or when the mode cannot be determined (default-safe).
 * In Stripe Connect mode, returns the original value as-is.
 *
 * Pure function with no dependencies — safe to import in tests.
 *
 * @param donorPaysFee - The donor's fee choice from the request
 * @param stripeConnect - Whether the klubr's trade policy has stripe_connect enabled (null/undefined = unknown)
 * @returns The resolved donorPaysFee value
 */
export function resolveDonorPaysFee(
    donorPaysFee: boolean | null | undefined,
    stripeConnect: boolean | null | undefined,
): boolean | null {
    if (stripeConnect !== true) {
        // Legacy mode or unknown → default-safe null
        return null;
    }

    // Stripe Connect mode → pass through donor's choice
    return donorPaysFee ?? null;
}
