import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';
import {
    profileIsAtLeastKlubrLeader,
    profileIsKlubrAdmin,
} from '../../../helpers/permissions';

/**
 * Middleware to verify the authenticated user owns the klubr
 * specified in the request body (klubrId field = klubr uuid).
 * Used for account creation where no Stripe account exists yet.
 */
export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user }: { user: UserEntity } = ctx.state;

        if (!user) {
            return ctx.unauthorized('Authentification requise');
        }

        const body = ctx.request.body;

        if (!body || typeof body !== 'object') {
            return ctx.badRequest('Le corps de la requête est invalide');
        }

        const { klubrId } = body as Record<string, unknown>;

        if (!klubrId || typeof klubrId !== 'string') {
            return ctx.badRequest('Le champ klubrId est requis (string)');
        }

        // Find klubr by uuid
        const klubr = await strapi.db
            .query('api::klubr.klubr')
            .findOne({
                where: { uuid: klubrId },
            });

        if (!klubr) {
            return ctx.notFound(`Klubr ${klubrId} introuvable`);
        }

        // Get user's member profile
        let profile: KlubrMemberEntity | null = null;
        if (user?.last_member_profile_used) {
            profile = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { uuid: user.last_member_profile_used },
                    populate: { klubr: true },
                });
        }

        if (
            !profileIsAtLeastKlubrLeader(profile, klubr.uuid) &&
            !profileIsKlubrAdmin(profile)
        ) {
            return ctx.unauthorized(
                "Vous n'avez pas les droits pour gérer ce klubr"
            );
        }

        // Store validated klubr in state to avoid redundant DB lookup in controller
        ctx.state.klubr = klubr;

        await next();
    };
};
