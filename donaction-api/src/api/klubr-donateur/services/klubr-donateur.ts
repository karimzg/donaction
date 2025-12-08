/**
 * klubr-donateur service
 */

import { Core, factories } from '@strapi/strapi';
import { KlubrDonateurEntity, UserEntity } from '../../../_types';
import { Context } from 'koa';
import { roleIsAtLeast } from '../../../helpers/permissions';
import { USER_ROLES } from '../../../helpers/userRoles';
import { randomizeString } from '../../../helpers/string';

export default factories.createCoreService(
    'api::klubr-donateur.klubr-donateur',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async getUserIdByEmail(email: string) {
            const user: Array<UserEntity> = await strapi.db
                .query('plugin::users-permissions.user')
                .findMany({
                    where: {
                        email: email,
                    },
                });
            return user[0]?.id;
        },

        async getUserToLinkDonateur(ctx: Context, email: string) {
            // If the user is an Admin, we don't need to link the Donateur to a User
            // Otherwise, we link the Donateur to an existing User or the current User
            const ctxUserIsAdmin =
                ctx?.state?.user?.role &&
                roleIsAtLeast(
                    ctx.state.user?.role,
                    USER_ROLES.AdminEditor.name,
                );
            const ctxUserId = !ctxUserIsAdmin ? ctx?.state?.user?.id : null;
            return (await this.getUserIdByEmail(email)) || ctxUserId;
        },

        // async createDonateurForDon(klubrDonateur, ctx) {
        //   const { /*users_permissions_user, klubDon,*/ ...klubrDonateurPayload } = klubrDonateur;
        //   console.log(">>> DONATEUR PAYLOAD", klubrDonateurPayload);
        //   const klubrDonateurContentType = strapi.contentType("api::klubr-donateur.klubr-donateur");
        //   const klubrDonateurPayloadSanitized = await sanitize.contentAPI.input(klubrDonateurPayload, klubrDonateurContentType);
        //   console.log(">>> klubrDonateurSanitized", klubrDonateurPayloadSanitized);
        //   console.log(">>> klubrDonateurSanitized", {
        //     ...klubrDonateurPayloadSanitized,
        //     dateNaissance: Date.now().toString()
        //   });
        //   let createdEntityKlubDonateur;
        //   try {
        //     createdEntityKlubDonateur  = await strapi.entityService.create("api::klub-donateur.klub-donateur", {
        //       data: {
        //         ...klubrDonateurPayloadSanitized,
        //         dateNaissance: Date.now().toString()
        //       }
        //     });
        //   } catch (err) {
        //     // console.log('Impossible de créer le Donateur', err.details.errors);
        //     console.log('Impossible de créer le Donateur', err);
        //     return ctx.badRequest('Impossible de créer le Donateur', { input: klubrDonateurPayloadSanitized })
        //   }
        //
        //   return createdEntityKlubDonateur;
        //   // const sanitizedEntity = await this.sanitizeOutput(createdEntityKlubDonateur, ctx);
        //   // return this.transformResponse(sanitizedEntity);
        //   // return strapi.entityService.findOne('api::restaurant.restaurant', entityId, this.getFetchParams(params));
        // }
        /* ANONYMIZATION */
        async anonymizeData(emailListByPass: Array<string> = []) {
            try {
                const donatorsToAnonimize: Array<KlubrDonateurEntity> =
                    await strapi.db
                        .query('api::klubr-donateur.klubr-donateur')
                        .findMany({
                            where: {
                                $and: [
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
                donatorsToAnonimize.map(async (donator) => {
                    await strapi
                        .documents('api::klubr-donateur.klubr-donateur')
                        .update({
                            documentId: donator.documentId,
                            data: {
                                nom: randomizeString(donator.nom),
                                prenom: randomizeString(donator.prenom, 5),
                                email: randomizeString(donator.email, 1),
                                raisonSocial: randomizeString(
                                    donator.raisonSocial,
                                ),
                                SIREN: '999999999',
                                tel: '',
                                adresse: randomizeString(donator.adresse),
                                adresse2: randomizeString(donator.adresse2),
                                dateNaissance: null,
                                place_id: '',
                                anonymized: true,
                            },
                        });
                });
                console.log(
                    'AnonymizeData donators done : ',
                    donatorsToAnonimize.length,
                    ' donators anonymized',
                );
                return true;
            } catch (e) {
                console.log(e);
                return null;
            }
        },
    }),
);
