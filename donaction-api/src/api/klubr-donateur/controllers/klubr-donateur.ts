/**
 * klubr-donateur controller
 */

import { Core, factories } from '@strapi/strapi';
import { removeId } from '../../../helpers/sanitizeHelpers';
import {
    KlubDonEntity,
    KlubrDonateurEntity,
    PaginationEntity,
    UserEntity,
} from '../../../_types';

export default factories.createCoreController(
    'api::klubr-donateur.klubr-donateur',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async findOne() {
            const ctx = strapi.requestContext.get();

            const { id } = ctx.params;

            if (!id) {
                return ctx.badRequest('Missing klub uuid.');
            }
            ctx.query = { ...ctx.query, filters: { uuid: id } };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const {
                results,
                pagination,
            }: {
                results: Array<KlubrDonateurEntity>;
                pagination: PaginationEntity;
            } = await strapi
                .service('api::klubr-donateur.klubr-donateur')
                .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound('Don not found');
            }

            const entity = results[0];
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },

        async find() {
            const ctx = strapi.requestContext.get();
            if (ctx.query?.filters['id'] && ctx.query?.filters['id']) {
                delete ctx.query.filters['id'];
            }
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            const {
                results,
                pagination,
            }: {
                results: Array<KlubrDonateurEntity>;
                pagination: PaginationEntity;
            } = await strapi
                .service('api::klubr-donateur.klubr-donateur')
                .find(sanitizedQueryParams);
            const sanitizedResult = await this.sanitizeOutput(results, ctx);
            return { data: removeId(sanitizedResult), meta: { pagination } };
        },

        async update() {
            const ctx = strapi.requestContext.get();
            try {
                // prevent filtering by id, but by uuid
                const { id } = ctx.params;
                if (!id) {
                    return ctx.badRequest('Missing UUID.');
                }
                const entityWithUUID: KlubrDonateurEntity = await strapi.db
                    .query('api::klubr-donateur.klubr-donateur')
                    .findOne({
                        select: ['id', 'email', 'documentId'],
                        where: { uuid: id },
                        populate: {
                            users_permissions_user: {
                                select: ['id', 'documentId'],
                            },
                        },
                    });
                if (!entityWithUUID) {
                    return ctx.badRequest(`Entity with UUID ${id} not found`);
                }
                ctx.params = { id: entityWithUUID.id };

                // link Donateur to User
                const emailToLink =
                    ctx.request.body?.data.email || entityWithUUID.email;
                // if emailToLink is provided and Donateur is not linked to a User
                if (
                    emailToLink &&
                    entityWithUUID.users_permissions_user === null
                ) {
                    const userIdToLink = await strapi
                        .service('api::klubr-donateur.klubr-donateur')
                        .getUserToLinkDonateur(ctx, emailToLink);
                    if (userIdToLink) {
                        ctx.request.body.data.users_permissions_user =
                            userIdToLink;
                    }
                }

                const { klubDon, ...payload } = ctx.request.body?.data;
                if (klubDon) {
                    const klubDonWithUUID: KlubDonEntity = await strapi.db
                        .query('api::klub-don.klub-don')
                        .findOne({
                            select: [
                                'id',
                                'documentId',
                                'montant',
                                'estOrganisme',
                                'withTaxReduction',
                            ],
                            where: { uuid: klubDon },
                        });
                    if (!klubDonWithUUID) {
                        return ctx.badRequest(
                            `Entity KlubDon with UUID ${id} not found`,
                        );
                    }

                    // Set KlubDon id (from uuid)
                    ctx.request.body.data.klubDon = klubDonWithUUID.id;

                    // Update KlubDon with deduction fiscale (from montant and donateurType)
                    let donBodyPayload = {
                        data: {
                            withTaxReduction: klubDonWithUUID.withTaxReduction,
                            montant: klubDonWithUUID.montant,
                            estOrganisme:
                                ctx.request.body.data.donateurType.toLowerCase() ===
                                'organisme',
                        },
                    };
                    donBodyPayload = strapi.services[
                        'api::klub-don.klub-don'
                    ].updateBodyWithDeductionFiscale(
                        donBodyPayload,
                        klubDonWithUUID,
                    );
                    await strapi.db.query('api::klub-don.klub-don').update({
                        where: { id: klubDonWithUUID.id },
                        data: {
                            ...donBodyPayload.data,
                        },
                    });
                }
                const entity = await strapi
                    .documents('api::klubr-donateur.klubr-donateur')
                    .update({
                        documentId: entityWithUUID.documentId,
                        data: ctx.request.body.data,
                    });

                // prevent returning ids
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(sanitizedResult);
            } catch (e) {
                return ctx.badRequest(e);
            }
        },

        async create() {
            const ctx = strapi.requestContext.get();
            const { klubDon, payload } = ctx.request.body?.data;
            if (klubDon) {
                const klubDonWithUUID: KlubDonEntity = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findOne({
                        select: [
                            'id',
                            'documentId',
                            'montant',
                            'estOrganisme',
                            'withTaxReduction',
                        ],
                        where: { uuid: klubDon },
                    });
                if (!klubDonWithUUID) {
                    return ctx.badRequest(
                        `Entity KlubDon with UUID ${klubDon} not found`,
                    );
                }
                // Set KlubDon id (from uuid)
                ctx.request.body.data.klubDon = klubDonWithUUID.id;

                // Update KlubDon with deduction fiscale (from montant and donateurType)
                let donBodyPayload = {
                    data: {
                        withTaxReduction: klubDonWithUUID.withTaxReduction,
                        montant: klubDonWithUUID.montant,
                        estOrganisme:
                            ctx.request.body.data.donateurType?.toLowerCase() ===
                            'organisme',
                    },
                };
                donBodyPayload = strapi.services[
                    'api::klub-don.klub-don'
                ].updateBodyWithDeductionFiscale(
                    donBodyPayload,
                    klubDonWithUUID,
                );
                const klubDonUpdateBody = {
                    where: { id: klubDonWithUUID.id },
                    data: {
                        ...donBodyPayload.data,
                    },
                };
                await strapi.db
                    .query('api::klub-don.klub-don')
                    .update(klubDonUpdateBody);
            }

            // link Donateur to User
            const { email } = ctx.request.body?.data;
            const userIdToLink = await strapi
                .service('api::klubr-donateur.klubr-donateur')
                .getUserToLinkDonateur(ctx, email);
            if (userIdToLink) {
                ctx.request.body.data.users_permissions_user = userIdToLink;
            }

            const entity = await strapi
                .documents('api::klubr-donateur.klubr-donateur')
                .create(ctx.request.body);

            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },

        async findByKlubForFront() {
            const ctx = strapi.requestContext.get();
            // 2024 03 06 - Not used in the front
            const { id, slug }: { id?: string; slug?: string } = ctx.query;

            if (!id && !slug) {
                return ctx.badRequest('Missing klub slug or id parameter.');
            }
            if (!!id && typeof parseInt(id) !== 'number') {
                return ctx.badRequest('Klub id should be a number.');
            }

            const filter = !!id
                ? {
                      id: {
                          $eq: id,
                      },
                  }
                : {
                      slug: {
                          $eq: slug,
                      },
                  };

            ctx.body = await strapi.db
                .query('api::klubr-donateur.klubr-donateur')
                .findMany({
                    where: {
                        klubDon: {
                            klubr: filter,
                        },
                    },
                });
        },

        async findLastDonateurForCtxUser() {
            const ctx = strapi.requestContext.get();
            const userCtx: UserEntity | null = ctx.state.user;

            if (!userCtx) {
                return ctx.badRequest('Missing user context.');
            }

            const myLastDonateur = await strapi
                .documents('api::klubr-donateur.klubr-donateur')
                .findMany({
                    filters: {
                        // @ts-ignore
                        users_permissions_user: userCtx.id as string,
                        donateurType: 'Particulier',
                        klubDon: { withTaxReduction: { $eq: true } },
                    },
                    sort: 'createdAt:desc',
                    limit: 1,
                });

            const myLastDonateurPro = await strapi
                .documents('api::klubr-donateur.klubr-donateur')
                .findMany({
                    filters: {
                        // @ts-ignore
                        users_permissions_user: userCtx.id as string,
                        donateurType: 'Organisme',
                    },
                    sort: 'createdAt:desc',
                    limit: 1,
                    populate: {
                        logo: true,
                    },
                });
            const myLastDonateurWithoutReduction = await strapi
                .documents('api::klubr-donateur.klubr-donateur')
                .findMany({
                    fields: ['email', 'nom', 'prenom', 'dateNaissance', 'uuid'],
                    filters: {
                        // @ts-ignore
                        users_permissions_user: userCtx.id,
                        klubDon: { withTaxReduction: { $eq: false } },
                    },
                    sort: 'createdAt:desc',
                    limit: 1,
                });
            const sanitizedResult = await this.sanitizeOutput(
                [
                    ...myLastDonateur,
                    ...myLastDonateurPro,
                    ...myLastDonateurWithoutReduction,
                ],
                ctx,
            );
            return removeId(sanitizedResult);
        },
    }),
);
