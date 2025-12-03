/**
 * klubr-membre router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::klubr-membre.klubr-membre', {
    prefix: '',
    only: ['delete'],
    except: ['create', 'update', 'find', 'findOne'],
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
