import { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { COLORS, logBlock } from '../helpers/logger';

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<any>) => {
        await next();

        const status = ctx.response.status;

        let statusColor = COLORS.reset;
        switch (true) {
            case status >= 200 && status < 300:
                statusColor = COLORS.green;
                break;
            case status >= 400 && status < 500:
                statusColor = COLORS.yellow;
                break;
            case status >= 500:
                statusColor = COLORS.red;
                break;
        }

        logBlock({
            statusColor,
            entries: [
                { key: 'METHOD', value: ctx.method },
                { key: 'URL', value: decodeURIComponent(ctx.url) },
                { key: 'STATUS', value: status },
                { key: 'MESSAGE', value: ctx.response.message },
                { key: 'ENV', value: ctx.app.env },
            ],
        });
    };
};
