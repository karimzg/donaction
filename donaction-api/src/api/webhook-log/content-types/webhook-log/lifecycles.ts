import { LifecycleEvent, WebhookLogEntity } from '../../../../_types';

export default {
    async beforeCreate(event: LifecycleEvent<WebhookLogEntity>) {
        const { data } = event.params;

        // Ensure defaults
        if (!data.status) {
            data.status = 'received';
        }
        if (data.retry_count === undefined || data.retry_count === null) {
            data.retry_count = 0;
        }
    },
};
