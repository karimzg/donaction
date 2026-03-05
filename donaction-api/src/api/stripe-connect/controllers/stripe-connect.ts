import { Core, factories } from '@strapi/strapi';
import { handleWebhookEvent } from '../../../helpers/stripe-webhook-handlers';
import type Stripe from 'stripe';
import { logBlock, logSimple, strapiLog, COLORS } from '../../../helpers/logger';
import { removeId } from '../../../helpers/sanitizeHelpers';
import { ALLOWED_ONBOARDING_DOMAINS } from '../../../constants';
import { isDuplicateStatus } from '../../webhook-log/services/webhook-log-helpers';

export default factories.createCoreController(
    'api::connected-account.connected-account',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Creates a new Stripe connected account for a klubr
         * POST /api/stripe-connect/accounts
         */
        async createAccount() {
            const ctx = strapi.requestContext.get();
            await this.validateQuery(ctx);
            await this.sanitizeQuery(ctx);

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

                // Klubr already validated by klubr-owner middleware
                const klubr = ctx.state.klubr;
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
                strapiLog.error(
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
            await this.validateQuery(ctx);
            await this.sanitizeQuery(ctx);

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

                // Validate URL domains using origin comparison (prevents subdomain bypass)
                const isAllowedUrl = (url: string): boolean => {
                    try {
                        const { origin } = new URL(url);
                        return ALLOWED_ONBOARDING_DOMAINS.includes(origin);
                    } catch {
                        return false;
                    }
                };

                if (!isAllowedUrl(refreshUrl) || !isAllowedUrl(returnUrl)) {
                    return ctx.badRequest(
                        'Les URLs doivent pointer vers un domaine autorisé (donaction.fr)'
                    );
                }

                // Use account already validated by account-owner middleware
                const connectedAccount = ctx.state.connectedAccount;
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
                strapiLog.error(
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
            await this.validateQuery(ctx);
            await this.sanitizeQuery(ctx);

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

                // Use account already validated by account-owner middleware
                const connectedAccount = ctx.state.connectedAccount;
                if (!connectedAccount) {
                    return ctx.notFound(
                        `Compte connecté ${accountId} introuvable`
                    );
                }

                const updated = await strapi
                    .service('api::stripe-connect.stripe-connect')
                    .syncAccountStatus(accountId);

                const sanitizedUpdated = await this.sanitizeOutput(updated, ctx) as any;

                logSimple({
                    message: 'Compte synchronisé avec succès',
                    color: 'green',
                    prefix: 'StripeConnect',
                });

                return ctx.send({
                    success: true,
                    data: removeId({
                        accountId: sanitizedUpdated.stripe_account_id,
                        accountStatus: sanitizedUpdated.account_status,
                        verificationStatus: sanitizedUpdated.verification_status,
                        onboardingCompleted: sanitizedUpdated.onboarding_completed,
                        lastSync: sanitizedUpdated.last_sync,
                    }),
                });
            } catch (error) {
                strapiLog.error(
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
            await this.validateQuery(ctx);
            await this.sanitizeQuery(ctx);

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

                // Use account already validated by account-owner middleware
                const account = ctx.state.connectedAccount;
                if (!account) {
                    return ctx.notFound(
                        `Compte connecté ${accountId} introuvable`
                    );
                }

                const sanitizedAccount = await this.sanitizeOutput(account, ctx) as any;

                logSimple({
                    message: 'Compte récupéré avec succès',
                    color: 'green',
                    prefix: 'StripeConnect',
                });

                return ctx.send({
                    success: true,
                    data: removeId({
                        accountId: sanitizedAccount.stripe_account_id,
                        accountStatus: sanitizedAccount.account_status,
                        verificationStatus: sanitizedAccount.verification_status,
                        onboardingCompleted: sanitizedAccount.onboarding_completed,
                        businessType: sanitizedAccount.business_type,
                        country: sanitizedAccount.country,
                        capabilities: sanitizedAccount.capabilities,
                        requirements: sanitizedAccount.requirements,
                        lastSync: sanitizedAccount.last_sync,
                    }),
                });
            } catch (error) {
                strapiLog.error(
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

                // Idempotency: try to create the webhook log entry first.
                // If a concurrent request already created it (unique constraint on event_id),
                // catch the error and re-fetch the existing entry.
                let webhookLog;
                try {
                    webhookLog = await strapi
                        .documents('api::webhook-log.webhook-log')
                        .create({
                            data: {
                                event_id: event.id,
                                event_type: event.type,
                                source: event.account ? 'connect' : 'platform',
                                stripe_account_id: event.account || null,
                                payload: event.data.object as any,
                                status: 'received',
                                retry_count: 0,
                            },
                        });
                } catch (createError) {
                    // Only handle PostgreSQL unique constraint violations (code 23505)
                    // Rethrow any other DB errors (connection timeout, ORM bugs, etc.)
                    const isUniqueViolation =
                        createError?.code === '23505' ||
                        createError?.detail?.includes('already exists');

                    if (!isUniqueViolation) {
                        throw createError;
                    }

                    // Unique constraint violation — another request won the race
                    webhookLog = await strapi.db
                        .query('api::webhook-log.webhook-log')
                        .findOne({
                            where: { event_id: event.id },
                        });

                    if (!webhookLog) {
                        throw createError; // Unexpected state, re-throw
                    }

                    if (isDuplicateStatus(webhookLog.status)) {
                        logSimple({
                            message: `Événement déjà traité: ${event.id}`,
                            color: 'yellow',
                            prefix: 'StripeConnect',
                        });
                        return ctx.send({ received: true });
                    }
                }

                logSimple({
                    message: `Webhook enregistré (documentId: ${webhookLog.documentId})`,
                    color: 'gray',
                    prefix: 'StripeConnect',
                });

                // Optimistic lock: claim webhook for processing
                // PostgreSQL re-evaluates WHERE after row lock, preventing concurrent double-processing
                const errorFilter = webhookLog.processing_error != null
                    ? { processing_error: { $eq: webhookLog.processing_error } }
                    : { processing_error: { $null: true } };

                const claimed = await strapi.db
                    .query('api::webhook-log.webhook-log')
                    .update({
                        where: { id: webhookLog.id, status: 'received', ...errorFilter },
                        data: { status: 'processing' },
                    });

                if (!claimed) {
                    logSimple({
                        message: `Webhook déjà en cours de traitement: ${event.id}`,
                        color: 'yellow',
                        prefix: 'StripeConnect',
                    });
                    return ctx.send({ received: true });
                }

                // Process webhook event
                try {
                    await handleWebhookEvent(strapi, event);

                    await strapi
                        .documents('api::webhook-log.webhook-log')
                        .update({
                            documentId: webhookLog.documentId,
                            data: {
                                status: 'processed',
                                processed_at: new Date(),
                                processing_error: null,
                            },
                        });

                    logSimple({
                        message: 'Webhook traité avec succès',
                        color: 'green',
                        prefix: 'StripeConnect',
                    });

                    return ctx.send({ received: true });
                } catch (handlerError) {
                    strapiLog.error(
                        'Erreur lors du traitement du webhook:',
                        handlerError
                    );

                    await strapi
                        .documents('api::webhook-log.webhook-log')
                        .update({
                            documentId: webhookLog.documentId,
                            data: {
                                status: 'failed',
                                processing_error: handlerError.message,
                                retry_count: (webhookLog.retry_count || 0) + 1,
                            },
                        });

                    // Return 200 to Stripe to avoid retries (don't leak internal error details)
                    // Failed events will be retried by our own retry logic
                    return ctx.send({ received: true });
                }
            } catch (error) {
                strapiLog.error(
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
