/**
 * blog controller
 */

import { Core, factories } from '@strapi/strapi';

export default factories.createCoreController(
    'api::blog.blog',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async create() {
            const ctx = strapi.requestContext.get();
            const { title, description, author } = ctx.request.body;

            // Generate slug from the title by replacing spaces with '-' and converting to lowercase
            const slug = title.toLowerCase().replace(/\s+/g, '-');

            // Extract the first 10 characters of the longDescription for shortDescription
            const shortDescription = description.substring(0, 10);

            // Set static values
            const staticValues = {
                title,
                slug,
                shortDescription,
                longDescription: description,
                btnText: 'Read More',
                author,
            };

            const inputData = {
                data: staticValues,
            };

            const createdEntity =
                await strapi.services['api::blog.blog'].create(inputData);

            const sanitizedEntity = await this.sanitizeOutput(
                createdEntity,
                ctx,
            );
            return this.transformResponse(sanitizedEntity);
        },
        async findOne() {
            const ctx = strapi.requestContext.get();
            const { id } = ctx.params;
            const entity = await strapi.db.query('api::blog.blog').findOne({
                where: { uuid: id },
                populate: ['image', 'authorImg'],
            });
            const sanitzedEntity = await this.sanitizeOutput(entity, ctx);
            return this.transformResponse(sanitzedEntity);
        },
    }),
);
