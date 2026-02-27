import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { KlubrMemberEntity, UserEntity } from '../../../_types';
import {
    profileIsAtLeastKlubrLeader,
    profileIsKlubrAdmin,
} from '../../../helpers/permissions';

/**
 * Middleware to verify the authenticated user owns the klubr
 * associated with the Stripe connected account.
 * Checks the accountId param against the user's member profile.
 */
export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user }: { user: UserEntity } = ctx.state;

        if (!user) {
            return ctx.unauthorized(
                'Authentification requise'
            );
        }

        const { accountId } = ctx.params;

        if (!accountId) {
            return ctx.badRequest(
                'Le paramètre accountId est requis'
            );
        }

        // Find connected account and its associated klubr
        const connectedAccount = await strapi.db
            .query('api::connected-account.connected-account')
            .findOne({
                where: { stripe_account_id: accountId },
                populate: { klubr: true },
            });

        if (!connectedAccount) {
            return ctx.notFound(
                `Compte connecté ${accountId} introuvable`
            );
        }

        const klubrUuid = connectedAccount.klubr?.uuid;

        if (!klubrUuid) {
            return ctx.badRequest(
                'Compte connecté non associé à un klubr'
            );
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
            !profileIsAtLeastKlubrLeader(profile, klubrUuid) &&
            !profileIsKlubrAdmin(profile)
        ) {
            return ctx.unauthorized(
                "Vous n'avez pas les droits pour accéder à ce compte Stripe"
            );
        }

        await next();
    };
};
