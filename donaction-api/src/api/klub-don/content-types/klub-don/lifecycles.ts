// const {
//     GenerateCertificate,
// } = require("../../../../helpers/klubr-pdf/generateCertificate");
// const {
//     GenerateInvoice,
// } = require("../../../../helpers/klubr-pdf/generateInvoice");
import { KlubDonEntity, KlubrMemberEntity, LifecycleEvent, } from '../../../../_types';
import GenerateInvoice from '../../../../helpers/klubrPDF/generateInvoice';
import GenerateCertificate from '../../../../helpers/klubrPDF/generateCertificate';
import { v4 as uuidv4 } from 'uuid';

export default {
    async beforeCreate(event: LifecycleEvent<any>) {
        const { data } = event.params;
        if (!data.uuid) {
            data.uuid = uuidv4();
        }
    },

    async afterCreate(event: LifecycleEvent<KlubDonEntity>) {
        const { result } = event;
        // Get user context within lifecycle hook
        // const ctx = strapi.requestContext.get();
        // const userId = ctx.state.user?.id;
        await handleProjetMontantUpdate(result);
        await handleEmail(result);
    },
    async afterUpdate(
        event: LifecycleEvent<KlubDonEntity & { fromAfterUpdate?: boolean }>,
    ) {
        let { result, params } = event;

        if (!result?.emailSent && !params?.data?.fromAfterUpdate) {
            if (
                result?.statusPaiment === 'success' &&
                result?.attestationNumber &&
                (!result?.attestationPath || !result?.recuPath)
            ) {
                result = (await generateUserPdfs(result)) || result;
            }
            if (result.montantAjouteAuMontantTotalDuProjet) {
                return;
            }
            await handleProjetMontantUpdate(result);
            await handleEmail(result);
        }
    },
    async beforeDelete(event: LifecycleEvent<KlubDonEntity>) {
        const { data, where, select, populate } = event.params;
        // TODO: CHECK THIS
        const entry: KlubDonEntity = await strapi.db
            .query('api::klub-don.klub-don')
            .findOne({
                where: { id: where.id },
                select: ['id', 'documentId', 'montant', 'statusPaiment'],
                populate: {
                    klub_projet: {
                        fields: [
                            'id',
                            'documentId',
                            'montantTotalDonations',
                            'nbDons',
                            'documentId',
                        ],
                    },
                },
            });
        const klubProjetId = entry?.klub_projet?.documentId;
        if (klubProjetId && entry.statusPaiment === 'success') {
            const montantTotalDonations =
                (entry?.klub_projet?.montantTotalDonations || 0) -
                entry.montant;
            const nbDons = (entry?.klub_projet?.nbDons || 0) - 1;
            await strapi.documents('api::klub-projet.klub-projet').update({
                documentId: klubProjetId,
                data: {
                    montantTotalDonations,
                    nbDons,
                },
            });
            console.log(
                `PROJET ${klubProjetId} mis à jour par le don ${entry.id} de ${entry.montant}€`,
            );
            console.log(
                `Nouvelles valeurs: ${nbDons} donateurs et ${montantTotalDonations}€`,
            );
        }
    },
};

const handleEmail = async (result: KlubDonEntity) => {
    if (result.statusPaiment === 'success') {
        let entryDon: KlubDonEntity;
        try {
            entryDon = await strapi
                .documents('api::klub-don.klub-don')
                .findOne({
                    documentId: result.documentId,
                    fields: [
                        'id',
                        'uuid',
                        'estOrganisme',
                        'montant',
                        'deductionFiscale',
                        'contributionAKlubr',
                        'statusPaiment',
                        'attestationPath',
                        'recuPath',
                        'isContributionDonation',
                    ],
                    populate: {
                        klub_projet: {
                            fields: [
                                'id',
                                'titre',
                                'slug',
                                'montantTotalDonations',
                                'nbDons',
                            ],
                            populate: {
                                klubr_membre: true,
                            },
                        },
                        klubDonateur: true,
                        klubr: {
                            populate: {
                                klubr_house: true,
                                logo: true,
                            },
                        },
                        klub_don_contribution: {
                            populate: {
                                klubDonateur: true,
                                klubr: {
                                    populate: {
                                        klubr_house: true,
                                        logo: true,
                                    },
                                },
                                klub_projet: {
                                    fields: [
                                        'id',
                                        'titre',
                                        'slug',
                                        'montantTotalDonations',
                                        'nbDons',
                                    ],
                                    populate: {
                                        klubr_membre: true,
                                    },
                                },
                            },
                        },
                        klub_don_payments: true,
                    },
                });
        } catch (e) {
            console.log(`Error getting entry don, ${e}`);
            return;
        }

        if (!entryDon?.klub_don_payments || entryDon?.isContributionDonation) {
            console.log(
                'EXIT - separator (not paid yet || isContributionDonation)',
                '----------------------*******************----------------------',
            );
            return;
        }
        // send email
        // console.log(
        //   "BEGIN - separator",
        //   "----------------------*******************----------------------"
        // );
        if (entryDon) {
            // *****************************************************************************
            // Get destination emails for KLUB MEMBER LEADER/NETWORK KLEADER & send email
            // *****************************************************************************
            try {
                const destinatairesTypes = [
                    'KlubMemberLeader',
                    // , 'NetworkLeader'
                ];
                const klubLeadersAndNetworkLeaders = await strapi.services[
                    'api::klubr-membre.klubr-membre'
                ].getKlubMembres(entryDon.klubr.id, destinatairesTypes);

                console.log({ klubLeadersAndNetworkLeaders });

                const send = async (
                    list: Array<KlubrMemberEntity>,
                    entry: KlubDonEntity,
                ) => {
                    list.filter(
                        (membre: KlubrMemberEntity) =>
                            membre.users_permissions_user?.email,
                    )
                        .filter(
                            (membre: KlubrMemberEntity) =>
                                !!membre.optin_mail_don_klub_project ||
                                !!membre.optin_mail_don_klub,
                        )
                        .map(async (membre: KlubrMemberEntity) => {
                            // OPTIN MAIL DON KLUB PROJECT
                            if (
                                (!!entry.klub_projet &&
                                    membre.optin_mail_don_klub_project) ||
                                (!entry.klub_projet &&
                                    membre.optin_mail_don_klub)
                            ) {
                                const response = await strapi.services[
                                    'api::klub-don.klub-don'
                                ].sendDonsConfirmationEmailToKlubLeaders(
                                    entry,
                                    membre,
                                    membre?.users_permissions_user?.email,
                                    'klubLeader',
                                );
                                console.log(
                                    `Don Email [${entryDon.id}] - KLUB MEMBER LEADER > response (${membre.role})`,
                                    membre.prenom,
                                    membre?.users_permissions_user?.email,
                                    response?.envelope,
                                );
                            }
                        });
                };
                await send(klubLeadersAndNetworkLeaders, entryDon);
                if (entryDon.klub_don_contribution?.klubr.id) {
                    const klubLeadersAndNetworkLeadersContribution =
                        await strapi.services[
                            'api::klubr-membre.klubr-membre'
                        ].getKlubMembres(
                            entryDon.klub_don_contribution?.klubr.id,
                            destinatairesTypes,
                        );
                    await send(
                        klubLeadersAndNetworkLeadersContribution,
                        entryDon.klub_don_contribution,
                    );
                }
            } catch (e) {
                console.log(`Error getting klub leaders, ${e}`);
            }

            // *****************************************************************************
            // Get destination emails for PROJECT AUTHOR & send email
            // *****************************************************************************
            try {
                if (entryDon.klub_projet?.klubr_membre?.uuid) {
                    const projectAuthors: Array<KlubrMemberEntity> =
                        await strapi.services[
                            'api::klubr-membre.klubr-membre'
                        ].getKlubMembreWithEmail(
                            entryDon.klub_projet?.klubr_membre.uuid,
                        );
                    projectAuthors
                        .filter(
                            (membre) => membre.users_permissions_user?.email,
                        )
                        .filter((membre) => {
                            return !!membre.optin_mail_don_project;
                        })
                        .map(async (membre) => {
                            const response = await strapi.services[
                                'api::klub-don.klub-don'
                            ].sendDonsConfirmationEmailToKlubLeaders(
                                entryDon,
                                membre,
                                membre?.users_permissions_user?.email,
                                'projectAuthor',
                            );
                            console.log(
                                `Don Email [${entryDon.id}] - PROJECT AUTHOR > response (${membre.role})`,
                                membre.prenom,
                                membre?.users_permissions_user?.email,
                                response?.envelope,
                            );
                        });
                }
            } catch (e) {
                console.log(`Error getting project authors, ${e}`);
            }
            // *****************************************************************************
            // Get destination emails for CONTRIBUTION & send email
            // *****************************************************************************
            try {
                if (
                    entryDon?.klub_don_contribution?.klub_projet?.klubr_membre
                        ?.uuid
                ) {
                    const projectAuthors: Array<KlubrMemberEntity> =
                        await strapi.services[
                            'api::klubr-membre.klubr-membre'
                        ].getKlubMembreWithEmail(
                            entryDon?.klub_don_contribution?.klub_projet
                                ?.klubr_membre.uuid,
                        );
                    projectAuthors
                        .filter(
                            (membre) => membre.users_permissions_user?.email,
                        )
                        .filter((membre) => {
                            return !!membre.optin_mail_don_project;
                        })
                        .map(async (membre) => {
                            const response = await strapi.services[
                                'api::klub-don.klub-don'
                            ].sendDonsConfirmationEmailToKlubLeaders(
                                entryDon.klub_don_contribution,
                                membre,
                                membre?.users_permissions_user?.email,
                                'projectAuthor',
                            );
                            console.log(
                                `Don Email [${entryDon.klub_don_contribution.id}] - CONTRIBUTION > response (${membre.role})`,
                                membre.prenom,
                                membre?.users_permissions_user?.email,
                                response?.envelope,
                            );
                        });
                }
            } catch (e) {
                console.log(`Error getting project authors, ${e}`);
            }
            // *****************************************************************************
            // Get destination emails for ADMIN & send email
            // *****************************************************************************
            // console.log("separator", "----------------------");
            // const admins = await strapi.db
            //   .query("plugin::users-permissions.user")
            //   .findMany({
            //     where: {
            //       role: {
            //         name: "Admin",
            //       },
            //     },
            //     populate: {
            //       role: true,
            //     },
            //   });
            try {
                const admins = [
                    {
                        email: 'k.zgoulli@gmail.com',
                        prenom: 'Karim',
                        nom: 'Zgoulli (ADMIN DE KLUBR)',
                        role: { name: 'Admin' },
                    },
                ];
                admins
                    .filter((user) => user?.email)
                    .map(async (user) => {
                        const response = await strapi.services[
                            'api::klub-don.klub-don'
                        ].sendDonsConfirmationEmailToKlubLeaders(
                            entryDon,
                            user,
                            user?.email,
                            'admin',
                        );
                        console.log(
                            `Don Email [${entryDon.id}] - ADMINS > response (ADMIN)`,
                            user?.email,
                            response?.envelope,
                        );
                    });
            } catch (e) {
                console.log(`Error getting admins, ${e}`);
            }

            // *****************************************************************************
            // Send email to DONATEUR
            // *****************************************************************************
            try {
                const response2 =
                    await strapi.services[
                        'api::klub-don.klub-don'
                    ].sendDonsConfirmationEmail(entryDon);
                console.log(
                    `Don Email [${entryDon.id}] > response (DONATEUR)`,
                    entryDon?.klubDonateur?.email,
                    response2?.envelope,
                );
                await strapi.documents('api::klub-don.klub-don').update({
                    documentId: result.documentId,
                    data: {
                        emailSent: true,
                    },
                });
                if (entryDon.klub_don_contribution.id) {
                    console.log(
                        `Don Email [${entryDon.klub_don_contribution.id}] > response (DONATEUR)`,
                        entryDon?.klubDonateur?.email,
                        response2?.envelope,
                    );
                    await strapi.documents('api::klub-don.klub-don').update({
                        documentId: entryDon.klub_don_contribution.documentId,
                        data: {
                            emailSent: true,
                        },
                    });
                }
            } catch (e) {
                console.log(`Error sending email to donateur, ${e}`);
            }
        } else {
            console.log(`Don Email [${result.id}] > no entry don found`);
        }
        // console.log(
        //   "END separator",
        //   "----------------------*******************----------------------"
        // );
    }
};

const generateUserPdfs = async (result: KlubDonEntity) => {
    try {
        const don: KlubDonEntity = await strapi
            .documents('api::klub-don.klub-don')
            .findOne({
                documentId: result.documentId,
                populate: {
                    klubDonateur: true,
                    klubr: {
                        populate: {
                            logo: true,
                        },
                    },
                    klub_projet: true,
                    klub_don_contribution: {
                        populate: {
                            klubDonateur: true,
                            klubr: {
                                populate: {
                                    logo: true,
                                },
                            },
                            klub_projet: true,
                        },
                    },
                },
            });

        let data = {};
        if (!result?.recuPath && result.withTaxReduction) {
            const result = await GenerateInvoice(don);
            if (result['errors']) {
                return null;
            }
            data['recuPath'] = result['file'];
        }
        if (!result?.attestationPath) {
            const result = await GenerateCertificate(don);
            if (result['errors']) {
                return null;
            }
            data['attestationPath'] = result['file'];
        }

        if (Object.keys(data).length) {
            // if (result.klub_don_contribution) {}
            return await strapi.documents('api::klub-don.klub-don').update({
                documentId: result.documentId,
                data: {
                    ...data,
                    // @ts-ignore
                    fromAfterUpdate: true,
                },
            });
        }
    } catch (e) {
        console.log(`Error generating user pdfs, ${e}`);
    }
};

const handleProjetMontantUpdate = async (result: KlubDonEntity) => {
    if (result.montantAjouteAuMontantTotalDuProjet) {
        return;
    }
    // console.log(">> handleProjetMontantUpdate >>", result);

    const entryCount = await strapi
        .documents('api::klub-don.klub-don')
        .findOne({
            documentId: result.documentId,
            fields: [],
            populate: {
                klub_projet: {
                    count: true,
                },
            },
        });

    if (
        entryCount.klub_projet['count'] === 1 &&
        result.statusPaiment === 'success'
    ) {
        const entry: KlubDonEntity = await strapi
            .documents('api::klub-don.klub-don')
            .findOne({
                documentId: result.documentId,
                fields: [],
                populate: {
                    klub_projet: {
                        fields: ['id', 'montantTotalDonations', 'nbDons'],
                    },
                },
            });
        const klubProjetId = entry?.klub_projet?.documentId;
        // console.log(
        //   ">> handleProjetMontantUpdate >> klubProjetId",
        //   entry?.klub_projet
        // );
        if (klubProjetId) {
            const montantTotalDonations =
                (entry?.klub_projet?.montantTotalDonations || 0) +
                result.montant;
            const nbDons = (entry?.klub_projet?.nbDons || 0) + 1;
            // console.log(
            //   ">> handleProjetMontantUpdate >> montantTotalDonations",
            //   montantTotalDonations,
            //   nbDons
            // );
            await strapi.documents('api::klub-projet.klub-projet').update({
                documentId: klubProjetId,
                data: {
                    montantTotalDonations,
                    nbDons,
                },
            });
            // console.log(">> handleProjetMontantUpdate >> updated projet");
            await strapi.documents('api::klub-don.klub-don').update({
                documentId: result.documentId,
                data: {
                    montantAjouteAuMontantTotalDuProjet: true,
                    // @ts-ignore
                    fromAfterUpdate: true,
                },
            });
            console.log('>> handleProjetMontantUpdate >> updated don');
            console.log(
                `PROJET ${klubProjetId} mis à jour par le don ${result.id} de ${result.montant}€`,
            );
            console.log(
                `Nouvelles valeurs: ${nbDons} donateurs et ${montantTotalDonations}€`,
            );
        }
    }
};
