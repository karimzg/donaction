/**
 * Daily cron job to sync all active Stripe connected accounts
 * Runs at 2:00 AM daily
 */
export default async ({ strapi }) => {
    console.log('\n⏰ ════════════════════════════════════════════════════════');
    console.log('⏰ CRON JOB: Synchronisation quotidienne des comptes Stripe');
    console.log(`⏰ Heure d'exécution: ${new Date().toISOString()}`);
    console.log('⏰ ════════════════════════════════════════════════════════\n');

    try {
        // Get all connected accounts except disabled ones
        const accounts = await strapi
            .service('api::stripe-connect.stripe-connect')
            .listAccounts({
                account_status: undefined, // Get all statuses
            });

        // Filter out disabled accounts
        const activeAccounts = accounts.filter(
            (account) => account.account_status !== 'disabled'
        );

        console.log(
            `📊 ${activeAccounts.length} compte(s) actif(s) à synchroniser\n`
        );

        let successCount = 0;
        let errorCount = 0;

        for (const account of activeAccounts) {
            try {
                console.log(
                    `🔄 Synchronisation du compte ${account.stripe_account_id}...`
                );

                await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .syncAccountStatus(account.stripe_account_id);

                successCount++;
                console.log(
                    `✅ Compte ${account.stripe_account_id} synchronisé\n`
                );
            } catch (error) {
                errorCount++;
                console.error(
                    `❌ Échec de la synchronisation pour ${account.stripe_account_id}:`,
                    error.message
                );
                console.error(`   Erreur:`, error, '\n');
            }
        }

        console.log('⏰ ════════════════════════════════════════════════════════');
        console.log('⏰ RÉSUMÉ DE LA SYNCHRONISATION');
        console.log(`⏰ Total: ${activeAccounts.length}`);
        console.log(`⏰ Réussis: ${successCount}`);
        console.log(`⏰ Échecs: ${errorCount}`);
        console.log('⏰ ════════════════════════════════════════════════════════\n');

        // Retry failed webhooks while we're at it
        console.log(
            '🔁 Tentative de retraitement des webhooks échoués...\n'
        );

        const { retryFailedWebhooks } = require('../helpers/stripe-webhook-handlers');
        await retryFailedWebhooks();

        console.log(
            '✅ Cron job de synchronisation terminé avec succès\n'
        );
    } catch (error) {
        console.error(
            '❌ Erreur fatale lors du cron job de synchronisation:',
            error
        );
        throw error;
    }
};
