import { KlubProjetEntity, LifecycleEvent } from '../../../../_types';
import { slugify } from '../../../../helpers/string';
import formattedCurrentDate from '../../../../helpers/date';
import { v4 as uuidv4 } from 'uuid';

export default {
    async beforeCreate(event: LifecycleEvent<KlubProjetEntity>) {
        const { data } = event.params;
        if (!data.uuid) {
            data.uuid = uuidv4();
        }
        if (event.params.data.slug === 'null') {
            if (event.params.data.titre) {
                event.params.data.slug =
                    slugify(event.params.data.titre) +
                    '-' +
                    formattedCurrentDate(2);
            }
        }
    },
};
