/**
 * klubr-membre service
 */

import { Core, factories } from '@strapi/strapi';
import { Context } from 'koa';
import {
    KlubrEntity,
    KlubrMemberEntity,
    UserEntity,
    UserRoleEntity,
} from '../../../_types';
import {
    isAdmin,
    isAtLeastKlubrLeader,
    isAtLeastLeader,
    roleIsGreaterThan,
} from '../../../helpers/permissions';
import { USER_ROLES } from '../../../helpers/userRoles';
import {
    BREVO_TEMPLATES,
    sendBrevoTransacEmail,
} from '../../../helpers/emails/sendBrevoTransacEmail';
import {
    checkSvgAndTransform,
    MEDIAS_TRANSFORMATIONS,
} from '../../../helpers/medias';
import { randomizeString } from '../../../helpers/string';

export default factories.createCoreService(
    'api::klubr-membre.klubr-membre',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async getUserToLink(ctx: Context, userToLinkUuid?: string) {
            const userToLink: UserEntity = await strapi.db
                .query('plugin::users-permissions.user')
                .findOne({
                    where: { uuid: ctx.state['user']?.uuid },
                    populate: {
                        role: true,
                        klubr_membres: true,
                    },
                });
            if (!userToLink) {
                return ctx.notFound('User to link not found');
            }
            return userToLink;
        },

        async getMemberByCode(ctx: Context, code?: string) {
            if (!code) {
                // return ctx.badRequest('Missing klubr member code.');
                return ctx.badRequest('Le code profil est manquant.');
            }
            const member: KlubrMemberEntity = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { code },
                    populate: {
                        users_permissions_user: true,
                        klubr: true,
                    },
                });
            if (!member) {
                return ctx.notFound(
                    `No klubr member corresponding to code ${code}`,
                );
            }
            return member;
        },

        async checkMemberCanBeLinked(
            ctx: Context,
            memberToLink: KlubrMemberEntity,
            code?: string,
        ) {
            if (!!memberToLink.users_permissions_user) {
                if (
                    memberToLink.users_permissions_user.uuid ===
                    ctx.state['user'].uuid
                ) {
                    // return ctx.badRequest(`Klubr member with code ${code} already linked to user ${memberToLink.users_permissions_user.username}`);
                    return ctx.badRequest(
                        `Le profil avec le code ${code} est déjà lié à l'utilisateur ${memberToLink.users_permissions_user.username}`,
                    );
                }
                // return ctx.badRequest(`Klubr member with code ${code} already linked to user ${memberToLink.users_permissions_user.username}`);
                return ctx.badRequest(
                    `Le profil avec le code ${code} est déjà lié à l'utilisateur ${memberToLink.users_permissions_user.username}`,
                );
            }
            return Promise.resolve(true);
        },

        async checkUserConnectedHasRightToLinkMemberToAnotherUser(
            ctx: Context,
            member: KlubrMemberEntity,
        ) {
            const userConnected = await strapi.db
                .query('plugin::users-permissions.user')
                .findOne({
                    where: { uuid: ctx.state.user.uuid },
                    populate: {
                        role: true,
                        klubr_membres: {
                            populate: {
                                klubr: {
                                    fields: ['id', 'uuid', 'denomination'],
                                },
                            },
                        },
                    },
                });
            userConnected?.klubr_membres.map((m) => {
                console.log(
                    '*** userConnected > membres ***',
                    m.klubr.denomination,
                    '>> ',
                    m.nom,
                    m.fonction,
                    m.role,
                );
            });
            // console.log("userConnected membres", userConnected?.klubr_membres);
            // console.log("is Admin", isAdmin(userConnected));
            // console.log("is At least isAtLeastLeader", isAtLeastLeader(userConnected));
            // console.log("is Owner", isAtLeastKlubrLeader(userConnected, member.klubr.uuid));

            const isAd = isAdmin(userConnected);
            const isKlubrOwner =
                isAtLeastLeader(userConnected) &&
                isAtLeastKlubrLeader(userConnected, member.klubr.uuid);
            console.log(isAd);
            if (!isAd && !isKlubrOwner) {
                // return ctx.forbidden('You are not allowed to link another user to a Klubr member(You need to be Klubr owner or Admin)');
                return ctx.forbidden(
                    "Vous n'êtes pas autorisé(e) à lier un autre utilisateur à ce profil(Vous devez être Dirigeant du club ou Super Admin)",
                );
            }
            return Promise.resolve(true);
        },

        async checkUserCanBeLinked(
            ctx: Context,
            memberToLink: KlubrMemberEntity,
            userToLink: UserEntity,
        ) {
            if (
                !!userToLink.role &&
                userToLink.role.name !== USER_ROLES.Public.name &&
                roleIsGreaterThan(memberToLink.role, userToLink.role.name)
            ) {
                // return ctx.badRequest(`User ${userToLink.username} has a lower role than Klubr member ${memberToLink.prenom} ${memberToLink.nom}`);
                return ctx.badRequest(
                    `L'utilisateur ${userToLink.username} n'est pas autorisé à lier le profil de ${memberToLink.prenom} ${memberToLink.nom}`,
                );
            }
            return Promise.resolve(true);
        },

        async linkMemberAndUser(member: KlubrMemberEntity, user: UserEntity) {
            const role: UserRoleEntity = await strapi.db
                .query('plugin::users-permissions.role')
                .findOne({
                    where: { name: member.role },
                });

            await strapi.documents('plugin::users-permissions.user').update({
                documentId: user.documentId,
                data: {
                    klubr_membres: {
                        connect: [member.id],
                    },
                    role: role.id,
                },
            });

            const date_link_user = new Date();
            return await strapi
                .documents('api::klubr-membre.klubr-membre')
                .update({
                    documentId: member.documentId,
                    data: {
                        date_link_user: date_link_user,
                    },
                });
        },

        async unlinkMemberAndUser(
            members: Array<KlubrMemberEntity>,
            user: UserEntity,
        ) {
            try {
                await strapi
                    .documents('plugin::users-permissions.user')
                    .update({
                        documentId: user.documentId,
                        data: {
                            klubr_membres: {
                                disconnect: members.map((member) => member.id),
                            },
                        },
                    });
            } catch (e) {
                console.log('unlinkMemberAndUser error', e);
            }
        },

        async getKlubMembres(klubId: number, roles: Array<string>) {
            roles = roles || [];
            return await strapi
                .documents('api::klubr-membre.klubr-membre')
                .findMany({
                    populate: {
                        users_permissions_user: {
                            fields: ['email', 'id', 'uuid'],
                        },
                    },
                    filters: {
                        $and: [
                            {
                                // @ts-ignore
                                klubr: klubId,
                            },
                            {
                                role: {
                                    // @ts-ignore
                                    $in: [...roles],
                                },
                            },
                        ],
                    },
                });
        },

        async getKlubMembreWithEmail(membreUUid: string) {
            return await strapi
                .documents('api::klubr-membre.klubr-membre')
                .findMany({
                    populate: {
                        users_permissions_user: {
                            fields: ['email'],
                        },
                    },
                    filters: {
                        uuid: membreUUid,
                    },
                });
        },

        async sendInvitationEmail(
            email: string,
            guest: { nom?: string; prenom?: string; code: string },
            host: { nom?: string; prenom?: string },
            club: KlubrEntity,
        ) {
            return await sendBrevoTransacEmail({
                to: [{ email: email }],
                templateId: BREVO_TEMPLATES.MEMBER_INVITATION,
                params: {
                    LOGO_CLUB: checkSvgAndTransform(club?.logo, [
                        MEDIAS_TRANSFORMATIONS.EMAIL_CLUB_LOGO,
                    ]),
                    ALT_LOGO_CLUB: club?.logo?.alternativeText,
                    INVITED_MEMBER_FULLNAME: `${guest?.prenom} ${guest?.nom}`,
                    INVITING_MEMBER_FULLNAME: `${host?.prenom} ${host?.nom}`,
                    INVITATION_URL: `${process.env.NEXTAUTH_URL}/s/${guest.code}`,
                    CLUB_DENOMINATION: club?.denomination,
                },
                tags: [
                    'email-invitation-membre',
                    ...(club?.slug ? [`${club.slug}`] : []),
                ],
            });
        },

        async sendClubCreationEmail(member: KlubrMemberEntity) {
            return await sendBrevoTransacEmail({
                to: [{ email: member?.email }],
                templateId: BREVO_TEMPLATES.CLUB_CREATION,
                params: {
                    CLUB_DENOMINATION: member?.klubr?.denomination,
                    CLUB_SLUG: member?.klubr?.slug,
                    INVITATION_URL: `${process.env.NEXTAUTH_URL}/s/${member?.code}`,
                    INVITED_FULLNAME: `${member?.prenom} ${member?.nom}`,
                },
                tags: [
                    'email-creation-klub',
                    ...(member?.klubr?.slug ? [`${member?.klubr.slug}`] : []),
                ],
            });
        },

        async relaunchOrphanMembers() {
            try {
                const sevenDaysAgo = new Date();
                const threeHoursAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
                const listMembers = await strapi
                    .documents('api::klubr-membre.klubr-membre')
                    .findMany({
                        filters: {
                            role: 'KlubMemberLeader',
                            // @ts-ignore
                            klubr: { $null: true },
                        },
                    });
                let index = 0;
                while (index < listMembers.length) {
                    const member = listMembers[index];

                    if (
                        new Date(member?.updatedAt) < sevenDaysAgo &&
                        member?.isRelaunched
                    ) {
                        await strapi
                            .documents('api::klubr-membre.klubr-membre')
                            .delete({
                                documentId: member.documentId,
                            });
                    } else if (
                        new Date(member?.updatedAt) < threeHoursAgo &&
                        !member?.isRelaunched
                    ) {
                        await strapi
                            .documents('api::klubr-membre.klubr-membre')
                            .update({
                                documentId: member.documentId,
                                data: {
                                    isRelaunched: true,
                                },
                            });
                        await sendBrevoTransacEmail({
                            to: [{ email: member?.email }],
                            templateId: BREVO_TEMPLATES.MEMBER_RELAUNCH,
                            params: {
                                RECEIVER_FULLNAME: `${member?.prenom} ${member?.nom}`,
                                MEMBER_UUID: member?.uuid,
                            },
                            tags: ['email-creation-klub'],
                        });
                    }
                    index++;
                }
                return true;
            } catch (e) {
                console.log(e);
                return null;
            }
        },

        /* ANONYMIZATION */
        async anonymizeData(emailListByPass: Array<string> = []) {
            try {
                const membersToAnonimize: Array<KlubrMemberEntity> =
                    await strapi.db
                        .query('api::klubr-membre.klubr-membre')
                        .findMany({
                            where: {
                                $and: [
                                    {
                                        role: {
                                            $ne: 'Admin',
                                        },
                                    },
                                    {
                                        role: {
                                            $ne: 'AdminEditor',
                                        },
                                    },
                                    {
                                        $or: [
                                            {
                                                anonymized: {
                                                    $ne: true,
                                                },
                                            },
                                            {
                                                anonymized: {
                                                    $null: true,
                                                },
                                            },
                                        ],
                                    },
                                ],
                                $or: [
                                    {
                                        email: {
                                            $notIn: emailListByPass,
                                        },
                                    },
                                    {
                                        email: {
                                            $null: true,
                                        },
                                    },
                                ],
                            },
                        });
                console.log(
                    '----------------- anonymizeData ------------------',
                );
                membersToAnonimize.map(async (member) => {
                    await strapi
                        .documents('api::klubr-membre.klubr-membre')
                        .update({
                            documentId: member.documentId,
                            data: {
                                nom: randomizeString(member.nom),
                                prenom: randomizeString(member.prenom, 5),
                                email: randomizeString(member.email, 1),
                                birthDate: null,
                                tel: '',
                                numLicence: '',
                                anonymized: true,
                            },
                        });
                });
                console.log(
                    'AnonymizeData members done : ',
                    membersToAnonimize.length,
                    ' members anonymized',
                );
                return true;
            } catch (e) {
                console.log(e);
                return null;
            }
        },

        async anonymizeUsersData(emailListByPass: Array<string> = []) {
            try {
                const usersToAnonimize: Array<UserEntity> = await strapi.db
                    .query('plugin::users-permissions.user')
                    .findMany({
                        populate: {
                            role: true,
                        },
                        where: {
                            $and: [
                                {
                                    role: {
                                        name: {
                                            $ne: 'Admin',
                                        },
                                    },
                                },
                                {
                                    role: {
                                        name: {
                                            $ne: 'AdminEditor',
                                        },
                                    },
                                },
                                {
                                    $or: [
                                        {
                                            anonymized: {
                                                $ne: true,
                                            },
                                        },
                                        {
                                            anonymized: {
                                                $null: true,
                                            },
                                        },
                                    ],
                                },
                            ],
                            $or: [
                                {
                                    email: {
                                        $notIn: emailListByPass,
                                    },
                                },
                                {
                                    email: {
                                        $null: true,
                                    },
                                },
                            ],
                        },
                    });
                console.log(
                    '----------------- anonymizeData ------------------',
                );
                usersToAnonimize.map(async (user) => {
                    await strapi
                        .documents('plugin::users-permissions.user')
                        .update({
                            documentId: user.documentId,
                            data: {
                                nom: randomizeString(user.nom),
                                email: randomizeString(user.email, 1),
                                anonymized: true,
                            },
                        });
                });
                console.log(
                    'AnonymizeData users done : ',
                    usersToAnonimize.length,
                    ' users anonymized',
                );
                return true;
            } catch (e) {
                console.log(e);
                return null;
            }
        },
    }),
);
