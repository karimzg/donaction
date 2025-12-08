export default {
    routes: [
        {
            method: 'GET',
            path: '/invoices/:id',
            handler: 'invoice.findOne',
            config: {
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
                middlewares: ['api::invoice.my-invoices'],
            },
        },
        {
            method: 'GET',
            path: '/invoices',
            handler: 'invoice.find',
            config: {
                middlewares: ['api::invoice.my-invoices'],
                // TODO: check if auth should be true
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/invoices/generate/:month/:year/:genPdf?/:send?',
            handler: 'invoice.generate',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/invoices/:clubUuid/generate/:month/:year/:genPdf?/:send?',
            handler: 'invoice.generateForClub',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/invoices/:uuid/pdf',
            handler: 'invoice.generateInvoicePdf',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/invoices/:uuid/send',
            handler: 'invoice.sendInvoiceToKlubrMembre',
            config: {
                // auth: false,
                policies: [],
            },
        },
    ],
};
