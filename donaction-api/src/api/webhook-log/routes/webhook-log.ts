/**
 * webhook-log router
 * Access controlled via Strapi admin permissions (admin only)
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::webhook-log.webhook-log', {
    only: ['find', 'findOne'],
});
