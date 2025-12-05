/**
 * klub-don router. by klub
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/klub-dons/relaunch/:id',
            handler: 'klub-don.findOne',
            config: {
                // auth: false,
                policies: [],
                middlewares: ['api::klub-don.check-relaunch'],
            },
        },
        {
            method: 'GET',
            path: '/klub-dons/byKlub',
            handler: 'klub-don.findByKlubForFront',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klub-dons/byProject',
            handler: 'klub-don.findByProjectForFront',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klub-dons/my-dons',
            handler: 'klub-don.findForCtxUser',
            config: {
                // auth: true,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klub-dons/received-dons',
            handler: 'klub-don.findReceivedForCtxUser',
            config: {
                // auth: true,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klub-dons/:id/att-pdf',
            handler: 'klub-don.attPdf',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klub-dons/:id/recu-pdf',
            handler: 'klub-don.recuPdf',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klub-dons/cleanAll',
            handler: 'klub-don.cleanAll',
            config: {
                policies: [],
            },
        },
        // {
        //   method: 'GET',
        //   path: '/klub-dons/testMailDonateur',
        //   handler: 'klub-don.testMailDonateur',
        //   config: {
        //     // auth: false,
        //     policies: []
        //   },
        // },
        // {
        //   method: 'POST',
        //   path: '/klub-dons/withDonateur',
        //   handler: 'klub-don.createWithDonateur',
        //   config: {
        //     auth: false,
        //     policies: []
        //   },
        // },
    ],
};
