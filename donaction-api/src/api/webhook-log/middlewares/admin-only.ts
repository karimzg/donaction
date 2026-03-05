import { Core } from '@strapi/strapi';
import { Context } from 'koa';

/**
 * Restricts access to authenticated users with the Admin role.
 * Webhook logs contain sensitive Stripe payload data.
 */
export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        const { user } = ctx.state;

        if (!user) {
            return ctx.unauthorized('Authentification requise');
        }

        if (user.role?.type !== 'admin') {
            return ctx.forbidden('Accès réservé aux administrateurs');
        }

        await next();
    };
};
