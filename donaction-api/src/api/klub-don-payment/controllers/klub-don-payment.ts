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
import { logBlock, logSimple, strapiLog, COLORS } from '../../../helpers/logger';

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
            await this.validateQuery(ctx);
            await this.sanitizeQuery(ctx);
            try {
                const { donUuid, clientSecret } = ctx.query;

                const match = (clientSecret as string)?.match(
                    /^(pi_.*)_secret_/
                );
                if (!match) {
                    return ctx.badRequest(
                        'Format du client secret invalide'
                    );
                }

                const paymentIntent = await stripe.paymentIntents.retrieve(
                    match[1],
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
                strapiLog.error('Erreur check payment:', e);
                return ctx.badRequest('Une erreur est survenue');
            }
        },
        async createPaymentIntent() {
            const ctx = strapi.requestContext.get();
            await this.validateQuery(ctx);
            await this.sanitizeQuery(ctx);
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
                            strapi,
                            idempotencyKey
                        );
                    if (existingPayment?.client_secret) {
                        logSimple({
                            message: `Réutilisation du payment intent existant pour la clé: ${idempotencyKey}`,
                            color: 'yellow',
                            prefix: 'KlubDonPayment',
                        });
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
                const useStripeConnect = tradePolicy?.stripe_connect ?? false;

                // Fetch don record to derive trusted donation amount from DB
                // (never trust client-provided donationAmount for fee calculation)
                const don: KlubDonEntity = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findOne({
                        where: { uuid: metadata.donUuid },
                    });

                if (!don) {
                    return ctx.badRequest('Don introuvable');
                }

                const trustedDonation = Number(don.montant);
                const trustedContribution = Number(don.contributionAKlubr || 0);
                const expectedPrice = trustedDonation + trustedContribution;

                // Cross-check client price against DB (compare integer cents to avoid float precision issues)
                const priceCents = Math.round(Number(price) * 100);
                const expectedCents = Math.round(expectedPrice * 100);
                if (Math.abs(priceCents - expectedCents) > 1) {
                    strapiLog.error(
                        `Price mismatch: client=${price}, expected=${expectedPrice} (don=${metadata.donUuid})`
                    );
                    return ctx.badRequest(
                        'Montant incohérent avec le don enregistré'
                    );
                }

                // Base amount = total price (donation + contribution) in cents
                let amountInCents = Math.round(expectedPrice * 100);
                let applicationFeeAmount = 0;

                // Fee base = donation amount only (excludes contribution)
                const baseDonationCents = Math.round(trustedDonation * 100);

                // Stripe Connect path
                if (useStripeConnect) {
                    if (!connectedAccount?.stripe_account_id) {
                        strapiLog.error(
                            `Compte Stripe Connect manquant pour le klub: ${klubr.uuid}`
                        );
                        return ctx.badRequest(
                            'Ce klub n\'a pas de compte Stripe Connect configuré'
                        );
                    }

                    // Validate charges_enabled
                    if (!connectedAccount.charges_enabled) {
                        strapiLog.error(
                            `Compte Stripe non activé pour les paiements: ${connectedAccount.stripe_account_id}`
                        );
                        return ctx.badRequest(
                            'Le compte de paiement de ce klub n\'est pas encore activé. Veuillez réessayer plus tard.'
                        );
                    }

                    // Reject payment if trade_policy is missing (prevents silent zero-fee)
                    if (!tradePolicy) {
                        return ctx.badRequest(
                            'Ce klubr n\'a pas de politique commerciale configurée'
                        );
                    }

                    // Calculate application fee on base donation amount
                    // Includes platform commission + estimated Stripe processing fees
                    applicationFeeAmount = calculateApplicationFee(
                        baseDonationCents,
                        tradePolicy
                    );

                    // Validate donorPaysFee against trade_policy setting (strict boolean)
                    // Use policy setting if client tries to bypass
                    const shouldDonorPayFee =
                        tradePolicy.donor_pays_fee && donorPaysFee === true;

                    // If donor pays fee, add it to total amount
                    if (shouldDonorPayFee) {
                        amountInCents += applicationFeeAmount;
                    }

                    // Determine actual donor pays fee value
                    const actualDonorPaysFee =
                        tradePolicy.donor_pays_fee && donorPaysFee === true;

                    logBlock({
                        statusColor: COLORS.blue,
                        entries: [
                            { key: 'Action', value: 'Création Payment Intent (Stripe Connect)' },
                            { key: 'Montant', value: `${amountInCents / 100}€` },
                            { key: 'Frais app.', value: `${applicationFeeAmount / 100}€` },
                            { key: 'Donor fees', value: String(actualDonorPaysFee) },
                            { key: 'Compte', value: connectedAccount.stripe_account_id },
                        ],
                        prefix: 'KlubDonPayment',
                    });

                    // Create PaymentIntent for Stripe Connect
                    const paymentIntentParams: Stripe.PaymentIntentCreateParams =
                        {
                            amount: amountInCents,
                            currency: 'eur',
                            metadata: {
                                donUuid: metadata.donUuid,
                                donorUuid: metadata.donorUuid,
                                klubUuid: metadata.klubUuid,
                                projectUuid: metadata.projectUuid,
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
                        strapi,
                        'fee_calculated',
                        klubr.documentId,
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
                logBlock({
                    statusColor: COLORS.blue,
                    entries: [
                        { key: 'Action', value: 'Création Payment Intent (Stripe Classique)' },
                        { key: 'Montant', value: `${amountInCents / 100}€` },
                    ],
                    prefix: 'KlubDonPayment',
                });

                const paymentIntent = await stripe.paymentIntents.create(
                    {
                        amount: amountInCents,
                        currency: 'eur',
                        metadata: {
                            donUuid: metadata.donUuid,
                            donorUuid: metadata.donorUuid,
                            klubUuid: metadata.klubUuid,
                            projectUuid: metadata.projectUuid,
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
                strapiLog.error('Erreur création payment intent:', e);
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
                    // Use rawBody for signature verification (consistent with Connect webhook)
                    const rawBody = ctx.request.rawBody
                        || ctx.request.body[Symbol.for('unparsedBody')];
                    event = stripe.webhooks.constructEvent(
                        rawBody,
                        sig,
                        endpointSecret,
                    );
                } catch (err) {
                    strapiLog.error(
                        `Webhook signature verification failed: ${err.message}`
                    );
                    return ctx.badRequest(`Webhook Error: ${err.message}`);
                }

                const { donUuid, donorUuid, klubUuid, projectUuid } =
                    event.data.object.metadata;

                // Handle events
                switch (event.type) {
                    case 'payment_intent.created':
                        logSimple({
                            message: `Payment intent created: ${event.data.object.id}`,
                            color: 'green',
                            prefix: 'KlubDonPayment',
                        });
                        await strapi.services[
                            'api::klub-don-payment.klub-don-payment'
                        ].updateDonAndDonPayment({
                            status: 'pending',
                            donUuid,
                            intent: event.data.object,
                        });
                        break;
                    case 'payment_intent.succeeded':
                        logSimple({
                            message: `Payment successful: ${event.data.object.id}`,
                            color: 'green',
                            prefix: 'KlubDonPayment',
                        });
                        await strapi.services[
                            'api::klub-don-payment.klub-don-payment'
                        ].updateDonAndDonPayment({
                            status: 'success',
                            donUuid,
                            intent: event.data.object,
                        });
                        break;
                    case 'payment_intent.payment_failed':
                        logSimple({
                            message: `Payment intent failed: ${event.data.object.id}`,
                            color: 'red',
                            prefix: 'KlubDonPayment',
                        });
                        await strapi.services[
                            'api::klub-don-payment.klub-don-payment'
                        ].updateDonAndDonPayment({
                            status: 'error',
                            donUuid,
                            intent: event.data.object,
                        });
                        break;
                    default:
                        logSimple({
                            message: `Unhandled event type: ${event.type}`,
                            color: 'yellow',
                            prefix: 'KlubDonPayment',
                        });
                }

                ctx.send({ received: true });
            } catch (e) {
                strapiLog.error('Erreur webhook Stripe:', e);
                return ctx.internalServerError(
                    'Une erreur est survenue lors du traitement du webhook'
                );
            }
        },
    }),
);
