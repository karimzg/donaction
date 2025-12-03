/**
 * klub-projet router. by klub
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/klubr-documents/:id',
            handler: 'klubr-document.findOne',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: [
                    {
                        name: 'api::klubr-document.owner-or-admin',
                        config: { list: false },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/klubr-documents',
            handler: 'klubr-document.find',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: [
                    {
                        name: 'api::klubr-document.owner-or-admin',
                        config: { list: true },
                    },
                ],
            },
        },
    ],
};
