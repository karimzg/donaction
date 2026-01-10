/**
 * klub-don controller
 */

import { Core, factories } from '@strapi/strapi';
import fs from 'fs';
import {
    KlubDonEntity,
    KlubProjetEntity,
    KlubrEntity,
    KlubrMemberEntity,
    PaginationEntity,
    UserEntity,
} from '../../../_types';
import { removeId } from '../../../helpers/sanitizeHelpers';
import { Context } from 'koa';
import { API_DEFAULT_PAGE_SIZE } from '../../../constants';
import createAssessment from '../../../helpers/gcc/createAssessment';
import GenerateCertificate from '../../../helpers/klubrPDF/generateCertificate';
import GenerateInvoice from '../../../helpers/klubrPDF/generateInvoice';
import getRecuNumberFromAtt from '../../../helpers/klubrPDF/funcs/getRecuNumberFromAtt';
import {
    BREVO_TEMPLATES,
    sendBrevoTransacEmail,
} from '../../../helpers/emails/sendBrevoTransacEmail';

export default factories.createCoreController(
    'api::klub-don.klub-don',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async findOne(): Promise<KlubDonEntity | Context> {
            const ctx = strapi.requestContext.get();
            const { id } = ctx.params;

            if (!id) {
                return ctx.badRequest('Missing klub uuid.');
            }
            ctx.query = { ...ctx.query, filters: { uuid: id } };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const {
                results,
                pagination,
            }: { results: Array<KlubDonEntity>; pagination: PaginationEntity } =
                await strapi
                    .service('api::klub-don.klub-don')
                    .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound('Don not found');
            }

            const entity = results[0];
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
            // return this.transformResponse(sanitizedEntity, { });
        },

        async find() {
            const ctx = strapi.requestContext.get();
            if (ctx.query?.filters && ctx.query?.filters['id']) {
                delete ctx.query?.filters['id'];
            }

            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            const {
                results,
                pagination,
            }: { results: Array<KlubDonEntity>; pagination: PaginationEntity } =
                await strapi
                    .service('api::klub-don.klub-don')
                    .find(sanitizedQueryParams);
            const sanitizedResult = await this.sanitizeOutput(results, ctx);
            return { data: removeId(sanitizedResult), meta: { pagination } };
            // return this.transformResponse(sanitizedEntities, { pagination });
        },

        async findByKlubForFront() {
            const ctx = strapi.requestContext.get();
            let { uuid, slug, start, limit, pagination } = ctx.query;
            if (pagination && pagination['page'] && pagination['pageSize']) {
                start =
                    (parseInt(pagination['page']) - 1) *
                    parseInt(pagination['pageSize']);
                limit = parseInt(pagination['pageSize']);
            }

            if (!uuid && !slug) {
                return ctx.badRequest('Missing klub slug or id parameter.');
            }

            const klubrFilters = !!uuid
                ? {
                      uuid: {
                          $eq: uuid,
                      },
                  }
                : {
                      slug: {
                          $eq: slug,
                      },
                  };
            const filters = {
                $and: [
                    {
                        statusPaiment: {
                            $eq: 'success',
                        },
                    },
                    { klubr: klubrFilters },
                ],
            };
            const count = await strapi.db
                .query('api::klub-don.klub-don')
                .count({ where: filters });

            const entries: Array<Partial<KlubDonEntity>> = await strapi
                .documents('api::klub-don.klub-don')
                .findMany({
                    fields: ['montant', 'datePaiment', 'uuid'],
                    start: start as number,
                    limit: (limit as number) || API_DEFAULT_PAGE_SIZE,
                    sort: [
                        {
                            createdAt: 'desc',
                        },
                    ],
                    // @ts-ignore
                    filters,
                    populate: {
                        klubDonateur: {
                            fields: [
                                'donateurType',
                                'prenom',
                                'raisonSocial',
                                'optInAffMontant',
                                'optInAffNom',
                                'civilite',
                            ],
                            filters: {
                                $or: [
                                    {
                                        optInAffMontant: {
                                            $eq: true,
                                        },
                                    },
                                    {
                                        optInAffNom: {
                                            $eq: true,
                                        },
                                    },
                                ],
                            },
                            populate: {
                                avatar: true,
                                logo: true,
                            },
                        },
                        klub_projet: {
                            fields: [
                                'titre',
                                'slug',
                                'montantTotalDonations',
                                'montantAFinancer',
                            ],
                        },
                    },
                })
                .then((results: Array<Partial<KlubDonEntity>>) => {
                    results = results.map((don) => {
                        if (don.klubDonateur?.optInAffNom === false) {
                            if (
                                don.klubDonateur?.donateurType === 'Particulier'
                            ) {
                                don.klubDonateur.prenom = 'Anonyme';
                            } else {
                                don.klubDonateur.raisonSocial = 'Anonyme';
                            }
                        }
                        if (don.klubDonateur?.optInAffMontant === false) {
                            don.montant = null;
                        }
                        delete don?.id;
                        delete don?.klubDonateur?.id;
                        delete don?.klub_projet?.id;
                        return don;
                    });
                    return results;
                });

            const pageSize = parseInt((limit as string) || String(count));
            const paginationOutput = {
                total: count,
                pageSize,
                pageCount: Math.ceil(count / (pageSize || 1)),
                currentPage: Math.floor(
                    (Number(start) || 1) / (Number(limit) || 0) + 1,
                ),
            };
            ctx.body = {
                data: removeId(entries),
                pagination: paginationOutput,
            };
        },

        async findByProjectForFront() {
            const ctx = strapi.requestContext.get();
            let { uuid, slug, start, limit, pagination } = ctx.query;
            if (pagination && pagination['page'] && pagination['pageSize']) {
                start =
                    (parseInt(pagination['page']) - 1) *
                    parseInt(pagination['pageSize']);
                limit = parseInt(pagination['pageSize']);
            }

            if (!uuid && !slug) {
                return ctx.badRequest(
                    'Missing project slug or uuid parameter.',
                );
            }

            const projectFilters = !!uuid
                ? {
                      uuid: {
                          $eq: uuid,
                      },
                  }
                : {
                      slug: {
                          $eq: slug,
                      },
                  };
            const filters = {
                $and: [
                    {
                        statusPaiment: {
                            $eq: 'success',
                        },
                    },
                    { klub_projet: projectFilters },
                ],
            };
            const count = await strapi.db
                .query('api::klub-don.klub-don')
                .count({ where: filters });

            const entries: Array<Partial<KlubDonEntity>> = await strapi
                .documents('api::klub-don.klub-don')
                .findMany({
                    fields: ['montant', 'datePaiment', 'uuid'],
                    start: start as number,
                    limit: (limit as number) || API_DEFAULT_PAGE_SIZE,
                    sort: [
                        {
                            createdAt: 'desc',
                        },
                    ],
                    // @ts-ignore // TODO: check
                    filters,
                    populate: {
                        klubDonateur: {
                            fields: [
                                'donateurType',
                                'prenom',
                                'raisonSocial',
                                'optInAffMontant',
                                'optInAffNom',
                                'civilite',
                            ],
                            filters: {
                                $or: [
                                    {
                                        optInAffMontant: {
                                            $eq: true,
                                        },
                                    },
                                    {
                                        optInAffNom: {
                                            $eq: true,
                                        },
                                    },
                                ],
                            },
                            populate: {
                                avatar: true,
                                logo: true,
                            },
                        },
                        klub_projet: {
                            fields: [
                                'titre',
                                'slug',
                                'montantTotalDonations',
                                'montantAFinancer',
                            ],
                        },
                    },
                })
                .then((results: Array<Partial<KlubDonEntity>>) => {
                    results = results.map((don: Partial<KlubDonEntity>) => {
                        if (don.klubDonateur?.optInAffNom === false) {
                            if (
                                don.klubDonateur?.donateurType === 'Particulier'
                            ) {
                                don.klubDonateur.prenom = 'Anonyme';
                            } else {
                                don.klubDonateur.raisonSocial = 'Anonyme';
                            }
                        }
                        if (don.klubDonateur?.optInAffMontant === false) {
                            don.montant = null;
                        }
                        delete don?.id;
                        delete don?.klubDonateur?.id;
                        delete don?.klub_projet?.id;
                        return don;
                    });
                    return results;
                });

            const pageSize = parseInt(limit as string) || count;
            const paginationOutput = {
                total: count,
                pageSize,
                pageCount: Math.ceil(count / (pageSize || 1)),
                currentPage: Math.floor(
                    (Number(start) || 1) / (Number(limit) || 0) + 1,
                ),
            };
            ctx.body = {
                data: removeId(entries),
                pagination: paginationOutput,
            };
        },

        async update() {
            const ctx = strapi.requestContext.get();
            try {
                const { formToken, ...cleanData } = ctx.request.body?.data || {};
                if (!formToken) {
                    return ctx.badRequest('Missing reCaptcha token.');
                }
                ctx.request.body.data = cleanData;
                const result = await createAssessment({
                    token: formToken,
                    recaptchaAction: 'UPDATE_DONATION',
                });
                if (!result) {
                    return ctx.badRequest('Captcha verification failed');
                }
                // prevent filtering by id, but by uuid
                const { id } = ctx.params;
                if (!id) {
                    return ctx.badRequest('Missing UUID.');
                }

                const entityWithUUID: KlubDonEntity = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findOne({
                        where: { uuid: id },
                        populate: {
                            klub_don_contribution: true,
                            klubDonateur: {
                                populate: {
                                    avatar: true,
                                    logo: true,
                                },
                            },
                            klub_projet: true,
                            klubr: true,
                            klub_don_payments: true,
                        },
                    });

                if (!entityWithUUID) {
                    return ctx.badRequest(`Entity with UUID ${id} not found`);
                }
                if (entityWithUUID.statusPaiment === 'success') {
                    return ctx.badRequest(
                        `Entity with UUID ${id} has already been paid`,
                    );
                }

                let body = {
                    ...ctx.request.body,
                };

                if (body?.data?.klubr) {
                    const klubr: KlubrEntity = await strapi.db
                        .query('api::klubr.klubr')
                        .findOne({
                            where: { uuid: ctx.request.body?.data?.klubr },
                        });
                    body.data.klubr = klubr.id;
                }
                if (body?.data?.klub_projet) {
                    const klubProjet: KlubProjetEntity = await strapi.db
                        .query('api::klub-projet.klub-projet')
                        .findOne({
                            where: { uuid: body?.data?.klub_projet },
                        });
                    body.data.klub_projet = klubProjet.id;
                }

                // Update body with deduction fiscale (from montant and isOrganisme)
                body = strapi.services[
                    'api::klub-don.klub-don'
                ].updateBodyWithDeductionFiscale(body, entityWithUUID);
                const entity = await strapi
                    .documents('api::klub-don.klub-don')
                    .update({
                        documentId: entityWithUUID.documentId,
                        data: body,
                    });

                // prevent returning ids
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(sanitizedResult);
            } catch (e) {
                const { id } = ctx.params;
                if (!id) {
                    return ctx.badRequest('Missing UUID.');
                }
                const populatedDon: KlubDonEntity = await strapi.db
                    .query('api::klub-don.klub-don')
                    .findOne({
                        where: { uuid: id },
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
                const cleaned =
                    await strapi.services[
                        'api::klub-don.klub-don'
                    ].cleanIndividual(populatedDon);

                if (!cleaned) {
                    return ctx.badRequest(
                        `An error have occured. cleaned: ${cleaned}`,
                    );
                }

                const sanitizedResult = await this.sanitizeOutput(cleaned, ctx);
                return removeId(sanitizedResult);
            }
        },

        async create() {
            const ctx = strapi.requestContext.get();
            try {
                const { formToken, ...cleanData } = ctx.request.body?.data || {};
                if (!formToken) {
                    return ctx.badRequest('Missing reCaptcha token.');
                }
                ctx.request.body.data = cleanData;
                const result = await createAssessment({
                    token: formToken,
                    recaptchaAction: 'CREATE_DONATION',
                });
                if (!result) {
                    return ctx.badRequest('Captcha verification failed');
                }
                if (ctx.request.body?.data?.klubr) {
                    const klubr: KlubrEntity = await strapi.db
                        .query('api::klubr.klubr')
                        .findOne({
                            where: { uuid: ctx.request.body?.data?.klubr },
                        });
                    ctx.request.body.data.klubr = klubr.id;
                }
                if (ctx.request.body?.data?.klub_projet) {
                    const klubProjet: KlubProjetEntity = await strapi.db
                        .query('api::klub-projet.klub-projet')
                        .findOne({
                            where: {
                                uuid: ctx.request.body?.data?.klub_projet,
                            },
                        });
                    ctx.request.body.data.klub_projet = klubProjet.id;
                }

                if (ctx.request.body?.data?.montant) {
                    // Update body with deduction fiscale (from montant and isOrganisme)
                    ctx.request.body = strapi.services[
                        'api::klub-don.klub-don'
                    ].updateBodyWithDeductionFiscale(
                        ctx.request.body,
                        undefined,
                    );
                }

                ctx.request.body.data.relaunchCode = Math.floor(
                    1000 + Math.random() * 9000,
                );
                const entity = await super.create(ctx);
                // prevent returning ids
                const sanitizedResult = await this.sanitizeOutput(
                    // TODO: check new response format
                    entity.data?.attributes || entity.data,
                    ctx,
                );
                return removeId(sanitizedResult);
            } catch (e) {
                return ctx.badRequest(e);
            }
        },

        async findByKlubSlug() {
            const ctx = strapi.requestContext.get();
            const { klubSlug } = ctx.query;

            ctx.body = (await strapi.db
                .query('api::klub-don.klub-don')
                .findMany({
                    where: {
                        klubr: {
                            slug: {
                                $eq: klubSlug,
                            },
                        },
                    },
                })) as Array<KlubDonEntity>;
        },

        async findByKlubId() {
            const ctx = strapi.requestContext.get();
            const { klubId } = ctx.query;

            if (!klubId) {
                return ctx.badRequest('Missing klubId parameter.');
            }

            ctx.body = (await strapi.db
                .query('api::klub-don.klub-don')
                .findMany({
                    where: {
                        klubr: {
                            id: {
                                $eq: klubId,
                            },
                        },
                    },
                })) as Array<KlubDonEntity>;
        },

        async findForCtxUser() {
            const ctx = strapi.requestContext.get();
            const userCtx: UserEntity | null = ctx.state.user;
            let { start, limit, pagination } = ctx.query;
            if (pagination && pagination['page'] && pagination['pageSize']) {
                start =
                    (parseInt(pagination['page']) - 1) *
                    parseInt(pagination['pageSize']);
                limit = parseInt(pagination['pageSize']);
            }

            if (!userCtx) {
                return ctx.badRequest('Missing user context.');
            }

            const filters = {
                klubDonateur: {
                    users_permissions_user: userCtx.id,
                },
                isContributionDonation: false,
            };
            const count = await strapi.db
                .query('api::klub-don.klub-don')
                .count({ where: filters });

            const myDons: Array<KlubDonEntity> = await strapi
                .documents('api::klub-don.klub-don')
                .findMany({
                    // @ts-ignore // FIX
                    filters,
                    start: start as number,
                    limit: Number(limit) || API_DEFAULT_PAGE_SIZE,
                    sort: [
                        {
                            createdAt: 'desc',
                        },
                    ],
                    populate: {
                        klubDonateur: {
                            populate: {
                                avatar: true,
                                logo: true,
                            },
                        },
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
                            populate: {
                                logo: true,
                            },
                        },
                        klub_don_contribution: true,
                    },
                });

            const pageSize = parseInt(String(limit)) || count;
            const paginationOutput = {
                total: count,
                pageSize,
                pageCount: Math.ceil(count / (pageSize || 1)),
                page: Math.floor(
                    (Number(start) || 1) / (Number(limit) || 0) + 1,
                ),
            };
            // const data = await this.sanitizeOutput(myDons, ctx);
            // ctx.body = { data, meta: { pagination: paginationOutput } };
            ctx.body = { data: myDons, meta: { pagination: paginationOutput } };
        },

        async findReceivedForCtxUser() {
            const ctx = strapi.requestContext.get();
            const userCtx: UserEntity | null = ctx.state.user;
            if (!userCtx) {
                return ctx.badRequest('Missing user context.');
            }

            const memberProfile: Partial<KlubrMemberEntity> = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    select: ['id', 'documentId'],
                    populate: {
                        klubr: {
                            fields: ['id', 'uuid', 'slug'],
                        },
                    },
                    where: { uuid: userCtx.last_member_profile_used },
                });
            if (!memberProfile) {
                return ctx.badRequest(
                    `Profile ${userCtx.last_member_profile_used} not found`,
                );
            }
            let filters = {};
            switch (userCtx.role?.name) {
                case 'KlubMember':
                    filters = {
                        klub_projet: {
                            klubr_membre: memberProfile.id,
                        },
                        // todo: check before that query project filter belongs to klubMember
                        // ...queryFilters
                    };
                    break;
                case 'KlubMemberLeader':
                    filters = {
                        // todo: check query project filter belongs to klub
                        // ...queryFilters
                        klubr: memberProfile.klubr.id,
                    };
                    break;
                case 'NetworkLeader':
                    // todo: check query
                    filters = {
                        // todo: LATER
                    };
                    break;
                case 'AdminEditor':
                    filters = {
                        klubr: memberProfile.klubr.id,
                    };
                    break;
                case 'Admin':
                    filters = {
                        // ...queryFilters
                    };
                    break;
                default:
                    return ctx.badRequest('User role unauthorized.');
            }
            filters = {
                $and: [
                    {
                        ...(ctx.query.filters as Record<string, any>),
                    },
                    filters,
                ],
            };
            ctx.query = { ...ctx.query, filters };
            await this.validateQuery(ctx);
            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            const {
                results,
                pagination,
            }: { results: Array<KlubDonEntity>; pagination: PaginationEntity } =
                await strapi
                    .service('api::klub-don.klub-don')
                    .find(sanitizedQueryParams);
            const sanitizedResult = await this.sanitizeOutput(results, ctx);
            return { data: removeId(sanitizedResult), meta: { pagination } };
        },

        async attPdf() {
            const ctx = strapi.requestContext.get();
            try {
                const { id } = ctx.params;

                if (!id) {
                    return ctx.badRequest('Missing don uuid.');
                }
                ctx.query = { ...ctx.query, filters: { uuid: id } };
                await this.validateQuery(ctx);

                const sanitizedQueryParams = await this.sanitizeQuery(ctx);

                const results: Array<KlubDonEntity> = await strapi
                    .documents('api::klub-don.klub-don')
                    .findMany({
                        ...sanitizedQueryParams,
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

                if (results.length === 0) {
                    return ctx.notFound('Don not found');
                }

                const don = results[0];
                let attestationPath = don?.attestationPath;

                if (!attestationPath || !fs.existsSync(attestationPath)) {
                    const result = await GenerateCertificate(don);
                    if (result['errors']) {
                        ctx.status = 400;
                        ctx.body = {
                            error: {
                                message: 'Erreur lors de la génération du PDF',
                                details: result['errors'],
                            },
                        };
                        return;
                    }
                    attestationPath = result['file'];
                    await strapi.documents('api::klub-don.klub-don').update({
                        documentId: don.documentId,
                        data: {
                            attestationPath,
                        },
                    });
                    if (don.klub_don_contribution) {
                        await strapi
                            .documents('api::klub-don.klub-don')
                            .update({
                                documentId:
                                    don?.klub_don_contribution.documentId,
                                data: {
                                    attestationPath,
                                },
                            });
                    }
                }
                const pdfFile = fs.readFileSync(attestationPath);
                ctx.response.type = 'application/pdf';
                ctx.response.attachment(`${don.attestationNumber}.pdf`);
                ctx.set('Access-Control-Expose-Headers', 'Content-Disposition');
                ctx.body = pdfFile;
            } catch (e) {
                console.log(e);
                ctx.status = 500;
                ctx.body = { message: `Erreur interne du serveur, ${e}` };
            }
        },

        async recuPdf() {
            const ctx = strapi.requestContext.get();
            try {
                const { id } = ctx.params;

                if (!id) {
                    return ctx.badRequest('Missing don uuid.');
                }
                ctx.query = { ...ctx.query, filters: { uuid: id } };
                await this.validateQuery(ctx);

                const sanitizedQueryParams = await this.sanitizeQuery(ctx);

                const results: Array<KlubDonEntity> = await strapi
                    .documents('api::klub-don.klub-don')
                    .findMany({
                        ...sanitizedQueryParams,
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

                if (results.length === 0) {
                    return ctx.notFound('Don not found');
                }

                const don = results[0];

                if (!don.withTaxReduction) {
                    return ctx.badRequest(
                        'Pas de reduction fiscale pour ce don',
                    );
                }
                let recuPath = don?.recuPath;
                if (!recuPath || !fs.existsSync(recuPath)) {
                    const result = await GenerateInvoice(don);
                    if (result['errors']) {
                        ctx.status = 400;
                        ctx.body = {
                            error: {
                                message: 'Erreur lors de la génération du PDF',
                                details: result['errors'],
                            },
                        };
                        return;
                    }
                    recuPath = result['file'];
                    await strapi.documents('api::klub-don.klub-don').update({
                        documentId: don.documentId,
                        data: {
                            recuPath,
                        },
                    });
                }

                const pdfFile = fs.readFileSync(recuPath);
                ctx.response.type = 'application/pdf';
                ctx.response.attachment(
                    `${getRecuNumberFromAtt(don.attestationNumber)}.pdf`,
                );
                ctx.set('Access-Control-Expose-Headers', 'Content-Disposition');
                ctx.body = pdfFile;
            } catch (e) {
                console.log(e);
                ctx.status = 500;
                ctx.body = { message: `Erreur interne du serveur, ${e}` };
            }
        },

        async cleanAll() {
            const ctx = strapi.requestContext.get();
            return await sendBrevoTransacEmail({
                subject: 'Donaction.fr: Réinitialiser votre mot de passe',
                to: [{ email: 'user.email' }],
                templateId: BREVO_TEMPLATES.FORGOT_PASSWORD,
                params: {
                    RESET_PASSWORD_URL: 'resetPasswordUrl',
                },
                tags: ['reset-password'],
            });
            // return await strapi.services['api::klub-don.klub-don'].cleanAll();
        },
    }),
);
