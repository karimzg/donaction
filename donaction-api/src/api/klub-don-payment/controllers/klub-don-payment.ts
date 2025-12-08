/**
 * klub-don-payment controller
 */

import { Core, factories } from '@strapi/strapi';
import createAssessment from '../../../helpers/gcc/createAssessment';
import { KlubDonEntity } from '../../../_types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default factories.createCoreController(
    'api::klub-don-payment.klub-don-payment',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async create() {
            const ctx = strapi.requestContext.get();

            if (!ctx.request.body?.data['formToken']) {
                return ctx.badRequest('Missing reCaptcha token.');
            }
            const result = await createAssessment({
                token: ctx.request.body?.data['formToken'],
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
                const { price, metadata } = ctx.request.body;
                if (!price || !metadata || !metadata?.donUuid) {
                    return ctx.badRequest('Une erreur est survenue');
                }
                const paymentIntent = await stripe.paymentIntents.create({
                    // Stripe divides the price by 100 (https://stripe.com/docs/currencies#zero-decimal)
                    amount: Number(price) * 100,
                    currency: 'eur',
                    metadata: metadata,
                });
                await strapi.services[
                    'api::klub-don-payment.klub-don-payment'
                ].updateDonAndDonPayment({
                    status: 'pending',
                    donUuid: metadata.donUuid,
                    intent: paymentIntent,
                });
                return {
                    intent: paymentIntent.client_secret,
                };
            } catch (e) {
                console.log(e);
                return ctx.badRequest('Une erreur est survenue');
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
