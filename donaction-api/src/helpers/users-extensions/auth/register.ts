import { Context } from 'koa';
import { Core } from '@strapi/strapi';
import { v4 } from 'uuid';
import { KlubrDonateurEntity } from '../../../_types';

export async function register(handler: Core.ControllerHandler, ctx: Context) {
    try {
        ctx.request.body.username =
            'username-' + Math.random().toString(36).substring(7);
        ctx.request.body.uuid = v4();

        await handler(ctx, null);

        // Get all donateurs with the same email and without user
        const donateursWithSameEmail: Array<KlubrDonateurEntity> = await strapi
            .documents('api::klubr-donateur.klubr-donateur')
            .findMany({
                fields: ['id'],
                filters: {
                    $and: [
                        {
                            email: ctx.request['body']?.email,
                        },
                        {
                            users_permissions_user: null,
                        },
                    ],
                },
            });

        // Update all donateurs with the same email and without user with the registered user id
        if (ctx.response.body['user'].id && !!donateursWithSameEmail.length) {
            donateursWithSameEmail.map(
                async (donateur: KlubrDonateurEntity) => {
                    await strapi
                        .documents('api::klubr-donateur.klubr-donateur')
                        .update({
                            documentId: donateur.documentId,
                            data: {
                                users_permissions_user:
                                    ctx.response.body['user'].id,
                            },
                        });
                },
            );
        }

        return ctx;
    } catch (e) {
        return e;
    }
}
