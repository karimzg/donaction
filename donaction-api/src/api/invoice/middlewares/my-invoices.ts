import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user }: { user: UserEntity } = ctx.state;
        console.log(
            '$$$$$$$$$$$$$$$$ invoice middleware $$$$$$$$$$$$$$$$$$$$$',
        );

        // Récupérer le club de l'utilisateur
        let clubID = null;
        let profile: KlubrMemberEntity;
        if (user?.last_member_profile_used) {
            profile = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { uuid: user.last_member_profile_used },
                    populate: { klubr: true },
                });
            clubID = profile?.klubr?.id;
        }
        console.log(
            '$$$$$$$$$$$$$$$$ ' +
                profile?.nom +
                '/' +
                profile?.role +
                ' $$$$$$$$$$$$$$$$$$$$$',
        );
        let filters = [];
        switch (profile?.role) {
            case 'Admin':
                filters = [];
                break;
            case 'AdminEditor':
            case 'NetworkLeader':
            case 'KlubMemberLeader':
                console.log(
                    '$$$$$$$$$$$$$$$$ invoice middleware $$$$$$$$$$$$$$$$$$$$$',
                    clubID,
                );
                filters = [{ klubr: clubID }];
                break;
            // case 'Authenticated':
            case 'KlubMember':
            default:
                return ctx.unauthorized(
                    'You are not allowed to access this resource',
                );
        }

        ctx.query = {
            ...ctx.query,
            filters: {
                ...(ctx.query.filters as Record<string, any>),
                $and: [...filters],
            },
        };
        console.log(
            '$$$$$$$$$$$$$$$$ invoice middleware $$$$$$$$$$$$$$$$$$$$$',
            filters,
        );

        // Passer au middleware suivant
        await next();
    };
};
