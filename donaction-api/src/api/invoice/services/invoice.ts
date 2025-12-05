/**
 * invoice service
 */

import { factories } from '@strapi/strapi';
import { basename } from 'path';
import fs from 'fs';
import {
    InvoiceEntity,
    InvoiceLineEntity,
    KlubDonEntity,
    KlubrEntity,
    KlubrMemberEntity,
} from '../../../_types';
import {
    BREVO_TEMPLATES,
    sendBrevoTransacEmail,
} from '../../../helpers/emails/sendBrevoTransacEmail';
import GenerateClubInvoice from '../../../helpers/klubrPDF/generateClubInvoice';
import sendEmail from '../../../helpers/emails/emailService';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export default factories.createCoreService(
    'api::invoice.invoice',
    ({ strapi }) => ({
        async createInvoices(
            clubUUid: string | null,
            month: string,
            year: string,
            generatePdf: boolean,
            sendInvoice: boolean,
        ) {
            console.log('createInvoices');
            // *****************************************************************************
            // GET KLUBRS
            // *****************************************************************************
            let klubrs: Array<KlubrEntity> = [];
            try {
                klubrs = await strapi.db.query('api::klubr.klubr').findMany({
                    where: {
                        trade_policy: { noBilling: false },
                        uuid: clubUUid ? { $eq: clubUUid } : { $notNull: true },
                    },
                    populate: {
                        trade_policy: true,
                    },
                });
                const msgArray = [];
                const msgErrorArray = [];
                const msgEmptyArray = [];

                let index = 0;
                while (index < klubrs.length) {
                    const klubr = klubrs[index];
                    console.log(
                        'Generating invoice for klubr',
                        klubr.denomination,
                    );
                    const result = await this.createInvoiceForKlub(
                        klubr,
                        month,
                        year,
                    );
                    if (result?.empty) {
                        msgEmptyArray.push(
                            `Pas de dons pour ${klubr.denomination}`,
                        );
                        console.log('Finished EMPTY', klubr.denomination);
                    } else if (result?.error) {
                        msgErrorArray.push(
                            `Erreur pour ${klubr.denomination} (${result?.message})`,
                        );
                        console.log('Finished ERROR', klubr.denomination);
                    } else {
                        msgArray.push(
                            `Facture #${result?.invoice?.invoiceNumber} ${month}/${year} pour ${
                                klubr.denomination
                            } : Nb Dons au club: ${
                                result?.donations?.donsForKlub?.length
                            } | Nb Dons projects: ${
                                result?.donations?.donsForProjects?.length
                            } | Commission Klubr: ${currencyFormatter.format(
                                result?.commissionTotalAmount || 0,
                            )} | Montant total dons: ${currencyFormatter.format(
                                result?.creditTotalAmount || 0,
                            )}`,
                        );
                        console.log('Finished OK', klubr.denomination);
                        // Generate invoice PDF
                        if (generatePdf) {
                            const { errors, path, data } =
                                await this.generateInvoicePDF(
                                    result?.invoice?.uuid,
                                );
                            if (sendInvoice && path && data) {
                                // Send email with invoice to klubr leader
                                await this.sendInvoiceToKlubMemberLeader(
                                    path,
                                    data,
                                );
                            }

                            if (errors) {
                                msgErrorArray.push(
                                    `Erreur pour ${klubr.denomination} (${errors})`,
                                );
                            }
                        }
                    }
                    index++;
                }
                const summary = {
                    period: `${month}/${year}`,
                    clubInvoices: msgArray,
                    clubInvoicesErrors: msgErrorArray,
                    clubInvoicesBypassed: msgEmptyArray,
                };
                // Send email with summary of invoices to admins
                await this.sendInvoicesSummary(summary);

                return summary;

                // GET INVOICE DETAILS
                // const invoice = await strapi.db.query("api::invoice.invoice").findOne({
                //   where: {uuid: '3c537bca-0064-48f8-b78b-70f198957606'},
                //   populate: {
                //     klubr: true,
                //     invoice_lines: true,
                //     klub_dons: {
                //       populate: {
                //         klubDonateur: true,
                //         klub_projet: true,
                //       }
                //     },
                //   }
                // });
                // console.log('invoice', invoice);
            } catch (error) {
                console.log('error', error);
            }
        },

        async createInvoiceForKlub(
            klubr: KlubrEntity,
            month: string,
            year: string,
        ) {
            // *****************************************************************************
            // SET TRADE POLICY
            // *****************************************************************************
            const tradePolicy = klubr?.trade_policy;
            if (!tradePolicy || tradePolicy.noBilling) {
                return {
                    error: true,
                    message: 'No Trade Policy for this klubr',
                    clubUuid: klubr.uuid,
                    club: klubr.denomination,
                    month,
                    year,
                };
            }
            const commissionPercentage = tradePolicy.commissionPercentage;
            let commissionTotalAmount = 0;
            let creditTotalAmount = 0;

            // Specific commission percentage for klub donation
            const klubDonHasSpecificCommissionPercentage =
                !!tradePolicy.klubDonationPercentage;
            let commissionKlubDonTotalAmount = 0;

            // Specific commission percentage for per donation
            const withPerDonationCommission = !!tradePolicy.perDonationCost;
            const perDonationCost = tradePolicy.perDonationCost;
            let nbDonationsForFixedCommission = 0;
            let sumPerDonationCost = 0;

            // *****************************************************************************
            // GET DONATIONS FOR THIS PERIOD
            // *****************************************************************************
            const allDonationToBeBilled = await this.getDonDuringPeriod(
                klubr.uuid,
                month,
                year,
            );
            if (
                !allDonationToBeBilled.donsForProjects.length &&
                !allDonationToBeBilled.donsForKlub.length
            ) {
                return {
                    error: false,
                    empty: true,
                    message: 'No donations found for this period',
                    clubUuid: klubr.uuid,
                    club: klubr.denomination,
                    month,
                    year,
                };
            }

            if (withPerDonationCommission) {
                nbDonationsForFixedCommission =
                    allDonationToBeBilled.donsForProjects.length;
                if (!klubDonHasSpecificCommissionPercentage) {
                    nbDonationsForFixedCommission +=
                        allDonationToBeBilled.donsForKlub.length;
                }
            }

            // *****************************************************************************
            // GET LAST INVOICE NUMBER
            // *****************************************************************************
            let lastInvoiceNumber;
            try {
                lastInvoiceNumber = await this.getLastInvoiceNumber();
            } catch (error) {
                console.log('error', error);
                return {
                    error: true,
                    message: 'Error while getting last invoice number',
                    clubUuid: klubr.uuid,
                    club: klubr.denomination,
                    month,
                    year,
                };
            }

            // *****************************************************************************
            // CREATE INVOICE
            // *****************************************************************************
            let invoice: InvoiceEntity;
            try {
                const billingDate = new Date(
                    Number(year),
                    Number(month) - 1,
                    1,
                );
                const billingPeriodMonthString = billingDate.toLocaleString(
                    'fr-FR',
                    {
                        month: 'long',
                    },
                );
                // create an invoice with last invoice number
                const data = {
                    invoiceNumber: lastInvoiceNumber,
                    dateInvoice: new Date(),
                    klubr: klubr.id,
                    billingPeriodSmall: `${year}/${month}`,
                    billingPeriod: billingPeriodMonthString + ' ' + year,
                };
                invoice = await strapi
                    .documents('api::invoice.invoice')
                    .create({
                        data,
                    });
            } catch (error) {
                console.log('error', error);
                return {
                    error: true,
                    message: 'Error while creating invoice' + lastInvoiceNumber,
                    clubUuid: klubr.uuid,
                    club: klubr.denomination,
                    month,
                    year,
                };
            }

            let lastInvoiceLineNumber = 0;
            // *****************************************************************************
            // ADD INVOICES CREDIT LINES FOR DONATIONS
            // *****************************************************************************
            try {
                // *****************************************************************************
                // ADD INVOICES CREDIT LINES FOR CLUB DONATIONS
                // *****************************************************************************
                if (allDonationToBeBilled.donsForKlub.length) {
                    let invoiceLine: InvoiceLineEntity;
                    try {
                        lastInvoiceLineNumber++;
                        const firstDayOfMonth = new Date(
                            Number(year),
                            Number(month),
                            1,
                        );
                        const lastDayOfPreviousMonth = new Date(
                            (firstDayOfMonth as any) - 1,
                        );
                        const invoiceLineData = {
                            invoice: invoice.id,
                            invoiceLineNumber:
                                lastInvoiceNumber +
                                '-' +
                                lastInvoiceLineNumber
                                    .toString()
                                    .padStart(3, '0'),
                            reference: `DONS CLUB`,
                            description: `Financement des activités d'intérêt général du Klub - ${month}/${year}`,
                            closingDate: lastDayOfPreviousMonth,
                            isCreditLine: true,
                        };
                        invoiceLine = await strapi
                            .documents('api::invoice-line.invoice-line')
                            .create({
                                // @ts-ignore
                                data: invoiceLineData,
                            });
                    } catch (error) {
                        console.log('error', error);
                        // TODO: rollback invoice creation ?
                        return {
                            error: true,
                            message: `Error while creating invoice line ${lastInvoiceLineNumber} for klub donations`,
                            clubUuid: klubr.uuid,
                            club: klubr.denomination,
                            month,
                            year,
                        };
                    }
                    // FOR EACH DONATION, UPDATE DONATION WITH INVOICE ID AND INVOICE LINE ID
                    let invoiceLineTotalAmount = 0;
                    let index = 0;
                    while (index < allDonationToBeBilled.donsForKlub.length) {
                        const donForKlub =
                            allDonationToBeBilled.donsForKlub[index];
                        if (klubDonHasSpecificCommissionPercentage) {
                            commissionKlubDonTotalAmount +=
                                (donForKlub.montant *
                                    tradePolicy.klubDonationPercentage) /
                                100;
                        } else {
                            commissionTotalAmount +=
                                (donForKlub.montant * commissionPercentage) /
                                100;
                        }
                        creditTotalAmount += donForKlub.montant;
                        invoiceLineTotalAmount += donForKlub.montant;

                        try {
                            await strapi.db
                                .query('api::klub-don.klub-don')
                                .update({
                                    where: { id: donForKlub.id },
                                    data: {
                                        invoice: invoice.id,
                                        invoice_line: invoiceLine.id,
                                        // param to prevent beforeUpdate lifecycle to be triggered
                                        fromBillingProcess: true,
                                    },
                                });
                        } catch (error) {
                            console.log('error', error);
                            // TODO: rollback invoice creation and invoice line creation ?
                            return {
                                error: true,
                                message: `Error while updating donation ${donForKlub.id}`,
                                clubUuid: klubr.uuid,
                                club: klubr.denomination,
                                month,
                                year,
                            };
                        }
                        index++;
                    }
                    // UPDATE INVOICE LINE TOTAL AMOUNT
                    try {
                        const invoiceLineData = {
                            amountExcludingTax: invoiceLineTotalAmount,
                            nbDonations:
                                allDonationToBeBilled.donsForKlub.length,
                        };
                        await strapi.db
                            .query('api::invoice-line.invoice-line')
                            .update({
                                where: { id: invoiceLine.id },
                                data: invoiceLineData,
                            });
                    } catch (e) {
                        console.log('error', e);
                        // TODO: rollback invoice creation, invoice line creation and donation update ?
                        return {
                            error: true,
                            message: `Error while updating invoice line ${invoiceLine.id} for klub donations`,
                            clubUuid: klubr.uuid,
                            club: klubr.denomination,
                            month,
                            year,
                        };
                    }
                }

                // *****************************************************************************
                // ADD INVOICES CREDIT LINES FOR PROJECT DONATIONS
                // *****************************************************************************
                if (allDonationToBeBilled.donsForProjects.length) {
                    const groupedDons =
                        allDonationToBeBilled.donsForProjects.reduce(
                            (acc, don) => {
                                const projectId = don.klub_projet.id;
                                if (!acc[projectId]) {
                                    acc[projectId] = [];
                                }
                                acc[projectId].push(don);
                                return acc;
                            },
                            {},
                        );
                    let invoiceLine: InvoiceLineEntity;
                    let projectIndex = 0;
                    while (projectIndex < Object.keys(groupedDons).length) {
                        const projectId =
                            Object.keys(groupedDons)[projectIndex];
                        const projectDons = groupedDons[projectId];
                        const project = projectDons[0].klub_projet;
                        try {
                            lastInvoiceLineNumber++;
                            const invoiceLineData = {
                                invoice: invoice.id,
                                invoiceLineNumber:
                                    lastInvoiceNumber +
                                    '-' +
                                    lastInvoiceLineNumber
                                        .toString()
                                        .padStart(3, '0'),
                                reference: `DONS PROJET`,
                                description: `${project.titre} - ${month}/${year}`,
                                closingDate:
                                    project.dateLimiteFinancementProjet,
                                isCreditLine: true,
                                klub_projet: project.id,
                            };
                            invoiceLine = await strapi
                                .documents('api::invoice-line.invoice-line')
                                .create({
                                    // @ts-ignore
                                    data: invoiceLineData,
                                });
                        } catch (error) {
                            console.log('error', error);
                            // TODO: rollback invoice creation ?
                            return {
                                error: true,
                                message: `Error while creating invoice line ${lastInvoiceLineNumber} for klub donations`,
                                clubUuid: klubr.uuid,
                                club: klubr.denomination,
                                month,
                                year,
                            };
                        }
                        // FOR EACH DONATION, UPDATE DONATION WITH INVOICE ID AND INVOICE LINE ID
                        let invoiceLineTotalAmount = 0;
                        let index = 0;
                        while (index < projectDons.length) {
                            const donForProject = projectDons[index];
                            commissionTotalAmount +=
                                (donForProject.montant * commissionPercentage) /
                                100;
                            creditTotalAmount += donForProject.montant;
                            invoiceLineTotalAmount += donForProject.montant;

                            try {
                                await strapi.db
                                    .query('api::klub-don.klub-don')
                                    .update({
                                        where: { id: donForProject.id },
                                        data: {
                                            invoice: invoice.id,
                                            invoice_line: invoiceLine.id,
                                            // param to prevent beforeUpdate lifecycle to be triggered
                                            fromBillingProcess: true,
                                        },
                                    });
                            } catch (error) {
                                console.log('error', error);
                                // TODO: rollback invoice creation and invoice line creation ?
                                return {
                                    error: true,
                                    message: `Error while updating donation ${donForProject.id}`,
                                    clubUuid: klubr.uuid,
                                    club: klubr.denomination,
                                    month,
                                    year,
                                };
                            }
                            index++;
                        }
                        // UPDATE INVOICE LINE TOTAL AMOUNT
                        try {
                            const invoiceLineData = {
                                amountExcludingTax: invoiceLineTotalAmount,
                                nbDonations: projectDons.length,
                            };
                            await strapi.db
                                .query('api::invoice-line.invoice-line')
                                .update({
                                    where: { id: invoiceLine.id },
                                    data: invoiceLineData,
                                });
                        } catch (e) {
                            console.log('error', e);
                            // TODO: rollback invoice creation, invoice line creation and donation update ?
                            return {
                                error: true,
                                message: `Error while updating invoice line ${invoiceLine.id} for klub donations`,
                                clubUuid: klubr.uuid,
                                club: klubr.denomination,
                                month,
                                year,
                            };
                        }
                        projectIndex++;
                    }
                }
            } catch (error) {
                console.log('error', error);
                return {
                    error: true,
                    message: 'Error while updating donations',
                    clubUuid: klubr.uuid,
                    club: klubr.denomination,
                    month,
                    year,
                };
            }

            // *****************************************************************************
            // ADD INVOICES DEBIT LINES FOR DONATIONS
            // *****************************************************************************
            try {
                // Specific commission percentage for klub donation
                if (commissionKlubDonTotalAmount > 0) {
                    lastInvoiceLineNumber++;
                    const invoiceLineData = {
                        invoice: invoice.id,
                        reference: tradePolicy.klubDonationReference,
                        description: tradePolicy.klubDonationDescription,
                        amountExcludingTax: commissionKlubDonTotalAmount,
                        invoiceLineNumber:
                            lastInvoiceNumber +
                            '-' +
                            lastInvoiceLineNumber.toString().padStart(3, '0'),
                    };
                    await strapi.db
                        .query('api::invoice-line.invoice-line')
                        .create({
                            data: invoiceLineData,
                        });
                }
                // Standard commission percentage for donations
                lastInvoiceLineNumber++;
                sumPerDonationCost =
                    nbDonationsForFixedCommission * perDonationCost;
                const invoiceLineData = {
                    invoice: invoice.id,
                    reference: tradePolicy.reference,
                    description: tradePolicy.billingDescription,
                    amountExcludingTax:
                        commissionTotalAmount + sumPerDonationCost,
                    invoiceLineNumber:
                        lastInvoiceNumber +
                        '-' +
                        lastInvoiceLineNumber.toString().padStart(3, '0'),
                };
                await strapi
                    .documents('api::invoice-line.invoice-line')
                    .create({
                        // @ts-ignore
                        data: invoiceLineData,
                    });
            } catch (error) {
                console.log('error', error);
                return {
                    error: true,
                    message: 'Error while creating invoice line',
                    clubUuid: klubr.uuid,
                    club: klubr.denomination,
                    month,
                    year,
                };
            }

            // *****************************************************************************
            // ADD OTHER DEBIT LINES (in case of other products sold by klubr)
            // *****************************************************************************

            // *****************************************************************************
            // UPDATE INVOICE TOTAL AMOUNT
            // *****************************************************************************
            try {
                const sumCommissions =
                    commissionTotalAmount +
                    commissionKlubDonTotalAmount +
                    sumPerDonationCost;
                const amountExcludingTax = sumCommissions - creditTotalAmount;
                const VAT = (sumCommissions * tradePolicy.VATPercentage) / 100;
                const amountIncludingTax = amountExcludingTax + VAT;
                const nbDonations =
                    allDonationToBeBilled.donsForKlub.length +
                    allDonationToBeBilled.donsForProjects.length;
                const averageBasket = nbDonations
                    ? creditTotalAmount / nbDonations
                    : 0;
                const commissionPercentage = tradePolicy
                    ? tradePolicy?.commissionPercentage
                    : undefined;
                await strapi.db.query('api::invoice.invoice').update({
                    where: { id: invoice.id },
                    data: {
                        amountExcludingTax,
                        VAT,
                        amountIncludingTax,
                        creditTotalAmount,
                        nbDonations,
                        averageBasket,
                        commissionPercentage,
                    },
                });
            } catch (error) {
                console.log('error', error);
                return {
                    error: true,
                    message: 'Error while updating invoice amounts',
                    clubUuid: klubr.uuid,
                    club: klubr.denomination,
                    month,
                    year,
                };
            }

            // *****************************************************************************
            // FORMAT RESULT
            // *****************************************************************************
            return {
                error: false,
                message: 'Invoice created',
                clubUuid: klubr.uuid,
                club: klubr.denomination,
                period: `${month}/${year}`,
                invoice,
                donations: allDonationToBeBilled,
                commissionTotalAmount,
                creditTotalAmount,
            };
        },

        async getDonDuringPeriod(
            clubUuid: string,
            month: string,
            year: string,
        ) {
            // *****************************************************************************
            // GET ALL CLUB DONATIONS FOR THIS PERIOD
            // *****************************************************************************
            let donsForKlub: Array<KlubDonEntity> = [];
            try {
                donsForKlub = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findMany({
                        where: {
                            klubr: {
                                uuid: {
                                    $eq: clubUuid,
                                },
                            },
                            statusPaiment: {
                                $eq: 'success',
                            },
                            datePaiment: {
                                $gte: new Date(
                                    Number(year),
                                    Number(month) - 1,
                                    1,
                                ),
                                $lt: new Date(Number(year), Number(month), 1),
                            },
                            klub_projet: {
                                $eq: null,
                            },
                            invoice: {
                                $eq: null,
                            },
                        },
                        // @ts-ignore
                        sort: [
                            {
                                datePaiment: 'desc',
                            },
                        ],
                        populate: {
                            klubDonateur: true,
                            klub_projet: {
                                fields: [
                                    'titre',
                                    'slug',
                                    'montantTotalDonations',
                                    'montantAFinancer',
                                ],
                            },
                            klubr: {
                                fields: ['denomination', 'slug'],
                            },
                        },
                    });
                console.log('donsForKlub', donsForKlub.length);
            } catch (error) {
                console.log('error', error);
            }
            // *****************************************************************************
            // GET ALL DONATIONS FOR PROJECTS ENDING DURING THIS PERIOD
            // *****************************************************************************
            let donsForProjects: Array<KlubDonEntity> = [];
            try {
                donsForProjects = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findMany({
                        where: {
                            klubr: {
                                uuid: {
                                    $eq: clubUuid,
                                },
                            },
                            statusPaiment: {
                                $eq: 'success',
                            },
                            klub_projet: {
                                dateLimiteFinancementProjet: {
                                    $gte: new Date(
                                        Number(year),
                                        Number(month) - 1,
                                        1,
                                    ),
                                    $lt: new Date(
                                        Number(year),
                                        Number(month),
                                        1,
                                    ),
                                },
                            },
                            invoice: {
                                $eq: null,
                            },
                        },
                        // @ts-ignore
                        sort: [
                            {
                                datePaiment: 'desc',
                            },
                        ],
                        populate: {
                            klubDonateur: true,
                            klub_projet: {
                                fields: [
                                    'titre',
                                    'slug',
                                    'montantTotalDonations',
                                    'montantAFinancer',
                                ],
                            },
                            klubr: {
                                fields: ['denomination', 'slug'],
                            },
                        },
                    });
            } catch (error) {
                console.log('error', error);
            }
            return { donsForKlub, donsForProjects };
        },

        async getLastInvoiceNumber(): Promise<string> {
            const entries: Array<InvoiceEntity> = await strapi.db
                .query('api::invoice.invoice')
                .findMany({
                    select: ['invoiceNumber', 'documentId'],
                    where: { invoiceNumber: { $notNull: true } },
                    limit: 1,
                    orderBy: { invoiceNumber: 'desc' },
                });
            const entry = entries[0];
            const month = new Date().getMonth() + 1;
            const monthStr = month < 10 ? `0${month}` : `${month}`;
            const prefix = `KLUBR-${new Date().getFullYear()}-${monthStr}`;
            const latestInvoiceNumber = entry ? entry.invoiceNumber : '';
            const latestInvoiceNumberLastPart =
                latestInvoiceNumber.split('-')[3];
            const nextInvoiceNumberLastPart =
                parseInt(latestInvoiceNumberLastPart) + 1;
            const nextInvoiceNumberLastPart5Digits = nextInvoiceNumberLastPart
                .toString()
                .padStart(5, '0');
            // Renumérotation des factures à chaque mois
            // return latestInvoiceNumber.startsWith(prefix)
            //   ? `${prefix}-${nextInvoiceNumberLastPart5Digits}`
            //   : `${prefix}-00001`;
            return `${prefix}-${nextInvoiceNumberLastPart5Digits}`;
        },

        async sendInvoicesSummary(summary: {
            period: string;
            clubInvoices: Array<string>;
            clubInvoicesErrors: Array<string>;
            clubInvoicesBypassed: Array<string>;
        }) {
            const subject = `Résumé des factures éditées pour la période ${summary.period}`;
            const tags = ['email-invoice-summary'];

            let html =
                '<h3>Résumé des factures éditées pour la période ' +
                summary.period +
                ' :</h3> <br/>';
            if (summary.clubInvoices.length) {
                html += '<h4>Factures éditées :</h4>';
                html += '<ul>';
                summary.clubInvoices.forEach((msg) => {
                    html += `<li>${msg}</li>`;
                });
                html += '</ul>';
            }
            if (summary.clubInvoicesErrors.length) {
                html += "<h4>Erreurs lors de l'édition des factures :</h4>";
                html += '<ul>';
                summary.clubInvoicesErrors.forEach((msg) => {
                    html += `<li>${msg}</li>`;
                });
                html += '</ul>';
            }
            if (summary.clubInvoicesBypassed.length) {
                html += '<h4>Factures non éditées :</h4>';
                html += '<ul>';
                summary.clubInvoicesBypassed.forEach((msg) => {
                    html += `<li>${msg}</li>`;
                });
                html += '</ul>';
            }

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
                    // TODO: CHECK
                    await sendEmail({
                        to: user.email,
                        from: 'hello@klubr.fr',
                        html,
                        subject,
                        tags,
                    });
                });
        },

        async sendInvoiceToKlubMemberLeader(path: string, data) {
            const result: Array<KlubrMemberEntity> = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findMany({
                    where: { klubr: { uuid: data?.klubr?.uuid } },
                    populate: ['klubr', 'users_permissions_user'],
                });
            if (!result) {
                return null;
            }
            const klubLeaders = result
                .filter(
                    (member) =>
                        member?.role === 'KlubMemberLeader' &&
                        !!member?.users_permissions_user?.email &&
                        !!member?.optin_mail_invoice,
                )
                .map((_) => ({
                    email: _?.users_permissions_user?.email,
                    fullName: `${_?.prenom} ${_?.nom}`,
                }));

            await this.updateInvoiceSentDate(data?.uuid);

            const attachments = [
                {
                    filename: basename(path),
                    path: path,
                },
            ];

            return await Promise.all(
                klubLeaders.map(async (member) => {
                    const resp = await sendBrevoTransacEmail({
                        from: { name: 'Klubr - Dons', email: 'dons@klubr.fr' },
                        to: [{ email: member.email }],
                        templateId: BREVO_TEMPLATES.CLUB_INVOICE,
                        params: {
                            NUMERIC_DATE: data?.billingPeriodSmall,
                            TEXT_DATE: data?.billingPeriod,
                            RECEIVER_FULLNAME: member?.fullName || '',
                        },
                        tags: [`email-invoice-${data?.billingPeriodSmall}`],
                        attachments,
                    });
                    return member;
                }),
            );
        },

        // TO be called by a CRON
        async generateAllMissingInvoicesPdf() {
            const entities: Array<InvoiceEntity> = await strapi.db
                .query('api::invoice.invoice')
                .findMany({
                    where: { invoicePdfPath: { $null: true } },
                    populate: {
                        klubr: true,
                        invoice_lines: {
                            populate: {
                                klub_dons: {
                                    populate: {
                                        klubDonateur: true,
                                    },
                                },
                            },
                        },
                    },
                });
            if (entities.length) {
                let index = 0;
                while (index < entities.length) {
                    const { path, data, errors } =
                        await this.generateInvoicePDF(null, entities[index]);
                    if (path && data) {
                        await this.sendInvoiceToKlubMemberLeader(path, data);
                    } else {
                        console.log(
                            `Error occured while generating pdf for ${entities[index]?.invoiceNumber}`,
                        );
                    }
                    index++;
                }
            }
        },
        //\\

        async generateInvoicePDF(
            uuid: string | null,
            fullPopulatedData?: InvoiceEntity,
        ) {
            try {
                let data = fullPopulatedData;
                if (!uuid && !fullPopulatedData)
                    return { error: `Missing uuid param` };
                if (!data) {
                    data = await strapi.db
                        .query('api::invoice.invoice')
                        .findOne({
                            where: { uuid },
                            populate: {
                                klubr: true,
                                invoice_lines: {
                                    populate: {
                                        klub_dons: {
                                            populate: {
                                                klubDonateur: true,
                                            },
                                        },
                                    },
                                },
                            },
                        });
                }
                if (!data) {
                    return { error: `Entity with uuid: ${uuid} is not found` };
                }
                if (
                    data?.invoicePdfPath &&
                    fs.existsSync(data?.invoicePdfPath)
                ) {
                    return { data, path: data?.invoicePdfPath };
                }
                const result = await GenerateClubInvoice(data);
                if (result['errors']) {
                    console.log(
                        `Errors while generating invoice pdf for ${data?.invoiceNumber}:`,
                        result,
                    );
                    return {
                        errors: result['errors'],
                        data,
                        path: data?.invoicePdfPath,
                    };
                }
                await strapi.documents('api::invoice.invoice').update({
                    documentId: data.documentId,
                    data: {
                        invoicePdfPath: result['file'],
                    },
                });
                return { data, path: result['file'] };
            } catch (e) {
                console.log({ ERROR: e });
                return { error: e };
            }
        },

        async updateInvoiceSentDate(uuid: string) {
            try {
                if (!uuid) {
                    throw new Error(`Missing uuid param`);
                }
                const data: InvoiceEntity = await strapi.db
                    .query('api::invoice.invoice')
                    .findOne({
                        where: { uuid },
                    });

                if (!data) {
                    throw new Error(`Entity with uuid: ${uuid} is not found`);
                }

                if (!data?.firstSentEmailDate) {
                    await strapi.documents('api::invoice.invoice').update({
                        documentId: data.documentId,
                        data: {
                            firstSentEmailDate: new Date(),
                        },
                    });
                    return true;
                }
                return false;
            } catch (e) {
                console.log(e);
                throw new Error(
                    e?.message ||
                        'Error occurred while updating invoiceSendDate',
                );
            }
        },
    }),
);
