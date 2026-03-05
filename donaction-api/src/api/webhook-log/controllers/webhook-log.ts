import { Core, factories } from '@strapi/strapi';

export default factories.createCoreController(
    'api::webhook-log.webhook-log',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * List webhook logs (admin only via Strapi permissions)
         */
        async find(ctx) {
            await this.validateQuery(ctx);
            const sanitizedQuery = await this.sanitizeQuery(ctx);
            const { results, pagination } = await strapi
                .service('api::webhook-log.webhook-log')
                .find(sanitizedQuery);
            const sanitized = await this.sanitizeOutput(results, ctx);
            return this.transformResponse(sanitized, { pagination });
        },

        /**
         * Get single webhook log by documentId (admin only)
         */
        async findOne(ctx) {
            await this.validateQuery(ctx);
            const sanitizedQuery = await this.sanitizeQuery(ctx);
            const { id: documentId } = ctx.params;
            const entity = await strapi
                .service('api::webhook-log.webhook-log')
                .findOne(documentId, sanitizedQuery);
            if (!entity) {
                return ctx.notFound('Webhook log not found');
            }
            const sanitized = await this.sanitizeOutput(entity, ctx);
            return this.transformResponse(sanitized);
        },
    })
);
