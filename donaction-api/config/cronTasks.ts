import { Core } from '@strapi/strapi';

export default {
    updateProjectStatus: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];
            console.log(
                '************ CRON: updateProjectStatus ************',
                formattedDate,
            );
            try {
                await strapi.db
                    .query('api::klub-projet.klub-projet')
                    .updateMany({
                        where: {
                            // id: 58
                            status: 'published',
                            dateLimiteFinancementProjet: {
                                $lt: formattedDate,
                            },
                        },
                        data: {
                            status: 'closed',
                        },
                    });
            } catch (err: any) {
                console.log(
                    'CRON: Erreur lors de la mise à jour des projets.',
                    err,
                );
            }
            console.log(
                '************ CRON END: updateProjectStatus ************',
            );
        },
        // options: Every day at 1am
        options: {
            rule: '0 1 0 * * *',
        },
    },
    // generateInvoices: {
    //   task: async ({strapi}) => {
    //     console.log('************ CRON: generateInvoices ************');
    //     try {
    //       const result = await strapi
    //         .service("api::invoice.invoice")
    //         // .createInvoices(month, year);
    //         .createInvoices('10', '2024');
    //     } catch (err) {
    //       console.log('CRON: Erreur lors de la génération des factures.', err);
    //     }
    //     console.log('************ CRON END: generateInvoices ************');
    //   },
    //   // options: Every day at 2am
    //   // options: {
    //   //   rule: "0 2 0 * * *",
    //   // },
    //   options: new Date(Date.now() + 20000),
    // },
    // BreakingChanges
    updateDefaultTradePolicyForKlubs: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log(
                '************ CRON: updateDefaultTradePolicyForKlubs ************',
            );
            try {
                const defaultTradePolicyId: any = await strapi
                    .service('api::trade-policy.trade-policy')
                    .getDefaultTradePolicy();
                console.log('defaultTradePolicy', defaultTradePolicyId);
                if (defaultTradePolicyId) {
                    const klubsToUpdate: Array<any> = await strapi.db
                        .query('api::klubr.klubr')
                        .findMany({
                            where: {
                                trade_policy: null,
                            },
                        });
                    if (klubsToUpdate.length) {
                        console.log('klubsToUpdate', klubsToUpdate.length);
                        await Promise.all(
                            klubsToUpdate.map(async (klub) => {
                                await strapi.db
                                    .query('api::klubr.klubr')
                                    .update({
                                        where: { id: klub.id },
                                        data: {
                                            trade_policy: defaultTradePolicyId,
                                        },
                                    });
                            }),
                        );
                    } else {
                        console.log(
                            'CRON: Aucun klub trouvé sans politique commerciale.',
                        );
                    }
                } else {
                    console.log(
                        'CRON: Aucune politique commerciale par défaut trouvée.',
                    );
                }
            } catch (err: any) {
                console.log(
                    'CRON: Erreur lors de la mise à jour des Politiques commerciales des klubs ',
                    err,
                );
            }
            console.log(
                '************ CRON END: updateDefaultTradePolicyForKlubs ************',
            );
        },
        options: new Date(Date.now() + 5000),
    },
    updateDefaultDocumentsAndInfosForKlubs: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log(
                '************ CRON: updateDefaultDocumentsAndInfosForKlubs ************',
            );
            try {
                /* INFOS */
                const klubsToUpdateInfo: Array<any> = await strapi.db
                    .query('api::klubr.klubr')
                    .findMany({
                        where: {
                            klubr_info: {
                                $null: true,
                            },
                        },
                        populate: {
                            federationLink: true,
                        },
                    });
                if (klubsToUpdateInfo.length) {
                    console.log('klubsToUpdateInfo', klubsToUpdateInfo.length);
                    await Promise.all(
                        klubsToUpdateInfo.map(async (klub) => {
                            /* CREATE klubr-infos */
                            /* UPDATE KLUBR INFOS */
                            const klubr_info1 = await strapi
                                .service('api::klubr.klubr')
                                .setKlubrInfosRequiredFieldsCompletion(
                                    klub,
                                    true,
                                );

                            const klubr_info2 = {
                                requiredDocsValidatedCompletion: 0,
                                requiredDocsWaitingValidationCompletion: 0,
                                requiredDocsRefusedCompletion: 0,
                            };
                            await strapi.db
                                .query('api::klubr-info.klubr-info')
                                .create({
                                    data: {
                                        klubr: klub.id,
                                        ...klubr_info1,
                                        ...klubr_info2,
                                    },
                                });
                        }),
                    );
                } else {
                    console.log('CRON: Aucun klub trouvé sans information.');
                }
                /* DOCS */
                const klubsToUpdateDoc: Array<any> = await strapi.db
                    .query('api::klubr.klubr')
                    .findMany({
                        where: {
                            klubr_document: {
                                $null: true,
                            },
                        },
                    });
                if (klubsToUpdateDoc.length) {
                    console.log('klubsToUpdateInfo', klubsToUpdateDoc.length);
                    await Promise.all(
                        klubsToUpdateDoc.map(async (klub) => {
                            await strapi.db
                                .query('api::klubr-document.klubr-document')
                                .create({
                                    data: {
                                        klubr: klub.id,
                                    },
                                });
                        }),
                    );
                } else {
                    console.log('CRON: Aucun klub trouvé sans document.');
                }
            } catch (err: any) {
                console.log(
                    'CRON: Erreur lors de la mise à jour des Documents et Informations des klubs ',
                    err,
                );
            }
            console.log(
                '************ CRON END: updateDefaultDocumentsAndInfosForKlubs ************',
            );
        },
        options: new Date(Date.now() + 7000),
    },
    // updateProjectStatusBreakingChange: {
    //   task: async ({strapi}) => {
    //     console.log('************ CRON: updateProjectStatusBreakingChange ************');
    //     try {
    //       await strapi.db.query("api::klub-projet.klub-projet").updateMany({
    //         where: {
    //           status: 'publie',
    //         },
    //         data: {
    //           status: 'published',
    //         },
    //       });
    //       await strapi.db.query("api::klub-projet.klub-projet").updateMany({
    //         where: {
    //           status: 'supprime',
    //         },
    //         data: {
    //           status: 'deleted',
    //         },
    //       });
    //       await strapi.db.query("api::klub-projet.klub-projet").updateMany({
    //         where: {
    //           status: 'creation',
    //         },
    //         data: {
    //           status: 'draft',
    //         },
    //       });
    //     } catch (err) {
    //       console.log('CRON: Erreur lors de la mise à jour des projets (Breaking change).', err);
    //     }
    //     console.log('************ CRON END: updateProjectStatusBreakingChange ************');
    //   },
    //   // Start 20 seconds after server start
    //   options: new Date(Date.now() + 20000),
    // },
    updateClubStatusBreakingChange: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log(
                '************ CRON: updateClubStatusBreakingChange ************',
            );
            try {
                await strapi.db.query('api::klubr.klubr').updateMany({
                    where: {
                        status: 'valide',
                    },
                    data: {
                        status: 'published',
                    },
                });
                await strapi.db.query('api::klubr.klubr').updateMany({
                    where: {
                        status: 'supprime',
                    },
                    data: {
                        status: 'deleted',
                    },
                });
                await strapi.db.query('api::klubr.klubr').updateMany({
                    where: {
                        status: 'creation',
                    },
                    data: {
                        status: 'draft',
                    },
                });
                await strapi.db.query('api::klubr.klubr').updateMany({
                    where: {
                        donationEligible: null,
                    },
                    data: {
                        donationEligible: false,
                    },
                });
            } catch (err: any) {
                console.log(
                    'CRON: Erreur lors de la mise à jour des clubs (Breaking change).',
                    err,
                );
            }
            console.log(
                '************ CRON END: updateClubStatusBreakingChange ************',
            );
        },
        // Start 10 seconds after server start
        options: new Date(Date.now() + 20000),
    },
    updateDonEmailSentBreakingChange: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log(
                '************ CRON: updateDonEmailSentBreakingChange ************',
            );
            try {
                await strapi.db.query('api::klub-don.klub-don').updateMany({
                    where: {
                        emailSent: null,
                    },
                    data: {
                        emailSent: true,
                    },
                });
            } catch (err: any) {
                console.log(
                    'CRON: Erreur lors de la mise à jour des status emailSent de dons (Breaking change).',
                    err,
                );
            }
            console.log(
                '************ CRON END: updateDonEmailSentBreakingChange ************',
            );
        },
        // Start 10 seconds after server start
        options: new Date(Date.now() + 5000),
    },
    // updateProfileOptin: {
    //   task: async ({strapi}) => {
    //     console.log('************ CRON: updateProfileOptin ************');
    //     try {
    //       await strapi.db.query("api::klubr-membre.klubr-membre").updateMany({
    //         where: {
    //           optin_mail_don_project: null,
    //           optin_mail_don_klub_project: null,
    //           optin_mail_don_klub: null,
    //         },
    //         data: {
    //           optin_mail_don_project: true,
    //           optin_mail_don_klub_project: true,
    //           optin_mail_don_klub: true,
    //         },
    //       });
    //     } catch (err) {
    //       console.log('CRON: Erreur lors de la mise à jour des profiles (Optin).', err);
    //     }
    //     console.log('************ CRON END: updateProfileOptin ************');
    //   },
    //   // Start 10 seconds after server start
    //   options: new Date(Date.now() + 21000),
    // },
    // updateProjectTmpl: {
    //   task: async ({strapi}) => {
    //     console.log('************ CRON: updateProjectTmpl ************');
    //     try {
    //       await strapi.db.query("api::klub-projet.klub-projet").updateMany({
    //         where: {
    //           isTemplate: null,
    //           isFromTemplate: null,
    //         },
    //         data: {
    //           isTemplate: false,
    //           isFromTemplate: false,
    //         },
    //       });
    //     } catch (err) {
    //       console.log('CRON: Erreur lors de la mise à jour des projets.', err);
    //     }
    //     console.log('************ CRON END: updateProjectTmpl ************');
    //   },
    //   // Start 10 seconds after server start
    //   options: new Date(Date.now() + 22000),
    // },,
    // wepPush: {
    //   task: async ({ strapi }) => {
    //     console.log('************ CRON: webPush ************');
    //     try {
    //       // https://github.com/web-push-libs/web-push
    //       const webpush = require('web-push');
    //
    //       // Generate VAPID keys (do it only once!)
    //       // console.log('webpush', webpush.generateVAPIDKeys());
    //       const privateKey = '2jOB2aJs6qFTrYwqdreyFHGK9_0E2UrsvGFVi7Tznbg';
    //       const publicKey = 'BF-U2dqDYi-tXNQ5rJ-ewiebSS72Z4AOoL8b1YMGC291x3gWvQiZ8njwDslQ-9Gt_IWOCLg3pvyhOG-yzUvTah0';
    //
    //       // Set VAPID keys
    //       webpush.setVapidDetails('mailto:hello@localhost', publicKey, privateKey);
    //       const sub = {
    //         "endpoint": "https://fcm.googleapis.com/fcm/send/cswTl6g8SDY:APA91bHJQDCjOOSejpYMH-8vpAqmCWV-WVKJGY8H7Zi_5_IaBwsqZDo_lDLa35hAjnVJQ6GQCKN7T6TTgMoUDG39f8C2TClFdK9qXbPRdifIGxBDHeBkU0xFfMZ6SSbuY4-CuO--R3St",
    //         "expirationTime": null,
    //         "keys": {
    //           "p256dh": "BM51p974LuvpjbPuxksT-kTInSsAl9i5nvl1yRGrrhmiEaUzS3-7QaK5PnXIgJ2zkq30xRD9LzMnOZinpHdD0Ks",
    //           "auth": "x4zKkBQv59w7MVrmxgvVwQ"
    //         }
    //       };
    //
    //       const payload = {
    //         notification: {
    //           actions: [
    //             {
    //               action: 'myAction',
    //               title: 'My action',
    //             },
    //           ],
    //           // badge: 'https://www.gstatic.com',
    //           // body: 'Push test body',
    //           data: {
    //             url: 'https://www.gstatic.com',
    //             message: 'Don recu de 1000€!',
    //           },
    //           // dir: 'ltr',
    //           icon: 'https://ik.imagekit.io/klubr/Misc/k-dot.svg?updatedAt=1737300694696',
    //           image: 'https://ik.imagekit.io/klubr/Klubs/klubr/House/klubr_house_4fcfc9ae00_gWA-E4Sze.jpg?updatedAt=1728046625329',
    //           lang: 'fr',
    //           // renotify: true,
    //           requireInteraction: true,
    //           // silent: false,
    //           // tag: 'push-test',
    //           // timestamp: Date.now(),
    //           title: 'Push Test Klubr.',
    //           vibrate: [100, 50, 100],
    //         }
    //       };
    //       console.log('payload', payload);
    //       console.log('sub', sub);
    //       webpush.sendNotification(sub, JSON.stringify(payload));
    //       // webpush.sendNotification(sub, 'XXXXXXXXXXXXXX xXXXXX');
    //
    //     } catch (err) {
    //       console.log('CRON: Erreur lors de la génération des keys webpush', err);
    //     }
    //     console.log('************ CRON END: webPush ************');
    //   },
    //   // Start 10 seconds after server start
    //   options: new Date(Date.now() + 5000),
    // }
    cleanAllKlubDons: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];
            console.log(
                '************ CRON: cleanAllKlubDons ************',
                formattedDate,
            );
            try {
                await strapi.services['api::klub-don.klub-don'].cleanAll();
            } catch (err: any) {
                console.log(
                    'CRON: Erreur lors de la mise à jour des klub dons.',
                    err,
                );
            }
            console.log('************ CRON END: cleanAllKlubDons ************');
        },
        options: {
            rule: '0 * * * *',
        },
    },
    syncStripeAccounts: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString();
            console.log(
                '************ CRON: syncStripeAccounts ************',
                formattedDate,
            );
            try {
                const syncTask = require('../src/cron/sync-stripe-accounts');
                await syncTask.default({ strapi });
            } catch (err: any) {
                console.log(
                    'CRON: Erreur lors de la synchronisation des comptes Stripe.',
                    err,
                );
            }
            console.log('************ CRON END: syncStripeAccounts ************');
        },
        // options: Every day at 2am
        options: {
            rule: '0 0 2 * * *',
        },
    },
    relaunchPendingDonations: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            try {
                await strapi.services[
                    'api::klub-don.klub-don'
                ].relaunchPendingDonations();
            } catch (err: any) {
                console.log('CRON: Erreur lors de la relance des dons.', err);
            }
        },
        options: {
            rule: '*/10 * * * *', // EVERY 10 minutes
        },
    },
    relaunchClubCreation: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            try {
                await strapi.services[
                    'api::klubr-membre.klubr-membre'
                ].relaunchOrphanMembers();
            } catch (err: any) {
                console.log(
                    'CRON: Erreur lors de la relance des dirigents.',
                    err,
                );
            }
        },
        options: {
            rule: '0 12 * * *', // Each day at noon (12pm)
        },
    },
    /* DATA ANONYMIZATION */
    anonymizeData: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            const dataAnonymization = process.env.ENVIRONMENT !== 'production';
            console.log(
                '************ CRON: anonymizeData ************',
                dataAnonymization,
            );

            if (dataAnonymization) {
                const emailListByPass = [
                    'quentinleclerc@live.fr',
                    'karim@donaction.fr',
                    'k.zgoulli@gmail.com',
                    'dev@nakaa.fr',
                    'hamach78@gmail.com',
                    'med@nakaa.fr',
                    'iheb.samti1@gmail.com',
                    'iheb.samti@gmail.com',
                    'maxence.lombard@email.com',
                    'aniskhalfaouiisi@gmail.com',
                    'qleclerc@libero-avocats.fr',
                ];
                try {
                    await strapi.services[
                        'api::klubr-membre.klubr-membre'
                    ].anonymizeData(emailListByPass);
                    await strapi.services[
                        'api::klubr-membre.klubr-membre'
                    ].anonymizeUsersData(emailListByPass);
                    await strapi.services[
                        'api::klubr-donateur.klubr-donateur'
                    ].anonymizeData(emailListByPass);
                } catch (err: any) {
                    console.log(
                        "CRON: Erreur lors de l'anonymisation des données de membres.",
                        err,
                    );
                }
            }
        },
        options: {
            rule: new Date(Date.now() + 10000),
        },
    },
};
