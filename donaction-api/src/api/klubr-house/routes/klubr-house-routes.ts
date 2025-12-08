'use strict';

/**
 * klubr-house router.
 */
// TODO: ajouter les mêmes middlewares que pour les routes de klubrs?
export default {
    routes: [
        {
            method: 'GET',
            path: '/klubr-houses/full/:id',
            handler: 'klubr-house.findOneFull',
            config: {
                // auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/klubr-houses/:id/poster-pdf',
            handler: 'klubr-house.posterPdf',
            config: {
                // auth: false,
                policies: [],
            },
        },
    ],
};
