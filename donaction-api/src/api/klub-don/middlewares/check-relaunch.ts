import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { UserEntity } from '../../../_types';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<void>) => {
        try {
            const { user }: { user: UserEntity } = ctx.state;
            const { id } = ctx.params;
            const { RELAUNCH_CODE } = ctx.query;
            if (!user) {
                if (!RELAUNCH_CODE) {
                    return ctx.badRequest('You cant edit this donation !');
                }
                const res = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findOne({
                        where: { uuid: id },
                    });

                if (Number(res.relaunchCode) !== Number(RELAUNCH_CODE)) {
                    return ctx.badRequest('You cant edit this donation !');
                }
            }
            return await next();
        } catch (e) {
            console.log(e);
            return ctx.badRequest('You cant edit this donation !');
        }
    };
};
