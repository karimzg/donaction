import jwt from 'jsonwebtoken';
import {
    BREVO_TEMPLATES,
    sendBrevoTransacEmail,
} from '../../emails/sendBrevoTransacEmail';
import { Context } from 'koa';
import { Core } from '@strapi/strapi';

export async function forgotPassword(
    handler: Core.ControllerHandler,
    ctx: Context,
) {
    try {
        const { email } = ctx.request.body;

        if (!email) {
            return ctx.badRequest('Email is required');
        }
        const user = await strapi
            .query('plugin::users-permissions.user')
            .findOne({
                where: { email },
            });

        if (!user) {
            return ctx.badRequest('This email does not exist.');
        }

        const code = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });
        const resetPasswordUrl = `${process.env.NEXTAUTH_URL}/reset-password?code=${code}`;

        console.log('RESET_PASSWORD', resetPasswordUrl);
        await sendBrevoTransacEmail({
            subject: 'Klubr.fr: Réinitialiser votre mot de passe',
            to: [{ email: user.email }],
            templateId: BREVO_TEMPLATES.FORGOT_PASSWORD,
            params: {
                RESET_PASSWORD_URL: resetPasswordUrl,
            },
            tags: ['reset-password'],
        });

        return ctx.send({
            message: 'Password reset email sent successfully',
        });
    } catch (e) {
        console.log(e);
        return ctx.badRequest(e);
    }
}
