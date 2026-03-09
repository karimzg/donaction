import type Stripe from 'stripe';
import { Core } from '@strapi/strapi';
import { syncAccountStatus, stripe, logFinancialAction, createTransferToConnectedAccount } from './stripe-connect-helper';
import { logBlock, logSimple, strapiLog, COLORS } from './logger';
import {
    sendBrevoTransacEmail,
    BREVO_TEMPLATES,
} from './emails/sendBrevoTransacEmail';
import { ConnectedAccountWithOptionalKlubr, DisputeKlubDon, DisputeStatusValue } from '../_types';

/**
 * Handles account.updated webhook event
 * Syncs account status from Stripe to database
 */
export async function handleAccountUpdated(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'account.updated' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const account = event.data.object as Stripe.Account;

    try {
        await syncAccountStatus(strapiInstance, account.id);

        logSimple({
            message: `Compte ${account.id} synchronisé avec succès`,
            color: 'green',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur lors du traitement du webhook account.updated:',
            error
        );
        throw error;
    }
}

/**
 * Handles account.external_account.created webhook event
 */
export async function handleExternalAccountCreated(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'account.external_account.created' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const accountId = event.account as string;

    try {
        await syncAccountStatus(strapiInstance, accountId);

        logSimple({
            message: `Compte externe ajouté pour ${accountId}`,
            color: 'green',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur lors du traitement du webhook external_account.created:',
            error
        );
        throw error;
    }
}

/**
 * Handles account.external_account.updated webhook event
 */
export async function handleExternalAccountUpdated(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'account.external_account.updated' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const accountId = event.account as string;

    try {
        await syncAccountStatus(strapiInstance, accountId);

        logSimple({
            message: `Compte externe mis à jour pour ${accountId}`,
            color: 'green',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur lors du traitement du webhook external_account.updated:',
            error
        );
        throw error;
    }
}

/**
 * Handles capability.updated webhook event
 */
export async function handleCapabilityUpdated(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'capability.updated' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const capability = event.data.object as Stripe.Capability;
    const accountId = event.account as string;

    try {
        await syncAccountStatus(strapiInstance, accountId);

        logSimple({
            message: `Capacité "${capability.id}" mise à jour pour ${accountId}`,
            color: 'green',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur lors du traitement du webhook capability.updated:',
            error
        );
        throw error;
    }
}

/**
 * Handles person.created webhook event
 */
export async function handlePersonCreated(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'person.created' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const accountId = event.account as string;

    try {
        await syncAccountStatus(strapiInstance, accountId);

        logSimple({
            message: `Personne ajoutée pour ${accountId}`,
            color: 'green',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur lors du traitement du webhook person.created:',
            error
        );
        throw error;
    }
}

/**
 * Handles person.updated webhook event
 */
export async function handlePersonUpdated(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'person.updated' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const accountId = event.account as string;

    try {
        await syncAccountStatus(strapiInstance, accountId);

        logSimple({
            message: `Personne mise à jour pour ${accountId}`,
            color: 'green',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur lors du traitement du webhook person.updated:',
            error
        );
        throw error;
    }
}

/**
 * Handles account.application.deauthorized webhook event
 * Triggered when a connected account disconnects from the platform.
 *
 * After deauthorization, the platform can no longer access the Stripe account
 * via the API, so we update the database directly instead of calling syncAccountStatus.
 */
export async function handleAccountDeauthorized(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'account.application.deauthorized' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const accountId = event.account;

    if (!accountId) {
        strapiLog.error(
            'account.application.deauthorized reçu sans account id'
        );
        return;
    }

    try {
        // Find connected account with klubr relation
        const connectedAccount = await strapiInstance.db
            .query('api::connected-account.connected-account')
            .findOne({
                where: { stripe_account_id: accountId },
                populate: { klubr: true },
            });

        if (!connectedAccount) {
            strapiLog.error(
                `Compte connecté introuvable pour le compte Stripe déautorisé: ${accountId}`
            );
            return;
        }

        // Disable the connected account
        await strapiInstance
            .documents('api::connected-account.connected-account')
            .update({
                documentId: connectedAccount.documentId,
                data: {
                    account_status: 'disabled',
                    charges_enabled: false,
                    payouts_enabled: false,
                    last_sync: new Date(),
                },
            });

        logSimple({
            message: `Compte ${accountId} désactivé (deauthorized)`,
            color: 'yellow',
            prefix: 'StripeConnect',
        });

        // Disable donation eligibility for the klubr
        if (connectedAccount.klubr?.documentId) {
            await strapiInstance
                .documents('api::klubr.klubr')
                .update({
                    documentId: connectedAccount.klubr.documentId,
                    data: { donationEligible: false },
                });

            logSimple({
                message: `Klubr ${connectedAccount.klubr.denomination || connectedAccount.klubr.documentId} - collecte de dons désactivée`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
        }

        // Fire-and-forget: send admin alert
        void sendDeauthorizedAdminAlert(
            accountId,
            connectedAccount
        );

        // Fire-and-forget: send notification to klubr admin
        void sendDeauthorizedKlubrNotification(
            strapiInstance,
            accountId,
            connectedAccount
        );

        logSimple({
            message: `Compte ${accountId} déautorisé de la plateforme`,
            color: 'yellow',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur lors du traitement du webhook account.application.deauthorized:',
            error
        );
        throw error;
    }
}

/**
 * Sends an admin alert when an account is deauthorized.
 * Non-blocking: errors are logged but not propagated.
 */
async function sendDeauthorizedAdminAlert(
    accountId: string,
    connectedAccount: ConnectedAccountWithOptionalKlubr
): Promise<void> {
    try {
        let klubrName = 'Inconnu';
        let klubrUuid = 'N/A';

        if (
            connectedAccount.klubr &&
            typeof connectedAccount.klubr === 'object'
        ) {
            klubrName = connectedAccount.klubr.denomination || 'Inconnu';
            klubrUuid = connectedAccount.klubr.uuid || 'N/A';
        }

        await sendBrevoTransacEmail({
            subject: `[ALERTE] Compte Stripe déconnecté: ${klubrName}`,
            templateId: BREVO_TEMPLATES.SUPER_ADMIN_ALERT_STRIPE,
            destIsAdmin: true,
            params: {
                ALERT_TYPE: 'Compte Stripe Connect déconnecté (deauthorized)',
                CLUB_NAME: klubrName,
                KLUBR_UUID: klubrUuid,
                STRIPE_ACCOUNT_ID: accountId,
                ACCOUNT_STATUS: 'disabled',
                DISABLED_REASON: 'Déconnexion volontaire de la plateforme',
                CURRENTLY_DUE: 'N/A',
                CHARGES_ENABLED: 'Non',
                PAYOUTS_ENABLED: 'Non',
            },
            tags: ['admin-alert', 'stripe-connect', 'account-deauthorized'],
        });

        logSimple({
            message: `Alerte admin envoyée pour compte déautorisé: ${accountId}`,
            color: 'yellow',
            prefix: 'StripeConnect',
        });
    } catch (alertError) {
        strapiLog.error(
            `Echec de l'envoi de l'alerte admin pour le compte déautorisé ${accountId}:`,
            alertError
        );
    }
}

/**
 * Sends a LEADER_ALERT notification to KlubMemberLeader members when the account is deauthorized.
 * Non-blocking: errors are logged but not propagated.
 */
async function sendDeauthorizedKlubrNotification(
    strapiInstance: Core.Strapi,
    accountId: string,
    connectedAccount: ConnectedAccountWithOptionalKlubr
): Promise<void> {
    try {
        // Guard: klubr must be a populated object (not a numeric FK)
        if (
            !connectedAccount.klubr ||
            typeof connectedAccount.klubr !== 'object'
        ) {
            logSimple({
                message: `Pas de klubr associé pour la notification de déconnexion: ${accountId}`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        const klubr = connectedAccount.klubr;

        if (!klubr.documentId) {
            logSimple({
                message: `Klubr sans documentId, notification ignorée: ${accountId}`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        const klubrName = klubr.denomination || 'Votre association';

        // Find KlubMemberLeader members to notify
        const leaders = await strapiInstance
            .service('api::klubr-membre.klubr-membre')
            .getKlubMembres(klubr.documentId, ['KlubMemberLeader']);

        const leadersWithEmail = leaders.filter(
            (member) => member.email || member.users_permissions_user?.email,
        );

        if (leadersWithEmail.length === 0) {
            logSimple({
                message: `Aucun dirigeant avec email trouvé pour le klubr ${klubrName}`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        // Send LEADER_ALERT to all leaders in parallel (allSettled to avoid dropping remaining emails on first failure)
        const results = await Promise.allSettled(leadersWithEmail.map(async (leader) => {
            const leaderEmail =
                leader.email || leader.users_permissions_user?.email;

            await sendBrevoTransacEmail({
                subject: `Action requise - Collecte de dons désactivée pour ${klubrName}`,
                templateId: BREVO_TEMPLATES.LEADER_ALERT,
                to: [{ email: leaderEmail, name: `${leader.prenom || ''} ${leader.nom || ''}`.trim() }],
                params: {
                    CLUB_NAME: klubrName,
                    ALERT_MESSAGE:
                        'Le compte de paiement de votre association a été déconnecté de la plateforme Donaction. ' +
                        'La collecte de dons est actuellement désactivée. ' +
                        'Veuillez contacter votre administrateur ou reconnecter votre compte pour rétablir la collecte.',
                },
                tags: ['klubr-notification', 'stripe-connect', 'account-deauthorized'],
            });

            logSimple({
                message: `Notification LEADER_ALERT envoyée à ${leaderEmail} pour compte déautorisé: ${accountId}`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
        }));

        results.forEach((result, i) => {
            if (result.status === 'rejected') {
                const leaderEmail = leadersWithEmail[i].email || leadersWithEmail[i].users_permissions_user?.email;
                strapiLog.error(`Echec envoi notification à ${leaderEmail}:`, result.reason);
            }
        });
    } catch (notifError) {
        strapiLog.error(
            `Echec de l'envoi de la notification klubr pour le compte déautorisé ${accountId}:`,
            notifError
        );
    }
}

/**
 * Maps Stripe dispute status to internal dispute status
 */
const DISPUTE_STATUS_MAP: Record<string, DisputeStatusValue> = {
    warning_needs_response: 'warning_received',
    warning_under_review: 'warning_under_review',
    warning_closed: 'warning_closed',
    needs_response: 'open',
    under_review: 'under_review',
    won: 'won',
    lost: 'lost',
    funds_reinstated: 'won',
};

/**
 * Handles charge.dispute.* webhook events
 * Updates klub_don dispute status, sends admin alerts, and reverses transfers when needed.
 */
export async function handleDispute(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: event.type },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const dispute = event.data.object as Stripe.Dispute;
    const accountId = event.account ?? 'unknown';

    if (!dispute.payment_intent) {
        strapiLog.error(
            `Dispute ${dispute.id} reçue sans payment_intent`
        );
        return;
    }

    const paymentIntentId = typeof dispute.payment_intent === 'string'
        ? dispute.payment_intent
        : dispute.payment_intent.id;

    // Find the donation via the payment record
    const payment = await strapiInstance.db
        .query('api::klub-don-payment.klub-don-payment')
        .findOne({
            where: { intent_id: paymentIntentId },
            populate: {
                klub_don: {
                    populate: {
                        klubr: true,
                    },
                },
            },
        });

    if (!payment?.klub_don) {
        strapiLog.warn(
            `Don non trouvé pour dispute ${dispute.id} (payment_intent: ${paymentIntentId})`
        );
        return;
    }

    const klubDon = payment.klub_don;

    // Idempotency guard: skip duplicate created events
    if (klubDon.disputeId === dispute.id && event.type === 'charge.dispute.created') {
        logSimple({
            message: `Dispute ${dispute.id} déjà traitée pour don ${klubDon.documentId}, ignoré`,
            color: 'yellow',
            prefix: 'StripeConnect',
        });
        return;
    }

    // Idempotency guard: skip closed retries if already closed
    if (klubDon.disputeClosedAt && event.type === 'charge.dispute.closed') {
        logSimple({
            message: `Dispute ${dispute.id} déjà clôturée pour don ${klubDon.documentId}, ignoré`,
            color: 'yellow',
            prefix: 'StripeConnect',
        });
        return;
    }

    const mappedStatus = DISPUTE_STATUS_MAP[dispute.status];
    if (!mappedStatus) {
        strapiLog.warn(
            `Statut dispute inconnu: '${dispute.status}', mappé à 'open' par défaut`
        );
    }
    const disputeStatus = mappedStatus || 'open';

    // Update klub_don with dispute info
    // Only set disputeClosedAt on terminal statuses — never reset to null (late events could erase it)
    const updateData: {
        disputeStatus: DisputeStatusValue;
        disputeId: string;
        disputeReason: string | null;
        disputeClosedAt?: Date;
    } = {
        disputeStatus,
        disputeId: dispute.id,
        disputeReason: dispute.reason,
    };
    if (['won', 'lost'].includes(disputeStatus)) {
        updateData.disputeClosedAt = new Date();
    }

    await strapiInstance
        .documents('api::klub-don.klub-don')
        .update({
            documentId: klubDon.documentId,
            data: updateData,
        });

    logSimple({
        message: `Don ${klubDon.documentId} mis à jour: disputeStatus=${disputeStatus}`,
        color: 'yellow',
        prefix: 'StripeConnect',
    });

    // Event-specific actions
    if (event.type === 'charge.dispute.created') {
        // Send urgent admin alert
        void sendDisputeAdminAlert(
            dispute,
            klubDon,
            accountId,
            'created',
        );

        // Log audit for dispute opening (awaited — financial audit must not be lost)
        if (klubDon.klubr?.documentId) {
            try {
                await logFinancialAction(
                    strapiInstance,
                    'dispute_opened',
                    klubDon.klubr.documentId,
                    klubDon.documentId,
                    dispute.amount,
                    dispute.id,
                    {
                        dispute_status: dispute.status,
                        dispute_reason: dispute.reason,
                    },
                );
            } catch (auditError) {
                strapiLog.error(
                    `Echec de l'audit log dispute_opened pour dispute ${dispute.id}:`,
                    auditError,
                );
            }
        }
    }

    // Reverse transfer only when Stripe actually withdraws funds (not on dispute creation)
    if (event.type === 'charge.dispute.funds_withdrawn') {
        if (dispute.amount > 0 && accountId !== 'unknown') {
            await reverseTransferForDispute(
                strapiInstance,
                dispute,
                klubDon,
                accountId,
            );
        }
    }

    // Re-transfer funds when dispute is won and Stripe reinstates funds
    if (event.type === 'charge.dispute.funds_reinstated') {
        if (dispute.amount > 0 && accountId !== 'unknown') {
            await reTransferForDisputeWon(
                strapiInstance,
                dispute,
                klubDon,
                accountId,
            );

            // Send admin alert (only when re-transfer was attempted)
            void sendDisputeAdminAlert(
                dispute,
                klubDon,
                accountId,
                'won',
            );
        }
    }

    if (event.type === 'charge.dispute.closed') {
        const auditActionType = disputeStatus === 'won' ? 'dispute_won' : 'dispute_lost';

        // Log audit for closure (awaited — financial audit must not be lost)
        if (klubDon.klubr?.documentId) {
            try {
                await logFinancialAction(
                    strapiInstance,
                    auditActionType,
                    klubDon.klubr.documentId,
                    klubDon.documentId,
                    dispute.amount,
                    dispute.id,
                    {
                        dispute_status: dispute.status,
                        dispute_reason: dispute.reason,
                    },
                );
            } catch (auditError) {
                strapiLog.error(
                    `Echec de l'audit log ${auditActionType} pour dispute ${dispute.id}:`,
                    auditError,
                );
            }
        }

        // Notify association leaders if dispute is lost
        if (disputeStatus === 'lost') {
            void sendDisputeLostKlubrNotification(
                strapiInstance,
                dispute,
                klubDon,
            );
        }

        // Send admin alert for closure
        void sendDisputeAdminAlert(
            dispute,
            klubDon,
            accountId,
            disputeStatus === 'lost' ? 'lost' : 'won',
        );
    }

    logSimple({
        message: `Dispute ${dispute.id} traité: ${disputeStatus}`,
        color: 'green',
        prefix: 'StripeConnect',
    });
}

/**
 * Reverses the transfer to the connected account when Stripe withdraws funds (charge.dispute.funds_withdrawn).
 * Non-blocking if it fails (logged but not propagated).
 */
async function reverseTransferForDispute(
    strapiInstance: Core.Strapi,
    dispute: Stripe.Dispute,
    klubDon: DisputeKlubDon,
    accountId: string,
): Promise<void> {
    try {
        const chargeId = typeof dispute.charge === 'string'
            ? dispute.charge
            : dispute.charge?.id;

        if (!chargeId) {
            logSimple({
                message: `Dispute ${dispute.id} sans charge, reversal ignoré`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        const charge = await stripe.charges.retrieve(chargeId);
        const transferId = typeof charge.transfer === 'string'
            ? charge.transfer
            : charge.transfer?.id;

        if (!transferId) {
            logSimple({
                message: `Aucun transfert trouvé sur charge ${chargeId} pour dispute ${dispute.id}, reversal ignoré`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        const relatedTransfer = await stripe.transfers.retrieve(transferId);

        // Idempotency: check if reversal already exists for this dispute
        const existingReversals = await stripe.transfers.listReversals(
            relatedTransfer.id,
            { limit: 100 },
        );
        const alreadyReversed = existingReversals.data.some(
            (r) => r.metadata?.dispute_id === dispute.id,
        );
        if (alreadyReversed) {
            logSimple({
                message: `Reversal déjà effectué pour dispute ${dispute.id}, ignoré`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        // Create transfer reversal
        const reversal = await stripe.transfers.createReversal(
            relatedTransfer.id,
            {
                amount: Math.min(dispute.amount, relatedTransfer.amount),
                metadata: {
                    dispute_id: dispute.id,
                    reason: 'dispute_funds_withdrawn',
                },
            },
        );

        logSimple({
            message: `Transfert ${relatedTransfer.id} reversé: ${reversal.id} (${reversal.amount / 100}€)`,
            color: 'yellow',
            prefix: 'StripeConnect',
        });

        // Audit log
        if (klubDon.klubr?.documentId) {
            await logFinancialAction(
                strapiInstance,
                'transfer_reversed',
                klubDon.klubr.documentId,
                klubDon.documentId,
                reversal.amount,
                reversal.id,
                {
                    dispute_id: dispute.id,
                    original_transfer_id: relatedTransfer.id,
                },
            );
        }
    } catch (error) {
        strapiLog.error(
            `Echec du reversal de transfert pour dispute ${dispute.id}:`,
            error,
        );

        // Audit the failed reversal attempt for forensic traceability
        if (klubDon.klubr?.documentId) {
            try {
                await logFinancialAction(
                    strapiInstance,
                    'transfer_reversal_failed',
                    klubDon.klubr.documentId,
                    klubDon.documentId,
                    dispute.amount,
                    `failed_${dispute.id}`,
                    {
                        dispute_id: dispute.id,
                        status: 'failed',
                        error: error instanceof Error ? error.message : String(error),
                    },
                );
            } catch (auditError) {
                strapiLog.error(
                    `Echec de l'audit log pour reversal échoué (dispute ${dispute.id}):`,
                    auditError,
                );
            }
        }

        // Send admin alert about the failure
        void sendDisputeAdminAlert(
            dispute,
            klubDon,
            accountId,
            'reversal_failed',
        );
    }
}

/**
 * Re-transfers funds to the connected account when dispute is won (charge.dispute.funds_reinstated).
 * Non-blocking if it fails (logged but not propagated).
 */
async function reTransferForDisputeWon(
    strapiInstance: Core.Strapi,
    dispute: Stripe.Dispute,
    klubDon: DisputeKlubDon,
    accountId: string,
): Promise<void> {
    try {
        const chargeId = typeof dispute.charge === 'string'
            ? dispute.charge
            : dispute.charge?.id;

        if (!chargeId) {
            logSimple({
                message: `Dispute ${dispute.id} sans charge, re-transfer ignoré`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        const charge = await stripe.charges.retrieve(chargeId);
        const transferId = typeof charge.transfer === 'string'
            ? charge.transfer
            : charge.transfer?.id;

        if (!transferId) {
            logSimple({
                message: `Aucun transfert trouvé sur charge ${chargeId} pour dispute ${dispute.id}, re-transfer ignoré`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        const originalTransfer = await stripe.transfers.retrieve(transferId);
        const reinstatedAmount = Math.min(dispute.amount, originalTransfer.amount);

        // Create new transfer to the connected account for the reinstated amount
        const newTransfer = await createTransferToConnectedAccount(
            reinstatedAmount,
            accountId,
            {
                dispute_id: dispute.id,
                original_transfer_id: originalTransfer.id,
                reason: 'dispute_funds_reinstated',
            },
        );

        logSimple({
            message: `Transfert créé pour fonds réintégrés: ${newTransfer.id} (${newTransfer.amount / 100}€)`,
            color: 'green',
            prefix: 'StripeConnect',
        });

        // Audit log
        if (klubDon.klubr?.documentId) {
            await logFinancialAction(
                strapiInstance,
                'transfer_created',
                klubDon.klubr.documentId,
                klubDon.documentId,
                newTransfer.amount,
                newTransfer.id,
                {
                    dispute_id: dispute.id,
                    reason: 'dispute_funds_reinstated',
                    original_transfer_id: originalTransfer.id,
                },
            );
        }
    } catch (error) {
        strapiLog.error(
            `Echec du re-transfer pour dispute gagnée ${dispute.id}:`,
            error,
        );

        // Log failed attempt for forensic traceability
        if (klubDon.klubr?.documentId) {
            try {
                await logFinancialAction(
                    strapiInstance,
                    'transfer_creation_failed',
                    klubDon.klubr.documentId,
                    klubDon.documentId,
                    dispute.amount,
                    `failed_retransfer_${dispute.id}`,
                    {
                        dispute_id: dispute.id,
                        reason: 'dispute_funds_reinstated',
                        status: 'failed',
                        error: error instanceof Error ? error.message : String(error),
                    },
                );
            } catch (auditError) {
                strapiLog.error(
                    `Echec de l'audit log pour re-transfer échoué (dispute ${dispute.id}):`,
                    auditError,
                );
            }
        }
    }
}

/**
 * Sends an admin alert for dispute events.
 * Non-blocking: errors are logged but not propagated.
 */
async function sendDisputeAdminAlert(
    dispute: Stripe.Dispute,
    klubDon: DisputeKlubDon,
    accountId: string,
    alertType: 'created' | 'lost' | 'won' | 'reversal_failed',
): Promise<void> {
    try {
        const klubrName = klubDon.klubr?.denomination || 'Inconnu';
        const klubrUuid = klubDon.klubr?.uuid || 'N/A';
        const amountEuros = (dispute.amount / 100).toFixed(2);

        const alertMessages: Record<string, string> = {
            created: `Nouveau litige ouvert - ${amountEuros}€`,
            lost: `Litige perdu - ${amountEuros}€ définitivement perdus`,
            won: `Litige gagné - ${amountEuros}€ récupérés`,
            reversal_failed: `Echec du reversal de transfert - ${amountEuros}€`,
        };

        const deadline = dispute.evidence_details?.due_by
            ? new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString('fr-FR')
            : 'N/A';

        await sendBrevoTransacEmail({
            subject: `[ALERTE${alertType === 'created' ? ' URGENTE' : ''}] Litige Stripe ${alertType}: ${klubrName}`,
            templateId: BREVO_TEMPLATES.SUPER_ADMIN_ALERT_STRIPE,
            destIsAdmin: true,
            params: {
                ALERT_TYPE: alertMessages[alertType],
                CLUB_NAME: klubrName,
                KLUBR_UUID: klubrUuid,
                STRIPE_ACCOUNT_ID: accountId,
                ACCOUNT_STATUS: `dispute_${alertType}`,
                DISABLED_REASON: `Litige: ${dispute.reason} (${dispute.id})`,
                CURRENTLY_DUE: deadline,
                CHARGES_ENABLED: 'N/A',
                PAYOUTS_ENABLED: 'N/A',
            },
            tags: ['admin-alert', 'stripe-connect', `dispute-${alertType}`],
        });

        logSimple({
            message: `Alerte admin envoyée pour dispute ${alertType}: ${dispute.id}`,
            color: 'yellow',
            prefix: 'StripeConnect',
        });
    } catch (alertError) {
        strapiLog.error(
            `Echec de l'envoi de l'alerte admin pour dispute ${dispute.id}:`,
            alertError,
        );
    }
}

/**
 * Sends notification to klubr leaders when a dispute is lost.
 * Non-blocking: errors are logged but not propagated.
 */
async function sendDisputeLostKlubrNotification(
    strapiInstance: Core.Strapi,
    dispute: Stripe.Dispute,
    klubDon: DisputeKlubDon,
): Promise<void> {
    try {
        const klubr = klubDon.klubr;

        if (!klubr || typeof klubr !== 'object' || !klubr.documentId) {
            logSimple({
                message: `Pas de klubr associé pour la notification de dispute perdue: ${dispute.id}`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        const klubrName = klubr.denomination || 'Votre association';
        const amountEuros = (dispute.amount / 100).toFixed(2);

        // Find club-level leaders to notify (Admin is platform-level, notified separately via destIsAdmin)
        const leaders = await strapiInstance
            .service('api::klubr-membre.klubr-membre')
            .getKlubMembres(klubr.documentId, [
                'KlubMemberLeader',
                'AdminEditor',
            ]);

        const leadersWithEmail = leaders.filter(
            (member) => member.email || member.users_permissions_user?.email,
        );

        if (leadersWithEmail.length === 0) {
            logSimple({
                message: `Aucun dirigeant avec email trouvé pour le klubr ${klubrName}`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
            return;
        }

        const results = await Promise.allSettled(
            leadersWithEmail.map(async (leader) => {
                const leaderEmail =
                    leader.email || leader.users_permissions_user?.email;

                await sendBrevoTransacEmail({
                    subject: `Litige perdu - ${amountEuros}€ pour ${klubrName}`,
                    templateId: BREVO_TEMPLATES.LEADER_ALERT,
                    to: [
                        {
                            email: leaderEmail,
                            name: `${leader.prenom || ''} ${leader.nom || ''}`.trim(),
                        },
                    ],
                    params: {
                        CLUB_NAME: klubrName,
                        ALERT_MESSAGE:
                            `Un litige de ${amountEuros}€ concernant un don a été perdu. ` +
                            `Le montant a été définitivement débité. ` +
                            `Raison du litige : ${dispute.reason || 'non précisée'}. ` +
                            `Veuillez contacter votre administrateur pour plus d'informations.`,
                    },
                    tags: [
                        'klubr-notification',
                        'stripe-connect',
                        'dispute-lost',
                    ],
                });

                logSimple({
                    message: `Notification dispute perdue envoyée à ${leaderEmail}`,
                    color: 'yellow',
                    prefix: 'StripeConnect',
                });
            }),
        );

        results.forEach((result, i) => {
            if (result.status === 'rejected') {
                const leaderEmail =
                    leadersWithEmail[i].email ||
                    leadersWithEmail[i].users_permissions_user?.email;
                strapiLog.error(
                    `Echec envoi notification dispute à ${leaderEmail}:`,
                    result.reason,
                );
            }
        });

        // Also notify platform super admin
        await sendBrevoTransacEmail({
            subject: `Litige perdu - ${amountEuros}€ pour ${klubrName}`,
            templateId: BREVO_TEMPLATES.LEADER_ALERT,
            destIsAdmin: true,
            params: {
                CLUB_NAME: klubrName,
                ALERT_MESSAGE:
                    `Un litige de ${amountEuros}€ concernant un don à ${klubrName} a été perdu. ` +
                    `Le montant a été définitivement débité. ` +
                    `Raison du litige : ${dispute.reason || 'non précisée'}.`,
            },
            tags: [
                'admin-alert',
                'stripe-connect',
                'dispute-lost',
            ],
        });
    } catch (notifError) {
        strapiLog.error(
            `Echec de l'envoi de la notification klubr pour dispute ${dispute.id}:`,
            notifError,
        );
    }
}

/**
 * Handles payout.paid webhook event
 * Stub handler - detailed payout logic in follow-up US
 */
export async function handlePayoutPaid(
    _strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'payout.paid' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const payout = event.data.object as Stripe.Payout;
    const accountId = event.account ?? 'unknown';

    logSimple({
        message: `Payout ${payout.id} payé pour compte ${accountId}`,
        color: 'green',
        prefix: 'StripeConnect',
    });

    // TODO: Implement payout tracking logic in follow-up US
}

/**
 * Handles payout.failed webhook event
 * Stub handler - detailed payout logic in follow-up US
 */
export async function handlePayoutFailed(
    _strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            { key: 'Webhook', value: 'payout.failed' },
            { key: 'Event ID', value: event.id },
        ],
        prefix: 'StripeConnect',
    });

    const payout = event.data.object as Stripe.Payout;
    const accountId = event.account ?? 'unknown';

    strapiLog.error(
        `Payout ${payout.id} échoué pour compte ${accountId}`
    );

    // TODO: Implement payout failure handling + notification in follow-up US
}

/**
 * Routes webhook event to appropriate handler
 * @param strapiInstance - Strapi instance (injected for testability)
 * @param event - Stripe webhook event
 */
export async function handleWebhookEvent(
    strapiInstance: Core.Strapi,
    event: Stripe.Event
): Promise<void> {
    logSimple({
        message: `Traitement du webhook: ${event.type}`,
        color: 'blue',
        prefix: 'StripeConnect',
    });

    switch (event.type) {
        case 'account.updated':
            await handleAccountUpdated(strapiInstance, event);
            break;

        case 'account.application.deauthorized':
            await handleAccountDeauthorized(strapiInstance, event);
            break;

        case 'account.external_account.created':
            await handleExternalAccountCreated(strapiInstance, event);
            break;

        case 'account.external_account.updated':
            await handleExternalAccountUpdated(strapiInstance, event);
            break;

        case 'capability.updated':
            await handleCapabilityUpdated(strapiInstance, event);
            break;

        case 'person.created':
            await handlePersonCreated(strapiInstance, event);
            break;

        case 'person.updated':
            await handlePersonUpdated(strapiInstance, event);
            break;

        case 'charge.dispute.created':
        case 'charge.dispute.updated':
        case 'charge.dispute.closed':
        case 'charge.dispute.funds_withdrawn':
        case 'charge.dispute.funds_reinstated':
            await handleDispute(strapiInstance, event);
            break;

        case 'payout.paid':
            await handlePayoutPaid(strapiInstance, event);
            break;

        case 'payout.failed':
            await handlePayoutFailed(strapiInstance, event);
            break;

        default:
            logSimple({
                message: `Type de webhook non géré: ${event.type}`,
                color: 'yellow',
                prefix: 'StripeConnect',
            });
    }
}

/**
 * Retries failed webhook events
 * Queries webhook-log for unprocessed events and re-processes them
 * @param strapiInstance - Strapi instance (injected for testability)
 */
export async function retryFailedWebhooks(
    strapiInstance: Core.Strapi
): Promise<void> {
    logBlock({
        statusColor: COLORS.yellow,
        entries: [
            {
                key: 'Action',
                value: 'Retraitement des webhooks échoués',
            },
        ],
        prefix: 'StripeConnect',
    });

    try {
        // Age threshold: only retry 'received'/'processing' events older than 5 minutes
        // to avoid racing with the main handler's optimistic lock
        const stuckThreshold = new Date(Date.now() - 5 * 60 * 1000);

        const failedLogs = await strapiInstance.db
            .query('api::webhook-log.webhook-log')
            .findMany({
                where: {
                    $or: [
                        // Failed: always eligible for retry
                        { status: 'failed' },
                        // Received or processing: only if stuck (older than 5 min)
                        // to avoid racing with the main handler's optimistic lock
                        {
                            status: { $in: ['received', 'processing'] },
                            updatedAt: { $lt: stuckThreshold.toISOString() },
                        },
                    ],
                    retry_count: { $lt: 3 },
                },
                limit: 50,
                orderBy: [{ createdAt: 'asc' }],
            });

        logSimple({
            message: `${failedLogs.length} webhook(s) échoué(s) à retraiter`,
            color: 'blue',
            prefix: 'StripeConnect',
        });

        for (const log of failedLogs) {
            try {
                // Optimistic lock: claim the event before processing to prevent
                // concurrent cron runs from double-processing the same event.
                // Includes 'processing' to reclaim stuck events (already age-filtered
                // by findMany to >5 min, so legitimate in-flight processing is safe).
                const claimed = await strapiInstance.db
                    .query('api::webhook-log.webhook-log')
                    .update({
                        where: {
                            id: log.id,
                            status: { $in: ['failed', 'received', 'processing'] },
                        },
                        data: { status: 'processing' },
                    });

                if (!claimed) {
                    logSimple({
                        message: `Webhook ${log.event_id} déjà réclamé, ignoré`,
                        color: 'yellow',
                        prefix: 'StripeConnect',
                    });
                    continue;
                }

                logSimple({
                    message: `Retraitement ${log.event_id} (tentative ${log.retry_count + 1}/3)`,
                    color: 'blue',
                    prefix: 'StripeConnect',
                });

                // Re-fetch the authentic event from Stripe instead of reconstructing
                const event = await stripe.events.retrieve(log.event_id);

                await handleWebhookEvent(strapiInstance, event);

                await strapiInstance
                    .documents('api::webhook-log.webhook-log')
                    .update({
                        documentId: log.documentId,
                        data: {
                            status: 'processed',
                            processed_at: new Date(),
                            retry_count: log.retry_count + 1,
                            processing_error: null,
                        },
                    });

                logSimple({
                    message: `Webhook ${log.event_id} retraité avec succès`,
                    color: 'green',
                    prefix: 'StripeConnect',
                });
            } catch (error) {
                // Stripe events expire after 30 days — mark as ignored (not retryable)
                if (error?.statusCode === 404) {
                    logSimple({
                        message: `Événement ${log.event_id} expiré sur Stripe (>30 jours)`,
                        color: 'yellow',
                        prefix: 'StripeConnect',
                    });

                    await strapiInstance
                        .documents('api::webhook-log.webhook-log')
                        .update({
                            documentId: log.documentId,
                            data: {
                                status: 'ignored',
                                processed_at: new Date(),
                                retry_count: 3,
                                processing_error: 'Event expired on Stripe (>30 days)',
                            },
                        });
                    continue;
                }

                strapiLog.error(
                    `Échec du retraitement du webhook ${log.event_id}:`,
                    error
                );

                await strapiInstance
                    .documents('api::webhook-log.webhook-log')
                    .update({
                        documentId: log.documentId,
                        data: {
                            status: 'failed',
                            retry_count: log.retry_count + 1,
                            processing_error: error.message,
                        },
                    });
            }
        }

        logSimple({
            message: 'Retraitement terminé',
            color: 'green',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur lors du retraitement des webhooks:',
            error
        );
        throw error;
    }
}
