import Stripe from 'stripe';
import {
    ConnectedAccountEntity,
    FinancialAuditLogEntity,
    TradePolicyEntity,
} from '../_types';

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
 * @param klubrId - The klubr database ID
 * @param businessType - Type of business entity
 * @param country - Country code (default: FR)
 * @returns Created Stripe account object
 */
export async function createConnectedAccount(
    klubrId: number,
    businessType: BusinessType,
    country: string = 'FR'
): Promise<Stripe.Account> {
    let account: Stripe.Account | null = null;

    try {
        console.log('\n🔵 ════════════════════════════════════════════════════════');
        console.log('🔵 CRÉATION COMPTE STRIPE CONNECT');
        console.log(`🔵 Klubr ID: ${klubrId} | Type: ${businessType} | Pays: ${country}`);
        console.log('🔵 ════════════════════════════════════════════════════════\n');

        account = await stripe.accounts.create({
            type: 'express',
            country: country,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: businessType,
        });

        console.log(`✅ Compte Stripe créé: ${account.id}`);

        // Store connected account in database
        try {
            await strapi.documents('api::connected-account.connected-account').create({
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

            console.log(`✅ Compte connecté enregistré en base pour le klubr ${klubrId}\n`);
        } catch (dbError) {
            // Database insert failed after Stripe account creation succeeded
            console.error('⚠️ ════════════════════════════════════════════════════════');
            console.error('⚠️ COMPTE STRIPE ORPHELIN DÉTECTÉ');
            console.error(`⚠️ ID Compte Stripe: ${account.id}`);
            console.error(`⚠️ ID Klubr: ${klubrId}`);
            console.error(`⚠️ Erreur: ${dbError.message}`);
            console.error('⚠️ Action requise: nettoyage manuel ou réconciliation webhook');
            console.error('⚠️ ════════════════════════════════════════════════════════\n');

            // Log orphaned account to webhook-log for manual cleanup
            try {
                await strapi.documents('api::webhook-log.webhook-log').create({
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
                console.log(`📝 Compte orphelin enregistré dans webhook-log pour nettoyage\n`);
            } catch (logError) {
                console.error(`❌ Échec de l'enregistrement du compte orphelin: ${logError.message}\n`);
            }

            throw dbError;
        }

        return account;
    } catch (error) {
        // Only log if not already handled by inner catch
        if (!account) {
            console.error('❌ Échec de la création du compte connecté:', error);
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
    console.log('\n🔗 ════════════════════════════════════════════════════════');
    console.log('🔗 GÉNÉRATION LIEN ONBOARDING COMPTE');
    console.log(`🔗 Compte: ${accountId}`);
    console.log('🔗 ════════════════════════════════════════════════════════\n');

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
    });

    console.log(`✅ Lien de compte généré: ${accountLink.url}\n`);

    return accountLink;
}

/**
 * Syncs connected account status from Stripe to database
 * @param accountId - Stripe account ID
 * @returns Updated connected account entity
 */
export async function syncAccountStatus(
    accountId: string
): Promise<ConnectedAccountEntity> {
    console.log('\n🔄 ════════════════════════════════════════════════════════');
    console.log('🔄 SYNCHRONISATION STATUT COMPTE DEPUIS STRIPE');
    console.log(`🔄 Compte: ${accountId}`);
    console.log('🔄 ════════════════════════════════════════════════════════\n');

    const account = await stripe.accounts.retrieve(accountId);

    // Find connected account in database
    const connectedAccount = await strapi.db
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
    let accountStatus: 'pending' | 'active' | 'restricted' | 'disabled' =
        'pending';
    if (account.charges_enabled && account.payouts_enabled) {
        accountStatus = 'active';
    } else if (
        account.requirements?.disabled_reason ||
        account.requirements?.currently_due?.length > 0
    ) {
        accountStatus = 'restricted';
    }

    // Determine verification status
    let verificationStatus:
        | 'unverified'
        | 'pending'
        | 'verified'
        | 'rejected' = 'unverified';
    if (account.details_submitted) {
        if (account.charges_enabled && account.payouts_enabled) {
            verificationStatus = 'verified';
        } else {
            verificationStatus = 'pending';
        }
    }

    console.log(`📊 Statut: ${accountStatus} | Vérification: ${verificationStatus}`);

    // Update database
    const updated = await strapi.db
        .query('api::connected-account.connected-account')
        .update({
            where: { id: connectedAccount.id },
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

    console.log(`✅ Statut du compte synchronisé avec succès\n`);

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

    // Validate percentage is within 0-100 range
    if (percentage < 0 || percentage > 100) {
        throw new Error(
            `Pourcentage de commission invalide: ${percentage}. Doit être entre 0 et 100.`
        );
    }

    // Validate fixed amount is non-negative
    if (fixedAmount < 0) {
        throw new Error(
            `Montant fixe invalide: ${fixedAmount}. Doit être >= 0.`
        );
    }

    // Validate donation amount is positive
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
    console.log('\n💸 ════════════════════════════════════════════════════════');
    console.log('💸 CRÉATION TRANSFERT VERS COMPTE CONNECTÉ');
    console.log(`💸 Montant: ${amount / 100}€ (${amount} centimes) → Compte: ${accountId}`);
    console.log('💸 ════════════════════════════════════════════════════════\n');

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: 'eur',
        destination: accountId,
        metadata: metadata,
    });

    console.log(`✅ Transfert créé: ${transfer.id}\n`);

    return transfer;
}

/**
 * Logs a financial action to the audit trail
 * @param actionType - Type of financial action
 * @param klubrId - Klubr database ID
 * @param klubDonId - Klub don database ID (optional)
 * @param amount - Amount involved in the action
 * @param stripeObjectId - Stripe object ID (payment intent, transfer, etc.)
 * @param metadata - Additional metadata
 * @returns Created financial audit log entity
 */
export async function logFinancialAction(
    actionType: FinancialActionType,
    klubrId: number,
    klubDonId: number | null,
    amount: number,
    stripeObjectId: string,
    metadata: Record<string, any> = {}
): Promise<FinancialAuditLogEntity> {
    console.log('\n📝 ════════════════════════════════════════════════════════');
    console.log('📝 ENREGISTREMENT ACTION FINANCIÈRE (AUDIT)');
    console.log(`📝 Action: ${actionType.toUpperCase()}`);
    console.log(`📝 Klubr: ${klubrId} | Don: ${klubDonId || 'N/A'} | Montant: ${amount / 100}€`);
    console.log(`📝 Objet Stripe: ${stripeObjectId}`);
    console.log('📝 ════════════════════════════════════════════════════════\n');

    const auditLog = await strapi
        .documents('api::financial-audit-log.financial-audit-log')
        .create({
            data: {
                action_type: actionType,
                klubr: klubrId,
                klub_don: klubDonId,
                amount: amount / 100, // Convert from cents to euros
                currency: 'EUR',
                stripe_object_id: stripeObjectId,
                metadata: metadata,
                performed_at: new Date(),
            },
        });

    console.log(`✅ Journal d'audit financier créé avec succès\n`);

    return auditLog as FinancialAuditLogEntity;
}
