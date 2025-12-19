/**
 * klub-projet router. by klub
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/klubr-membres/:uuid',
            handler: 'klubr-membre.findOne',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: [
                    {
                        name: 'api::klubr-membre.remove-unauthorized-fields',
                        config: { list: false },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/klubr-membres',
            handler: 'klubr-membre.find',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: ['api::klubr-membre.klubr-membre'],
            },
        },
        {
            method: 'POST',
            path: '/klubr-membres/link-to-user/:code',
            handler: 'klubr-membre.linkToUser',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/klubr-membres/switch-to/:uuid',
            handler: 'klubr-membre.switchToProfile',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/klubr-membres/switch-to-admin-editor/:klubUuid',
            handler: 'klubr-membre.switchToProfileAdminEditor',
            middlewares: ['api::klubr-membre.admin'],
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/klubr-membres/:code/send-invitation',
            handler: 'klubr-membre.sendInvitation',
            config: {
                // TODO: Ajouter un isAdmin or same klubr check
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/klubr-membres',
            handler: 'klubr-membre.create',
            config: {
                // TODO: Ajouter un isAdmin or same klubr check
                // auth: false,
                policies: [],
                middlewares: ['api::klubr-membre.can-create'],
            },
        },
        {
            method: 'POST',
            path: '/klubr-membres/for-front',
            handler: 'klubr-membre.createForFront',
            config: {
                policies: [],
            },
        },
        {
            method: 'PUT',
            path: '/klubr-membres/for-front/:uuid',
            handler: 'klubr-membre.updateForFront',
            config: {
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klubr-membres/for-front/:uuid',
            handler: 'klubr-membre.findOne',
            config: {
                policies: [],
            },
        },
        {
            method: 'PUT',
            path: '/klubr-membres/:uuid',
            handler: 'klubr-membre.update',
            config: {
                // TODO: Ajouter un isAdmin or same klubr check
                // auth: false,
                policies: [],
                middlewares: ['api::klubr-membre.can-update'],
            },
        },
    ],
};
