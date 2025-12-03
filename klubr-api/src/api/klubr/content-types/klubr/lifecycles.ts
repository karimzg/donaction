import {
    KlubrEntity,
    LifecycleEvent,
    TradePolicyEntity,
} from '../../../../_types';
import { slugify } from '../../../../helpers/string';
import { v4 as uuidv4 } from 'uuid';

export default {
    async beforeCreate(event: LifecycleEvent<KlubrEntity>) {
        const { data } = event.params;
        if (!data.uuid) {
            data.uuid = uuidv4();
        }

        // Generate a code for each new club
        event.params.data.code =
            'KC' + Math.random().toString(36).substring(2, 8).toUpperCase();
        event.params.data.codeLeader =
            'LC' + Math.random().toString(36).substring(2, 8).toUpperCase();
        // Set default trade policy if none is provided
        if (!event.params.data?.trade_policy['connect']?.length) {
            // TODO: check table link
            // @ts-ignore
            event.params.data.trade_policy = await getDefaultTradePolicy();
        }
        if (!event.params.data.slug || event.params.data.slug === 'null') {
            if (event.params.data.denomination) {
                event.params.data.slug = slugify(
                    event.params.data.denomination,
                );
            }
        }
    },

    async beforeUpdate(event: LifecycleEvent<KlubrEntity>) {
        event.params.data.code =
            event.params.data.code ||
            'KC' + Math.random().toString(36).substring(2, 8).toUpperCase();
        event.params.data.codeLeader =
            event.params.data.codeLeader ||
            'LC' + Math.random().toString(36).substring(2, 8).toUpperCase();
    },
};

const getDefaultTradePolicy = async () => {
    try {
        const defaultTradePolicy: TradePolicyEntity = await strapi.db
            .query('api::trade-policy.trade-policy')
            .findOne({
                select: ['id', 'documentId'],
                where: { defaultTradePolicy: true },
            });
        return defaultTradePolicy?.id || null;
    } catch (err) {
        console.log(
            'Erreur lors de la récupération de la politique commerciale par défaut',
            err,
        );
    }
};
