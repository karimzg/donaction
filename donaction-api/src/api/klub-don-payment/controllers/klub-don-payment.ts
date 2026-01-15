/**
 * klub-don-payment controller
 */

import { Core, factories } from '@strapi/strapi';
import createAssessment from '../../../helpers/gcc/createAssessment';
import {
    KlubDonEntity,
    KlubrEntity,
    TradePolicyEntity,
    ConnectedAccountEntity,
} from '../../../_types';
import type Stripe from 'stripe';
import {
    findExistingPaymentByIdempotencyKey,
    isValidIdempotencyKey,
} from '../../../helpers/idempotency-helper';
import {
    calculateApplicationFee,
    logFinancialAction,
    stripe,
} from '../../../helpers/stripe-connect-helper';

export default factories.createCoreController(
    'api::klub-don-payment.klub-don-payment',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async create() {
            const ctx = strapi.requestContext.get();
            const { formToken, ...cleanData } = ctx.request.body?.data || {};
            if (!formToken) {
                return ctx.badRequest('Missing reCaptcha token.');
            }
            ctx.request.body.data = cleanData;
            const result = await createAssessment({
                token: formToken,
                recaptchaAction: 'CREATE_DONATION_PAYMENT',
            });
            if (!result) {
                return ctx.badRequest('Captcha verification failed');
            }
            const klubrDon: KlubDonEntity = await strapi.db
                .query('api::klub-don.klub-don')
                .findOne({
                    where: { uuid: ctx.request.body?.data?.klub_don },
                });
            ctx.request.body.data.klub_don = klubrDon.id;
            const entity = await super.create(ctx);
            return await this.sanitizeOutput(entity.data.attributes, ctx);
        },
        async check() {
            const ctx = strapi.requestContext.get();
            try {
                const { donUuid, clientSecret } = ctx.query;

                const paymentIntent = await stripe.paymentIntents.retrieve(
                    (clientSecret as string).match(/^(pi_.*)_secret_/)[1],
                );

                return await strapi.services[
                    'api::klub-don-payment.klub-don-payment'
                ].updateDonAndDonPayment({
                    status:
                        paymentIntent.status === 'succeeded'
                            ? 'success'
                            : paymentIntent?.last_payment_error
                              ? 'error'
                              : 'pending',
                    donUuid: donUuid,
                    intent: paymentIntent,
                });
            } catch (e) {
                console.log(e);
                return ctx.badRequest('Une erreur est survenue');
            }
        },
        async createPaymentIntent() {
            const ctx = strapi.requestContext.get();
            try {
                const { price, metadata, idempotencyKey, donorPaysFee } =
                    ctx.request.body;

                if (!price || !metadata || !metadata?.donUuid) {
                    return ctx.badRequest('Données de paiement manquantes');
                }

                if (!metadata?.klubUuid) {
                    return ctx.badRequest('UUID du klub manquant');
                }

                // Validate idempotency key format if provided
                if (idempotencyKey && !isValidIdempotencyKey(idempotencyKey)) {
                    return ctx.badRequest('Clé d\'idempotence invalide');
                }

                // Check for existing payment with same idempotency key
                if (idempotencyKey) {
                    const existingPayment =
                        await findExistingPaymentByIdempotencyKey(
                            idempotencyKey
                        );
                    if (existingPayment?.client_secret) {
                        console.log(
                            `♻️ Réutilisation du payment intent existant pour la clé: ${idempotencyKey}`
                        );
                        return {
                            intent: existingPayment.client_secret,
                            reused: true,
                        };
                    }
                }

                // Fetch klubr with trade_policy and connected_account
                const klubr: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid: metadata.klubUuid },
                        populate: {
                            trade_policy: true,
                            connected_account: true,
                        },
                    });

                if (!klubr) {
                    return ctx.notFound('Klub introuvable');
                }

                const tradePolicy = klubr.trade_policy as TradePolicyEntity;
                const connectedAccount =
                    klubr.connected_account as ConnectedAccountEntity;
                const useStripeConnect = tradePolicy?.stripe_connect ?? true;

                // Calculate base amount in cents
                let amountInCents = Number(price) * 100;
                let applicationFeeAmount = 0;

                // Stripe Connect path
                if (useStripeConnect) {
                    if (!connectedAccount?.stripe_account_id) {
                        console.error(
                            `❌ Compte Stripe Connect manquant pour le klub: ${klubr.uuid}`
                        );
                        return ctx.badRequest(
                            'Ce klub n\'a pas de compte Stripe Connect configuré'
                        );
                    }

                    // Validate charges_enabled
                    if (!connectedAccount.charges_enabled) {
                        console.error(
                            `❌ Compte Stripe non activé pour les paiements: ${connectedAccount.stripe_account_id}`
                        );
                        return ctx.badRequest(
                            'Le compte de paiement de ce klub n\'est pas encore activé. Veuillez réessayer plus tard.'
                        );
                    }

                    // Calculate application fee
                    if (tradePolicy) {
                        applicationFeeAmount = calculateApplicationFee(
                            amountInCents,
                            tradePolicy
                        );

                        // Validate donorPaysFee against trade_policy setting
                        // Use policy setting if client tries to bypass
                        const shouldDonorPayFee =
                            tradePolicy.donor_pays_fee && donorPaysFee;

                        // If donor pays fee, add it to total amount
                        if (shouldDonorPayFee) {
                            amountInCents += applicationFeeAmount;
                        }
                    }

                    // Determine actual donor pays fee value
                    const actualDonorPaysFee =
                        tradePolicy?.donor_pays_fee && donorPaysFee;

                    console.log('\n💳 ════════════════════════════════════════');
                    console.log('💳 CRÉATION PAYMENT INTENT (STRIPE CONNECT)');
                    console.log(`💳 Montant: ${amountInCents / 100}€`);
                    console.log(`💳 Frais application: ${applicationFeeAmount / 100}€`);
                    console.log(`💳 Donateur paie frais: ${actualDonorPaysFee}`);
                    console.log(`💳 Compte connecté: ${connectedAccount.stripe_account_id}`);
                    console.log('💳 ════════════════════════════════════════\n');

                    // Create PaymentIntent for Stripe Connect
                    const paymentIntentParams: Stripe.PaymentIntentCreateParams =
                        {
                            amount: amountInCents,
                            currency: 'eur',
                            metadata: {
                                ...metadata,
                                payment_method: 'stripe_connect',
                                donor_pays_fee: String(actualDonorPaysFee),
                            },
                            on_behalf_of: connectedAccount.stripe_account_id,
                            transfer_data: {
                                destination: connectedAccount.stripe_account_id,
                            },
                            application_fee_amount: applicationFeeAmount,
                        };

                    const paymentIntent = await stripe.paymentIntents.create(
                        paymentIntentParams,
                        {
                            idempotencyKey: idempotencyKey || undefined,
                        }
                    );

                    // Update donation and payment records
                    await strapi.services[
                        'api::klub-don-payment.klub-don-payment'
                    ].updateDonAndDonPayment({
                        status: 'pending',
                        donUuid: metadata.donUuid,
                        intent: paymentIntent,
                        idempotencyKey,
                        applicationFeeAmount,
                        paymentMethod: 'stripe_connect',
                    });

                    // Log financial action for audit
                    await logFinancialAction(
                        'fee_calculated',
                        Number(klubr.id),
                        null,
                        applicationFeeAmount,
                        paymentIntent.id,
                        {
                            donation_uuid: metadata.donUuid,
                            fee_model: tradePolicy?.fee_model,
                            donor_pays_fee: actualDonorPaysFee,
                            total_amount: amountInCents,
                        }
                    );

                    return {
                        intent: paymentIntent.client_secret,
                        reused: false,
                    };
                }

                // Classic Stripe path (stripeConnect = false)
                console.log('\n💳 ════════════════════════════════════════');
                console.log('💳 CRÉATION PAYMENT INTENT (STRIPE CLASSIQUE)');
                console.log(`💳 Montant: ${amountInCents / 100}€`);
                console.log('💳 ════════════════════════════════════════\n');

                const paymentIntent = await stripe.paymentIntents.create(
                    {
                        amount: amountInCents,
                        currency: 'eur',
                        metadata: {
                            ...metadata,
                            payment_method: 'stripe_classic',
                        },
                    },
                    {
                        idempotencyKey: idempotencyKey || undefined,
                    }
                );

                await strapi.services[
                    'api::klub-don-payment.klub-don-payment'
                ].updateDonAndDonPayment({
                    status: 'pending',
                    donUuid: metadata.donUuid,
                    intent: paymentIntent,
                    idempotencyKey,
                    applicationFeeAmount: 0,
                    paymentMethod: 'stripe_classic',
                });

                return {
                    intent: paymentIntent.client_secret,
                    reused: false,
                };
            } catch (e) {
                console.error('❌ Erreur création payment intent:', e);
                return ctx.badRequest(
                    'Une erreur est survenue lors de la création du paiement'
                );
            }
        },
        async stripeWebHooks() {
            const ctx = strapi.requestContext.get();
            try {
                const sig = ctx.request.headers['stripe-signature'];
                const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

                let event;
                try {
                    event = stripe.webhooks.constructEvent(
                        ctx.request.body[Symbol.for('unparsedBody')],
                        sig,
                        endpointSecret,
                    );
                } catch (err) {
                    console.error(
                        '⚠️ Webhook signature verification failed:',
                        err.message,
                    );
                    return ctx.badRequest(`Webhook Error: ${err.message}`);
                }

                const { donUuid, donorUuid, klubUuid, projectUuid } =
                    event.data.object.metadata;

                // Handle events
                switch (event.type) {
                    case 'payment_intent.created':
                        console.info(
                            '✅ Payment intent created:',
                            event.data.object,
                        );
                        await strapi.services[
                            'api::klub-don-payment.klub-don-payment'
                        ].updateDonAndDonPayment({
                            status: 'pending',
                            donUuid,
                            intent: event.data.object,
                        });
                        break;
                    case 'payment_intent.succeeded':
                        console.info(
                            '✅ Payment successful:',
                            event.data.object,
                        );
                        await strapi.services[
                            'api::klub-don-payment.klub-don-payment'
                        ].updateDonAndDonPayment({
                            status: 'success',
                            donUuid,
                            intent: event.data.object,
                        });
                        break;
                    case 'payment_intent.payment_failed':
                        console.info(
                            'Payment intent failed:',
                            event.data.object,
                        );
                        await strapi.services[
                            'api::klub-don-payment.klub-don-payment'
                        ].updateDonAndDonPayment({
                            status: 'error',
                            donUuid,
                            intent: event.data.object,
                        });
                        break;
                    default:
                        console.warn(`Unhandled event type: ${event.type}`);
                }

                ctx.send({ received: true });
            } catch (e) {
                console.log(e);
            }
        },
    }),
);
