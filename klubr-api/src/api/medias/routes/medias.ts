export default {
    routes: [
        {
            method: 'GET',
            path: '/medias/avatars/:type?',
            handler: 'medias.findAvatars',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/medias/klubr/:uuid/files',
            handler: 'medias.postFileKlubr',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/medias/klubr-membres/:uuid/files',
            handler: 'medias.postFileKlubrMembre',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/medias/dynamicZoneFiles/:entity/:uuid/:dynamicZone/:componentType/:componentId?',
            handler: 'medias.postFileDynamicZone',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/medias/klubr-house/:uuid/files',
            handler: 'medias.postFileKlubrHouse',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/medias/klub-projet/:uuid/files',
            handler: 'medias.postFileKlubProjet',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/medias/klubr-donateur/:uuid/files',
            handler: 'medias.postFileKlubrDonateur',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/medias/user/:uuid/files',
            handler: 'medias.postFileUser',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
    ],
};
