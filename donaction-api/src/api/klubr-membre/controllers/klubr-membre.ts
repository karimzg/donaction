/**
 * klubr-membre controller
 */

import { Core, factories } from '@strapi/strapi';
import {
    removeCodes,
    removeFields,
    removeId,
} from '../../../helpers/sanitizeHelpers';
import {
    KlubrEntity,
    KlubrMemberEntity,
    PaginationEntity,
    UserEntity,
    UserRoleEntity,
} from '../../../_types';
import {
    isAdmin,
    isAtLeastAdminEditor,
    isAtLeastMember,
    memberIsAtLeastLeader,
    roleIsAtLeast,
} from '../../../helpers/permissions';
import { USER_ROLES } from '../../../helpers/userRoles';
import createAssessment from '../../../helpers/gcc/createAssessment';

export default factories.createCoreController(
    'api::klubr-membre.klubr-membre',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async delete(ctx) {
            console.log('****************DELETE*******************');
            const { id } = ctx.params;
            if (!id) {
                return ctx.badRequest('Missing klubr member uuid.');
            }
            ctx.query = { ...ctx.query, filters: { uuid: id } };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const { results }: { results: Array<KlubrMemberEntity> } =
                await strapi
                    .service('api::klubr-membre.klubr-membre')
                    .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound('Klub member not found');
            }

            const entity = results[0];
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            await strapi.documents('api::klubr-membre.klubr-membre').delete({
                documentId: entity.documentId,
            });
            return removeId(removeCodes(sanitizedResult));
        },

        async findOne(ctx) {
            try {
                console.log('****************FIND ONE*******************');
                const { uuid } = ctx.params;

                if (!uuid) {
                    return ctx.badRequest('Missing klubr member uuid.');
                }
                ctx.query = { ...ctx.query, filters: { uuid } };
                await this.validateQuery(ctx);

                const sanitizedQueryParams = await this.sanitizeQuery(ctx);

                const { results }: { results: Array<KlubrMemberEntity> } =
                    await strapi
                        .service('api::klubr-membre.klubr-membre')
                        .find(sanitizedQueryParams);

                if (results.length === 0) {
                    return ctx.notFound('Klub member not found');
                }

                const entity = results[0];
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(sanitizedResult);
            } catch (e) {
                console.log(e);
                return ctx.badRequest('Une erreur est survenue !');
            }
        },

        async find() {
            const ctx = strapi.requestContext.get();
            console.log('****************FIND*******************');
            if (ctx.query?.filters && ctx.query?.filters['id']) {
                delete ctx.query.filters['id'];
            }
            await this.validateQuery(ctx);

            let hasKlubrPopulate = false;
            if (!ctx.query.populate || Array.isArray(ctx.query.populate)) {
                // populate klubr if not already populated, in order to remove codes for non authorized ctx.users
                hasKlubrPopulate = !!(
                    ctx.query.populate as Array<string>
                )?.find((p) => p?.startsWith('klubr'));
                if (!hasKlubrPopulate) {
                    ctx.query.populate = [
                        ...((ctx.query.populate as any) || []),
                        'klubr',
                    ];
                }
            } else if (
                ctx.query.withEmails &&
                ctx.state.user &&
                isAtLeastMember(ctx.state.user)
            ) {
                // populate klubr if not already populated, in order to remove codes for non authorized ctx.users
                hasKlubrPopulate = !!ctx.query.populate['klubr'];
                ctx.query = {
                    ...ctx.query,
                    populate: {
                        klubr: { fields: ['uuid'] },
                        ...(ctx.query.populate as Array<string>),
                        users_permissions_user: { fields: ['email'] },
                    },
                };
            }

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            const {
                results,
                pagination,
            }: {
                results: Array<KlubrMemberEntity>;
                pagination: PaginationEntity;
            } = await strapi
                .service('api::klubr-membre.klubr-membre')
                .find(sanitizedQueryParams);

            const ctxUserCanViewCodes =
                ctx.state.user?.role &&
                roleIsAtLeast(
                    ctx.state.user?.role?.name,
                    USER_ROLES.KlubMemberLeader.name,
                );

            if (
                ctx.query.withEmails &&
                ctx.state.user &&
                !isAtLeastAdminEditor(ctx.state?.user)
            ) {
                // Retrieve the user.last_member_profile_used member with klubr.uuid
                const lastMemberProfileUsed =
                    ctx.state.user.last_member_profile_used;
                const member: KlubrMemberEntity = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        where: { uuid: lastMemberProfileUsed },
                        populate: { klubr: true },
                    });
                const memberKlubrUuid = member?.klubr?.uuid;
                console.log('memberKlubrUuid', memberKlubrUuid);
                // remove email if memberKlubrUuid is different from member.klubr.uuid
                results.forEach((m) => {
                    m.users_permissions_user =
                        m.klubr?.uuid === memberKlubrUuid
                            ? m.users_permissions_user
                            : undefined;
                    // remove unnecessary klubr
                    // if (!ctxUserCanViewCodes && numberOfKeysInKlubr(m.klubr) === 2 && !!m.klubr?.uuid && !!m.klubr?.id) {
                    if (!ctxUserCanViewCodes && !hasKlubrPopulate) {
                        m.klubr = undefined;
                    }
                });
            }

            /* REMOVE INVITATIONS CODES FOR USER NOT AT LEAST LEADER OF THE KLUB OF EACH MEMBERS */
            const sanitizedResult = await this.sanitizeOutput(results, ctx);
            let data = removeId(sanitizedResult);
            if (!ctxUserCanViewCodes) {
                console.log('Removing codes for non authorized users');
                data = removeFields(data, [
                    'email',
                    'tel',
                    'birthDate',
                    'code',
                    'codeLeader',
                ]);
            } else {
                console.log(
                    'User can view codes (hasKlubrPopulate)',
                    hasKlubrPopulate,
                );
                // remove code if memberKlubrUuid is different from member.klubr.uuid
                const lastMemberProfileUsed =
                    ctx.state.user.last_member_profile_used;
                const member = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        where: { uuid: lastMemberProfileUsed },
                        populate: { klubr: true },
                    });
                const memberKlubrUuid = member?.klubr?.uuid;
                data = data.map((m) => {
                    if (
                        m.klubr?.uuid !== memberKlubrUuid &&
                        !isAdmin(ctx.state.user)
                    ) {
                        console.log(
                            'Removing codes for non authorized users',
                            m.klubr?.uuid,
                            memberKlubrUuid,
                        );
                        m = removeFields(m, [
                            'email',
                            'tel',
                            'birthDate',
                            'code',
                            'codeLeader',
                        ]);
                    }
                    // remove unnecessary klubr
                    if (!hasKlubrPopulate) {
                        m.klubr = undefined;
                    }
                    return m;
                });
            }
            return { data, meta: { pagination } };
        },

        async update() {
            const ctx = strapi.requestContext.get();
            try {
                // prevent filtering by id, but by uuid
                const { uuid } = ctx.params;
                if (!uuid) {
                    return ctx.badRequest('Missing UUID.');
                }
                const entityWithUUID: KlubrMemberEntity = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        select: ['documentId'],
                        populate: {
                            avatar: true,
                            klubr: {
                                fields: ['id', 'uuid', 'slug'],
                            },
                        },
                        where: { uuid },
                    });
                if (!entityWithUUID) {
                    return ctx.badRequest(`Entity with UUID ${uuid} not found`);
                }

                /* use /medias/klubr-membres/{{uuid}}/files to set klubr-member.avatar */
                /* Kept only to setAvatar from library */
                const { body, files } = ctx.request;
                if (body.data?.avatar) {
                    const avatarId = body.data.avatar.set[0];
                    if (avatarId !== entityWithUUID.avatar?.id) {
                        console.log('Moving file to folder', entityWithUUID);
                        await strapi
                            .service('api::medias.medias')
                            .moveFileToFolder(
                                ctx,
                                entityWithUUID.avatar,
                                avatarId,
                                `/Klubs/${entityWithUUID.klubr.slug}/Membres/`,
                            );
                    }
                }

                if (ctx.request.body?.data?.klubr) {
                    const klubr: KlubrEntity = await strapi.db
                        .query('api::klubr.klubr')
                        .findOne({
                            where: { uuid: ctx.request.body?.data?.klubr },
                        });
                    body.data.klubr = klubr.id;
                }
                const entity = await strapi
                    .documents('api::klubr-membre.klubr-membre')
                    .update({
                        documentId: entityWithUUID.documentId,
                        populate: {
                            ...(ctx.query.populate as any),
                        },
                        data: {
                            ...body.data,
                        },
                    });

                // prevent returning ids
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(removeCodes(sanitizedResult));
            } catch (e) {
                console.log('Error updating klubr member:', e);
                return ctx.badRequest(
                    'Une erreur est survenue lors de la mise à jour du membre.',
                );
            }
        },

        async create(ctx) {
            try {
                console.log('****************CREATE*******************');
                if (ctx.request.body?.data?.klubr) {
                    const klubr: KlubrEntity = await strapi.db
                        .query('api::klubr.klubr')
                        .findOne({
                            where: { uuid: ctx.request.body?.data?.klubr },
                        });
                    ctx.request.body.data.klubr = klubr.id;
                }
                console.log('DATA', ctx.request.body.data);
                const entity = await super.create(ctx);
                // prevent returning ids
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(sanitizedResult);
            } catch (e) {
                console.log('Error creating klubr member:', e);
                return ctx.badRequest(
                    'Une erreur est survenue lors de la création du membre.',
                );
            }
        },

        async createForFront(ctx) {
            try {
                if (!ctx.request.body?.data['formToken']) {
                    return ctx.badRequest('Missing reCaptcha token.');
                }
                const result = await createAssessment({
                    token: ctx.request.body?.data['formToken'],
                    recaptchaAction: 'CREATE_KLUBR_MEMBER',
                });

                if (!result) {
                    return ctx.badRequest('Captcha verification failed');
                }
                const entity = await strapi
                    .documents('api::klubr-membre.klubr-membre')
                    .create({
                        //@ts-ignore
                        data: {
                            email: ctx.request.body.data.email,
                            nom: ctx.request.body.data.nom,
                            prenom: ctx.request.body.data.prenom,
                            tel: ctx.request.body.data.tel,
                            birthDate: ctx.request.body.data.birthDate,
                            role: 'KlubMemberLeader',
                            fonction: 'Dirigeant',
                            optin_mail_invoice: true,
                        },
                    });
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(sanitizedResult);
            } catch (e) {
                console.log(e);
                return ctx.badRequest(e);
            }
        },

        async updateForFront(ctx) {
            if (!ctx.request.body?.data['formToken']) {
                return ctx.badRequest('Missing reCaptcha token.');
            }
            const result = await createAssessment({
                token: ctx.request.body?.data['formToken'],
                recaptchaAction: 'UPDATE_KLUBR_MEMBER',
            });
            if (!result) {
                return ctx.badRequest('Captcha verification failed');
            }
            const entity = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .update({
                    where: { uuid: ctx.params.uuid },
                    data: {
                        email: ctx.request.body.data?.email,
                        nom: ctx.request.body.data?.nom,
                        prenom: ctx.request.body.data?.prenom,
                        tel: ctx.request.body.data?.tel,
                        birthDate: ctx.request.body.data?.birthDate,
                    },
                });
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },

        async sendInvitation(ctx) {
            //TODO: check ctx.user is admin or leader of klubr
            console.log(
                '****************SENDING INVITATION*******************',
            );
            const { code } = ctx.params;
            const { email } = ctx.request.body?.data;
            // const { user } = ctx.state;

            // Retrieve the user.last_member_profile_used member with klubr.uuid
            const lastMemberProfileUsed =
                ctx.state.user?.last_member_profile_used;
            const host: KlubrMemberEntity = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { uuid: lastMemberProfileUsed },
                    populate: { klubr: true },
                });

            /* Check MEMBER */
            console.log('**GETTING GUEST**');
            const guest: KlubrMemberEntity = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { code },
                    populate: {
                        klubr: {
                            populate: {
                                klubr_house: true,
                                logo: true,
                            },
                        },
                    },
                });
            if (!guest)
                return ctx.notFound(
                    'Aucun profil ne correspond au code fourni',
                );

            if (email) {
                const response = await strapi.services[
                    'api::klubr-membre.klubr-membre'
                ].sendInvitationEmail(email, guest, host, guest.klubr);
                return true;
            }
            return false;
        },

        async linkToUser(ctx) {
            let serviceResponse;
            console.log(
                '****************LINKING MEMBER TO USER*******************',
            );
            const { code } = ctx.params;
            const { userToLinkUuid } = ctx.request.body?.data;

            /* If no userToLink defined then ctx.user is choosen */
            console.log('**GETTING USER TO LINK**');
            const userToLink: UserEntity = await strapi
                .service('api::klubr-membre.klubr-membre')
                .getUserToLink(ctx, userToLinkUuid);
            if (!userToLink) return ctx.notFound('Utilisateur non trouvé');
            console.log('  > userToLink', userToLink.email, userToLink.uuid);

            /* Check CODE AND MEMBER */
            console.log('**GETTING MEMBER TO LINK**');
            const memberToLink: KlubrMemberEntity = await strapi
                .service('api::klubr-membre.klubr-membre')
                .getMemberByCode(ctx, code);
            if (!memberToLink)
                return ctx.notFound(
                    'Aucun profil ne correspond au code fourni',
                );
            console.log(
                '  > memberToLink',
                memberToLink.prenom,
                memberToLink.nom,
                memberToLink.fonction,
                memberToLink.role,
                memberToLink.code,
            );
            console.log(
                '  > memberToLink > klubr',
                memberToLink.klubr?.id,
                memberToLink.klubr?.uuid,
                memberToLink.klubr?.denomination,
            );
            console.log(
                '  > memberToLink > user',
                memberToLink.users_permissions_user?.email,
                memberToLink.users_permissions_user?.uuid,
            );

            /* Check if MEMBER is already linked to USER */
            console.log('**CHECKING MEMBER CAN BE LINKED**');
            serviceResponse = await strapi
                .service('api::klubr-membre.klubr-membre')
                .checkMemberCanBeLinked(ctx, memberToLink, code);
            console.log('  > serviceResponse', serviceResponse);
            if (!serviceResponse) return;

            /* If userToLink is not ctx.state.user BUT defined by request body, check that ctx.state.user has rights to do it (Admin OR ((Leader OR Network) AND klub owner of memberToLink) */
            console.log('**CHECKING USER CONNECTED RIGHTS**');
            if (!!userToLinkUuid) {
                serviceResponse = await strapi
                    .service('api::klubr-membre.klubr-membre')
                    .checkUserConnectedHasRightToLinkMemberToAnotherUser(
                        ctx,
                        memberToLink,
                    );
                if (!serviceResponse) return;
            }

            /* Check if USER can be linked to MEMBER */
            // Not used anymore as user can now switch from one profile with role A to another with role B
            // console.log("**CHECKING USER CAN BE LINKED**");
            // serviceResponse = await strapi.service("api::klubr-membre.klubr-membre").checkUserCanBeLinked(ctx, memberToLink, userToLink);
            // if (!serviceResponse) return;

            /* Link MEMBER to USER */
            console.log('**LINKING MEMBER TO USER**');
            const updatedUser = await strapi
                .service('api::klubr-membre.klubr-membre')
                .linkMemberAndUser(memberToLink, userToLink);
            if (!serviceResponse) return;
            console.log('****************AUTHORIZED*******************');
            const sanitizedResult = await this.sanitizeOutput(updatedUser, ctx);
            return removeId(sanitizedResult);
        },

        async switchToProfile(ctx) {
            const { uuid } = ctx.params;
            console.log(
                '****************SWITCHING TO PROFILE*******************',
            );

            const user: UserEntity = await strapi.db
                .query('plugin::users-permissions.user')
                .findOne({
                    where: { uuid: ctx.state.user.uuid },
                    populate: {
                        role: true,
                        klubr_membres: {
                            populate: {
                                avatar: true,
                                klubr: {
                                    populate: {
                                        logo: true,
                                        klubrAffiliations: true,
                                        template_projects_libraries: true,
                                        trade_policy: true,
                                        klubr_info: true,
                                    },
                                },
                            },
                        },
                    },
                });
            if (!user) {
                // return ctx.notFound('Connected user not found');
                return ctx.notFound('Utilisateur connecté non trouvé');
            }

            /* check if user is linked to member */
            console.log('**CHECKING USER IS LINKED TO MEMBER**');
            let member = user.klubr_membres.find((m) => m.uuid === uuid);
            if (!member) {
                // return ctx.badRequest('User is not linked to this member');
                return ctx.badRequest("Vous n'êtes pas lié à ce profil");
            }

            /* check if user's profile is not the one to switch to */
            console.log('**CHECKING USER IS NOT ALREADY ON THIS PROFILE**');
            if (user.last_member_profile_used === member.uuid) {
                // return ctx.badRequest('User is already on this profile');
                return ctx.badRequest('Vous êtes déjà sur ce profil');
            }

            const role: UserRoleEntity = await strapi.db
                .query('plugin::users-permissions.role')
                .findOne({
                    where: { name: member.role },
                });
            if (!role) {
                // return ctx.badRequest('Member role not found');
                return ctx.badRequest("Le rôle du profil n'a pas été trouvé");
            }

            /* Sanitize member if not at least KlubMemberLeader */
            if (!memberIsAtLeastLeader(member)) {
                member = removeFields(member, ['klubr_info', 'trade_policy']);
            }

            /* Update User role & last_member_profile_used */
            console.log(
                '**UPDATING USER ROLE & LAST MEMBER PROFILE USED**',
                role.name,
            );
            const userUpdated: UserEntity = await strapi
                .documents('plugin::users-permissions.user')
                .update({
                    documentId: user.documentId,
                    data: {
                        last_member_profile_used: member.uuid,
                        role: role.id,
                    },
                });

            console.log('****************SWITCHED*******************');
            return member;
        },

        async switchToProfileAdminEditor(ctx) {
            try {
                const { klubUuid } = ctx.params;
                console.log(
                    '****************SWITCHING TO PROFILE ADMIN EDITOR*******************',
                );

                /* Get Klubr */
                const klubr: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid: klubUuid },
                    });
                if (!klubr) {
                    return ctx.notFound('Klub non trouvé');
                }

                /* Check club as one AdminEditor */
                const destinatairesTypes = ['AdminEditor'];
                const klubAdminEditors = await strapi.services[
                    'api::klubr-membre.klubr-membre'
                ].getKlubMembres(klubr.id, destinatairesTypes);

                /* Create or get Admin Edtior for Klub */
                const klubAdminEditor =
                    klubAdminEditors.length === 0
                        ? await strapi
                              .documents('api::klubr-membre.klubr-membre')
                              .create({
                                  // @ts-ignore
                                  data: {
                                      nom: klubr.acronyme,
                                      prenom: 'Admin',
                                      role: 'AdminEditor',
                                      fonction: 'Administrateur',
                                      klubr: klubr.id,
                                  },
                              })
                        : klubAdminEditors[0];

                if (!klubAdminEditor) {
                    return ctx.notFound(
                        'Impossible de récupérer ou créer un AdminEditor pour ce klub',
                    );
                }

                /* Unlink all AdminEditors from user */
                const userToUnlink = await strapi
                    .service('api::klubr-membre.klubr-membre')
                    .getUserToLink(ctx);
                const adminEditor = userToUnlink.klubr_membres.filter(
                    (m: KlubrMemberEntity) => m.role === 'AdminEditor',
                );
                if (adminEditor.length > 0) {
                    await strapi
                        .service('api::klubr-membre.klubr-membre')
                        .unlinkMemberAndUser(adminEditor, userToUnlink);
                }

                /* If klub as already klubAdmin that is link to a user */
                if (klubAdminEditors.length > 0) {
                    if (!!klubAdminEditor.users_permissions_user) {
                        // Vérifier si le user est déjà lié à l'utilisateur connecté
                        if (
                            klubAdminEditor.users_permissions_user.id ===
                            ctx.state.user.id
                        ) {
                            const alreadyConnectedToUser =
                                ctx.state.user.last_member_profile_used ===
                                klubAdminEditor.uuid;
                            return {
                                status: alreadyConnectedToUser
                                    ? 'alreadyLinkedToUserAndConnected'
                                    : 'alreadyLinkedToUser',
                                ...klubAdminEditor,
                            };
                        }
                        // Sinon Mettre à jour l'utilisateur (qui n'est pas celui connecté) en supprimant la last_member_profile_used
                        await strapi.db
                            .query('plugin::users-permissions.user')
                            .update({
                                where: {
                                    id: klubAdminEditor.users_permissions_user
                                        .id,
                                    last_member_profile_used:
                                        klubAdminEditor.uuid,
                                },
                                data: {
                                    last_member_profile_used: null,
                                },
                            });
                        return {
                            status: 'alreadyExistingAdminEditorNotLinkedToUSer',
                            ...klubAdminEditor,
                        };
                    }
                }
                return { status: 'newAdminEditor', ...klubAdminEditor };
            } catch (e) {
                console.log('Error', e);
                return ctx.badRequest(e);
            }
        },
    }),
);
