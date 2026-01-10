/**
 * Type declarations for Koa extensions
 */

import 'koa';

declare module 'koa' {
    interface Request {
        /**
         * Raw request body as string or Buffer
         * Provided by Strapi's body parser middleware
         */
        rawBody?: string | Buffer;
    }
}
