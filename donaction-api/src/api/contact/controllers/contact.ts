/**
 * contact controller
 */

import { Core, factories } from '@strapi/strapi';
import { removeId } from '../../../helpers/sanitizeHelpers';
import createAssessment from '../../../helpers/gcc/createAssessment';
import { ContactEntity, PaginationEntity } from '../../../_types';

export default factories.createCoreController(
    'api::contact.contact',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async findOne() {
            const ctx = strapi.requestContext.get();
            const { id } = ctx.params;

            if (!id) {
                return ctx.badRequest('Missing contact uuid.');
            }

            ctx.query = { ...ctx.query, filters: { uuid: id } };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const { results }: { results: Array<ContactEntity> } = await strapi
                .service('api::contact.contact')
                .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound('Message not found');
            }

            const entity = results[0];
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
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
                    results: Array<ContactEntity>;
                    pagination: PaginationEntity;
                } = await strapi
                    .service('api::contact.contact')
                    .find(sanitizedQueryParams);

                const sanitizedResult = await this.sanitizeOutput(results, ctx);
                return {
                    data: removeId(sanitizedResult),
                    meta: { pagination },
                };
            } catch (e) {
                console.log(e);
                return ctx.badRequest(e);
            }
        },

        async update() {
            const ctx = strapi.requestContext.get();
            // prevent filtering by id, but by uuid
            const { id } = ctx.params;
            if (!id) {
                return ctx.badRequest('Missing UUID.');
            }
            const entityWithUUID: ContactEntity = await strapi.db
                .query('api::contact.contact')
                .findOne({
                    select: ['id', 'documentId'],
                    where: { uuid: id },
                });
            if (!entityWithUUID) {
                return ctx.badRequest(`Entity with UUID ${id} not found`);
            }
            ctx.params = { id: entityWithUUID.id };
            const entity = await strapi
                .documents('api::contact.contact')
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
            return removeId(sanitizedResult);
        },

        async create() {
            const ctx = strapi.requestContext.get();
            const { formToken, ...cleanData } = ctx.request.body?.data || {};
            if (!formToken) {
                return ctx.badRequest('Missing reCaptcha token.');
            }
            ctx.request.body.data = cleanData;
            const result = await createAssessment({
                token: formToken,
                recaptchaAction: 'CREATE_CONTACT_FORM',
            });
            if (!result) {
                return ctx.badRequest('Captcha verification failed');
            }
            const entity = await super.create(ctx);
            console.log(entity);
            if (entity) {
                await strapi.services['api::contact.contact'].sendMsgToAdmin(
                    entity.data.attributes,
                );
            }
            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },
    }),
);
