import { LifecycleEvent, ConnectedAccountEntity } from '../../../../_types';
import { v4 as uuidv4 } from 'uuid';

export default {
    async beforeCreate(event: LifecycleEvent<ConnectedAccountEntity>) {
        const { data } = event.params;
        if (!data.uuid) {
            data.uuid = uuidv4();
        }
    },
};
