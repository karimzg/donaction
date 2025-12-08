/**
 * `klubr-info` middleware
 */
import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';
import {
    profileIsAtLeastKlubrLeader,
    profileIsKlubrAdmin,
} from '../../../helpers/permissions';

// const {profileIsAtLeastKlubrLeader, profileIsKlubrAdmin} = require("../../../helpers/permissions");
export default (
    config: { list?: boolean },
    { strapi }: { strapi: Core.Strapi },
) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user }: { user?: UserEntity } = ctx.state;
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
        if (!list) {
            const klubrInfo = await strapi.db
                .query('api::klubr-info.klubr-info')
                .findOne({
                    where: { id: ctx.params.id },
                    populate: { klubr: true },
                });
            if (
                !klubrInfo?.klubr ||
                (!profileIsAtLeastKlubrLeader(profile, klubrInfo.klubr?.uuid) &&
                    !profileIsKlubrAdmin(profile))
            ) {
                return ctx.unauthorized(
                    "Vous n'avez pas les droits pour accéder à cette ressource",
                );
            }
        } else {
            let filters = [];
            switch (profile?.role) {
                case 'Admin':
                    filters = [];
                    break;
                case 'AdminEditor':
                case 'NetworkLeader':
                case 'KlubMemberLeader':
                    filters = [
                        { klubr: { uuid: { $eq: profile?.klubr?.uuid } } },
                    ];
                    break;
                case 'KlubMember':
                //@ts-ignore
                case 'Authenticated':
                default:
                    filters = null;
                    break;
            }
            if (!filters) {
                return ctx.unauthorized(
                    "Vous n'avez pas les droits pour accéder à ces ressources",
                );
            }
            ctx.query = {
                ...ctx.query,
                filters: {
                    ...(ctx.query.filters as Record<string, any>),
                    $and: [...filters],
                },
            };
        }

        // Passer au middleware suivant
        await next();
    };
};
