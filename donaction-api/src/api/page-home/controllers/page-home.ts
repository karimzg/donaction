/**
 * page-home controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
    'api::page-home.page-home',
    ({ strapi }) => ({
        async find(ctx) {
            await this.validateQuery(ctx);
            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            const entity = await strapi.db
                .query('api::page-home.page-home')
                .findOne(sanitizedQueryParams);
            const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
            return this.transformResponse(sanitizedEntity);
        },
    }),
);
