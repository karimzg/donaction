/**
 * `can-create` middleware
 */
import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrEntity, KlubrMemberEntity, UserEntity } from '../../../_types';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user }: { user: UserEntity | null } = ctx.state;
        const { codeInvitationKlub }: { codeInvitationKlub?: string } =
            ctx.query;
        const { klubr } = ctx.request.body?.data;

        if (codeInvitationKlub) {
            // If the request contains a codeInvitationKlub, check if the klubr is the same as the one in the code
            const where = codeInvitationKlub.startsWith('LC')
                ? { codeLeader: codeInvitationKlub }
                : { code: codeInvitationKlub };
            const guestClub: KlubrEntity = await strapi.db
                .query('api::klubr.klubr')
                .findOne({
                    where,
                });
            if (!guestClub)
                return ctx.notFound('Aucun club ne correspond au code fourni');
            if (guestClub.uuid !== klubr) {
                return ctx.unauthorized(
                    `Non autorisé: Vous n\'êtes pas autorisé à créer un profil pour ce club`,
                );
            }
        } else {
            // If the request does not contain a codeInvitationKlub, check if the user is allowed to create a profile
            // Récupérer le club de l'utilisateur
            let clubUUID = null;
            let profile: KlubrMemberEntity | null = null;
            if (user?.last_member_profile_used) {
                profile = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        where: { uuid: user.last_member_profile_used },
                        populate: { klubr: true },
                    });
                clubUUID = profile?.klubr?.uuid;
            }
            if (!profile) {
                return ctx.unauthorized(
                    'Non autorisé: Vous devez être connecté pour créer un profil',
                );
            }
            switch (profile?.role) {
                case 'AdminEditor':
                case 'NetworkLeader':
                case 'KlubMemberLeader':
                    if (clubUUID !== klubr)
                        return ctx.unauthorized(
                            "Non autorisé: Vous n'êtes pas autorisé à créer un profil pour ce club",
                        );
                    break;
                case 'KlubMember':
                // @ts-ignore
                case 'Authenticated':
                // @ts-ignore
                case 'Public':
                    return ctx.unauthorized(
                        'Non autorisé: Votre profile ne vous permet pas de créer un profil',
                    );
                default:
                    break;
            }
        }
        console.log(
            '$$$$$$$$$$$$$$$$ klubr-membre can-create middleware $$$$$$$$$$$$$$$$$$$$$ >> OK',
        );
        // Passer au middleware suivant
        await next();
    };
};
