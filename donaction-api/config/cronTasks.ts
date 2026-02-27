import { Core } from '@strapi/strapi';

export default {
    updateProjectStatus: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];

            console.log(
                '🔄 [CRON] updateProjectStatus - START',
                `\n   📅 Date: ${formattedDate}`,
            );

            try {
                const result = await strapi.db
                    .query('api::klub-projet.klub-projet')
                    .updateMany({
                        where: {
                            status: 'published',
                            dateLimiteFinancementProjet: {
                                $lt: formattedDate,
                            },
                        },
                        data: {
                            status: 'closed',
                        },
                    });

                console.log(
                    '✅ [CRON] updateProjectStatus - SUCCESS',
                    `\n   📊 Projets mis à jour: ${result?.count || 0}`,
                );
            } catch (err: any) {
                console.error(
                    '❌ [CRON] updateProjectStatus - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de la mise à jour des projets'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] updateProjectStatus - END\n');
        },
        // options: Every day at 1am (cron: seconds minutes hours dayOfMonth month dayOfWeek)
        options: {
            rule: '0 0 1 * * *',
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
            console.log('🔄 [CRON] updateDefaultTradePolicyForKlubs - START');

            try {
                const defaultTradePolicyId: any = await strapi
                    .service('api::trade-policy.trade-policy')
                    .getDefaultTradePolicy();

                if (!defaultTradePolicyId) {
                    console.log(
                        '⏭️  [CRON] updateDefaultTradePolicyForKlubs - SKIPPED',
                        '\n   ℹ️  Aucune politique commerciale par défaut trouvée',
                    );
                    return;
                }

                console.log(
                    `   📋 Politique par défaut: ${defaultTradePolicyId}`,
                );

                const klubsToUpdate: Array<any> = await strapi.db
                    .query('api::klubr.klubr')
                    .findMany({
                        where: {
                            trade_policy: null,
                        },
                    });

                if (klubsToUpdate.length === 0) {
                    console.log(
                        '⏭️  [CRON] updateDefaultTradePolicyForKlubs - SKIPPED',
                        '\n   ℹ️  Aucun klub sans politique commerciale',
                    );
                    return;
                }

                console.log(
                    `   📊 Klubs à mettre à jour: ${klubsToUpdate.length}`,
                );

                await Promise.all(
                    klubsToUpdate.map(async (klub) => {
                        await strapi.db.query('api::klubr.klubr').update({
                            where: { id: klub.id },
                            data: {
                                trade_policy: defaultTradePolicyId,
                            },
                        });
                    }),
                );

                console.log(
                    '✅ [CRON] updateDefaultTradePolicyForKlubs - SUCCESS',
                    `\n   📊 Klubs mis à jour: ${klubsToUpdate.length}`,
                );
            } catch (err: any) {
                console.error(
                    '❌ [CRON] updateDefaultTradePolicyForKlubs - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de la mise à jour des politiques commerciales'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] updateDefaultTradePolicyForKlubs - END\n');
        },
        options: new Date(Date.now() + 5000),
    },
    updateDefaultDocumentsAndInfosForKlubs: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log(
                '🔄 [CRON] updateDefaultDocumentsAndInfosForKlubs - START',
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

                if (klubsToUpdateInfo.length > 0) {
                    console.log(
                        `   📊 Klubs sans info: ${klubsToUpdateInfo.length}`,
                    );

                    await Promise.all(
                        klubsToUpdateInfo.map(async (klub) => {
                            /* CREATE klubr-infos */
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

                    console.log(
                        `   ✅ Infos créées: ${klubsToUpdateInfo.length}`,
                    );
                } else {
                    console.log('   ℹ️  Aucun klub sans information');
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

                if (klubsToUpdateDoc.length > 0) {
                    console.log(
                        `   📊 Klubs sans docs: ${klubsToUpdateDoc.length}`,
                    );

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

                    console.log(
                        `   ✅ Documents créés: ${klubsToUpdateDoc.length}`,
                    );
                } else {
                    console.log('   ℹ️  Aucun klub sans document');
                }

                console.log(
                    '✅ [CRON] updateDefaultDocumentsAndInfosForKlubs - SUCCESS',
                );
            } catch (err: any) {
                console.error(
                    '❌ [CRON] updateDefaultDocumentsAndInfosForKlubs - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de la mise à jour des documents et informations'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log(
                '🏁 [CRON] updateDefaultDocumentsAndInfosForKlubs - END\n',
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
                '🔄 [CRON] updateClubStatusBreakingChange - START',
                '\n   🔧 Migration de données - Breaking changes',
            );

            try {
                const updates = [];

                const valide = await strapi.db
                    .query('api::klubr.klubr')
                    .updateMany({
                        where: { status: 'valide' },
                        data: { status: 'published' },
                    });
                updates.push(`valide→published: ${valide?.count || 0}`);

                const supprime = await strapi.db
                    .query('api::klubr.klubr')
                    .updateMany({
                        where: { status: 'supprime' },
                        data: { status: 'deleted' },
                    });
                updates.push(`supprime→deleted: ${supprime?.count || 0}`);

                const creation = await strapi.db
                    .query('api::klubr.klubr')
                    .updateMany({
                        where: { status: 'creation' },
                        data: { status: 'draft' },
                    });
                updates.push(`creation→draft: ${creation?.count || 0}`);

                const donation = await strapi.db
                    .query('api::klubr.klubr')
                    .updateMany({
                        where: { donationEligible: null },
                        data: { donationEligible: false },
                    });
                updates.push(`donationEligible null→false: ${donation?.count || 0}`);

                console.log(
                    '✅ [CRON] updateClubStatusBreakingChange - SUCCESS',
                    `\n   📊 Migrations: ${updates.join(', ')}`,
                );
            } catch (err: any) {
                console.error(
                    '❌ [CRON] updateClubStatusBreakingChange - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de la migration des clubs'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] updateClubStatusBreakingChange - END\n');
        },
        // Start 10 seconds after server start
        options: new Date(Date.now() + 20000),
    },
    updateDonEmailSentBreakingChange: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log(
                '🔄 [CRON] updateDonEmailSentBreakingChange - START',
                '\n   🔧 Migration emailSent null→true',
            );

            try {
                const result = await strapi.db
                    .query('api::klub-don.klub-don')
                    .updateMany({
                        where: { emailSent: null },
                        data: { emailSent: true },
                    });

                console.log(
                    '✅ [CRON] updateDonEmailSentBreakingChange - SUCCESS',
                    `\n   📊 Dons mis à jour: ${result?.count || 0}`,
                );
            } catch (err: any) {
                console.error(
                    '❌ [CRON] updateDonEmailSentBreakingChange - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de la migration emailSent'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] updateDonEmailSentBreakingChange - END\n');
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
    //           icon: 'https://ik.imagekit.io/donaction/Misc/k-dot.svg?updatedAt=1737300694696',
    //           image: 'https://ik.imagekit.io/donaction/Klubs/klubr/House/klubr_house_4fcfc9ae00_gWA-E4Sze.jpg?updatedAt=1728046625329',
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
                '🔄 [CRON] cleanAllKlubDons - START',
                `\n   📅 Date: ${formattedDate}`,
            );

            try {
                await strapi.services['api::klub-don.klub-don'].cleanAll();
                console.log('✅ [CRON] cleanAllKlubDons - SUCCESS');
            } catch (err: any) {
                console.error(
                    '❌ [CRON] cleanAllKlubDons - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors du nettoyage des dons'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] cleanAllKlubDons - END\n');
        },
        // options: Every hour at minute 0 (cron: seconds minutes hours dayOfMonth month dayOfWeek)
        options: {
            rule: '0 0 * * * *',
        },
    },
    syncStripeAccounts: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            const env = process.env.NODE_ENV || 'development';
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString();

            // Production guard: Skip in non-production environments
            if (env !== 'production') {
                console.log(
                    '⏭️  [CRON] syncStripeAccounts - SKIPPED',
                    `\n   📅 Date: ${formattedDate}`,
                    `\n   🌍 Environment: ${env} (only runs in production)`,
                );
                return;
            }

            console.log(
                '🔄 [CRON] syncStripeAccounts - START',
                `\n   📅 Date: ${formattedDate}`,
                `\n   🌍 Environment: ${env}`,
            );

            try {
                const { default: syncTask } = await import('../src/cron/sync-stripe-accounts');
                await syncTask({ strapi });
                console.log('✅ [CRON] syncStripeAccounts - SUCCESS');
            } catch (err: any) {
                console.error(
                    '❌ [CRON] syncStripeAccounts - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de la synchronisation des comptes Stripe'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log(`🏁 [CRON] syncStripeAccounts - END\n`);
        },
        // options: Every day at 2am
        options: {
            rule: '0 0 2 * * *',
        },
    },
    relaunchPendingDonations: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log('🔄 [CRON] relaunchPendingDonations - START');

            try {
                await strapi.services[
                    'api::klub-don.klub-don'
                ].relaunchPendingDonations();
                console.log('✅ [CRON] relaunchPendingDonations - SUCCESS');
            } catch (err: any) {
                console.error(
                    '❌ [CRON] relaunchPendingDonations - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de la relance des dons'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] relaunchPendingDonations - END\n');
        },
        // options: Every 10 minutes (cron: seconds minutes hours dayOfMonth month dayOfWeek)
        options: {
            rule: '0 */10 * * * *',
        },
    },
    relaunchClubCreation: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log(
                '🔄 [CRON] relaunchClubCreation - START',
                '\n   📧 Relance des dirigeants orphelins',
            );

            try {
                await strapi.services[
                    'api::klubr-membre.klubr-membre'
                ].relaunchOrphanMembers();
                console.log('✅ [CRON] relaunchClubCreation - SUCCESS');
            } catch (err: any) {
                console.error(
                    '❌ [CRON] relaunchClubCreation - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de la relance des dirigeants'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] relaunchClubCreation - END\n');
        },
        // options: Each day at noon/12pm (cron: seconds minutes hours dayOfMonth month dayOfWeek)
        options: {
            rule: '0 0 12 * * *',
        },
    },
    /* IDEMPOTENCY KEY CLEANUP */
    cleanupStaleIdempotencyKeys: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            console.log('🔄 [CRON] cleanupStaleIdempotencyKeys - START');

            try {
                // Clean up idempotency keys older than 24 hours
                // Stripe's idempotency keys expire after 24h, so we can safely clean up older records
                const twentyFourHoursAgo = new Date(
                    Date.now() - 24 * 60 * 60 * 1000,
                );

                const result = await strapi.db
                    .query('api::klub-don-payment.klub-don-payment')
                    .updateMany({
                        where: {
                            idempotency_key: { $notNull: true },
                            createdAt: { $lt: twentyFourHoursAgo.toISOString() },
                        },
                        data: {
                            idempotency_key: null,
                        },
                    });

                console.log(
                    '✅ [CRON] cleanupStaleIdempotencyKeys - SUCCESS',
                    `\n   📊 Clés nettoyées: ${result?.count || 0}`,
                );
            } catch (err: any) {
                console.error(
                    '❌ [CRON] cleanupStaleIdempotencyKeys - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors du nettoyage des clés'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] cleanupStaleIdempotencyKeys - END\n');
        },
        // options: Every day at 3am (after Stripe sync)
        options: {
            rule: '0 0 3 * * *',
        },
    },
    /* DATA ANONYMIZATION */
    anonymizeData: {
        task: async ({ strapi }: { strapi: Core.Strapi }) => {
            const dataAnonymization = process.env.ENVIRONMENT !== 'production';
            const env = process.env.ENVIRONMENT || 'unknown';

            console.log(
                '🔄 [CRON] anonymizeData - START',
                `\n   🌍 Environment: ${env}`,
                `\n   🔒 Anonymisation: ${dataAnonymization ? 'ACTIVÉE' : 'DÉSACTIVÉE'}`,
            );

            if (!dataAnonymization) {
                console.log(
                    '⏭️  [CRON] anonymizeData - SKIPPED',
                    '\n   ℹ️  Anonymisation uniquement en non-production',
                );
                return;
            }

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

            console.log(
                `   📋 Emails protégés: ${emailListByPass.length} comptes`,
            );

            try {
                await strapi.services[
                    'api::klubr-membre.klubr-membre'
                ].anonymizeData(emailListByPass);
                console.log('   ✅ Membres anonymisés');

                await strapi.services[
                    'api::klubr-membre.klubr-membre'
                ].anonymizeUsersData(emailListByPass);
                console.log('   ✅ Utilisateurs anonymisés');

                await strapi.services[
                    'api::klubr-donateur.klubr-donateur'
                ].anonymizeData(emailListByPass);
                console.log('   ✅ Donateurs anonymisés');

                console.log('✅ [CRON] anonymizeData - SUCCESS');
            } catch (err: any) {
                console.error(
                    '❌ [CRON] anonymizeData - ERROR',
                    `\n   ⚠️  Message: ${err.message || 'Erreur lors de l\'anonymisation'}`,
                    `\n   📋 Stack: ${err.stack || 'Non disponible'}`,
                );
            }

            console.log('🏁 [CRON] anonymizeData - END\n');
        },
        options: {
            rule: new Date(Date.now() + 10000),
        },
    },
};
