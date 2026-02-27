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
        // Get all connected accounts except disabled ones
        const accounts = await strapi
            .service('api::stripe-connect.stripe-connect')
            .listAccounts({
                account_status: undefined,
            });

        const activeAccounts = accounts.filter(
            (account) => account.account_status !== 'disabled'
        );

        logSimple({
            message: `${activeAccounts.length} compte(s) actif(s) à synchroniser`,
            color: 'blue',
            prefix: 'StripeConnect',
        });

        let successCount = 0;
        let errorCount = 0;

        for (const account of activeAccounts) {
            try {
                await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .syncAccountStatus(account.stripe_account_id);

                successCount++;
            } catch (error) {
                errorCount++;
                strapiLog.error(
                    `Échec synchronisation ${account.stripe_account_id}: ${error.message}`
                );
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
