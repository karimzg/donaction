/**
 * klub-don service
 */

import { Core, factories } from '@strapi/strapi';
import { basename } from 'path';
import {
    KlubDonEntity,
    KlubDonPaymentEntity,
    KlubProjetEntity,
    KlubrEntity,
    UserEntity,
} from '../../../_types';
import {
    BREVO_TEMPLATES,
    sendBrevoTransacEmail,
} from '../../../helpers/emails/sendBrevoTransacEmail';
import {
    checkSvgAndTransform,
    MEDIAS_TRANSFORMATIONS,
} from '../../../helpers/medias';
import {
    TAUX_DEDUCTION_FISCALE_PART,
    TAUX_DEDUCTION_FISCALE_PRO,
} from '../../../constants';
import { Context } from 'koa';
import GetAttNumber from '../../../helpers/getAttNumber';
import type { Input } from 'normalize-package-data';
import sendEmail from '../../../helpers/emails/emailService';

export default factories.createCoreService(
    'api::klub-don.klub-don',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async sendDonsConfirmationEmail(don: KlubDonEntity) {
            const attachments = [];

            if (don?.attestationPath) {
                attachments.push({
                    filename: basename(don?.attestationPath),
                    path: don?.attestationPath,
                });
            }
            // TODO: si il y  a recu klubr
            if (don?.recuPath) {
                attachments.push({
                    filename: basename(don?.recuPath),
                    path: don?.recuPath,
                });
            }
            if (
                don?.klub_don_contribution?.id &&
                don?.klub_don_contribution?.recuPath
            ) {
                attachments.push({
                    filename: basename(don?.klub_don_contribution?.recuPath),
                    path: don?.klub_don_contribution?.recuPath,
                });
            }

            return await sendBrevoTransacEmail({
                from: { name: 'Klubr - Dons', email: 'dons@klubr.fr' },
                to: [{ email: don?.klubDonateur?.email }],
                templateId: BREVO_TEMPLATES.DONATION_DONOR_CONFIRMATION,
                params: {
                    RECEIVER_FULLNAME: `${don?.klubDonateur?.prenom || ''} ${
                        don?.klubDonateur?.nom || ''
                    }`,
                    CLUB_LOGO_URL: checkSvgAndTransform(don?.klubr?.logo, [
                        MEDIAS_TRANSFORMATIONS.EMAIL_CLUB_LOGO,
                    ]),
                    CLUB_LOGO_ALT: don?.klubr?.logo?.alternativeText,
                    CLUB_DENOMINATION: don?.klubr?.denomination,
                    TEXT_COLOR:
                        don?.klubr?.klubr_house?.primary_color?.slice(1),
                    PROJECT_TITLE: don?.klub_projet?.titre || '',
                    DONATION_AMOUNT: don?.montant,
                    DONATION_CONTRIBUTION: don?.contributionAKlubr || '',
                    DONATION_TOTAL:
                        don?.montant + (don?.contributionAKlubr || 0),
                },
                tags: [
                    'email-don-donateur',
                    ...(don?.klubr?.slug ? [`${don.klubr.slug}`] : []),
                ],
                attachments,
            });
        },
        async sendDonsConfirmationEmailToKlubLeaders(
            don: KlubDonEntity,
            membreOrAdminDestinataire: { prenom: string; nom: string },
            emailDestinataire: string,
            // destType: 'klubLeader' | 'projectAuthor' | 'admin' = 'klubLeader'
            destType = 'klubLeader',
        ) {
            const tagDestType =
                destType === 'klubLeader'
                    ? 'email-don-club-leader'
                    : destType === 'projectAuthor'
                      ? 'email-don-project-author'
                      : 'email-don-admin';
            const tags = don?.klub_projet?.slug
                ? [`${don.klub_projet.slug}`, tagDestType]
                : [tagDestType];
            if (don?.klubr?.slug) {
                tags.push(`${don.klubr.slug}`);
            }
            console.log(
                'sendDonsConfirmationEmailToKlubLeaders',
                don?.klub_projet?.klubr_membre,
            );
            return await sendBrevoTransacEmail({
                from: { name: 'Klubr - Dons', email: 'dons@klubr.fr' },
                to: [{ email: emailDestinataire }],
                templateId: BREVO_TEMPLATES.DONATION_ADMIN_NOTIFICATION,
                params: {
                    RECEIVER_FULLNAME: `${membreOrAdminDestinataire?.prenom || ''} ${
                        membreOrAdminDestinataire?.nom || ''
                    }`,
                    CLUB_DENOMINATION: don?.klubr?.denomination,
                    CLUB_LOGO_URL: checkSvgAndTransform(don?.klubr?.logo, [
                        MEDIAS_TRANSFORMATIONS.EMAIL_CLUB_LOGO,
                    ]),
                    CLUB_LOGO_ALT: don?.klubr?.logo?.alternativeText,
                    PROJECT_TITLE: don?.klub_projet?.titre,
                    DEST_TYPE: destType,
                    PROJECT_MEMBER_FULLNAME:
                        destType !== 'projectAuthor'
                            ? `${don?.klub_projet?.klubr_membre?.prenom} ${don?.klub_projet?.klubr_membre?.nom}`
                            : undefined,
                    PROJECT_MEMBER_ROLE:
                        destType !== 'projectAuthor'
                            ? don?.klub_projet?.klubr_membre?.fonction || ''
                            : undefined,
                    DONATION_AMOUNT: don?.montant,
                    DONATION_CONTRIBUTION: don?.contributionAKlubr || '',
                    DONATION_TOTAL:
                        destType === 'admin'
                            ? don?.montant + (don?.contributionAKlubr || 0)
                            : don?.montant,
                    DONOR_IMAGE_URL:
                        checkSvgAndTransform(don?.klubDonateur?.logo, [
                            MEDIAS_TRANSFORMATIONS.AVATAR,
                        ]) ||
                        checkSvgAndTransform(don?.klubDonateur?.avatar, [
                            MEDIAS_TRANSFORMATIONS.AVATAR,
                        ]),
                    DONOR_IMAGE_ALT:
                        don?.klubDonateur?.logo?.alternativeText ||
                        don?.klubDonateur?.avatar?.alternativeText,
                    DONOR_FULLNAME:
                        don?.klubDonateur?.raisonSocial ||
                        `${don?.klubDonateur?.prenom} ${don?.klubDonateur?.nom}`,
                    DONOR_ADDRESS: don?.klubDonateur?.adresse
                        ? `${don?.klubDonateur?.adresse} ${don?.klubDonateur?.adresse2}`
                        : '',
                    DONOR_ADDRESS_2: don?.klubDonateur?.adresse
                        ? `${don?.klubDonateur?.ville}, ${don?.klubDonateur?.cp}, ${don?.klubDonateur?.pays}`
                        : '',
                    DONOR_TEL: don?.klubDonateur?.tel || '',
                    DONOR_EMAIL: don?.klubDonateur?.email,
                },
                tags,
            });
        },
        updateBodyWithDeductionFiscale(
            body: { data: Partial<KlubDonEntity> },
            don: KlubDonEntity,
        ) {
            const montant = body?.data?.montant || don?.montant;
            // console.log('updateBodyWithDeductionFiscale 1', montant);
            const estOrganisme = body?.data?.estOrganisme || don?.estOrganisme;
            const withTaxReduction =
                body?.data?.withTaxReduction || don?.withTaxReduction;
            // console.log('updateBodyWithDeductionFiscale 2', estOrganisme);
            // console.log('updateBodyWithDeductionFiscale 2B', body?.data);
            if (
                body?.data?.montant ||
                (body?.data?.estOrganisme !== undefined &&
                    body?.data?.estOrganisme !== null)
            ) {
                const deductionFiscale =
                    montant *
                    (estOrganisme
                        ? TAUX_DEDUCTION_FISCALE_PRO
                        : TAUX_DEDUCTION_FISCALE_PART);
                // console.log('updateBodyWithDeductionFiscale 3', deductionFiscale);
                body = {
                    ...body,
                    data: {
                        ...body.data,
                        deductionFiscale: withTaxReduction
                            ? deductionFiscale
                            : 0,
                    },
                };
                // console.log('updateBodyWithDeductionFiscale 4', body.data.deductionFiscale);
            }
            console.log({ body, don, withTaxReduction });
            return body;
        },
        async createContributionForDon(
            entityWithUUID: KlubDonEntity,
            ctx: Context,
        ) {
            const klubrDon: KlubDonEntity = await strapi.db
                .query('api::klub-don.klub-don')
                .findOne({
                    where: { uuid: entityWithUUID.uuid },
                    populate: {
                        klub_don_contribution: true,
                        klubDonateur: {
                            populate: {
                                avatar: true,
                                logo: true,
                            },
                        },
                        klub_don_payments: true,
                    },
                });
            const klubrClubContribution: KlubrEntity = await strapi.db
                .query('api::klubr.klubr')
                .findOne({
                    where: { uuid: process.env.KLUBR_UUID },
                });

            const klubrProjectContribution: KlubProjetEntity = await strapi.db
                .query('api::klub-projet.klub-projet')
                .findOne({
                    where: { uuid: process.env.KLUBR_CONTRIBUTION_UUID },
                });

            const data = this.updateBodyWithDeductionFiscale(
                {
                    data: {
                        statusPaiment: 'success',
                        montant: klubrDon.contributionAKlubr,
                        estOrganisme: klubrDon.estOrganisme,
                        datePaiment: entityWithUUID.datePaiment,
                        // @ts-ignore // TODO: CHECK
                        klubr: klubrClubContribution.id,
                        // @ts-ignore // TODO: CHECK
                        klub_projet: klubrProjectContribution.id,
                        withTaxReduction: klubrDon.withTaxReduction,
                        attestationNumber: `${entityWithUUID?.attestationNumber}-CONTRIBUTION`,
                        isContributionDonation: true,
                    },
                },
                null,
            );
            const donContributionEntity = await strapi
                .documents('api::klub-don.klub-don')
                // @ts-ignore
                .create(data);

            const { id, uuid, createdAt, updatedAt, logo, ...rest } =
                klubrDon.klubDonateur;
            const { email } = klubrDon.klubDonateur;
            const userIdToLink: UserEntity = await strapi
                .service('api::klubr-donateur.klubr-donateur')
                .getUserToLinkDonateur(ctx, email);
            if (userIdToLink) {
                rest.users_permissions_user = userIdToLink;
            }
            const donateurContributionEntity = await strapi
                .documents('api::klubr-donateur.klubr-donateur')
                .create({
                    // @ts-ignore
                    data: {
                        ...rest,
                        logo: logo?.id,
                        klubDon: donContributionEntity.id,
                    },
                });
            const payment = klubrDon?.klub_don_payments?.find(
                (_) => _?.status === 'succeeded',
            );
            if (payment) {
                await strapi
                    .documents('api::klub-don-payment.klub-don-payment')
                    .create({
                        data: {
                            klub_don: donContributionEntity.id,
                            amount: payment.amount,
                            client_secret: payment.client_secret,
                            currency: payment.currency,
                            payment_method: payment.payment_method,
                            intent_id: payment.intent_id,
                            created: payment.created,
                            error_code: payment.error_code,
                            status: payment.status,
                        },
                    });
            }

            return await strapi.documents('api::klub-don.klub-don').update({
                documentId: donContributionEntity.documentId,
                data: {
                    klubDonateur: donateurContributionEntity.id,
                },
            });
        },
        async cleanAll() {
            try {
                const entries: Array<KlubDonEntity> = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findMany({
                        where: {
                            statusPaiment: { $ne: 'success' },
                        },
                        populate: {
                            klub_don_payments: true,
                            klub_don_contribution: true,
                            klubDonateur: {
                                populate: {
                                    avatar: true,
                                    logo: true,
                                },
                            },
                            klub_projet: true,
                            klubr: true,
                        },
                    });
                let index = 0;
                const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
                while (index < entries.length) {
                    const payment = entries[index]?.klub_don_payments?.find(
                        (_) => _?.status === 'succeeded',
                    );
                    if (
                        payment?.updatedAt &&
                        new Date(payment.updatedAt) < threeMinutesAgo
                    ) {
                        await this.cleanIndividual(entries[index]);
                    }
                    index++;
                }
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        },
        async cleanIndividual(
            populatedDonation: KlubDonEntity,
            forceRandom?: Input,
        ) {
            const payment = populatedDonation?.klub_don_payments?.find(
                (_) => _?.status === 'succeeded',
            );
            if (populatedDonation?.klub_don_payments && payment) {
                let data: Input = {
                    statusPaiment: 'success',
                    datePaiment: new Date(payment.createdAt),
                    attestationNumber: populatedDonation?.attestationNumber,
                };

                if (!populatedDonation?.attestationNumber) {
                    const attestationNumber =
                        await GetAttNumber.i().generate(!!forceRandom);
                    data = {
                        ...data,
                        attestationNumber,
                    };
                }

                if (forceRandom) {
                    await this.sendCleanErrorEmail(
                        populatedDonation,
                        forceRandom?.attestationNumber,
                    );
                }

                try {
                    const result: KlubDonEntity = await strapi
                        .documents('api::klub-don.klub-don')
                        .update({
                            documentId: populatedDonation.documentId,
                            data,
                        });

                    if (
                        result.statusPaiment === 'success' &&
                        result.datePaiment &&
                        !result.klub_don_contribution &&
                        result.contributionAKlubr > 0
                    ) {
                        const contributionEntity =
                            await this.createContributionForDon(
                                {
                                    ...populatedDonation,
                                    datePaiment: result.datePaiment,
                                    attestationNumber: result.attestationNumber,
                                },
                                null,
                            );
                        const res = await strapi
                            .documents('api::klub-don.klub-don')
                            .update({
                                documentId: populatedDonation.documentId,
                                data: {
                                    klub_don_contribution:
                                        contributionEntity.id,
                                },
                            });
                        GetAttNumber.unlock();
                        return res;
                    }
                    GetAttNumber.unlock();
                    return result;
                } catch (e) {
                    if (!forceRandom) {
                        return await this.cleanIndividual(
                            populatedDonation,
                            data,
                        );
                    }
                    GetAttNumber.unlock();
                    return false;
                }
            }
            return true;
        },
        async sendCleanErrorEmail(
            populatedDon: KlubDonEntity,
            generatedAttNumber?: string,
        ) {
            const subject = `Erreur clean don ${populatedDon.uuid}`;
            const tags = [''];

            let html =
                '<h3>Erreur clean don ' + populatedDon.uuid + ' :</h3> <br/>';
            if (populatedDon.klub_don_payments.length) {
                html += '<h4>Payments :</h4>';
                html += '<ul>';
                populatedDon.klub_don_payments.forEach((payment) => {
                    html += `<li>Numéro d'attestation: ${populatedDon.attestationNumber}</li>`;
                    html += `<li>Numéro d'attestation échoué: ${generatedAttNumber}</li>`;
                    html += `<li>Status: ${payment.status}</li>`;
                    html += `<li>Montant: ${Number(payment.amount) / 100}</li>`;
                    html += `<li>Devise: ${payment.currency}</li>`;
                    html += `<li>Méthode de paiment: ${payment.payment_method}</li>`;
                    html += `<li>Intent_id: ${payment.intent_id}</li>`;
                    html += `<li>***************************</li>`;
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
                {
                    email: 'hamach78@gmail.com',
                    prenom: 'Med',
                    nom: 'Chouiref (DEV)',
                    role: { name: 'Admin' },
                },
            ];
            admins
                .filter((user) => user?.email)
                .map(async (user) => {
                    // TODO: COMPLETE
                    await sendEmail({
                        to: user.email,
                        from: 'hello@klubr.fr',
                        html,
                        subject,
                        tags,
                    });
                });
        },
        // async createInvoice(don) {
        //   return await strapi.services['api::invoice.invoice'].createInvoiceFromDon(don);
        // },
        async relaunchPendingDonations() {
            try {
                const entries: Array<KlubDonEntity> = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findMany({
                        where: {
                            statusPaiment: { $ne: 'success' },
                            updatedAt: {
                                $lt: new Date(Date.now() - 10 * 60 * 1000),
                            },
                            hasBeenRelaunched: false,
                            relaunchCode: { $notNull: true },
                        },
                        populate: {
                            klub_don_payments: true,
                            klubDonateur: true,
                            klub_projet: true,
                            klubr: true,
                        },
                    });
                let index = 0;
                while (index < entries.length) {
                    const entry = entries[index];
                    const payment: KlubDonPaymentEntity =
                        entry?.klub_don_payments?.find(
                            (_) => _?.status === 'succeeded',
                        );
                    if (!payment) {
                        const relaunchCode = Math.floor(
                            1000 + Math.random() * 9000,
                        );
                        const link = `${process.env.NEXTAUTH_URL}/${entry?.klubr?.slug}${
                            entry?.klub_projet
                                ? '/nos-projets/' + entry?.klub_projet?.slug
                                : ''
                        }?PAYEMENT_FORM=true&DON_UUID=${entry?.uuid}&RELAUNCH_CODE=${
                            entry?.relaunchCode || relaunchCode
                        }`;
                        await sendBrevoTransacEmail({
                            to: [{ email: entry?.klubDonateur?.email }],
                            templateId: BREVO_TEMPLATES.DONATION_DONOR_RELAUNCH,
                            params: {
                                RECEIVER_FULLNAME: `${entry?.klubDonateur?.prenom} ${entry?.klubDonateur?.nom}`,
                                RELAUNCH_LINK: link,
                            },
                            tags: ['email-relaunch-donateur'],
                        });
                        await strapi
                            .documents('api::klub-don.klub-don')
                            .update({
                                documentId: entry.documentId,
                                data: {
                                    hasBeenRelaunched: true,
                                    relaunchCode:
                                        entry?.relaunchCode || relaunchCode,
                                },
                            });
                    }
                    index++;
                }
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        },
    }),
);
