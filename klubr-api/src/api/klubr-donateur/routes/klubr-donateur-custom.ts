/**
 * klub-don router. by klub
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/klubr-donateurs/byKlub',
            handler: 'klubr-donateur.findByKlubForFront',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klubr-donateurs/my-last',
            handler: 'klubr-donateur.findLastDonateurForCtxUser',
            config: {
                // auth: false,
                policies: [],
            },
        },
    ],
};
