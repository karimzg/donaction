import Stripe from 'stripe';
import { syncAccountStatus } from './stripe-connect-helper';

/**
 * Handles account.updated webhook event
 * Syncs account status from Stripe to database
 */
export async function handleAccountUpdated(event: Stripe.Event): Promise<void> {
    console.log('\n📬 ════════════════════════════════════════════════════════');
    console.log('📬 WEBHOOK: account.updated');
    console.log(`📬 Event ID: ${event.id}`);
    console.log('📬 ════════════════════════════════════════════════════════\n');

    const account = event.data.object as Stripe.Account;

    try {
        // Sync account status using existing helper
        await syncAccountStatus(account.id);

        console.log(
            `✅ Webhook traité: Compte ${account.id} synchronisé avec succès\n`
        );
    } catch (error) {
        console.error(
            `❌ Erreur lors du traitement du webhook account.updated:`,
            error
        );
        throw error;
    }
}

/**
 * Handles account.external_account.created webhook event
 * Updates connected account when external account (bank account) is added
 */
export async function handleExternalAccountCreated(
    event: Stripe.Event
): Promise<void> {
    console.log('\n📬 ════════════════════════════════════════════════════════');
    console.log('📬 WEBHOOK: account.external_account.created');
    console.log(`📬 Event ID: ${event.id}`);
    console.log('📬 ════════════════════════════════════════════════════════\n');

    const externalAccount = event.data.object as Stripe.BankAccount;
    const accountId = event.account as string;

    try {
        // Sync full account status to capture external account changes
        await syncAccountStatus(accountId);

        console.log(
            `✅ Webhook traité: Compte externe ajouté pour ${accountId}\n`
        );
    } catch (error) {
        console.error(
            `❌ Erreur lors du traitement du webhook external_account.created:`,
            error
        );
        throw error;
    }
}

/**
 * Handles account.external_account.updated webhook event
 * Updates connected account when external account is modified
 */
export async function handleExternalAccountUpdated(
    event: Stripe.Event
): Promise<void> {
    console.log('\n📬 ════════════════════════════════════════════════════════');
    console.log('📬 WEBHOOK: account.external_account.updated');
    console.log(`📬 Event ID: ${event.id}`);
    console.log('📬 ════════════════════════════════════════════════════════\n');

    const externalAccount = event.data.object as Stripe.BankAccount;
    const accountId = event.account as string;

    try {
        // Sync full account status to capture external account changes
        await syncAccountStatus(accountId);

        console.log(
            `✅ Webhook traité: Compte externe mis à jour pour ${accountId}\n`
        );
    } catch (error) {
        console.error(
            `❌ Erreur lors du traitement du webhook external_account.updated:`,
            error
        );
        throw error;
    }
}

/**
 * Handles capability.updated webhook event
 * Updates connected account when capabilities (card_payments, transfers) change
 */
export async function handleCapabilityUpdated(
    event: Stripe.Event
): Promise<void> {
    console.log('\n📬 ════════════════════════════════════════════════════════');
    console.log('📬 WEBHOOK: capability.updated');
    console.log(`📬 Event ID: ${event.id}`);
    console.log('📬 ════════════════════════════════════════════════════════\n');

    const capability = event.data.object as Stripe.Capability;
    const accountId = event.account as string;

    try {
        // Sync full account status to capture capability changes
        await syncAccountStatus(accountId);

        console.log(
            `✅ Webhook traité: Capacité "${capability.id}" mise à jour pour ${accountId}\n`
        );
    } catch (error) {
        console.error(
            `❌ Erreur lors du traitement du webhook capability.updated:`,
            error
        );
        throw error;
    }
}

/**
 * Handles person.created webhook event
 * Updates connected account when person (representative) is added
 */
export async function handlePersonCreated(event: Stripe.Event): Promise<void> {
    console.log('\n📬 ════════════════════════════════════════════════════════');
    console.log('📬 WEBHOOK: person.created');
    console.log(`📬 Event ID: ${event.id}`);
    console.log('📬 ════════════════════════════════════════════════════════\n');

    const person = event.data.object as Stripe.Person;
    const accountId = event.account as string;

    try {
        // Sync full account status to capture person addition
        await syncAccountStatus(accountId);

        console.log(
            `✅ Webhook traité: Personne ajoutée pour ${accountId}\n`
        );
    } catch (error) {
        console.error(
            `❌ Erreur lors du traitement du webhook person.created:`,
            error
        );
        throw error;
    }
}

/**
 * Handles person.updated webhook event
 * Updates connected account when person information is modified
 */
export async function handlePersonUpdated(event: Stripe.Event): Promise<void> {
    console.log('\n📬 ════════════════════════════════════════════════════════');
    console.log('📬 WEBHOOK: person.updated');
    console.log(`📬 Event ID: ${event.id}`);
    console.log('📬 ════════════════════════════════════════════════════════\n');

    const person = event.data.object as Stripe.Person;
    const accountId = event.account as string;

    try {
        // Sync full account status to capture person changes
        await syncAccountStatus(accountId);

        console.log(
            `✅ Webhook traité: Personne mise à jour pour ${accountId}\n`
        );
    } catch (error) {
        console.error(
            `❌ Erreur lors du traitement du webhook person.updated:`,
            error
        );
        throw error;
    }
}

/**
 * Routes webhook event to appropriate handler
 * @param event - Stripe webhook event
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
    console.log(`\n🎯 Traitement du webhook: ${event.type}`);

    switch (event.type) {
        case 'account.updated':
            await handleAccountUpdated(event);
            break;

        case 'account.external_account.created':
            await handleExternalAccountCreated(event);
            break;

        case 'account.external_account.updated':
            await handleExternalAccountUpdated(event);
            break;

        case 'capability.updated':
            await handleCapabilityUpdated(event);
            break;

        case 'person.created':
            await handlePersonCreated(event);
            break;

        case 'person.updated':
            await handlePersonUpdated(event);
            break;

        default:
            console.log(`⚠️ Type de webhook non géré: ${event.type}\n`);
    }
}

/**
 * Retries failed webhook events
 * Queries webhook-log for unprocessed events and re-processes them
 */
export async function retryFailedWebhooks(): Promise<void> {
    console.log('\n🔁 ════════════════════════════════════════════════════════');
    console.log('🔁 RETRY: Tentative de retraitement des webhooks échoués');
    console.log('🔁 ════════════════════════════════════════════════════════\n');

    try {
        // Query webhook-log for failed events
        const failedLogs = await strapi.db
            .query('api::webhook-log.webhook-log')
            .findMany({
                where: {
                    processed: false,
                    retry_count: { $lt: 3 },
                },
                limit: 50,
                orderBy: [{ createdAt: 'asc' }],
            });

        console.log(
            `📊 ${failedLogs.length} webhook(s) échoué(s) à retraiter\n`
        );

        for (const log of failedLogs) {
            try {
                console.log(
                    `🔄 Retraitement du webhook ${log.event_id} (tentative ${log.retry_count + 1}/3)`
                );

                // Reconstruct Stripe event from payload
                const event: Stripe.Event = {
                    id: log.event_id,
                    type: log.event_type,
                    data: { object: log.payload },
                    account: log.account_id || undefined,
                } as Stripe.Event;

                // Re-process event
                await handleWebhookEvent(event);

                // Mark as processed
                await strapi.db.query('api::webhook-log.webhook-log').update({
                    where: { id: log.id },
                    data: {
                        processed: true,
                        retry_count: log.retry_count + 1,
                        error_message: null,
                    },
                });

                console.log(`✅ Webhook ${log.event_id} retraité avec succès\n`);
            } catch (error) {
                console.error(
                    `❌ Échec du retraitement du webhook ${log.event_id}:`,
                    error
                );

                // Update retry count and error message
                await strapi.db.query('api::webhook-log.webhook-log').update({
                    where: { id: log.id },
                    data: {
                        retry_count: log.retry_count + 1,
                        error_message: error.message,
                    },
                });
            }
        }

        console.log(`✅ Retraitement terminé\n`);
    } catch (error) {
        console.error(
            `❌ Erreur lors du retraitement des webhooks:`,
            error
        );
        throw error;
    }
}
