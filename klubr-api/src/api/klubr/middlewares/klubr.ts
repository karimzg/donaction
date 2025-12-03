import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';
import { CLUB_STATUS } from '../../../helpers/clubStatus';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user }: { user: UserEntity } = ctx.state;
        const { code, codeLeader } =
            (ctx.query?.filters as Record<string, any>) || {};
        const hasCode =
            (code && code['$eq']) || (codeLeader && codeLeader['$eq']);
        // console.log('$$$$$$$$$$$$$$$$ klubr middleware $$$$$$$$$$$$$$$$$$$$$');

        // Récupérer le club de l'utilisateur
        let clubID: number | null = null;
        let profileID: number | null = null;
        let profile: KlubrMemberEntity | null = null;
        if (user?.last_member_profile_used) {
            profile = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { uuid: user.last_member_profile_used },
                    populate: { klubr: true },
                });
            profileID = profile?.id as number;
            clubID = profile?.klubr?.id as number;
        }
        // console.log('$$$$$$$$$$$$$$$$ ' + profile?.nom + '/' + profile?.role + ' $$$$$$$$$$$$$$$$$$$$$');
        let filters = [];
        switch (profile?.role) {
            case 'Admin':
                filters = [];
                break;
            case 'AdminEditor':
                filters = limitationFilters(profileID, clubID, [
                    CLUB_STATUS.DRAFT,
                    CLUB_STATUS.PUBLISHED,
                    CLUB_STATUS.DELETED,
                ]);
                break;
            case 'NetworkLeader':
            case 'KlubMemberLeader':
            case 'KlubMember':
                filters = limitationFilters(
                    profileID,
                    clubID,
                    [
                        CLUB_STATUS.PUBLISHED,
                        ...(hasCode ? [CLUB_STATUS.DRAFT] : []),
                    ],
                    [CLUB_STATUS.DRAFT],
                );
                break;
            // TODO: check here (à virer)
            // @ts-ignore
            case 'Authenticated':
                filters = limitationFilters(profileID, clubID, [
                    CLUB_STATUS.PUBLISHED,
                    ...(hasCode ? [CLUB_STATUS.DRAFT] : []),
                ]);
                break;
            default:
                filters = limitationFilters(profileID, clubID, [
                    CLUB_STATUS.PUBLISHED,
                    ...(hasCode ? [CLUB_STATUS.DRAFT] : []),
                ]);
                break;
        }

        ctx.query = {
            ...ctx.query,
            filters: {
                ...(ctx.query.filters as Record<string, any>),
                $and: [...filters],
            },
        };
        // console.log('$$$$$$$$$$$$$$$$ klubr middleware $$$$$$$$$$$$$$$$$$$$$', filters);

        // Passer au middleware suivant
        await next();
    };
};

const limitationFilters = (
    profileID?: number,
    clubId?: number,
    authorizedStatus?: Array<string>,
    clubAuthorizedStatus?: Array<string>,
) => {
    const filters =
        authorizedStatus || (clubId && clubAuthorizedStatus)
            ? [{ $or: [] }]
            : [];
    if (authorizedStatus) {
        filters[0].$or.push({
            status: {
                $in: authorizedStatus,
            },
        });
    }

    if (clubId && clubAuthorizedStatus) {
        filters[0].$or.push({
            $and: [
                {
                    status: {
                        $in: clubAuthorizedStatus,
                    },
                },
                { id: clubId },
            ],
        });
    }

    return filters;
};
