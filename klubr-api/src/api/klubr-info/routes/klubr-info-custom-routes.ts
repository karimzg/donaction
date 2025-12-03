/**
 * klub-projet router. by klub
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/klubr-infos/:id',
            handler: 'klubr-info.findOne',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: [
                    {
                        name: 'api::klubr-info.owner-or-admin',
                        config: { list: false },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/klubr-infos',
            handler: 'klubr-info.find',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: [
                    {
                        name: 'api::klubr-info.owner-or-admin',
                        config: { list: true },
                    },
                ],
            },
        },
    ],
};
