import { Core } from '@strapi/strapi';
import { Context } from 'koa';

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
};

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: () => Promise<any>) => {
        await next();

        const method = ctx.method;
        const status = ctx.response.status;
        const message = ctx.response.message;
        const url = ctx.url;

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

        console.log(` `);
        console.log(`${COLORS.blue}${'─'.repeat(50)}${COLORS.reset}`);
        console.log(
            `${COLORS.gray}[Strapi]${COLORS.reset} ${statusColor}METHOD       ${method}`,
        );
        console.log(
            `${COLORS.gray}[Strapi]${COLORS.reset} ${statusColor}URL          ${COLORS.reset}${url}`,
        );
        console.log(
            `${COLORS.gray}[Strapi]${COLORS.reset} ${statusColor}STATUS       ${COLORS.reset}${status}`,
        );
        console.log(
            `${COLORS.gray}[Strapi]${COLORS.reset} ${statusColor}MESSAGE      ${COLORS.reset}${message}`,
        );
        console.log(
            `${COLORS.gray}[Strapi]${COLORS.reset} ${statusColor}ENV          ${COLORS.reset}${ctx.app.env}`,
        );
        console.log(`${COLORS.blue}${'─'.repeat(50)}${COLORS.reset}`);
    };
};
