import { LifecycleEvent } from '../../../../_types';
import { v4 as uuidv4 } from 'uuid';

export default {
    async beforeCreate(event: LifecycleEvent<any>) {
        const { data } = event.params;
        if (!data.uuid) {
            data.uuid = uuidv4();
        }
    },
};
