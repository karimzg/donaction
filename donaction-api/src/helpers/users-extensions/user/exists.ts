import { Context } from 'koa';
import { ValidationError } from 'yup';

export async function exists(ctx: Context) {
    try {
        if (!ctx.params.email) {
            throw new ValidationError('Missing "email".');
        }
        const validEmailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if (!ctx.params.email.match(validEmailRegex)) {
            throw new ValidationError('Email format is invalid');
        }
        const user = await strapi.db
            .query('plugin::users-permissions.user')
            .findMany({
                where: {
                    email: ctx.params.email,
                },
            });
        return {
            provider: user[0]?.provider || null,
        };
    } catch (e) {
        ctx.throw(400, e['message']);
    }
}
