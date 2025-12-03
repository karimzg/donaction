/**
 * invoice controller
 */

import { Core, factories } from '@strapi/strapi';
import fs from 'fs';
import { removeId } from '../../../helpers/sanitizeHelpers';
import { InvoiceEntity, PaginationEntity } from '../../../_types';

export default factories.createCoreController(
    'api::invoice.invoice',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async findOne() {
            const ctx = strapi.requestContext.get();

            const { id } = ctx.params;

            if (!id) {
                return ctx.badRequest('Missing invoice uuid.');
            }
            ctx.query = {
                ...ctx.query,
                filters: {
                    uuid: id,
                    ...(ctx.query.filters as Record<string, any>),
                },
            };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const {
                results,
                pagination,
            }: { results: Array<InvoiceEntity>; pagination: PaginationEntity } =
                await strapi
                    .service('api::invoice.invoice')
                    .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound('Invoice not found');
            }

            const entity = results[0];

            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
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
            }: { results: Array<InvoiceEntity>; pagination: PaginationEntity } =
                await strapi
                    .service('api::invoice.invoice')
                    .find(sanitizedQueryParams);
            const sanitizedResult = await this.sanitizeOutput(results, ctx);
            return { data: removeId(sanitizedResult), meta: { pagination } };
        },

        async update() {
            const ctx = strapi.requestContext.get();
            // prevent filtering by id, but by uuid
            const { id } = ctx.params;
            if (!id) {
                return ctx.badRequest('Missing UUID.');
            }
            const entityWithUUID: Partial<InvoiceEntity> = await strapi.db
                .query('api::invoice.invoice')
                .findOne({
                    select: ['id', 'documentId'],
                    where: { uuid: id },
                });
            if (!entityWithUUID) {
                return ctx.badRequest(`Entity with UUID ${id} not found`);
            }
            ctx.params = { id: entityWithUUID.id };

            const entity = await strapi
                .documents('api::invoice.invoice')
                .update({
                    documentId: entityWithUUID.documentId,
                    populate: {
                        ...(ctx.query.populate as any),
                    },
                    data: {
                        ...ctx.request.body.data,
                    },
                });
            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },

        async create() {
            const ctx = strapi.requestContext.get();
            const entity: InvoiceEntity = await super.create(ctx);
            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },

        async generate() {
            const ctx = strapi.requestContext.get();
            try {
                console.log('------------ generate invoice -----------');
                const { month, year, genPdf, send } = ctx.params;
                if (!month || !year) {
                    return ctx.badRequest(`Missing month or year param`);
                }
                const sendInvoice = send === 'true';
                const generatePdf = genPdf === 'true';
                return await strapi
                    .service('api::invoice.invoice')
                    .createInvoices(
                        null,
                        month,
                        year,
                        generatePdf,
                        sendInvoice,
                    );
            } catch (error) {
                console.log('error', error);
            }
            // // prevent returning ids
            // const sanitizedResult = await this.sanitizeOutput(result, ctx);
            // return removeId(sanitizedResult);
        },

        async generateForClub() {
            const ctx = strapi.requestContext.get();
            try {
                console.log(
                    '------------ generate invoice for club -----------',
                );
                const { clubUuid, month, year, genPdf, send } = ctx.params;
                if (!clubUuid) {
                    return ctx.badRequest(`Missing clubUuid param`);
                }
                if (!month || !year) {
                    return ctx.badRequest(`Missing month or year param`);
                }
                const sendInvoice = send === 'true';
                const generatePdf = genPdf === 'true';
                return await strapi
                    .service('api::invoice.invoice')
                    .createInvoices(
                        clubUuid,
                        month,
                        year,
                        generatePdf,
                        sendInvoice,
                    );
            } catch (error) {
                console.log('error', error);
            }

            // console.log('------------ generate invoice for club -----------');
            // const {clubUuid, month, year, genPdf, send} = ctx.params;
            // if (!clubUuid) {
            //   return ctx.badRequest(`Missing clubUuid param`);
            // }
            // if (!month || !year) {
            //   return ctx.badRequest(`Missing month or year param`);
            // }
            // const sendInvoice = send === 'true';
            // const generatePdf = genPdf === 'true';
            // const result = await strapi
            //   .service("api::invoice.invoice")
            //   .createInvoiceForKlub(clubUuid, month, year, generatePdf, sendInvoice);
            // return result;

            // // prevent returning ids
            // const sanitizedResult = await this.sanitizeOutput(result, ctx);
            // return removeId(sanitizedResult);
        },

        async generateInvoicePdf() {
            const ctx = strapi.requestContext.get();
            console.log('------------ generate invoice by uuid -----------');
            try {
                const { uuid } = ctx.params;
                if (!uuid) {
                    return ctx.badRequest(`Missing uuid param`);
                }
                const { data, path, errors } = await strapi
                    .service('api::invoice.invoice')
                    .generateInvoicePDF(uuid);
                if (errors) {
                    return ctx.badRequest(
                        `Erreur pendant la génération de la facture PDF`,
                        data?.invoiceNumber
                            ? [`${data.invoiceNumber}-${data?.klubr?.slug}.pdf`]
                            : undefined,
                    );
                }
                if (data && path) {
                    const pdfFile = fs.readFileSync(path);
                    ctx.response.type = 'application/pdf';
                    ctx.response.attachment(
                        `${data.invoiceNumber}-${data?.klubr?.slug}.pdf`,
                    );
                    ctx.set(
                        'Access-Control-Expose-Headers',
                        'Content-Disposition',
                    );
                    ctx.body = pdfFile;
                } else {
                    return ctx.badRequest(
                        `Erreur pendant la génération de la facture PDF`,
                        data?.invoiceNumber
                            ? [`${data.invoiceNumber}-${data?.klubr?.slug}.pdf`]
                            : undefined,
                    );
                }
            } catch (e) {
                return e;
            }
        },

        async sendInvoiceToKlubrMembre() {
            const ctx = strapi.requestContext.get();
            console.log('------------ send invoice by uuid -----------');
            try {
                const { uuid } = ctx.params;
                if (!uuid) {
                    return ctx.badRequest(`Missing uuid param`);
                }
                const { data, path, errors } = await strapi
                    .service('api::invoice.invoice')
                    .generateInvoicePDF(uuid);
                if (errors) {
                    ctx.status = 400;
                    ctx.body = {
                        error: {
                            message: 'Erreur lors de la génération du PDF',
                            details: errors,
                        },
                    };
                    return;
                }
                if (data && path) {
                    const leadersEmailsSent = await strapi
                        .service('api::invoice.invoice')
                        .sendInvoiceToKlubMemberLeader(path, data);
                    return leadersEmailsSent?.length > 0
                        ? leadersEmailsSent
                        : [];
                } else {
                    console.log({ data, path });
                    return ctx.badRequest(
                        `Error while sending invoice: ${data.invoiceNumber}-${data?.klubr?.slug}.pdf`,
                    );
                }
            } catch (e) {
                return e;
            }
        },
    }),
);
