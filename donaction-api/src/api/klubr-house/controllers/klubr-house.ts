/**
 * klubr-house controller
 */

import { Core, factories } from '@strapi/strapi';
import { KlubrHouseEntity, PaginationEntity } from '../../../_types';
import { removeId } from '../../../helpers/sanitizeHelpers';
import GeneratePoster from '../../../helpers/klubrPDF/generatePoster';
import convertPdfToImage from '../../../helpers/klubrPDF/funcs/convertPdfToImage';

export default factories.createCoreController(
    'api::klubr-house.klubr-house',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async findOne() {
            const ctx = strapi.requestContext.get();
            const { id } = ctx.params;

            if (!id) {
                return ctx.badRequest('Missing klub-house uuid.');
            }
            ctx.query = { ...ctx.query, filters: { uuid: id } };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const {
                results,
                pagination,
            }: {
                results: Array<KlubrHouseEntity>;
                pagination: PaginationEntity;
            } = await strapi
                .service('api::klubr-house.klubr-house')
                .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound('Klub House not found');
            }

            const entity = results[0];
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },

        async find() {
            const ctx = strapi.requestContext.get();
            if (ctx.query?.filters && ctx.query?.filters['id']) {
                delete ctx.query.filters['id'];
            }
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            const {
                results,
                pagination,
            }: {
                results: Array<KlubrHouseEntity>;
                pagination: PaginationEntity;
            } = await strapi
                .service('api::klubr-house.klubr-house')
                .find(sanitizedQueryParams);
            const sanitizedResult = await this.sanitizeOutput(results, ctx);
            return { data: removeId(sanitizedResult), meta: { pagination } };
        },

        async findOneFull() {
            try {
                const ctx = strapi.requestContext.get();
                const { id } = ctx.params;

                if (!id) {
                    return ctx.badRequest('Missing klub uuid parameter.');
                }

                const entity: KlubrHouseEntity = await strapi.db
                    .query('api::klubr-house.klubr-house')
                    .findOne({
                        where: { uuid: id },
                    });

                if (!entity?.id) {
                    return ctx.badRequest('Klubr House not found');
                }
                const entry = await strapi
                    .documents('api::klubr-house.klubr-house')
                    .findOne({
                        documentId: entity.documentId,
                        populate: {
                            couvertureMedia: true,
                            chiffres: true,
                            club_presentation: {
                                on: {
                                    'club-presentation.mot-du-dirigeant': {
                                        fields: ['titre'],
                                        populate: {
                                            citation: true,
                                        },
                                    },
                                    'club-presentation.section-citation': {
                                        populate: {
                                            citations: true,
                                        },
                                    },
                                    'club-presentation.pourquoi-klubr-accompagne':
                                        true,
                                    'club-presentation.localisation': true,
                                    'club-presentation.club-presentation': true,
                                    'composant-atoms.section-texte-image': {
                                        populate: {
                                            image: true,
                                        },
                                    },
                                },
                            },
                            partnerList: {
                                on: {
                                    'composant-atoms.partner-item': {
                                        populate: {
                                            logo: true,
                                        },
                                    },
                                },
                            },
                        },
                    });

                const sanitizedResult = await this.sanitizeOutput(entry, ctx);
                return removeId(sanitizedResult);
            } catch (e) {
                console.log(e);
            }
        },

        async update() {
            const ctx = strapi.requestContext.get();
            // prevent filtering by id, but by uuid
            const { id } = ctx.params;
            if (!id) {
                return ctx.badRequest('Missing UUID.');
            }
            const entityWithUUID: KlubrHouseEntity = await strapi.db
                .query('api::klubr-house.klubr-house')
                .findOne({
                    select: ['id', 'documentId'],
                    populate: {
                        club_presentation: {
                            on: {
                                'club-presentation.mot-du-dirigeant': {
                                    fields: ['titre'],
                                    populate: {
                                        citation: true,
                                    },
                                },
                                'club-presentation.section-citation': {
                                    fields: ['titre'],
                                    populate: {
                                        citations: {
                                            populate: {
                                                image: true,
                                            },
                                        },
                                    },
                                },
                                'club-presentation.pourquoi-klubr-accompagne':
                                    true,
                                'club-presentation.club-presentation': true,
                                'composant-atoms.section-texte-image': {
                                    populate: {
                                        image: true,
                                    },
                                },
                            },
                        },
                        partnerList: {
                            populate: {
                                logo: true,
                            },
                        },
                    },
                    where: { uuid: id },
                });
            if (!entityWithUUID) {
                return ctx.badRequest(`Entity with UUID ${id} not found`);
            }
            ctx.params = { id: entityWithUUID.id };
            if (ctx.request.body?.data?.club_presentation) {
                console.log(
                    'entityWithUUID.club_presentation',
                    entityWithUUID.club_presentation,
                );
                const newItems = ctx.request.body.data.club_presentation.filter(
                    (item: any) =>
                        entityWithUUID.club_presentation?.some(
                            (item2) => item2.__component === item.__component,
                        ) === false,
                );
                ctx.request.body.data.club_presentation = [
                    ...entityWithUUID.club_presentation.map((item) => {
                        const newItem =
                            ctx.request.body.data.club_presentation.find(
                                (item2: any) =>
                                    item2.__component === item.__component,
                            );
                        return newItem ? { ...item, ...newItem } : item;
                    }),
                    ...newItems,
                ];
                // ctx.request.body.data.club_presentation = [
                //   ...entityWithUUID.club_presentation.filter((item) => ctx.request.body.data.club_presentation.some((item2) => item2.__component === item.__component) === false),
                //   ...ctx.request.body.data.club_presentation
                // ]
            }
            const entity = await strapi
                .documents('api::klubr-house.klubr-house')
                .update({
                    documentId: entityWithUUID.documentId,
                    populate: {
                        ...(ctx.query.populate as any),
                    },
                    data: {
                        ...ctx.request.body.data,
                    },
                });
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },

        async updateDynamicZone() {
            const ctx = strapi.requestContext.get();
            // https://docs.strapi.io/dev-docs/api/entity-service/components-dynamic-zones
            // prevent filtering by id, but by uuid
            const { uuid } = ctx.params;
            let body = {
                ...ctx.request.body,
            };
            if (!uuid) {
                return ctx.badRequest('Missing UUID.');
            }
            const entityWithUUID: KlubrHouseEntity = await strapi.db
                .query('api::klubr-house.klubr-house')
                .findOne({
                    select: ['id', 'documentId', 'title'],
                    where: { uuid },
                });
            if (!entityWithUUID) {
                return ctx.badRequest(`Entity with UUID ${uuid} not found`);
            }
            ctx.params = { id: entityWithUUID.id };

            const entry = await strapi
                .documents('api::klubr-house.klubr-house')
                .update({
                    documentId: entityWithUUID.documentId,
                    populate: {},
                    data: {
                        ...body.data,
                    },
                });
            // // prevent returning ids
            // const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(entry);
        },

        async create() {
            const ctx = strapi.requestContext.get();
            const entity = await super.create(ctx);
            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },

        async posterPdf() {
            const ctx = strapi.requestContext.get();
            try {
                const { id } = ctx.params;

                if (!id) {
                    return ctx.badRequest('Missing klub uuid parameter.');
                }

                const entity: KlubrHouseEntity = await strapi.db
                    .query('api::klubr-house.klubr-house')
                    .findOne({
                        where: { uuid: id },
                    });

                if (!entity?.id) {
                    return ctx.badRequest('Klubr House not found');
                }

                const entry = await strapi
                    .documents('api::klubr-house.klubr-house')
                    .findOne({
                        documentId: entity.documentId,
                        populate: {
                            couvertureMedia: true,
                            poster_media: true,
                            klubr: {
                                populate: {
                                    logo: true,
                                },
                            },
                        },
                    });

                // if (!entry.poster_media && !isImage(entry.couvertureMedia?.url)) {
                //   return ctx.badRequest("Veuillez fournir une image d'affiche");
                // }

                const result = await GeneratePoster(entry, 'CLUB');
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

                const pdfFile = Buffer.from(result['file']);
                const pdfName = entry?.klubr?.slug
                    ?.split('-')
                    ?.reduce((prev, curr) => {
                        prev.push(curr[0]?.toUpperCase() + curr?.slice(1));
                        return prev;
                    }, [])
                    ?.join('-');

                const imgBuffer = !!ctx.query.asImage
                    ? await convertPdfToImage(pdfFile, pdfName)
                    : null;

                ctx.response.type = imgBuffer ? 'image/png' : 'application/pdf';
                ctx.response.attachment(
                    `Affiche-${pdfName}.${imgBuffer ? 'png' : 'pdf'}`,
                );
                ctx.set('Access-Control-Expose-Headers', 'Content-Disposition');
                ctx.body = imgBuffer || pdfFile;
                return entry;
            } catch (e) {
                console.log('>>>> CATCH', e);
                ctx.status = 500;
                ctx.body = { message: `Erreur interne du serveur, ${e}` };
            }
        },
    }),
);
