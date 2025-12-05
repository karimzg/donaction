export default {
    routes: [
        {
            method: 'GET',
            path: '/klubrs/stats-all',
            handler: 'klubr.getAllKlubrStats',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klubr.admin-editor-or-admin'],
            },
        },
        {
            method: 'GET',
            path: '/klubrs/:uuid',
            handler: 'klubr.findOne',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: [
                    'api::klubr.klubr',
                    {
                        name: 'api::klubr.remove-unauthorized-fields',
                        config: { list: false },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/klubrs',
            handler: 'klubr.find',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: [
                    'api::klubr.klubr',
                    {
                        name: 'api::klubr.remove-unauthorized-fields',
                        config: { list: true },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/klubrs/bySlug/:slug/:preview?',
            handler: 'klubr.findBySlug',
            config: {
                // auth: false,
                policies: [],
                // no need middleware, restriction handled by param /:preview
                middlewares: [
                    {
                        name: 'api::klubr.remove-unauthorized-fields',
                        config: { list: false },
                    },
                ],
            },
        },
        {
            method: 'POST',
            path: '/klubrs/:code/send-invitation',
            handler: 'klubr.sendInvitation',
            config: {
                // TODO: Ajouter un isAdmin or same klubr check
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/klubrs/:uuid/create-documents',
            handler: 'klubr.postKlubrDocuments',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klubr.owner-or-admin'],
            },
        },
        {
            method: 'POST',
            path: '/klubrs/:uuid/documents',
            handler: 'klubr.postFileDocuments',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klubr.owner-or-admin'],
            },
        },
        {
            method: 'PUT',
            path: '/klubrs/:uuid/documents/validate',
            handler: 'klubr.validateDocuments',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klubr.admin-editor-or-admin'],
            },
        },
        {
            method: 'GET',
            path: '/klubrs/:uuid/documents/:doc',
            handler: 'klubr.getFileDocuments',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klubr.owner-or-admin'],
            },
        },
        {
            method: 'POST',
            path: '/klubrs/new/by-leader/:memberUuid',
            handler: 'klubr.createKlubrByMember',
            config: {
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klubrs/:uuid/stats',
            handler: 'klubr.getKlubrStats',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klubr.owner-or-admin'],
            },
        },
    ],
};
