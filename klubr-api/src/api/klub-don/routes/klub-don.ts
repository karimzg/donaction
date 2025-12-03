/**
 * klub-don router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::klub-don.klub-don', {
    prefix: '',
    only: ['find', 'create', 'update', 'delete'],
    except: ['findOne'],
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
