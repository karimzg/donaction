import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';
import {
    profileIsAtLeastKlubrLeader,
    profileIsKlubrAdmin,
} from '../../../helpers/permissions';
import { removeFields } from '../../../helpers/sanitizeHelpers';

export default (
    config: Record<string, any>,
    { strapi }: { strapi: Core.Strapi },
) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        await next();
        const { user }: { user: UserEntity } = ctx.state;
        const { list } = config;
        console.log('list', list);

        // Récupérer le club de l'utilisateur
        let profile: KlubrMemberEntity | null = null;
        if (user?.last_member_profile_used) {
            profile = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { uuid: user.last_member_profile_used },
                    populate: { klubr: true },
                });
        }

        if (list && ctx.response.body && ctx.response.body['data']) {
            // if (GET list of klubrs)
            ctx.response.body['data']?.map((klubr) => {
                if (
                    !profile ||
                    (!profileIsAtLeastKlubrLeader(profile, klubr.uuid) &&
                        !profileIsKlubrAdmin(profile))
                ) {
                    klubr = removeFields(klubr, [
                        'klubr_document',
                        'klubr_info',
                        'code',
                        'codeLeader',
                    ]);
                }
                return klubr;
            });
        } else {
            // if (GET klubr by uuid)
            const klubUuuid =
                ctx.params.uuid ||
                (ctx.query?.filters as Record<string, any>)?.uuid?.$eq ||
                ctx.response.body['uuid'];
            if (
                !profile ||
                (!profileIsAtLeastKlubrLeader(profile, klubUuuid) &&
                    !profileIsKlubrAdmin(profile))
            ) {
                ctx.response.body = removeFields(ctx.response.body, [
                    'klubr_document',
                    'klubr_info',
                    'code',
                    'codeLeader',
                ]);
            }
        }
    };
};
