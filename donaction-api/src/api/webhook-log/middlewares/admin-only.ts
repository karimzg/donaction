import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { isAdmin } from '../../../helpers/permissions';

/**
 * Restricts access to authenticated users with the Admin role.
 * Webhook logs contain sensitive Stripe payload data.
 *
 * Note: isAdmin() checks the users-permissions role (user.role.name === 'Admin'),
 * which is the platform-level admin role — not the Klubr member profile role.
 */
export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user } = ctx.state;

        if (!user) {
            return ctx.unauthorized('Authentification requise');
        }

        if (!isAdmin(user)) {
            return ctx.forbidden('Accès réservé aux administrateurs');
        }

        await next();
    };
};
