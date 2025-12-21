import { Core, factories } from '@strapi/strapi';
import { handleWebhookEvent } from '../../../helpers/stripe-webhook-handlers';
import Stripe from 'stripe';

export default factories.createCoreController(
    'api::stripe-connect.stripe-connect',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Creates a new Stripe connected account for a klubr
         * POST /api/stripe-connect/accounts
         */
        async createAccount() {
            const ctx = strapi.requestContext.get();

            console.log(
                '\n🎯 ════════════════════════════════════════════════════════'
            );
            console.log('🎯 CONTROLLER: createAccount');
            console.log(
                '🎯 ════════════════════════════════════════════════════════\n'
            );

            try {
                const { klubrId, businessType, country } = ctx.request.body;

                // Validate required fields
                if (!klubrId) {
                    return ctx.badRequest('Le champ klubrId est requis');
                }

                if (!businessType) {
                    return ctx.badRequest(
                        'Le champ businessType est requis'
                    );
                }

                // Validate businessType enum
                const validBusinessTypes = [
                    'individual',
                    'company',
                    'non_profit',
                ];
                if (!validBusinessTypes.includes(businessType)) {
                    return ctx.badRequest(
                        `businessType doit être l'une des valeurs suivantes: ${validBusinessTypes.join(', ')}`
                    );
                }

                // Check if klubr exists
                const klubr = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { id: klubrId },
                    });

                if (!klubr) {
                    return ctx.notFound(`Klubr ${klubrId} introuvable`);
                }

                // Check if account already exists for this klubr
                const existingAccount = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .retrieveAccountByKlubr(klubrId);

                if (existingAccount) {
                    return ctx.badRequest(
                        `Un compte Stripe Connect existe déjà pour ce klubr`
                    );
                }

                // Create account via service
                const account = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .createAccount(klubrId, businessType, country || 'FR');

                console.log(`✅ Controller: Compte créé avec succès\n`);

                return {
                    success: true,
                    data: {
                        accountId: account.id,
                        status: 'pending',
                    },
                };
            } catch (error) {
                console.error(
                    '❌ Controller: Erreur lors de la création du compte:',
                    error
                );
                return ctx.internalServerError(
                    `Erreur lors de la création du compte: ${error.message}`
                );
            }
        },

        /**
         * Generates onboarding link for Stripe Express account
         * POST /api/stripe-connect/accounts/:accountId/onboarding-link
         */
        async generateOnboardingLink() {
            const ctx = strapi.requestContext.get();

            console.log(
                '\n🎯 ════════════════════════════════════════════════════════'
            );
            console.log('🎯 CONTROLLER: generateOnboardingLink');
            console.log(
                '🎯 ════════════════════════════════════════════════════════\n'
            );

            try {
                const { accountId } = ctx.params;
                const { refreshUrl, returnUrl } = ctx.request.body;

                // Validate required fields
                if (!accountId) {
                    return ctx.badRequest(
                        'Le paramètre accountId est requis'
                    );
                }

                if (!refreshUrl || !returnUrl) {
                    return ctx.badRequest(
                        'Les champs refreshUrl et returnUrl sont requis'
                    );
                }

                // Check if account exists
                const connectedAccount = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .retrieveAccount(accountId);

                if (!connectedAccount) {
                    return ctx.notFound(
                        `Compte connecté ${accountId} introuvable`
                    );
                }

                // Generate onboarding link via service
                const accountLink = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .generateOnboardingLink(
                        accountId,
                        refreshUrl,
                        returnUrl
                    );

                console.log(
                    `✅ Controller: Lien d'onboarding généré avec succès\n`
                );

                return {
                    success: true,
                    data: {
                        url: accountLink.url,
                        expiresAt: accountLink.expires_at,
                    },
                };
            } catch (error) {
                console.error(
                    '❌ Controller: Erreur lors de la génération du lien:',
                    error
                );
                return ctx.internalServerError(
                    `Erreur lors de la génération du lien: ${error.message}`
                );
            }
        },

        /**
         * Syncs account status from Stripe
         * POST /api/stripe-connect/accounts/:accountId/sync
         */
        async syncAccount() {
            const ctx = strapi.requestContext.get();

            console.log(
                '\n🎯 ════════════════════════════════════════════════════════'
            );
            console.log('🎯 CONTROLLER: syncAccount');
            console.log(
                '🎯 ════════════════════════════════════════════════════════\n'
            );

            try {
                const { accountId } = ctx.params;

                // Validate required fields
                if (!accountId) {
                    return ctx.badRequest(
                        'Le paramètre accountId est requis'
                    );
                }

                // Check if account exists
                const connectedAccount = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .retrieveAccount(accountId);

                if (!connectedAccount) {
                    return ctx.notFound(
                        `Compte connecté ${accountId} introuvable`
                    );
                }

                // Sync account status via service
                const updated = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .syncAccountStatus(accountId);

                console.log(
                    `✅ Controller: Compte synchronisé avec succès\n`
                );

                return {
                    success: true,
                    data: {
                        accountId: updated.stripe_account_id,
                        accountStatus: updated.account_status,
                        verificationStatus: updated.verification_status,
                        onboardingCompleted: updated.onboarding_completed,
                        lastSync: updated.last_sync,
                    },
                };
            } catch (error) {
                console.error(
                    '❌ Controller: Erreur lors de la synchronisation:',
                    error
                );
                return ctx.internalServerError(
                    `Erreur lors de la synchronisation: ${error.message}`
                );
            }
        },

        /**
         * Retrieves connected account details
         * GET /api/stripe-connect/accounts/:accountId
         */
        async getAccount() {
            const ctx = strapi.requestContext.get();

            console.log(
                '\n🎯 ════════════════════════════════════════════════════════'
            );
            console.log('🎯 CONTROLLER: getAccount');
            console.log(
                '🎯 ════════════════════════════════════════════════════════\n'
            );

            try {
                const { accountId } = ctx.params;

                // Validate required fields
                if (!accountId) {
                    return ctx.badRequest(
                        'Le paramètre accountId est requis'
                    );
                }

                // Retrieve account via service
                const account = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .retrieveAccount(accountId);

                if (!account) {
                    return ctx.notFound(
                        `Compte connecté ${accountId} introuvable`
                    );
                }

                console.log(
                    `✅ Controller: Compte récupéré avec succès\n`
                );

                return {
                    success: true,
                    data: {
                        accountId: account.stripe_account_id,
                        accountStatus: account.account_status,
                        verificationStatus: account.verification_status,
                        onboardingCompleted: account.onboarding_completed,
                        businessType: account.business_type,
                        country: account.country,
                        capabilities: account.capabilities,
                        requirements: account.requirements,
                        lastSync: account.last_sync,
                        klubr: account.klubr,
                    },
                };
            } catch (error) {
                console.error(
                    '❌ Controller: Erreur lors de la récupération du compte:',
                    error
                );
                return ctx.internalServerError(
                    `Erreur lors de la récupération du compte: ${error.message}`
                );
            }
        },

        /**
         * Handles Stripe webhook events
         * POST /api/stripe-connect/webhook
         */
        async handleWebhook() {
            const ctx = strapi.requestContext.get();

            console.log(
                '\n🎯 ════════════════════════════════════════════════════════'
            );
            console.log('🎯 CONTROLLER: handleWebhook');
            console.log(
                '🎯 ════════════════════════════════════════════════════════\n'
            );

            try {
                // Event is attached by verify-webhook-signature middleware
                const event: Stripe.Event = ctx.state.stripeEvent;

                if (!event) {
                    return ctx.badRequest(
                        'Événement Stripe manquant (vérification de signature échouée)'
                    );
                }

                console.log(`📬 Événement reçu: ${event.type} (${event.id})`);

                // Log webhook event to database
                const webhookLog = await strapi
                    .documents('api::webhook-log.webhook-log')
                    .create({
                        data: {
                            event_id: event.id,
                            event_type: event.type,
                            account_id: event.account || null,
                            payload: event.data.object as any,
                            processed: false,
                            retry_count: 0,
                        },
                    });

                console.log(
                    `📝 Webhook enregistré dans le log (ID: ${webhookLog.documentId})`
                );

                // Process webhook event
                try {
                    await handleWebhookEvent(event);

                    // Mark as processed
                    await strapi.db
                        .query('api::webhook-log.webhook-log')
                        .update({
                            where: { id: webhookLog.id },
                            data: {
                                processed: true,
                            },
                        });

                    console.log(
                        `✅ Controller: Webhook traité avec succès\n`
                    );

                    return { received: true };
                } catch (handlerError) {
                    console.error(
                        `❌ Erreur lors du traitement du webhook:`,
                        handlerError
                    );

                    // Mark as failed with error message
                    await strapi.db
                        .query('api::webhook-log.webhook-log')
                        .update({
                            where: { id: webhookLog.id },
                            data: {
                                processed: false,
                                error_message: handlerError.message,
                            },
                        });

                    // Return 200 to Stripe to avoid retries
                    // Failed events will be retried by our own retry logic
                    return { received: true, error: handlerError.message };
                }
            } catch (error) {
                console.error(
                    '❌ Controller: Erreur lors du traitement du webhook:',
                    error
                );
                return ctx.internalServerError(
                    `Erreur lors du traitement du webhook: ${error.message}`
                );
            }
        },
    })
);
