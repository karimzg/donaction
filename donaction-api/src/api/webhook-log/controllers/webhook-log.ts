import { Core, factories } from '@strapi/strapi';
import { removeId } from '../../../helpers/sanitizeHelpers';

export default factories.createCoreController(
    'api::webhook-log.webhook-log',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async find() {
            const ctx = strapi.requestContext.get();
            await this.validateQuery(ctx);
            const sanitizedQuery = await this.sanitizeQuery(ctx);
            const { results, pagination } = await strapi
                .service('api::webhook-log.webhook-log')
                .find(sanitizedQuery);
            const sanitized = await this.sanitizeOutput(results, ctx);
            return this.transformResponse(removeId(sanitized), { pagination });
        },

        async findOne() {
            const ctx = strapi.requestContext.get();
            const { uuid } = ctx.params;
            await this.validateQuery(ctx);
            const sanitizedQuery = await this.sanitizeQuery(ctx);

            const results = await strapi
                .documents('api::webhook-log.webhook-log')
                .findMany({
                    filters: { uuid: { $eq: uuid } },
                    ...sanitizedQuery,
                    limit: 1,
                });
            const result = results[0] ?? null;

            if (!result) {
                return ctx.notFound('Webhook log introuvable');
            }

            const sanitized = await this.sanitizeOutput(result, ctx);
            return this.transformResponse(removeId(sanitized));
        },
    })
);
