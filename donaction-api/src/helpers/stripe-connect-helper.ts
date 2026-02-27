import Stripe from 'stripe';
import { Core } from '@strapi/strapi';
import {
    ConnectedAccountEntity,
    FinancialAuditLogEntity,
    TradePolicyEntity,
} from '../_types';
import { logBlock, logSimple, COLORS } from './logger';
import { DEFAULT_CURRENCY } from '../constants';

// Validate STRIPE_SECRET_KEY exists before initializing client
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
        'STRIPE_SECRET_KEY manquant dans les variables d\'environnement. Vérifiez votre fichier .env'
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
    country: string = 'FR'
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
                        capabilities:
                            account.capabilities as any,
                        requirements:
                            account.requirements as any,
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
                console.error(
                    `Échec de l'enregistrement du compte orphelin: ${logError.message}`
                );
            }

            throw dbError;
        }

        return account;
    } catch (error) {
        if (!account) {
            console.error(
                'Échec de la création du compte connecté:',
                error
            );
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
    returnUrl: string
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
        message: `Lien de compte généré: ${accountLink.url}`,
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
    accountId: string
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
            `Compte connecté introuvable pour le compte Stripe: ${accountId}`
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

    // Update database
    const updated = await strapiInstance.db
        .query('api::connected-account.connected-account')
        .update({
            where: { id: connectedAccount.id },
            data: {
                account_status: accountStatus,
                verification_status: verificationStatus,
                onboarding_completed: account.details_submitted,
                capabilities:
                    account.capabilities as any,
                requirements:
                    account.requirements as any,
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

/**
 * Calculates application fee based on trade policy fee model
 * @param amount - Donation amount in cents
 * @param tradePolicy - Trade policy entity
 * @returns Calculated fee amount in cents
 * @throws Error if fee parameters are invalid
 */
export function calculateApplicationFee(
    amount: number,
    tradePolicy: TradePolicyEntity
): number {
    const feeModel = tradePolicy.fee_model || 'percentage_only';
    const percentage = tradePolicy.commissionPercentage || 0;
    const fixedAmount = tradePolicy.fixed_amount || 0;

    if (percentage < 0 || percentage > 100) {
        throw new Error(
            `Pourcentage de commission invalide: ${percentage}. Doit être entre 0 et 100.`
        );
    }

    if (fixedAmount < 0) {
        throw new Error(
            `Montant fixe invalide: ${fixedAmount}. Doit être >= 0.`
        );
    }

    if (amount <= 0) {
        throw new Error(
            `Montant de donation invalide: ${amount}. Doit être > 0.`
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
        default:
            fee = Math.round((amount * percentage) / 100);
    }

    return fee;
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
    metadata: Record<string, string> = {}
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
 * @param klubrId - Klubr database ID
 * @param klubDonId - Klub don database ID (optional)
 * @param amount - Amount involved in the action
 * @param stripeObjectId - Stripe object ID (payment intent, transfer, etc.)
 * @param metadata - Additional metadata
 * @returns Created financial audit log entity
 */
export async function logFinancialAction(
    strapiInstance: Core.Strapi,
    actionType: FinancialActionType,
    klubrId: number,
    klubDonId: number | null,
    amount: number,
    stripeObjectId: string,
    metadata: Record<string, any> = {}
): Promise<FinancialAuditLogEntity> {
    logBlock({
        statusColor: COLORS.blue,
        entries: [
            { key: 'Action', value: `Audit: ${actionType.toUpperCase()}` },
            { key: 'Klubr', value: klubrId },
            { key: 'Don', value: klubDonId || 'N/A' },
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
                klubr: klubrId,
                klub_don: klubDonId,
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
    account: Stripe.Account
): 'pending' | 'active' | 'restricted' | 'disabled' => {
    if (account.charges_enabled && account.payouts_enabled) {
        return 'active';
    }
    if (
        account.requirements?.disabled_reason ||
        account.requirements?.currently_due?.length > 0
    ) {
        return 'restricted';
    }
    return 'pending';
};

/** Determines verification status from Stripe account data */
const determineVerificationStatus = (
    account: Stripe.Account
): 'unverified' | 'pending' | 'verified' | 'rejected' => {
    if (!account.details_submitted) {
        return 'unverified';
    }
    if (account.charges_enabled && account.payouts_enabled) {
        return 'verified';
    }
    return 'pending';
};
