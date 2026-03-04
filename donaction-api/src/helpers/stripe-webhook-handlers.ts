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
        const failedLogs = await strapiInstance.db
            .query('api::webhook-log.webhook-log')
            .findMany({
                where: {
                    status: { $in: ['failed', 'received'] },
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
                // Stripe events expire after 30 days — mark as permanently failed
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
                                status: 'failed',
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
