/**
 * `klubr-projects` middleware
 */
import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrEntity, KlubrMemberEntity } from '../../../_types';
import { PROJECT_STATUS } from '../../../helpers/projectStatus';

// const { PROJECT_STATUS } = require("../../../helpers/project-status");
export default (config, { strapi }: { strapi: Core.Strapi }) => {
    // Add your own logic here.
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user } = ctx.state;
        const { withTemplates } = ctx.query;
        // const customParam = config.customParam;

        // console.log('$$$$$$$$$$$$$$$$ klub-projet middleware $$$$$$$$$$$$$$$$$$$$$ PROFILE', user);

        // Récupérer le klubr Id
        let klubrId = 0;
        if (withTemplates) {
            const klubr: KlubrEntity = await strapi.db
                .query('api::klubr.klubr')
                .findOne({
                    where: { uuid: process.env.KLUBR_UUID },
                    select: ['id', 'documentId'],
                });
            klubrId = klubr?.id as number;
            // console.log('$$$$$$$$$$$$$$$$ klub-projet middleware $$$$$$$$$$$$$$$$$$$$$ klubrId', klubrId);
        }

        // Récupérer le club de l'utilisateur
        let clubID = null;
        let profileID = null;
        let profile: KlubrMemberEntity | null = null;
        if (user?.last_member_profile_used) {
            profile = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    select: ['id', 'documentId', 'role', 'prenom', 'nom'],
                    where: { uuid: user.last_member_profile_used },
                    populate: {
                        klubr: withTemplates
                            ? {
                                  select: ['id', 'documentId', 'denomination'],
                                  populate: {
                                      klubrAffiliations: {
                                          select: ['id', 'documentId'],
                                      },
                                  },
                              }
                            : { select: ['id', 'documentId'] },
                    },
                });
            profileID = profile?.id;
            clubID = profile?.klubr?.id;
            console.dir(profile, { depth: null });
            console.log(
                '$$$$$$$$$$$$$$$$ klub-projet middleware $$$$$$$$$$$$$$$$$$$$$ profileID',
                clubID,
            );
        }
        const klubrAffiliationsIds = profile?.klubr?.klubrAffiliations?.map(
            (klub) => klub.id,
        );
        // console.log('$$$$$$$$$$$$$$$$ klub-projet middleware $$$$$$$$$$$$$$$$$$$$$ PROFILE', profile ? `${profile.prenom} ${profile.nom} - ${profile.role} (${profile?.klubr?.denomination})` : 'No profile');
        // console.log('$$$$$$$$$$$$$$$$ klub-projet middleware $$$$$$$$$$$$$$$$$$$$$ AFFILIATION', klubrAffiliationsIds);
        let filters = [];
        // if (customParam === 'forFront') {
        //   filters = limitationFilters(klubrId, klubrAffiliationsIds, profileID, clubID, [PROJECT_STATUS.PUBLISHED, PROJECT_STATUS.CLOSED, PROJECT_STATUS.BILLED]);
        // } else {
        switch (profile?.role) {
            case 'Admin':
                filters = [];
                // filters = limitationFilters(klubrId, klubrAffiliationsIds, profileID, clubID, [PROJECT_STATUS.PUBLISHED, PROJECT_STATUS.CLOSED, PROJECT_STATUS.BILLED], [PROJECT_STATUS.DRAFT, PROJECT_STATUS.WAITING_APPROVAL, PROJECT_STATUS.DELETED]);
                break;
            case 'AdminEditor':
                filters = limitationFilters(
                    klubrId,
                    // @ts-ignore
                    klubrAffiliationsIds,
                    profileID,
                    clubID,
                    [
                        PROJECT_STATUS.PUBLISHED,
                        PROJECT_STATUS.CLOSED,
                        PROJECT_STATUS.BILLED,
                    ],
                    [
                        PROJECT_STATUS.DRAFT,
                        PROJECT_STATUS.WAITING_APPROVAL,
                        PROJECT_STATUS.DELETED,
                    ],
                );
                break;
            case 'NetworkLeader':
                filters = limitationFilters(
                    klubrId,
                    // @ts-ignore
                    klubrAffiliationsIds,
                    profileID,
                    clubID,
                    [
                        PROJECT_STATUS.PUBLISHED,
                        PROJECT_STATUS.CLOSED,
                        PROJECT_STATUS.BILLED,
                    ],
                    [PROJECT_STATUS.DRAFT, PROJECT_STATUS.WAITING_APPROVAL],
                );
                break;
            case 'KlubMemberLeader':
                filters = limitationFilters(
                    klubrId,
                    // @ts-ignore
                    klubrAffiliationsIds,
                    profileID,
                    clubID,
                    [
                        PROJECT_STATUS.PUBLISHED,
                        PROJECT_STATUS.CLOSED,
                        PROJECT_STATUS.BILLED,
                    ],
                    [PROJECT_STATUS.DRAFT, PROJECT_STATUS.WAITING_APPROVAL],
                );
                break;
            case 'KlubMember':
                filters = limitationFilters(
                    klubrId,
                    // @ts-ignore
                    klubrAffiliationsIds,
                    profileID,
                    clubID,
                    [
                        PROJECT_STATUS.PUBLISHED,
                        PROJECT_STATUS.CLOSED,
                        PROJECT_STATUS.BILLED,
                    ],
                    undefined,
                    [PROJECT_STATUS.DRAFT, PROJECT_STATUS.WAITING_APPROVAL],
                );
                break;
            // @ts-ignore
            case 'Authenticated':
                filters = limitationFilters(
                    klubrId,
                    // @ts-ignore
                    klubrAffiliationsIds,
                    profileID,
                    clubID,
                    [
                        PROJECT_STATUS.PUBLISHED,
                        PROJECT_STATUS.CLOSED,
                        PROJECT_STATUS.BILLED,
                    ],
                );
                break;
            default:
                filters = limitationFilters(
                    klubrId,
                    // @ts-ignore
                    klubrAffiliationsIds,
                    profileID,
                    clubID,
                    [
                        PROJECT_STATUS.PUBLISHED,
                        PROJECT_STATUS.CLOSED,
                        PROJECT_STATUS.BILLED,
                    ],
                );
                break;
        }
        // }
        // TODO: Add where project.klubr.status === validated

        // console.log('$$$$$$$$$$$$$$$$ klub-projet middleware $$$$$$$$$$$$$$$$$$$$$ ctx.query.filters', ctx.query.filters);
        console.log('TEST 2');
        if (filters?.length > 0) {
            ctx.query = {
                ...ctx.query,
                filters: {
                    ...(ctx.query.filters as Record<string, any>),
                    $and: [...filters],
                },
            };
        }
        console.log(
            '$$$$$$$$$$$$$$$$ klub-projet middleware $$$$$$$$$$$$$$$$$$$$$ ctx.query.filters AFTER',
            ctx.query.filters,
        );
        console.log('TEST 3');
        console.dir(ctx.query.filters, { depth: null });
        // console.log('$$$$$$$$$$$$$$$$ klub-projet middleware $$$$$$$$$$$$$$$$$$$$$ ctx.query.filters AFTER', ctx.query.filters['$and']);
        console.log('TEST 4');
        // Passer au middleware suivant
        await next();
    };
};

const limitationFilters = (
    klubrId: number,
    klubrAffiliationsIds: number[],
    profileID: number,
    clubId: number,
    authorizedStatus?: Array<string>,
    clubAuthorizedStatus?: Array<string>,
    memberAuthorizedStatus?: Array<string>,
) => {
    const filters =
        authorizedStatus ||
        (clubId && clubAuthorizedStatus) ||
        (profileID && memberAuthorizedStatus)
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
                { klubr: clubId },
            ],
        });
    }
    if (profileID && memberAuthorizedStatus) {
        filters[0].$or.push({
            $and: [
                {
                    status: {
                        $in: memberAuthorizedStatus,
                    },
                },
                { klubr_membre: profileID },
            ],
        });
    }
    if (klubrId > 0) {
        // Means with templates
        // Authorise templates from : klubr, klubrAffiliationsIds and own klub
        filters[0].$or.push({
            $and: [
                { isTemplate: true },
                {
                    klubr: {
                        $in: [...(klubrAffiliationsIds || []), klubrId, clubId],
                    },
                },
            ],
        });
    }
    return filters;
};
