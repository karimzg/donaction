import { Core, factories } from '@strapi/strapi';

// TODO: Populate related_don and related_klubr relations when processing
// payment and account webhooks respectively (follow-up to US-WH-001)

export default factories.createCoreService(
    'api::webhook-log.webhook-log',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Find a webhook log entry by Stripe event ID.
         * Used for idempotence checks and audit lookups.
         */
        async findByEventId(eventId: string) {
            return strapi.db
                .query('api::webhook-log.webhook-log')
                .findOne({
                    where: { event_id: eventId },
                });
        },
    })
);
