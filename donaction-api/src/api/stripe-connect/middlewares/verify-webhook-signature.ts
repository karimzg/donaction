import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import Stripe from 'stripe';

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
        'STRIPE_SECRET_KEY manquant dans les variables d\'environnement'
    );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
});

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        console.log('\n🔒 ════════════════════════════════════════════════════════');
        console.log('🔒 MIDDLEWARE: verify-webhook-signature');
        console.log('🔒 ════════════════════════════════════════════════════════\n');

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_CONNECT;

        if (!webhookSecret) {
            console.error(
                '❌ STRIPE_WEBHOOK_SECRET_CONNECT manquant dans les variables d\'environnement'
            );
            return ctx.badRequest(
                'Configuration du webhook manquante'
            );
        }

        try {
            // Get raw body as string
            const sig = ctx.request.headers['stripe-signature'];

            if (!sig) {
                console.error('❌ En-tête stripe-signature manquant');
                return ctx.badRequest(
                    'Signature Stripe manquante'
                );
            }

            // Construct event from webhook payload and signature
            let event: Stripe.Event;

            try {
                // CRITICAL: Stripe signature verification requires the EXACT raw body bytes
                // Strapi may provide rawBody, but if not available, we cannot verify
                const rawBody = ctx.request.rawBody;

                if (!rawBody) {
                    console.error(
                        '❌ rawBody non disponible - la vérification de signature échouera',
                        '\n   📋 ctx.request.rawBody:', typeof ctx.request.rawBody,
                        '\n   ⚠️  IMPORTANT: Configurez Strapi pour préserver le raw body sur cette route'
                    );

                    // WARNING: Do NOT use JSON.stringify as fallback
                    // Stripe's signature is calculated on exact bytes, not re-serialized JSON
                    // Whitespace, key order, etc. will differ and signature will fail
                    return ctx.badRequest(
                        'Corps de requête brut non disponible - vérification de signature impossible'
                    );
                }

                console.log(
                    `   📦 Raw body disponible: ${typeof rawBody} (${Buffer.isBuffer(rawBody) ? rawBody.length + ' bytes' : rawBody.length + ' chars'})`
                );

                event = stripe.webhooks.constructEvent(
                    rawBody,
                    sig as string,
                    webhookSecret
                );

                console.log(
                    `✅ Signature vérifiée pour l'événement ${event.type} (${event.id})`
                );
            } catch (err) {
                console.error(
                    `❌ Échec de la vérification de signature: ${err.message}`
                );
                return ctx.badRequest(
                    `Échec de la vérification de signature: ${err.message}`
                );
            }

            // Attach verified event to context state
            ctx.state.stripeEvent = event;

            console.log('✅ Événement Stripe vérifié et attaché au contexte\n');

            // Continue to controller
            await next();
        } catch (error) {
            console.error(
                '❌ Erreur lors de la vérification de la signature:',
                error
            );
            return ctx.internalServerError(
                `Erreur lors de la vérification de la signature: ${error.message}`
            );
        }
    };
};
