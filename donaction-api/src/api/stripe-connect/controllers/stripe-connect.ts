import { Core, factories } from '@strapi/strapi';
import { handleWebhookEvent } from '../../../helpers/stripe-webhook-handlers';
import Stripe from 'stripe';
import { logBlock, logSimple, COLORS } from '../../../helpers/logger';
import { removeId } from '../../../helpers/sanitizeHelpers';

export default factories.createCoreController(
    'api::connected-account.connected-account',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Creates a new Stripe connected account for a klubr
         * POST /api/stripe-connect/accounts
         */
        async createAccount() {
            const ctx = strapi.requestContext.get();

            logBlock({
                statusColor: COLORS.blue,
                entries: [
                    { key: 'Controller', value: 'createAccount' },
                ],
                prefix: 'StripeConnect',
            });

            try {
                const { klubrId, businessType, country } = ctx.request.body;

                if (!klubrId) {
                    return ctx.badRequest('Le champ klubrId est requis');
                }

                if (!businessType) {
                    return ctx.badRequest('Le champ businessType est requis');
                }

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

                // Check if klubr exists (use uuid from client, not internal id)
                const klubr = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid: klubrId },
                    });

                if (!klubr) {
                    return ctx.notFound(`Klubr ${klubrId} introuvable`);
                }

                // Check if account already exists for this klubr
                const existingAccount = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .retrieveAccountByKlubr(klubr.id);

                if (existingAccount) {
                    return ctx.badRequest(
                        `Un compte Stripe Connect existe déjà pour ce klubr`
                    );
                }

                const account = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .createAccount(klubr.id, businessType, country || 'FR');

                logSimple({
                    message: 'Compte créé avec succès',
                    color: 'green',
                    prefix: 'StripeConnect',
                });

                return ctx.send({
                    success: true,
                    data: {
                        accountId: account.id,
                        status: 'pending',
                    },
                });
            } catch (error) {
                console.error(
                    'Erreur lors de la création du compte:',
                    error
                );
                return ctx.internalServerError(
                    'Une erreur est survenue lors de la création du compte Stripe'
                );
            }
        },

        /**
         * Generates onboarding link for Stripe Express account
         * POST /api/stripe-connect/accounts/:accountId/onboarding-link
         */
        async generateOnboardingLink() {
            const ctx = strapi.requestContext.get();

            logBlock({
                statusColor: COLORS.blue,
                entries: [
                    { key: 'Controller', value: 'generateOnboardingLink' },
                ],
                prefix: 'StripeConnect',
            });

            try {
                const { accountId } = ctx.params;
                const { refreshUrl, returnUrl } = ctx.request.body;

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

                // Validate URL domains
                const allowedDomains = [
                    'https://donaction.fr',
                    'https://www.donaction.fr',
                    'https://re7.donaction.fr',
                    'http://localhost',
                ];

                const isAllowedUrl = (url: string): boolean =>
                    allowedDomains.some((domain) =>
                        url.startsWith(domain)
                    );

                if (!isAllowedUrl(refreshUrl) || !isAllowedUrl(returnUrl)) {
                    return ctx.badRequest(
                        'Les URLs doivent pointer vers un domaine autorisé (donaction.fr)'
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

                const accountLink = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .generateOnboardingLink(
                        accountId,
                        refreshUrl,
                        returnUrl
                    );

                logSimple({
                    message: "Lien d'onboarding généré avec succès",
                    color: 'green',
                    prefix: 'StripeConnect',
                });

                return ctx.send({
                    success: true,
                    data: {
                        url: accountLink.url,
                        expiresAt: accountLink.expires_at,
                    },
                });
            } catch (error) {
                console.error(
                    'Erreur lors de la génération du lien:',
                    error
                );
                return ctx.internalServerError(
                    "Une erreur est survenue lors de la génération du lien d'onboarding"
                );
            }
        },

        /**
         * Syncs account status from Stripe
         * POST /api/stripe-connect/accounts/:accountId/sync
         */
        async syncAccount() {
            const ctx = strapi.requestContext.get();

            logBlock({
                statusColor: COLORS.blue,
                entries: [
                    { key: 'Controller', value: 'syncAccount' },
                ],
                prefix: 'StripeConnect',
            });

            try {
                const { accountId } = ctx.params;

                if (!accountId) {
                    return ctx.badRequest(
                        'Le paramètre accountId est requis'
                    );
                }

                const connectedAccount = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .retrieveAccount(accountId);

                if (!connectedAccount) {
                    return ctx.notFound(
                        `Compte connecté ${accountId} introuvable`
                    );
                }

                const updated = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .syncAccountStatus(accountId);

                logSimple({
                    message: 'Compte synchronisé avec succès',
                    color: 'green',
                    prefix: 'StripeConnect',
                });

                return ctx.send({
                    success: true,
                    data: removeId({
                        accountId: updated.stripe_account_id,
                        accountStatus: updated.account_status,
                        verificationStatus: updated.verification_status,
                        onboardingCompleted: updated.onboarding_completed,
                        lastSync: updated.last_sync,
                    }),
                });
            } catch (error) {
                console.error(
                    'Erreur lors de la synchronisation:',
                    error
                );
                return ctx.internalServerError(
                    'Une erreur est survenue lors de la synchronisation du compte'
                );
            }
        },

        /**
         * Retrieves connected account details
         * GET /api/stripe-connect/accounts/:accountId
         */
        async getAccount() {
            const ctx = strapi.requestContext.get();

            logBlock({
                statusColor: COLORS.blue,
                entries: [
                    { key: 'Controller', value: 'getAccount' },
                ],
                prefix: 'StripeConnect',
            });

            try {
                const { accountId } = ctx.params;

                if (!accountId) {
                    return ctx.badRequest(
                        'Le paramètre accountId est requis'
                    );
                }

                const account = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .retrieveAccount(accountId);

                if (!account) {
                    return ctx.notFound(
                        `Compte connecté ${accountId} introuvable`
                    );
                }

                logSimple({
                    message: 'Compte récupéré avec succès',
                    color: 'green',
                    prefix: 'StripeConnect',
                });

                return ctx.send({
                    success: true,
                    data: removeId({
                        accountId: account.stripe_account_id,
                        accountStatus: account.account_status,
                        verificationStatus: account.verification_status,
                        onboardingCompleted: account.onboarding_completed,
                        businessType: account.business_type,
                        country: account.country,
                        capabilities: account.capabilities,
                        requirements: account.requirements,
                        lastSync: account.last_sync,
                    }),
                });
            } catch (error) {
                console.error(
                    'Erreur lors de la récupération du compte:',
                    error
                );
                return ctx.internalServerError(
                    'Une erreur est survenue lors de la récupération du compte'
                );
            }
        },

        /**
         * Handles Stripe webhook events
         * POST /api/stripe-connect/webhook
         */
        async handleWebhook() {
            const ctx = strapi.requestContext.get();

            logBlock({
                statusColor: COLORS.blue,
                entries: [
                    { key: 'Controller', value: 'handleWebhook' },
                ],
                prefix: 'StripeConnect',
            });

            try {
                const event: Stripe.Event = ctx.state.stripeEvent;

                if (!event) {
                    return ctx.badRequest(
                        'Événement Stripe manquant (vérification de signature échouée)'
                    );
                }

                if (!event.type || typeof event.type !== 'string') {
                    return ctx.badRequest(
                        "Type d'événement Stripe invalide ou manquant"
                    );
                }

                if (!event.id || typeof event.id !== 'string') {
                    return ctx.badRequest(
                        "ID d'événement Stripe invalide ou manquant"
                    );
                }

                if (!event.data || typeof event.data !== 'object') {
                    return ctx.badRequest(
                        "Données d'événement Stripe invalides ou manquantes"
                    );
                }

                logSimple({
                    message: `Événement reçu: ${event.type} (${event.id})`,
                    color: 'blue',
                    prefix: 'StripeConnect',
                });

                // Check for duplicate event before processing
                const existingLog = await strapi.db
                    .query('api::webhook-log.webhook-log')
                    .findOne({
                        where: { event_id: event.id },
                    });

                if (existingLog?.processed) {
                    logSimple({
                        message: `Événement déjà traité: ${event.id}`,
                        color: 'yellow',
                        prefix: 'StripeConnect',
                    });
                    return { received: true };
                }

                // Log webhook event to database (or reuse existing unprocessed entry)
                const webhookLog = existingLog
                    ? existingLog
                    : await strapi
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

                logSimple({
                    message: `Webhook enregistré (documentId: ${webhookLog.documentId})`,
                    color: 'gray',
                    prefix: 'StripeConnect',
                });

                // Process webhook event
                try {
                    await handleWebhookEvent(strapi, event);

                    await strapi
                        .documents('api::webhook-log.webhook-log')
                        .update({
                            documentId: webhookLog.documentId,
                            data: {
                                processed: true,
                            },
                        });

                    logSimple({
                        message: 'Webhook traité avec succès',
                        color: 'green',
                        prefix: 'StripeConnect',
                    });

                    return { received: true };
                } catch (handlerError) {
                    console.error(
                        'Erreur lors du traitement du webhook:',
                        handlerError
                    );

                    await strapi
                        .documents('api::webhook-log.webhook-log')
                        .update({
                            documentId: webhookLog.documentId,
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
                    'Erreur lors du traitement du webhook:',
                    error
                );
                return ctx.internalServerError(
                    'Une erreur est survenue lors du traitement du webhook'
                );
            }
        },
    })
);
