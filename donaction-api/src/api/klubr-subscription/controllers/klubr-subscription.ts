/**
 * klubr-subscription controller
 */

import { Core, factories } from '@strapi/strapi';
import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import updateAuthorizedHosts from '../../../helpers/gcc/updateAuthorizedHosts';
import { KlubrSubscriptionEntity, PaginationEntity } from '../../../_types';
import { removeId } from '../../../helpers/sanitizeHelpers';

export default factories.createCoreController(
    'api::klubr-subscription.klubr-subscription',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async create(ctx) {
            try {
                //TODO: @Karim; get klubr member details to check if he can create a subscription for this klub ?
                //TODO: KlubrUuid is optionnal only for donaction.fr, re7.donaction.fr
                if (
                    !ctx.request.body?.data?.web_component ||
                    !ctx.request.body?.data?.host
                    // || !ctx.request.body?.data?.klubr
                ) {
                    return ctx.badRequest(
                        'Missing klubr | web_component | host',
                    );
                }

                ctx.request.body.data.uuid = v4();

                ctx.request.body.data.apiToken = jwt.sign(
                    {
                        uuid: ctx.request.body.data.uuid,
                        host: ctx.request.body.data.host,
                        web_component: ctx.request.body.data.web_component,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: ctx.request.body.data.host.includes(
                            'localhost',
                        )
                            ? '1d'
                            : '365d',
                    },
                );
                const klubrUuid = ctx.request.body.data?.klubr;

                if ('klubr' in ctx.request.body.data) {
                    delete ctx.request.body.data.klubr;
                }
                const entity = await super.create(ctx);

                if (klubrUuid) {
                    const klubr = await strapi.db
                        .query('api::klubr.klubr')
                        .findOne({
                            where: { uuid: klubrUuid },
                        });
                    await strapi
                        .documents('api::klubr-subscription.klubr-subscription')
                        .update({
                            documentId: entity.data.documentId,
                            data: {
                                klubr: klubr.id,
                            },
                        });
                }

                const res = await strapi
                    .documents('api::klubr-subscription.klubr-subscription')
                    .findOne({
                        documentId: entity.data.documentId,
                        populate: {
                            klubr: {
                                populate: {
                                    logo: true,
                                    klubr_house: true,
                                },
                            },
                        },
                    });

                const keysRes = await updateAuthorizedHosts({
                    host: ctx.request.body.data.host,
                    remove: false,
                });

                return { ...res, ...keysRes };
            } catch (e) {
                console.log(e);
                return ctx.badRequest(e);
            }
        },

        async delete(ctx) {
            try {
                const subscriptionUuid = ctx?.params?.id;
                const subscriptionEntity = await strapi.db
                    .query('api::klubr-subscription.klubr-subscription')
                    .findOne({
                        where: { uuid: subscriptionUuid },
                    });

                if (!subscriptionEntity) {
                    console.log('subscription cannot be found');
                    return ctx.badRequest('Subscription cannot be found');
                }

                ctx.params.id = subscriptionEntity?.id;

                const entity = await super.delete(ctx);

                const resKeys = await updateAuthorizedHosts({
                    host: subscriptionEntity.host,
                    remove: true,
                });

                return {
                    ...entity,
                    ...resKeys,
                };
            } catch (e) {
                return ctx.badRequest(e);
            }
        },

        async findOne(ctx) {
            // const ctx = strapi.requestContext.get();
            try {
                const { id } = ctx.params;

                if (!id) {
                    return ctx.badRequest('Missing subscription uuid.');
                }
                ctx.query = { ...ctx.query, filters: { uuid: id } };
                await this.validateQuery(ctx);

                const sanitizedQueryParams = await this.sanitizeQuery(ctx);

                const {
                    results,
                    pagination,
                }: {
                    results: Array<KlubrSubscriptionEntity>;
                    pagination: PaginationEntity;
                } = await strapi
                    .service('api::klubr-subscription.klubr-subscription')
                    .find(sanitizedQueryParams);

                console.log('results', results);

                if (results.length === 0) {
                    return ctx.notFound('Don not found');
                }

                const entity = results[0];
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(sanitizedResult);

                // const subscriptionUuid = ctx?.params?.id;
                // const subscriptionEntity = await strapi.db
                //     .query('api::klubr-subscription.klubr-subscription')
                //     .findOne({
                //         where: { uuid: subscriptionUuid },
                //     });
                // console.log('subscriptionEntity', subscriptionEntity);
                // if (!subscriptionEntity) {
                //     console.log('subscription cannot be found');
                //     return ctx.badRequest('Subscription cannot be found');
                // }
                // console.log('ID', subscriptionEntity?.id);
                //
                // ctx.params.id = subscriptionEntity?.id;
                //
                // const entity = await super.findOne(ctx);
                //
                // console.log('entity', entity);
                // return {
                //     ...entity,
                // };
            } catch (e) {
                return ctx.badRequest(e);
            }
        },

        async find() {
            const ctx = strapi.requestContext.get();
            try {
                if (ctx.query?.filters && ctx.query?.filters['id']) {
                    delete ctx.query.filters['id'];
                }
                await this.validateQuery(ctx);

                const sanitizedQueryParams = await this.sanitizeQuery(ctx);
                const {
                    results,
                    pagination,
                }: {
                    results: Array<KlubrSubscriptionEntity>;
                    pagination: PaginationEntity;
                } = await strapi
                    .service('api::klubr-subscription.klubr-subscription')
                    .find(sanitizedQueryParams);
                const sanitizedResult = await this.sanitizeOutput(results, ctx);
                return {
                    data: removeId(sanitizedResult),
                    meta: { pagination },
                };
            } catch (e) {
                return ctx.badRequest(e);
            }
        },

        async decrypt(ctx) {
            if (!ctx.request.body?.apiToken) {
                return ctx.badRequest('Missing Api Token');
            }

            let decoded;
            try {
                decoded = jwt.verify(
                    ctx.request.body?.apiToken,
                    process.env.JWT_SECRET,
                );
            } catch (e) {
                console.log(e);
                return ctx.badRequest('Api Token is expired');
            }

            const klubrPopulate = {
                populate: {
                    logo: true,
                    klubr_house: true,
                    trade_policy: {
                        fields: ['allowKlubrContribution'],
                    },
                },
            };
            const res = await strapi.db
                .query('api::klubr-subscription.klubr-subscription')
                .findOne({
                    where: { uuid: decoded?.uuid },
                    populate: {
                        klubr: klubrPopulate,
                    },
                });

            if (!res) {
                console.log('subscription cannot be found');
                return ctx.badRequest('Subscription cannot be found');
            }

            if (!res.klubr && !ctx.request.body.klubrUuid) {
                return ctx.badRequest('Missing Klubr');
            }

            if (!res.klubr) {
                const klubr = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid: ctx.request.body?.klubrUuid },
                        populate: klubrPopulate.populate,
                    });
                if (!klubr) {
                    return ctx.badRequest('Unknown Klubr');
                }
                res.klubr = klubr;
            }
            if (ctx.request.body?.projectUuid) {
                const project = await strapi.db
                    .query('api::klub-projet.klub-projet')
                    .findOne({
                        where: { uuid: ctx.request.body?.projectUuid },
                        populate: {
                            klubr: klubrPopulate,
                        },
                    });
                if (!project) {
                    return ctx.badRequest('Unknown project');
                }
                if (project?.klubr?.uuid !== res.klubr?.uuid) {
                    return ctx.badRequest('Unknown project for this klub');
                }
                res.project = project;
            }

            return res;
        },
    }),
);
