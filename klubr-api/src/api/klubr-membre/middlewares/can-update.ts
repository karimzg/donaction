import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';

/**
 * `can-update` middleware
 */
export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user }: { user: UserEntity | null } = ctx.state;
        const { klubr } = ctx.request.body?.data;
        const { uuid } = ctx.params;
        // Inutile pour l'instant, le lien étant fait directement par /klubr-membres/link-to-user avec le code d'invitation
        // const { codeInvitationMember } = ctx.query;
        // if (codeInvitationMember) {
        //   console.log("**GETTING GUEST MEMBER**");
        //   const guest = await strapi.db.query("api::klubr-membre.klubr-membre").findOne({
        //     where: { code: codeInvitationMember },
        //     populate: {
        //       klubr: true,
        //     }
        //   });
        //   if (!guest) return ctx.notFound('Aucun profil ne correspond au code fourni');
        //   console.log('$$$$$$$$$$$$$$$$ klubr-membre can-update middleware $$$$$$$$$$$$$$$$$$$$$ >> KLUBS', guest?.klubr?.uuid, klubr);
        //   if (guest.klubr.uuid !== klubr) {
        //     console.log("**GUEST KO**");
        //     return ctx.unauthorized('Non autorisé: Vous n\'êtes pas autorisé à modifier un profil pour ce club');
        //   }
        // } else {
        // Récupérer le club de l'utilisateur

        // GET profile to update klubr.uuid
        let updatedProfileKlubUuid = klubr;
        if (!updatedProfileKlubUuid) {
            const updatedProfile: KlubrMemberEntity = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { uuid: uuid },
                    populate: { klubr: true },
                });
            updatedProfileKlubUuid = updatedProfile?.klubr?.uuid;
        }

        // GET current profile klubr.uuid
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
                'Non autorisé: Vous devez être connecté pour modifier un profil',
            );
        }
        switch (profile?.role) {
            case 'AdminEditor':
            case 'NetworkLeader':
            case 'KlubMemberLeader':
                if (clubUUID !== updatedProfileKlubUuid)
                    return ctx.unauthorized(
                        "Non autorisé: Vous n'êtes pas autorisé à modifier un profil pour ce club",
                    );
                break;
            case 'KlubMember':
                if (uuid !== profile.uuid)
                    return ctx.unauthorized(
                        'Non autorisé: Vous ne pouvez modifier que votre propre profil',
                    );
                break;
            // @ts-ignore
            case 'Authenticated':
            // @ts-ignore
            case 'Public':
                return ctx.unauthorized(
                    'Non autorisé: Votre profile ne vous permet pas de modifier un profil',
                );
            default:
                break;
            // }
        }
        // Passer au middleware suivant
        await next();
    };
};
