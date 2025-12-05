/**
 * trade-policy service
 */

import { Core, factories } from '@strapi/strapi';

export default factories.createCoreService(
    'api::trade-policy.trade-policy',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async getDefaultTradePolicy() {
            try {
                const defaultTradePolicy = await strapi.db
                    .query('api::trade-policy.trade-policy')
                    .findOne({
                        select: ['id', 'documentId'],
                        where: { defaultTradePolicy: true },
                    });
                return defaultTradePolicy?.id || null;
            } catch (err) {
                console.log(
                    'Erreur lors de la récupération de la politique commerciale par défaut',
                    err,
                );
                return null;
            }
        },
    }),
);
