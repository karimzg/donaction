/**
 * klub-don-payment service
 */

import { Core, factories } from '@strapi/strapi';
import { KlubDonEntity } from '../../../_types';
import GetAttNumber from '../../../helpers/getAttNumber';
import Stripe from 'stripe';

export default factories.createCoreService(
    'api::klub-don-payment.klub-don-payment',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async updateDonAndDonPayment({
            status,
            donUuid,
            intent,
            idempotencyKey,
            applicationFeeAmount,
            paymentMethod,
        }: {
            status: string;
            donUuid: string;
            intent: Stripe.PaymentIntent;
            idempotencyKey?: string;
            applicationFeeAmount?: number;
            paymentMethod?: 'stripe_classic' | 'stripe_connect';
        }) {
            try {
                const klubrDon: KlubDonEntity = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findOne({
                        where: { uuid: donUuid },
                        populate: {
                            klub_don_payments: true,
                            klub_don_contribution: true,
                        },
                    });
                const body = {
                    data: {
                        amount: intent.amount,
                        client_secret: intent.client_secret,
                        currency: intent.currency,
                        payment_method:
                            paymentMethod ||
                            intent.payment_method ||
                            intent?.last_payment_error?.payment_method?.id ||
                            '',
                        created: intent.created,
                        intent_id: intent.id,
                        error_code:
                            intent['error_code'] ||
                            intent?.last_payment_error?.code ||
                            '',
                        status: intent.status,
                        klub_don: klubrDon.id,
                        ...(idempotencyKey && { idempotency_key: idempotencyKey }),
                        ...(applicationFeeAmount !== undefined && {
                            application_fee_amount: applicationFeeAmount,
                        }),
                    },
                };
                const payment = klubrDon.klub_don_payments.find(
                    (_) => _.intent_id === body.data.intent_id,
                );
                if (payment) {
                    await strapi
                        .documents('api::klub-don-payment.klub-don-payment')
                        .update({
                            documentId: payment.documentId,
                            // @ts-ignore
                            data: body.data,
                        });
                } else {
                    await strapi
                        .documents('api::klub-don-payment.klub-don-payment')
                        // @ts-ignore
                        .create(body);
                }
                const klubDonBody = {
                    data: {
                        statusPaiment: status || 'notDone',
                    },
                };
                if (status === 'success') {
                    klubDonBody.data['datePaiment'] = new Date();
                    if (!klubrDon.attestationNumber) {
                        klubDonBody.data['attestationNumber'] =
                            await GetAttNumber.i().generate();
                    }
                    if (
                        !klubrDon.klub_don_contribution &&
                        klubrDon.contributionAKlubr > 0
                    ) {
                        const contributionEntity: KlubDonEntity =
                            await strapi.services[
                                'api::klub-don.klub-don'
                            ].createContributionForDon(
                                {
                                    ...klubrDon,
                                    datePaiment:
                                        klubDonBody.data['datePaiment'],
                                    attestationNumber:
                                        klubrDon?.attestationNumber ||
                                        klubDonBody.data['attestationNumber'],
                                },
                                null,
                            );
                        klubDonBody.data['klub_don_contribution'] =
                            contributionEntity.id;
                    }
                }

                const res = await strapi
                    .documents('api::klub-don.klub-don')
                    .update({
                        documentId: klubrDon.documentId,
                        // @ts-ignore
                        data: klubDonBody.data,
                    });
                GetAttNumber.unlock();
                return res;
            } catch (e) {
                GetAttNumber.unlock();
            }
        },
    }),
);
