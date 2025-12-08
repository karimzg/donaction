/**
 * template-projects-library controller
 */

import { Core, factories } from '@strapi/strapi';
import {
    KlubrEntity,
    PaginationEntity,
    TemplateProjectsCategoryEntity,
    TemplateProjectsLibraryEntity,
} from '../../../_types';
import { removeCodes, removeId } from '../../../helpers/sanitizeHelpers';

export default factories.createCoreController(
    'api::template-projects-library.template-projects-library',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async delete(ctx) {
            console.log('****************DELETE*******************');
            const { id } = ctx.params;
            if (!id) {
                return ctx.badRequest(
                    'Missing template-projects-library uuid.',
                );
            }
            ctx.query = { ...ctx.query, filters: { uuid: id } };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const {
                results,
                pagination,
            }: {
                results: Array<TemplateProjectsLibraryEntity>;
                pagination: PaginationEntity;
            } = await strapi
                .service(
                    'api::template-projects-library.template-projects-library',
                )
                .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound(
                    'Project template library member not found',
                );
            }

            const entity = results[0];
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            await strapi
                .documents(
                    'api::template-projects-library.template-projects-library',
                )
                .delete({
                    documentId: entity.documentId,
                });
            return removeId(removeCodes(sanitizedResult));
        },

        async findOne(ctx) {
            console.log('****************FIND ONE*******************');
            const { id } = ctx.params;

            if (!id) {
                return ctx.badRequest('Missing Project template library uuid.');
            }
            ctx.query = { ...ctx.query, filters: { uuid: id } };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const {
                results,
                pagination,
            }: {
                results: Array<TemplateProjectsLibraryEntity>;
                pagination: PaginationEntity;
            } = await strapi
                .service(
                    'api::template-projects-library.template-projects-library',
                )
                .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound('Project template library not found');
            }

            const entity = results[0];
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(removeCodes(sanitizedResult));
        },

        async find(ctx) {
            if (ctx.query.filters && ctx.query.filters['id']) {
                delete ctx.query.filters['id'];
            }
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            const {
                results,
                pagination,
            }: {
                results: Array<TemplateProjectsLibraryEntity>;
                pagination: PaginationEntity;
            } = await strapi
                .service(
                    'api::template-projects-library.template-projects-library',
                )
                .find(sanitizedQueryParams);
            const sanitizedResult = await this.sanitizeOutput(results, ctx);
            return { data: removeId(sanitizedResult), meta: { pagination } };
        },

        async update(ctx) {
            // prevent filtering by id, but by uuid
            const { id } = ctx.params;
            if (!id) {
                return ctx.badRequest('Missing UUID.');
            }
            const entityWithUUID: TemplateProjectsLibraryEntity =
                await strapi.db
                    .query(
                        'api::template-projects-library.template-projects-library',
                    )
                    .findOne({
                        select: ['id', 'documentId'],
                        populate: {
                            template_projects_categories: {
                                fields: ['id', 'uuid'],
                            },
                            klubrs: {
                                fields: ['id', 'uuid'],
                            },
                        },
                        where: { uuid: id },
                    });
            if (!entityWithUUID) {
                return ctx.badRequest(`Entity with UUID ${id} not found`);
            }

            if (ctx.request.body?.data?.template_projects_categories) {
                const tmplCategory: TemplateProjectsCategoryEntity =
                    await strapi.db
                        .query(
                            'api::template-projects-category.template-projects-category',
                        )
                        .findOne({
                            where: {
                                uuid: ctx.request.body?.data
                                    ?.template_projects_categories,
                            },
                        });
                ctx.request.body.data.klubr = tmplCategory.id;
            }
            if (ctx.request.body?.data?.klubrs) {
                const klubr: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid: ctx.request.body?.data?.klubrs },
                    });
                ctx.request.body.data.klubrs = klubr.id;
            }
            const entity = await strapi
                .documents(
                    'api::template-projects-library.template-projects-library',
                )
                .update({
                    documentId: entityWithUUID.documentId,
                    populate: {
                        ...(ctx.query.populate as any),
                    },
                    data: {
                        ...ctx.request.body.data,
                    },
                });

            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(removeCodes(sanitizedResult));
        },

        async create(ctx) {
            if (ctx.request.body?.data?.klubr) {
                const klubrs = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid: ctx.request.body?.data?.klubrs },
                    });
                ctx.request.body.data.klubrs = klubrs.id;
            }
            const entity = await super.create(ctx);
            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },
    }),
);
