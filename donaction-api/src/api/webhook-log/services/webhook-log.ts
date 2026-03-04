import { Core, factories } from '@strapi/strapi';
import {
    LogWebhookEventParams,
    checkIdempotence,
    buildWebhookLogData,
    validateWebhookEventParams,
} from './webhookLogHelpers';

export default factories.createCoreService(
    'api::webhook-log.webhook-log',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Log a webhook event with idempotence check.
         * If event_id already exists, marks as "ignored" and returns the existing log.
         *
         * @returns {{ log: object, isDuplicate: boolean }}
         */
        async logWebhookEvent(params: LogWebhookEventParams) {
            const errors = validateWebhookEventParams(params);
            if (errors.length > 0) {
                throw new Error(`Invalid webhook params: ${errors.join(', ')}`);
            }

            // Idempotence: check if event already logged
            const existing = await strapi.db
                .query('api::webhook-log.webhook-log')
                .findOne({
                    where: { event_id: params.eventId },
                });

            const result = checkIdempotence(existing);

            if (result.action === 'mark_ignored') {
                await strapi.db
                    .query('api::webhook-log.webhook-log')
                    .update({
                        where: { id: existing.id },
                        data: { status: 'ignored' },
                    });
                return { log: { ...existing, status: 'ignored' }, isDuplicate: true };
            }

            if (result.action === 'skip') {
                return { log: existing, isDuplicate: true };
            }

            // Create new log entry
            const data = buildWebhookLogData(params);
            const log = await strapi.documents('api::webhook-log.webhook-log').create({
                // @ts-ignore - data shape matches schema, TS generated types may lag
                data,
            });

            return { log, isDuplicate: false };
        },

        /**
         * Update webhook log status after processing
         */
        async updateLogStatus(
            documentId: string,
            status: 'processing' | 'processed' | 'failed',
            error?: string
        ) {
            const data: Record<string, unknown> = { status };
            if (status === 'processed') {
                data.processed_at = new Date().toISOString();
            }
            if (error) {
                data.processing_error = error;
            }

            return strapi.documents('api::webhook-log.webhook-log').update({
                documentId,
                data,
            });
        },

        /**
         * Increment retry count for a failed webhook log
         */
        async incrementRetry(documentId: string) {
            const log = await strapi.documents('api::webhook-log.webhook-log').findOne({
                documentId,
            });
            if (!log) return null;

            return strapi.documents('api::webhook-log.webhook-log').update({
                documentId,
                data: {
                    // @ts-ignore - retry_count exists on entity
                    retry_count: (log.retry_count || 0) + 1,
                    status: 'received',
                },
            });
        },
    })
);
