import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import jwt from 'jsonwebtoken';

export async function resetPassword(
    handler: Core.ControllerHandler,
    ctx: Context,
) {
    const { code, password } = ctx.request.body;

    let decoded;
    try {
        decoded = jwt.verify(code, process.env.JWT_SECRET);
    } catch (e) {
        return ctx.badRequest('Token is expired');
    }

    const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: decoded.id },
    });

    if (!user) {
        return ctx.notFound('User not found');
    }

    await strapi
        .plugin('users-permissions')
        .service('user')
        .edit(user.id, { password });

    ctx.send({ message: 'Password has been reset successfully' });
}
