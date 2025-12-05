import { KlubrMemberEntity, LifecycleEvent } from '../../../../_types';
import { slugify } from '../../../../helpers/string';
import formattedCurrentDate from '../../../../helpers/date';
import { v4 as uuidv4 } from 'uuid';

export default {
    async beforeCreate(event: LifecycleEvent<Partial<KlubrMemberEntity>>) {
        const { data } = event.params;
        if (!data.uuid) {
            data.uuid = uuidv4();
        }

        // Generate a code for each new member
        event.params.data.code = Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();
        if (!event.params.data.slug || event.params.data.slug === 'null') {
            if (event.params.data.nom) {
                event.params.data.slug =
                    slugify(
                        event.params.data.nom +
                            (event.params.data.prenom
                                ? '-' + event.params.data.prenom
                                : ''),
                    ) +
                    '-' +
                    formattedCurrentDate(2);
            }
        }
    },

    // Deprecated: used to set code for older members
    // async beforeUpdate(event) {
    //   event.params.data.code = event.params.data.code || Math.random().toString(36).substring(2, 12).toUpperCase();
    // },
};
