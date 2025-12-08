/**
 * klub-projet service
 */

import { Core, factories } from '@strapi/strapi';
import { KlubProjetEntity } from '../../../_types';

export default factories.createCoreService(
    'api::klub-projet.klub-projet',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async populateTmplRef(
            entries: Array<KlubProjetEntity>,
            parentUuid?: string,
        ) {
            try {
                if (entries && typeof entries === 'object') {
                    return entries?.map((entry) => ({
                        ...entry,
                        tmplRef:
                            entry?.isFromTemplate &&
                            ![parentUuid, entry?.klubr?.uuid].includes(
                                entry?.tmplReference?.klubr?.uuid,
                            )
                                ? {
                                      logo: entry?.tmplReference?.klubr?.logo,
                                      denomination:
                                          entry?.tmplReference?.klubr
                                              ?.denomination,
                                      template_projects_category:
                                          entry?.tmplReference
                                              ?.template_projects_category,
                                      uuid: entry?.tmplReference?.klubr?.uuid,
                                  }
                                : null,
                    }));
                }
            } catch (e) {
                console.log(e);
            }
        },
    }),
);
