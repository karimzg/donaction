import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import type Stripe from 'stripe';
import { stripe } from '../../../helpers/stripe-connect-helper';
import { logBlock, logSimple, strapiLog, COLORS } from '../../../helpers/logger';

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
            strapiLog.error(
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
                // CRITICAL: Stripe signature verification requires the EXACT raw body bytes.
                // Strapi's body parser with `includeUnparsed: true` and `patchKoa: true`
                // exposes the raw body via `ctx.request.body[Symbol.for('unparsedBody')]`
                // (koa-body internals). Fall back to ctx.request.rawBody for compatibility.
                const rawBody =
                    ctx.request.body?.[Symbol.for('unparsedBody')] ??
                    (ctx.request as any).rawBody;

                if (!rawBody) {
                    strapiLog.error(
                        'rawBody non disponible - vérifiez config/middlewares.ts (includeUnparsed: true, patchKoa: true)'
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
                strapiLog.error(
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
            strapiLog.error(
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
