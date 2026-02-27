import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import Stripe from 'stripe';
import { stripe } from '../../../helpers/stripe-connect-helper';
import { logBlock, logSimple, COLORS } from '../../../helpers/logger';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        logBlock({
            statusColor: COLORS.yellow,
            entries: [
                { key: 'Middleware', value: 'verify-webhook-signature' },
            ],
            prefix: 'StripeConnect',
        });

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_CONNECT;

        if (!webhookSecret) {
            console.error(
                'STRIPE_WEBHOOK_SECRET_CONNECT manquant dans les variables d\'environnement'
            );
            return ctx.badRequest(
                'Configuration du webhook manquante'
            );
        }

        try {
            const sig = ctx.request.headers['stripe-signature'];

            if (!sig) {
                return ctx.badRequest(
                    'Signature Stripe manquante'
                );
            }

            let event: Stripe.Event;

            try {
                // CRITICAL: Stripe signature verification requires the EXACT raw body bytes
                const rawBody = ctx.request.rawBody;

                if (!rawBody) {
                    console.error(
                        'rawBody non disponible - la vérification de signature échouera',
                        '\n   ctx.request.rawBody:', typeof ctx.request.rawBody,
                        '\n   IMPORTANT: Configurez Strapi pour préserver le raw body sur cette route'
                    );

                    // WARNING: Do NOT use JSON.stringify as fallback
                    // Stripe's signature is calculated on exact bytes, not re-serialized JSON
                    return ctx.badRequest(
                        'Corps de requête brut non disponible - vérification de signature impossible'
                    );
                }

                event = stripe.webhooks.constructEvent(
                    rawBody,
                    sig as string,
                    webhookSecret
                );

                logSimple({
                    message: `Signature vérifiée: ${event.type} (${event.id})`,
                    color: 'green',
                    prefix: 'StripeConnect',
                });
            } catch (err) {
                console.error(
                    `Échec de la vérification de signature: ${err.message}`
                );
                return ctx.badRequest(
                    `Échec de la vérification de signature: ${err.message}`
                );
            }

            // Attach verified event to context state
            ctx.state.stripeEvent = event;

            await next();
        } catch (error) {
            console.error(
                'Erreur lors de la vérification de la signature:',
                error
            );
            // Don't expose internal error details to client (security)
            return ctx.internalServerError(
                'Une erreur est survenue lors de la vérification du webhook'
            );
        }
    };
};
