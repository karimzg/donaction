import { factories } from '@strapi/strapi';

/**
 * Webhook log routes — read-only via REST API.
 * Write operations happen internally (webhook handler, not via API).
 * Permissions should be restricted to admin role in Strapi admin panel.
 */
export default factories.createCoreRouter('api::webhook-log.webhook-log', {
    only: ['find', 'findOne'],
});
