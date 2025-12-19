import { Context } from 'koa';
import { PaginationEntity } from '../../../_types';

export async function findWithStats(ctx: Context) {
    try {
        // GET USERS WITH META PAGINATION
        const { pagination, ...query } = ctx.query;
        let paginationQuery = {};
        if (pagination) {
            const { page, pageSize } = pagination as PaginationEntity;
            paginationQuery = {
                page: +page || 1,
                pageSize: +pageSize || 20,
            };
        }
        const data = await strapi.entityService.findPage(
            'plugin::users-permissions.user',
            {
                ...query,
                ...paginationQuery,
            },
        );
        ctx.body = {
            data: data.results,
            meta: {
                pagination: {
                    ...data.pagination,
                },
            },
        };
    } catch (error) {
        console.log(error);
        return ctx.badRequest([
            { messages: [{ id: 'Bad request', message: error.message }] },
        ]);
    }

    const returnedIds = ctx.body['data'].map((user) => user.id);

    try {
        // GET DONATEURS FOR EACH USERS
        const donateurs = await strapi.db
            .query('api::klubr-donateur.klubr-donateur')
            .findMany({
                select: ['nom', 'prenom', 'email', 'donateurType'],
                where: {
                    users_permissions_user: {
                        $in: returnedIds,
                    },
                    klubDon: {
                        montant: {
                            $ne: null,
                        },
                        statusPaiment: {
                            $eq: 'success',
                        },
                    },
                },
                populate: {
                    klubDon: {
                        select: [
                            'montant',
                            'statusPaiment',
                            'isContributionDonation',
                        ],
                    },
                    users_permissions_user: {
                        select: ['id'],
                    },
                },
            });
        ctx.body['data'] = ctx.body['data']?.map((user) => {
            const donateursOfUser = donateurs.filter(
                (donateur) => donateur.users_permissions_user.id === user.id,
            );
            // UPDATE USER WITH DONATION STATS
            user.stats = {
                nbDonsParticuliers: donateursOfUser.filter(
                    (donateur) =>
                        donateur.donateurType === 'Particulier' &&
                        !donateur.klubDon.isContributionDonation,
                ).length,
                nbDonsContributionParticuliers: donateursOfUser.filter(
                    (donateur) =>
                        donateur.donateurType === 'Particulier' &&
                        !!donateur.klubDon.isContributionDonation,
                ).length,
                nbDonsOrganismes: donateursOfUser.filter(
                    (donateur) =>
                        donateur.donateurType === 'Organisme' &&
                        !donateur.klubDon.isContributionDonation,
                ).length,
                nbDonsContributionOrganismes: donateursOfUser.filter(
                    (donateur) =>
                        donateur.donateurType === 'Organisme' &&
                        !!donateur.klubDon.isContributionDonation,
                ).length,
                montantTotal: donateursOfUser
                    .filter(
                        (donateur) => !donateur.klubDon.isContributionDonation,
                    )
                    .reduce(
                        (acc, donateur) => acc + donateur.klubDon.montant,
                        0,
                    ),
                montantContributionsTotal: donateursOfUser
                    .filter(
                        (donateur) => !!donateur.klubDon.isContributionDonation,
                    )
                    .reduce(
                        (acc, donateur) => acc + donateur.klubDon.montant,
                        0,
                    ),
            };
            return user;
        });
    } catch (e) {
        console.log(e);
        console.log('error adding stats to users', e);
        return ctx.body;
    }
    return ctx.body;
}
