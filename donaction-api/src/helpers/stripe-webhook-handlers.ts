import type Stripe from 'stripe';
import { Core } from '@strapi/strapi';
import { syncAccountStatus, stripe } from './stripe-connect-helper';
import { logBlock, logSimple, strapiLog, COLORS } from './logger';

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
 * Triggered when a connected account disconnects from the platform
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

    const accountId = event.account as string;

    try {
        await syncAccountStatus(strapiInstance, accountId);

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
 * Handles charge.dispute.* webhook events
 * Stub handler - detailed dispute logic in follow-up US-WH-005
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
    const accountId = event.account as string;

    logSimple({
        message: `Dispute ${dispute.id} (${event.type}) pour compte ${accountId}`,
        color: 'yellow',
        prefix: 'StripeConnect',
    });

    // TODO: Implement dispute handling logic in US-WH-005
}

/**
 * Handles payout.paid webhook event
 * Stub handler - detailed payout logic in follow-up US
 */
export async function handlePayoutPaid(
    strapiInstance: Core.Strapi,
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
    const accountId = event.account as string;

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
    strapiInstance: Core.Strapi,
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
    const accountId = event.account as string;

    strapiLog.error(
        `Payout ${payout.id} échoué pour compte ${accountId}`
    );

    logSimple({
        message: `Payout ${payout.id} échoué pour compte ${accountId}`,
        color: 'red',
        prefix: 'StripeConnect',
    });

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
