import { Core, factories } from '@strapi/strapi';

export default factories.createCoreService(
    'api::webhook-log.webhook-log',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Check if an event has already been logged (idempotence check).
         * Returns the existing log entry or null.
         */
        async findByEventId(eventId: string) {
            return strapi.db
                .query('api::webhook-log.webhook-log')
                .findOne({
                    where: { event_id: eventId },
                });
        },

        /**
         * Check if an event should be ignored (already processed or being processed).
         * Returns true if the event is a duplicate that should be skipped.
         */
        async isDuplicate(eventId: string): Promise<boolean> {
            const existing = await this.findByEventId(eventId);
            if (!existing) return false;
            return ['processed', 'processing', 'ignored'].includes(
                existing.status
            );
        },
    })
);
