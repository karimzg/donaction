import Stripe from 'stripe';
import { Core } from '@strapi/strapi';
import {
    ConnectedAccountEntity,
    FinancialAuditLogEntity,
    TradePolicyEntity,
} from '../_types';
import { logBlock, logSimple, strapiLog, COLORS } from './logger';
import { DEFAULT_CURRENCY } from '../constants';

/**
 * Parameters for determining whether the donor pays the fee
 */
export interface DonorPaysFeeParams {
    /** Trade policy of the klubr */
    tradePolicy: TradePolicyEntity;
    /** Whether this donation targets a project (true) or the club directly (false) */
    isProjectDon: boolean;
    /** Explicit donor choice, if any. null/undefined means no explicit choice. */
    donorChoice?: boolean | null;
}

/**
 * Determines whether the donor pays the processing fees for a donation.
 *
 * Logic:
 * 1. Guard clause: if Stripe Connect is disabled, use legacy `donor_pays_fee` field.
 *    **Note:** In legacy mode, the policy value is enforced — `donorChoice` is intentionally
 *    ignored because legacy clubs have no donor fee choice UI.
 * 2. Get context default: `donor_pays_fee_project` for project donations,
 *    `donor_pays_fee_club` for club donations
 * 3. If `allow_donor_fee_choice` is disabled, return the context default
 * 4. If the donor made an explicit choice, respect it
 * 5. Otherwise, return the context default
 *
 * @param params - Donor pays fee parameters
 * @returns Whether the donor should pay the fees
 */
export function determineDonorPaysFee(params: DonorPaysFeeParams): boolean {
    const { tradePolicy, isProjectDon, donorChoice } = params;

    // Guard clause: Legacy mode when Stripe Connect is disabled
    if (!tradePolicy.stripe_connect) {
        return tradePolicy.donor_pays_fee ?? false;
    }

    // Context-based default
    const defaultValue = isProjectDon
        ? (tradePolicy.donor_pays_fee_project ?? true)
        : (tradePolicy.donor_pays_fee_club ?? false);

    // If donor choice is disabled, always use the default
    if (!tradePolicy.allow_donor_fee_choice) {
        return defaultValue;
    }

    // If donor made an explicit choice, respect it
    if (donorChoice !== null && donorChoice !== undefined) {
        return donorChoice;
    }

    // No explicit choice: use context default
    return defaultValue;
}

// Validate required Stripe env vars at module load (fail fast at startup)
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
        "STRIPE_SECRET_KEY manquant dans les variables d'environnement. Vérifiez votre fichier .env",
    );
}
if (!process.env.STRIPE_WEBHOOK_SECRET_CONNECT) {
    throw new Error(
        "STRIPE_WEBHOOK_SECRET_CONNECT manquant dans les variables d'environnement. Vérifiez votre fichier .env",
    );
}

/** Pinned Stripe API version for consistency across all usages */
export const STRIPE_API_VERSION = '2025-02-24.acacia' as const;

/**
 * Centralized Stripe client with validated API key.
 * Use this client everywhere instead of creating new Stripe instances.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
});

/**
 * Business type for Stripe connected accounts
 */
export type BusinessType = 'individual' | 'company' | 'non_profit';

/**
 * Financial action types for audit logging
 */
export type FinancialActionType =
    | 'transfer_created'
    | 'payout_initiated'
    | 'refund_processed'
    | 'fee_calculated';

/**
 * Creates a Stripe connected account for a klubr
 * @param strapiInstance - Strapi instance (injected for testability)
 * @param klubrId - The klubr database ID
 * @param businessType - Type of business entity
 * @param country - Country code (default: FR)
 * @returns Created Stripe account object
 */
export async function createConnectedAccount(
    strapiInstance: Core.Strapi,
    klubrId: number,
    businessType: BusinessType,
    country: string = 'FR',
): Promise<Stripe.Account> {
    let account: Stripe.Account | null = null;

    try {
        logBlock({
            statusColor: COLORS.blue,
            entries: [
                { key: 'Action', value: 'Création compte Stripe Connect' },
                { key: 'Klubr ID', value: klubrId },
                { key: 'Type', value: businessType },
                { key: 'Pays', value: country },
            ],
            prefix: 'StripeConnect',
        });

        account = await stripe.accounts.create({
            type: 'express',
            country: country,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: businessType,
        });

        logSimple({
            message: `Compte Stripe créé: ${account.id}`,
            color: 'green',
            prefix: 'StripeConnect',
        });

        // Store connected account in database
        try {
            await strapiInstance
                .documents('api::connected-account.connected-account')
                .create({
                    data: {
                        stripe_account_id: account.id,
                        klubr: klubrId,
                        account_status: 'pending',
                        verification_status: 'unverified',
                        onboarding_completed: false,
                        business_type: businessType,
                        country: country,
                        created_at_stripe: new Date(account.created * 1000),
                        capabilities: account.capabilities as any,
                        requirements: account.requirements as any,
                        charges_enabled: account.charges_enabled ?? false,
                        payouts_enabled: account.payouts_enabled ?? false,
                    },
                });

            logSimple({
                message: `Compte connecté enregistré en base pour le klubr ${klubrId}`,
                color: 'green',
                prefix: 'StripeConnect',
            });
        } catch (dbError) {
            // Database insert failed after Stripe account creation succeeded
            logBlock({
                statusColor: COLORS.red,
                entries: [
                    { key: 'ALERTE', value: 'COMPTE STRIPE ORPHELIN DÉTECTÉ' },
                    { key: 'Stripe ID', value: account.id },
                    { key: 'Klubr ID', value: klubrId },
                    { key: 'Erreur', value: dbError.message },
                    { key: 'Action', value: 'Nettoyage manuel requis' },
                ],
                prefix: 'StripeConnect',
            });

            // Log orphaned account to webhook-log for manual cleanup
            try {
                await strapiInstance
                    .documents('api::webhook-log.webhook-log')
                    .create({
                        data: {
                            event_id: `orphaned_account_${account.id}_${Date.now()}`,
                            event_type: 'account.orphaned',
                            account_id: account.id,
                            payload: {
                                klubrId,
                                businessType,
                                country,
                                stripeAccountId: account.id,
                                error: dbError.message,
                                timestamp: new Date().toISOString(),
                            },
                            processed: false,
                            error_message: `Database insert failed: ${dbError.message}`,
                            retry_count: 0,
                        },
                    });

                logSimple({
                    message:
                        'Compte orphelin enregistré dans webhook-log pour nettoyage',
                    color: 'yellow',
                    prefix: 'StripeConnect',
                });
            } catch (logError) {
                strapiLog.error(
                    `Échec de l'enregistrement du compte orphelin: ${logError.message}`,
                );
            }

            throw dbError;
        }

        return account;
    } catch (error) {
        if (!account) {
            strapiLog.error('Échec de la création du compte connecté:', error);
        }
        throw error;
    }
}

/**
 * Generates an account link for Stripe Connect onboarding
 * @param accountId - Stripe account ID
 * @param refreshUrl - URL to redirect if link expires
 * @param returnUrl - URL to redirect after onboarding
 * @returns Account link object
 */
export async function generateAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
): Promise<Stripe.AccountLink> {
    logBlock({
        statusColor: COLORS.blue,
        entries: [
            { key: 'Action', value: 'Génération lien onboarding' },
            { key: 'Compte', value: accountId },
        ],
        prefix: 'StripeConnect',
    });

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
    });

    logSimple({
        message: `Lien de compte généré pour ${accountId} (expire: ${new Date(accountLink.expires_at * 1000).toISOString()})`,
        color: 'green',
        prefix: 'StripeConnect',
    });

    return accountLink;
}

/**
 * Syncs connected account status from Stripe to database
 * @param strapiInstance - Strapi instance (injected for testability)
 * @param accountId - Stripe account ID
 * @returns Updated connected account entity
 */
export async function syncAccountStatus(
    strapiInstance: Core.Strapi,
    accountId: string,
): Promise<ConnectedAccountEntity> {
    logBlock({
        statusColor: COLORS.blue,
        entries: [
            { key: 'Action', value: 'Synchronisation statut compte' },
            { key: 'Compte', value: accountId },
        ],
        prefix: 'StripeConnect',
    });

    const account = await stripe.accounts.retrieve(accountId);

    // Find connected account in database
    const connectedAccount = await strapiInstance.db
        .query('api::connected-account.connected-account')
        .findOne({
            where: { stripe_account_id: accountId },
        });

    if (!connectedAccount) {
        throw new Error(
            `Compte connecté introuvable pour le compte Stripe: ${accountId}`,
        );
    }

    // Determine account status
    const accountStatus = determineAccountStatus(account);
    const verificationStatus = determineVerificationStatus(account);

    logSimple({
        message: `Statut: ${accountStatus} | Vérification: ${verificationStatus}`,
        color: 'blue',
        prefix: 'StripeConnect',
    });

    // Update database using Document Service API with documentId
    const updated = await strapiInstance
        .documents('api::connected-account.connected-account')
        .update({
            documentId: connectedAccount.documentId,
            data: {
                account_status: accountStatus,
                verification_status: verificationStatus,
                onboarding_completed: account.details_submitted,
                capabilities: account.capabilities as any,
                requirements: account.requirements as any,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                last_sync: new Date(),
            },
        });

    logSimple({
        message: 'Statut du compte synchronisé avec succès',
        color: 'green',
        prefix: 'StripeConnect',
    });

    return updated as ConnectedAccountEntity;
}

/** Valid fee model values — reject anything else */
const VALID_FEE_MODELS = [
    'percentage_only',
    'fixed_only',
    'percentage_plus_fixed',
] as const;

/** Default Stripe processing fee rates for European cards (France) */
const DEFAULT_STRIPE_FEE_PERCENTAGE = 1.5;
const DEFAULT_STRIPE_FEE_FIXED = 0.25;

/**
 * Calculates platform commission based on trade policy fee model
 * @param amount - Donation amount in cents
 * @param tradePolicy - Trade policy entity
 * @returns Platform commission in cents (excludes Stripe processing fees)
 * @throws Error if fee parameters are invalid
 */
export function calculatePlatformCommission(
    amount: number,
    tradePolicy: TradePolicyEntity,
): number {
    const feeModel = tradePolicy.fee_model || 'percentage_only';
    const percentage = tradePolicy.commissionPercentage || 0;
    const fixedAmount = tradePolicy.fixed_amount || 0;

    if (!VALID_FEE_MODELS.includes(feeModel as any)) {
        throw new Error(
            `Modèle de frais invalide: '${feeModel}'. Valeurs autorisées: ${VALID_FEE_MODELS.join(', ')}`,
        );
    }

    if (percentage < 0 || percentage > 100) {
        throw new Error(
            `Pourcentage de commission invalide: ${percentage}. Doit être entre 0 et 100.`,
        );
    }

    if (fixedAmount < 0) {
        throw new Error(
            `Montant fixe invalide: ${fixedAmount}. Doit être >= 0.`,
        );
    }

    if (amount <= 0) {
        throw new Error(
            `Montant de donation invalide: ${amount}. Doit être > 0.`,
        );
    }

    let fee = 0;

    switch (feeModel) {
        case 'percentage_only':
            fee = Math.round((amount * percentage) / 100);
            break;
        case 'fixed_only':
            fee = Math.round(fixedAmount * 100); // Convert to cents
            break;
        case 'percentage_plus_fixed':
            fee =
                Math.round((amount * percentage) / 100) +
                Math.round(fixedAmount * 100);
            break;
    }

    return fee;
}

/**
 * Estimates Stripe processing fees for a given donation amount.
 *
 * IMPORTANT: This is an **estimate** based on standard European card rates.
 * Actual Stripe fees vary by card type (EU vs non-EU, credit vs debit, AMEX)
 * and may differ from this calculation. If the estimate is too low, the platform
 * absorbs the difference. A misconfigured stripe_fee_percentage of 0 would
 * silently zero out Stripe fee recovery — validate inputs accordingly.
 *
 * @param donationAmountCents - Donation amount in cents
 * @param tradePolicy - Trade policy entity (stripe_fee_percentage stored as percentage, e.g. 1.5 for 1.5%)
 * @returns Estimated Stripe processing fees in cents
 */
export function estimateStripeFees(
    donationAmountCents: number,
    tradePolicy: TradePolicyEntity,
): number {
    const percentage =
        tradePolicy.stripe_fee_percentage ?? DEFAULT_STRIPE_FEE_PERCENTAGE;
    const fixed = tradePolicy.stripe_fee_fixed ?? DEFAULT_STRIPE_FEE_FIXED;

    if (percentage < 0 || percentage > 100) {
        throw new Error('Pourcentage de frais Stripe invalide');
    }
    if (fixed < 0) {
        throw new Error('Frais fixes Stripe invalides');
    }

    return Math.round((donationAmountCents * percentage) / 100 + fixed * 100);
}

/**
 * Calculates total application fee (platform commission + estimated Stripe fees)
 *
 * The application_fee_amount covers both DONACTION's commission and Stripe's
 * processing fees. This ensures the association receives the expected net amount:
 * - Scenario A (donor pays): association gets 100% of donation
 * - Scenario B (fees included): fees are transparently deducted
 *
 * @param donationAmountCents - Base donation amount in cents (excluding contribution)
 * @param tradePolicy - Trade policy entity
 * @returns Total application fee in cents
 * @throws Error if fee parameters are invalid
 */
export function calculateApplicationFee(
    donationAmountCents: number,
    tradePolicy: TradePolicyEntity,
): number {
    const platformCommission = calculatePlatformCommission(
        donationAmountCents,
        tradePolicy,
    );
    const stripeFees = estimateStripeFees(donationAmountCents, tradePolicy);
    return platformCommission + stripeFees;
}

/**
 * Creates a transfer to a connected account
 * @param amount - Amount to transfer in cents
 * @param accountId - Stripe connected account ID
 * @param metadata - Additional metadata for the transfer
 * @returns Created Stripe transfer object
 */
export async function createTransferToConnectedAccount(
    amount: number,
    accountId: string,
    metadata: Record<string, string> = {},
): Promise<Stripe.Transfer> {
    logBlock({
        statusColor: COLORS.blue,
        entries: [
            { key: 'Action', value: 'Création transfert' },
            { key: 'Montant', value: `${amount / 100}€ (${amount} centimes)` },
            { key: 'Compte', value: accountId },
        ],
        prefix: 'StripeConnect',
    });

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: DEFAULT_CURRENCY,
        destination: accountId,
        metadata: metadata,
    });

    logSimple({
        message: `Transfert créé: ${transfer.id}`,
        color: 'green',
        prefix: 'StripeConnect',
    });

    return transfer;
}

/**
 * Logs a financial action to the audit trail
 * @param strapiInstance - Strapi instance (injected for testability)
 * @param actionType - Type of financial action
 * @param klubrDocumentId - Klubr documentId (Strapi v5 identifier)
 * @param klubDonDocumentId - Klub don documentId (optional)
 * @param amount - Amount involved in the action
 * @param stripeObjectId - Stripe object ID (payment intent, transfer, etc.)
 * @param metadata - Additional metadata
 * @returns Created financial audit log entity
 */
export async function logFinancialAction(
    strapiInstance: Core.Strapi,
    actionType: FinancialActionType,
    klubrDocumentId: string,
    klubDonDocumentId: string | null,
    amount: number,
    stripeObjectId: string,
    metadata: Record<string, any> = {},
): Promise<FinancialAuditLogEntity> {
    logBlock({
        statusColor: COLORS.blue,
        entries: [
            { key: 'Action', value: `Audit: ${actionType.toUpperCase()}` },
            { key: 'Klubr', value: klubrDocumentId },
            { key: 'Don', value: klubDonDocumentId || 'N/A' },
            { key: 'Montant', value: `${amount / 100}€` },
            { key: 'Stripe', value: stripeObjectId },
        ],
        prefix: 'StripeConnect',
    });

    const auditLog = await strapiInstance
        .documents('api::financial-audit-log.financial-audit-log')
        .create({
            data: {
                action_type: actionType,
                klubr: klubrDocumentId,
                klub_don: klubDonDocumentId,
                amount: amount / 100, // Convert from cents to euros
                currency: DEFAULT_CURRENCY.toUpperCase(),
                stripe_object_id: stripeObjectId,
                metadata: metadata,
                performed_at: new Date(),
            },
        });

    logSimple({
        message: "Journal d'audit financier créé avec succès",
        color: 'green',
        prefix: 'StripeConnect',
    });

    return auditLog as FinancialAuditLogEntity;
}

// --- Pure helper functions ---

/** Determines account status from Stripe account data */
const determineAccountStatus = (
    account: Stripe.Account,
): 'pending' | 'active' | 'restricted' | 'disabled' => {
    if (account.charges_enabled && account.payouts_enabled) {
        return 'active';
    }
    if (account.requirements?.disabled_reason) {
        return 'disabled';
    }
    if (account.requirements?.currently_due?.length > 0) {
        return 'restricted';
    }
    return 'pending';
};

/** Determines verification status from Stripe account data */
const determineVerificationStatus = (
    account: Stripe.Account,
): 'unverified' | 'pending' | 'verified' | 'rejected' => {
    if (!account.details_submitted) {
        return 'unverified';
    }
    if (account.charges_enabled && account.payouts_enabled) {
        return 'verified';
    }
    return 'pending';
};
