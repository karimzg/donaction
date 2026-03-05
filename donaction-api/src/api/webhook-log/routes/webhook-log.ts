/**
 * Webhook log routes — read-only, admin-only.
 * Write operations happen internally (webhook handler, not via REST API).
 */
export default {
    routes: [
        {
            method: 'GET',
            path: '/webhook-logs',
            handler: 'webhook-log.find',
            config: {
                middlewares: ['api::webhook-log.admin-only'],
            },
        },
        {
            method: 'GET',
            path: '/webhook-logs/:uuid',
            handler: 'webhook-log.findOne',
            config: {
                middlewares: ['api::webhook-log.admin-only'],
            },
        },
    ],
};
