/**
 * `klubr` middleware
 */
import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';
import {
    profileIsAtLeastKlubrLeader,
    profileIsKlubrAdmin,
} from '../../../helpers/permissions';
import { removeFields } from '../../../helpers/sanitizeHelpers';

// const {profileIsAtLeastKlubrLeader, profileIsKlubrAdmin} = require("../../../helpers/permissions");
// const {removeFields} = require("../../../helpers/sanitize-helpers");
export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        await next();
        const { user }: { user: UserEntity | null } = ctx.state;
        const { list }: { list?: boolean } = config;
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

        console.log('ctx.response.body', ctx.response.body);
        if (list) {
            // if (GET list of members)
            // Not working for list as each members needs to be populate with klubr
            // ctx.response.body?.data?.map((klubr) => {
            //   if (!profileIsAtLeastKlubrLeader(profile, klubr.uuid) && !profileIsKlubrAdmin(profile)) {
            //     klubr = removeFields(klubr, ["klubr_document", "code", "codeLeader"]);
            //   }
            //   return klubr;
            // });
        } else {
            // if (GET member by uuid)
            let klubUuuid = ctx.response.body['klubr']?.uuid;
            if (!klubUuuid) {
                const memberWithKlubr: KlubrMemberEntity = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        where: {
                            uuid: ctx.response.body['uuid'] || ctx.params.uuid,
                        },
                        populate: { klubr: true },
                    });
                klubUuuid = memberWithKlubr?.klubr.uuid;
            }
            if (
                !profile ||
                (profile?.uuid !== ctx.params.uuid &&
                    !profileIsAtLeastKlubrLeader(profile, klubUuuid) &&
                    !profileIsKlubrAdmin(profile))
            ) {
                ctx.response.body = removeFields(ctx.response.body, [
                    'email',
                    'tel',
                    'birthDate',
                    'code',
                    'codeLeader',
                ]);
            }
        }
    };
};
