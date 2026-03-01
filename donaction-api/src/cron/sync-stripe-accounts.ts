import { Core } from '@strapi/strapi';
import { retryFailedWebhooks } from '../helpers/stripe-webhook-handlers';
import { logBlock, logSimple, strapiLog, COLORS } from '../helpers/logger';

/**
 * Daily cron job to sync all active Stripe connected accounts
 * Runs at 2:00 AM daily
 */
export default async ({ strapi }: { strapi: Core.Strapi }) => {
    logBlock({
        statusColor: COLORS.blue,
        entries: [
            { key: 'Cron', value: 'Synchronisation quotidienne comptes Stripe' },
            { key: 'Heure', value: new Date().toISOString() },
        ],
        prefix: 'StripeConnect',
    });

    try {
        // Get all connected accounts except disabled ones (filtered at DB level)
        const activeAccounts = await strapi.db
            .query('api::connected-account.connected-account')
            .findMany({
                where: {
                    account_status: { $ne: 'disabled' },
                },
                populate: { klubr: true },
                orderBy: [{ createdAt: 'desc' }],
            });

        logSimple({
            message: `${activeAccounts.length} compte(s) actif(s) à synchroniser`,
            color: 'blue',
            prefix: 'StripeConnect',
        });

        let successCount = 0;
        let errorCount = 0;

        // Process in parallel batches of 10 to avoid Stripe rate limits
        const BATCH_SIZE = 10;
        for (let i = 0; i < activeAccounts.length; i += BATCH_SIZE) {
            const batch = activeAccounts.slice(i, i + BATCH_SIZE);
            const results = await Promise.allSettled(
                batch.map((account) =>
                    strapi
                        .service('api::stripe-connect.stripe-connect')
                        .syncAccountStatus(account.stripe_account_id)
                )
            );

            for (let j = 0; j < results.length; j++) {
                if (results[j].status === 'fulfilled') {
                    successCount++;
                } else {
                    errorCount++;
                    strapiLog.error(
                        `Échec synchronisation ${batch[j].stripe_account_id}: ${(results[j] as PromiseRejectedResult).reason?.message}`
                    );
                }
            }
        }

        logBlock({
            statusColor: successCount === activeAccounts.length
                ? COLORS.green
                : COLORS.yellow,
            entries: [
                { key: 'Résumé', value: 'Synchronisation terminée' },
                { key: 'Total', value: activeAccounts.length },
                { key: 'Réussis', value: successCount },
                { key: 'Échecs', value: errorCount },
            ],
            prefix: 'StripeConnect',
        });

        // Retry failed webhooks
        logSimple({
            message: 'Tentative de retraitement des webhooks échoués...',
            color: 'blue',
            prefix: 'StripeConnect',
        });

        await retryFailedWebhooks(strapi);

        logSimple({
            message: 'Cron job de synchronisation terminé avec succès',
            color: 'green',
            prefix: 'StripeConnect',
        });
    } catch (error) {
        strapiLog.error(
            'Erreur fatale lors du cron job de synchronisation:',
            error
        );
        throw error;
    }
};
