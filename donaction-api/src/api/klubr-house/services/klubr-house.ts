/**
 * klubr-house service
 */

import { Core, factories } from '@strapi/strapi';
import { slugify } from '../../../helpers/string';

export default factories.createCoreService(
    'api::klubr-house.klubr-house',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Generate a unique slug for a klubr-house based on its title.
         * Tries base slug, then -2, -3 suffixes. Throws error after 3 collisions.
         */
        async getSlug(title: string): Promise<string> {
            const baseSlug = slugify(title);
            const MAX_ATTEMPTS = 3;

            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                const candidateSlug =
                    attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;

                const existing = await strapi.db
                    .query('api::klubr-house.klubr-house')
                    .findOne({
                        where: { slug: candidateSlug },
                    });

                if (!existing) {
                    return candidateSlug;
                }
            }

            throw new Error(
                `Impossible de générer un slug unique pour "${title}" après ${MAX_ATTEMPTS} tentatives.`,
            );
        },
    }),
);
