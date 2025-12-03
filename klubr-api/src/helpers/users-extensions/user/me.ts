import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity } from '../../../_types';
import { memberIsAtLeastLeader } from '../../permissions';
import { removeCodes } from '../../sanitizeHelpers';
import { v4 } from 'uuid';

export async function me(handler: Core.ControllerHandler, ctx: Context) {
    if (!ctx.state.user.uuid) {
        await strapi.db.query('plugin::users-permissions.user').update({
            where: {
                id: ctx.state.user.id,
            },
            data: {
                uuid: v4(),
            },
        });
    }
    await handler(ctx, null);
    if (ctx.body && ctx.body['klubr_membres']) {
        try {
            ctx.body['klubr_membres'] = ctx.body['klubr_membres'].map(
                (klubr_membre: KlubrMemberEntity) => {
                    if (
                        klubr_membre?.klubr &&
                        !memberIsAtLeastLeader(klubr_membre)
                    ) {
                        delete klubr_membre?.klubr.code;
                        delete klubr_membre?.klubr.codeLeader;
                    }
                    return klubr_membre;
                },
            );
        } catch (e) {
            console.log('error removing codes', e);
            ctx.body = removeCodes(ctx.body);
        }
    }
    return ctx.body;
}
