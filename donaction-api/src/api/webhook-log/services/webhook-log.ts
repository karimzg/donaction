import { factories } from '@strapi/strapi';

// TODO: Populate related_don and related_klubr relations when processing
// payment and account webhooks respectively (follow-up to US-WH-001)

export default factories.createCoreService('api::webhook-log.webhook-log');
