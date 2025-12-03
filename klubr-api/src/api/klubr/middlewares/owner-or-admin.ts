import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';
import {
    profileIsAtLeastKlubrLeader,
    profileIsKlubrAdmin,
} from '../../../helpers/permissions';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user }: { user: UserEntity } = ctx.state;

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

        if (
            !profileIsAtLeastKlubrLeader(profile, ctx.params.uuid) &&
            !profileIsKlubrAdmin(profile)
        ) {
            return ctx.unauthorized(
                "Vous n'avez pas les droits pour accéder à cette ressource",
            );
        }

        // Passer au middleware suivant
        const resp = await next();
    };
};
