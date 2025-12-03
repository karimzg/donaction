/**
 * invoice router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::invoice.invoice', {
    prefix: '',
    only: ['create', 'update', 'delete'],
    except: ['find', 'findOne'],
    // config: {
    //     find: {
    //         auth: false,
    //         policies: [],
    //         middlewares: [],
    //     },
    //     findOne: {},
    //     create: {},
    //     update: {},
    //     delete: {},
    // },
});
