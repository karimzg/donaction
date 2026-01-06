/**
 * klubr service
 */

import { Core, factories } from '@strapi/strapi';
import {
    KlubrDocumentEntity,
    KlubrEntity,
    KlubrInfoEntity,
} from '../../../_types';
import {
    BREVO_TEMPLATES,
    sendBrevoTransacEmail,
} from '../../../helpers/emails/sendBrevoTransacEmail';
import {
    checkSvgAndTransform,
    MEDIAS_TRANSFORMATIONS,
} from '../../../helpers/medias';
import { slugify } from '../../../helpers/string';

export default factories.createCoreService(
    'api::klubr.klubr',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async sendInvitationEmail(
            email: string,
            host: { prenom: string; nom: string },
            club: KlubrEntity,
            code: string,
        ) {
            return await sendBrevoTransacEmail({
                subject: `${club?.denomination} vous invite à rejoindre Klubr!`,
                templateId: BREVO_TEMPLATES.MEMBER_INVITATION,
                to: [{ email: email }],
                params: {
                    MESSAGE: `${host.prenom} ${host.nom} vous invite à rejoindre le club ${club.denomination} sur donaction.fr`,
                    LOGO_CLUB: checkSvgAndTransform(club?.logo, [
                        MEDIAS_TRANSFORMATIONS.EMAIL_CLUB_LOGO,
                    ]),
                    ALT_LOGO_CLUB: club?.logo?.alternativeText,
                    INVITING_MEMBER_FULLNAME: `${host?.prenom} ${host?.nom}`,
                    INVITATION_URL: `${process.env.NEXTAUTH_URL}/s/${code}`,
                    CLUB_DENOMINATION: club?.denomination,
                },
                tags: [
                    'email-invitation-club',
                    ...(club?.slug ? [`${club.slug}`] : []),
                ],
            });
        },
        async setKlubrInfosRequiredFieldsCompletion(
            klubr: KlubrEntity,
            withoutUpdate = false,
        ) {
            const requiredFields = [
                'denomination',
                'federationLink',
                'legalStatus',
                'sportType',
                'acronyme',
                'siegeSocialAdresse',
                'siegeSocialCP',
                'siegeSocialVille',
                'siegeSocialPays',
                'associationType',
                'siegeSocialPays',
                'siegeSocialDepartement',
                'siegeSocialRegion',
            ];
            console.log('Klubr required fields:', requiredFields);
            console.log('Klubr ', klubr);
            const emptyFieldsCount = countEmptyFields(klubr, requiredFields);
            console.log(
                `Klubr empty fields count: ${emptyFieldsCount} / ${requiredFields.length}`,
            );
            const emptyFieldsPercentage = Math.round(
                (emptyFieldsCount / requiredFields.length) * 100,
            );
            console.log(
                `Klubr empty fields percentage: ${emptyFieldsPercentage}%`,
            );
            const requiredFieldsCompletion = 100 - emptyFieldsPercentage;
            console.log(
                `Klubr required fields completion: ${requiredFieldsCompletion}%`,
            );

            if (!withoutUpdate) {
                console.log(
                    'Updating klubr info with required fields completion...',
                );
                // TODO check array or not
                const klubrInfos: KlubrInfoEntity[] = await strapi.db
                    .query('api::klubr-info.klubr-info')
                    .update({
                        where: { klubr: klubr.id },
                        data: {
                            requiredFieldsCompletion,
                        },
                    });
                console.log('Klubr infos updated:', klubrInfos);
                return klubrInfos;
            } else {
                console.log(
                    'Returning required fields completion without update...',
                );
                return { requiredFieldsCompletion };
            }
        },
        async setKlubrInfosRequiredDocsCompletion(
            klubrId: number,
            klubrDocuments: KlubrDocumentEntity,
            withoutUpdate = false,
        ) {
            const requiredFields = [
                // 'justifDomicileDirigeant',
                'justifDesignationPresident',
                'statutsAssociation',
                'ribAssociation',
                'avisSituationSIRENE',
                'attestationAffiliationFederation',
            ];
            const docStatus = countDocs(klubrDocuments, requiredFields);
            if (!withoutUpdate) {
                return await strapi.db
                    .query('api::klubr-info.klubr-info')
                    .update({
                        where: { klubr: klubrId },
                        data: {
                            ...docStatus,
                        },
                    });
            } else {
                return docStatus;
            }
        },

        /**
         * Generate a unique slug for a klubr based on its denomination.
         * Tries base slug, then -2, -3 suffixes. Throws error after 3 collisions.
         */
        async getSlug(denomination: string): Promise<string> {
            const baseSlug = slugify(denomination);
            const MAX_ATTEMPTS = 3;

            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                const candidateSlug =
                    attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;

                const existing = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { slug: candidateSlug },
                    });

                if (!existing) {
                    return candidateSlug;
                }
            }

            throw new Error(
                `Impossible de générer un identifiant unique pour "${denomination}" après ${MAX_ATTEMPTS} tentatives. Une association avec la même dénomination existe peut-être déjà.`,
            );
        },
    }),
);

const countEmptyFields = (
    klubr: KlubrEntity,
    requiredFields: Array<string>,
) => {
    return requiredFields.reduce((count: number, field: string) => {
        if (
            klubr[field] === null ||
            klubr[field] === undefined ||
            klubr[field] === ''
        ) {
            return count + 1;
        }
        return count;
    }, 0);
};

const countDocs = (
    klubrDocs: KlubrDocumentEntity,
    requiredFields: Array<string>,
) => {
    const totalDocsRequired = requiredFields.length;
    const result = {
        requiredDocsValidatedCompletion: 0,
        requiredDocsWaitingValidationCompletion: 0,
        requiredDocsRefusedCompletion: 0,
    };
    requiredFields.forEach((field: string) => {
        if (
            klubrDocs[field] !== null &&
            klubrDocs[field] !== 'null' &&
            klubrDocs[field] !== undefined &&
            klubrDocs[field] !== ''
        ) {
            const status = klubrDocs[field + 'Valide'];
            if (status === true) {
                result.requiredDocsValidatedCompletion++;
            } else if (status === false) {
                result.requiredDocsRefusedCompletion++;
            } else {
                result.requiredDocsWaitingValidationCompletion++;
            }
        }
    });
    result.requiredDocsValidatedCompletion = Math.round(
        (result.requiredDocsValidatedCompletion / totalDocsRequired) * 100,
    );
    result.requiredDocsWaitingValidationCompletion = Math.round(
        (result.requiredDocsWaitingValidationCompletion / totalDocsRequired) *
            100,
    );
    result.requiredDocsRefusedCompletion = Math.round(
        (result.requiredDocsRefusedCompletion / totalDocsRequired) * 100,
    );
    return result;
};
