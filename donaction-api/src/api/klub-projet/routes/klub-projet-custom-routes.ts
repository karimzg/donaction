/**
 * klub-projet router. by klub
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/klub-projets/:id',
            handler: 'klub-projet.findOne',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: ['api::klub-projet.klub-projet'],
            },
        },
        {
            method: 'GET',
            path: '/klub-projets',
            handler: 'klub-projet.find',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: ['api::klub-projet.klub-projet'],
            },
        },
        {
            method: 'GET',
            path: '/klub-projets/bySlug/:id',
            handler: 'klub-projet.findBySlug',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klub-projet.klub-projet'],
            },
        },
        {
            method: 'GET',
            path: '/klub-projets/byKlub/:id',
            handler: 'klub-projet.findByKlubId',
            config: {
                // auth: false,
                policies: [],
                middlewares: [
                    {
                        name: 'api::klub-projet.klub-projet',
                        // config: {
                        //   customParam: 'forFront', // Pass the custom parameter here
                        // },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/klub-projets/:id/poster-pdf',
            handler: 'klub-projet.posterPdf',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klub-projet.klub-projet'],
            },
        },
    ],
};
