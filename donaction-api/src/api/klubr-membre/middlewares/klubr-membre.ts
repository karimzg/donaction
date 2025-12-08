/**
 * `klubr-membre` middleware
 */
import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { isAtLeastAdminEditor } from '../../../helpers/permissions';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    // Add your own logic here.
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user } = ctx.state;
        const { code } = (ctx.query?.filters || {}) as Record<string, any>;
        console.log(
            '$$$$$$$$$$$$$$$$ klubr-membre middleware $$$$$$$$$$$$$$$$$$$$$',
        );
        // Vérifie si l'utilisateur est connecté
        if (!user || (user && !isAtLeastAdminEditor(user))) {
            // Récupérer le club de l'utilisateur
            // const userId = user.id;
            // const userClub = await strapi.entityService.findOne(
            //   'plugin::users-permissions.user',
            //   userId,
            //   { populate: ['club'] }
            // );

            if (
                ctx.state['user'] &&
                !isAtLeastAdminEditor(ctx.state['user']) &&
                !code
            ) {
                ctx.query = {
                    ...ctx.query,
                    filters: {
                        ...(ctx.query.filters as Record<string, any>),
                        role: {
                            $notIn: ['Admin', 'AdminEditor'],
                        },
                    },
                };
            }
            console.log(
                '$$$$$$$$$$$$$$$$ klubr-membre middleware $$$$$$$$$$$$$$$$$$$$$',
                ctx.query,
            );

            // if (userClub && userClub.club) {
            //   // Si c'est une requête GET (find), applique un filtre sur le club
            //   if (ctx.request.method === 'GET') {
            //     const query = ctx.query || {};
            //     query.filters = query.filters || {};
            //     query.filters.club = userClub.club.id;
            //
            //     ctx.query = query;
            //   }
            // } else {
            //   // Si l'utilisateur n'a pas de club associé, retourne une réponse vide ou une erreur
            //   ctx.body = [];
            //   return;
            // }
        }

        // Passer au middleware suivant
        await next();
    };
};
