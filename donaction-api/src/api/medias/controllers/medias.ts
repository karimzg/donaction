import { KlubrHouseEntity } from '../../../_types';
import { ContentType } from '@strapi/types/dist/schema';

export default {
    async findAvatars(ctx) {
        const { type } = ctx.params;
        const avatarFolder = process.env.IMAGEKIT_STRAPI_AVATAR_FOLDER;
        const avatarMenFolder = process.env.IMAGEKIT_STRAPI_AVATAR_FOLDER_MEN;
        const avatarWomenFolder =
            process.env.IMAGEKIT_STRAPI_AVATAR_FOLDER_WOMEN;
        let filters: Record<string, any>;
        switch (type) {
            case 'men':
                filters = {
                    folderPath: {
                        $eq: avatarMenFolder,
                    },
                };
                break;
            case 'women':
                filters = {
                    folderPath: {
                        $eq: avatarWomenFolder,
                    },
                };
                break;
            default:
                filters = {
                    $or: [
                        {
                            folderPath: avatarFolder,
                        },
                        {
                            folderPath: avatarMenFolder,
                        },
                        {
                            folderPath: avatarWomenFolder,
                        },
                    ],
                };
                break;
        }
        const avatars = await strapi.documents('plugin::upload.file').findMany({
            filters,
        });
        ctx.body = avatars;
    },
    async postFileKlubr(ctx) {
        const { files } = ctx.request;
        const { uuid } = ctx.params;

        const entityWithUUID = await strapi.db
            .query('api::klubr.klubr')
            .findOne({
                populate: {
                    logo: true,
                },
                where: { uuid },
            });
        console.log('ENTITY WITH UUID', entityWithUUID);
        if (!entityWithUUID) {
            return ctx.badRequest(`Entity with UUID ${uuid} not found`);
        }

        console.log('SET ENTITY FILES');
        return await strapi
            .service('api::medias.medias')
            .setEntityFiles(
                ctx,
                'api::klubr.klubr',
                entityWithUUID,
                files,
                `/Klubs/${entityWithUUID.slug}/`,
            );
    },
    async postFileKlubrMembre(ctx) {
        try {
            const { files } = ctx.request;
            const { uuid } = ctx.params;

            const entityWithUUID = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    populate: {
                        avatar: true,
                        klubr: {
                            fields: ['id', 'uuid', 'slug'],
                        },
                    },
                    where: { uuid },
                });
            if (!entityWithUUID) {
                return ctx.badRequest(`Entity with UUID ${uuid} not found`);
            }

            return await strapi
                .service('api::medias.medias')
                .setEntityFiles(
                    ctx,
                    'api::klubr-membre.klubr-membre',
                    entityWithUUID,
                    files,
                    `/Klubs/${entityWithUUID.klubr.slug}/Membres/`,
                );
        } catch (e) {
            console.log('ERROR', e);
            return ctx.badRequest('Erreur pendant le chargement du fichier');
        }
    },
    async postFileKlubrHouse(ctx) {
        const { files } = ctx.request;
        const { uuid } = ctx.params;
        console.log('POST FILE KLUBR HOUSE');
        const entityWithUUID = await strapi.db
            .query('api::klubr-house.klubr-house')
            .findOne({
                populate: {
                    couvertureMedia: true,
                    klubr: {
                        fields: ['id', 'uuid', 'slug'],
                    },
                },
                where: { uuid },
            });
        if (!entityWithUUID) {
            return ctx.badRequest(`Entity with UUID ${uuid} not found`);
        }
        console.log('SET ENTITY FILES', entityWithUUID);
        try {
            return await strapi
                .service('api::medias.medias')
                .setEntityFiles(
                    ctx,
                    'api::klubr-house.klubr-house',
                    entityWithUUID,
                    files,
                    `/Klubs/${entityWithUUID.klubr.slug}/House/`,
                );
        } catch (e) {
            console.log('ERROR', e);
        }
        return false;
    },
    async postFileKlubProjet(ctx) {
        const { files } = ctx.request;
        const { uuid } = ctx.params;

        const entityWithUUID = await strapi.db
            .query('api::klub-projet.klub-projet')
            .findOne({
                populate: {
                    couverture: true,
                    klubr: {
                        fields: ['id', 'uuid', 'slug'],
                    },
                },
                where: { uuid },
            });
        if (!entityWithUUID) {
            return ctx.badRequest(`Entity with UUID ${uuid} not found`);
        }

        return await strapi
            .service('api::medias.medias')
            .setEntityFiles(
                ctx,
                'api::klub-projet.klub-projet',
                entityWithUUID,
                files,
                `/Klubs/${entityWithUUID.klubr.slug}/Projets/${entityWithUUID.slug}`,
            );
    },
    async postFileKlubrDonateur(ctx) {
        const { files } = ctx.request;
        const { uuid } = ctx.params;

        console.log('POST FILE KLUBR DONATEUR');
        const entityWithUUID = await strapi.db
            .query('api::klubr-donateur.klubr-donateur')
            .findOne({
                populate: {
                    avatar: true,
                    logo: true,
                },
                where: { uuid },
            });
        if (!entityWithUUID) {
            return ctx.badRequest(`Entity with UUID ${uuid} not found`);
        }

        return await strapi
            .service('api::medias.medias')
            .setEntityFiles(
                ctx,
                'api::klubr-donateur.klubr-donateur',
                entityWithUUID,
                files,
                `/Mecenes/`,
            );
    },
    async postFileUser(ctx) {
        const { files } = ctx.request;
        const { uuid } = ctx.params;

        console.log('POST FILE KLUBR DONATEUR');
        const entityWithUUID = await strapi.db
            .query('plugin::users-permissions.user')
            .findOne({
                populate: {
                    avatar: true,
                },
                where: { uuid },
            });
        if (!entityWithUUID) {
            return ctx.badRequest(`Entity with UUID ${uuid} not found`);
        }

        return await strapi
            .service('api::medias.medias')
            .setEntityFiles(
                ctx,
                'plugin::users-permissions.user',
                entityWithUUID,
                files,
                `/Users/`,
            );
    },
    async postFileDynamicZone(ctx) {
        try {
            console.log('POST FILE KLUBR HOUSE DYNAMIC ZONE');
            const { files } = ctx.request;
            const filesObj = Object.entries(files);
            let {
                entity,
                uuid,
                dynamicZone,
                componentType,
                fieldName,
                componentId,
            } = ctx.params;

            const model = Object.values(strapi.contentTypes).find(
                (contentType: ContentType) =>
                    contentType.info?.singularName === entity,
            );

            if (!model) {
                return ctx.badRequest(`Model ${entity} not found`);
            }

            if (filesObj.length === 0) {
                return ctx.badRequest('No files provided');
            }
            const filesObjKeys = Object.assign(
                {},
                ...filesObj.map(([key, value]) => {
                    return { [key]: true };
                }),
            );

            // TODO: adapter la requête selon le model (ici: klubr-house)
            let entityWithUUID: KlubrHouseEntity, uploadPath: string;
            switch (entity) {
                case 'klubr-house':
                    entityWithUUID = await strapi.db
                        .query('api::klubr-house.klubr-house')
                        .findOne({
                            populate: {
                                klubr: {
                                    fields: ['id', 'uuid', 'slug'],
                                },
                                [dynamicZone]: {
                                    populate: filesObjKeys,
                                },
                            },
                            where: { uuid },
                        });
                    uploadPath = `/Klubs/${entityWithUUID.klubr.slug}/House/`;
                    break;
                case 'page-home':
                    entityWithUUID = await strapi.db
                        .query('api::page-home.page-home')
                        .findOne({
                            populate: {
                                [dynamicZone]: {
                                    populate: filesObjKeys,
                                },
                            },
                            where: { uuid },
                        });
                    uploadPath = `/Pages/`;
                    break;

                case 'klub-projet':
                    entityWithUUID = await strapi.db
                        .query('api::klub-projet.klub-projet')
                        .findOne({
                            populate: {
                                klubr: {
                                    fields: ['id', 'uuid', 'slug'],
                                },
                                [dynamicZone]: {
                                    populate: filesObjKeys,
                                },
                            },
                            where: { uuid },
                        });
                    uploadPath = `/Klubs/${entityWithUUID.klubr.slug}/Projets/${entityWithUUID.slug}`;
                    break;
                default:
                    return ctx.badRequest(`Model ${entity} not implemented`);
            }
            
            if (!entityWithUUID) {
                return ctx.badRequest(`Entity with UUID ${uuid} not found`);
            }
            const components = entityWithUUID[dynamicZone].filter(
                (component: any) => component.__component === componentType,
            );
            if (!components || components.length === 0) {
                return ctx.badRequest(
                    `Component type ${componentType} not found in dynamic zone ${dynamicZone}`,
                );
            }

            // default to first component if no componentId is provided
            let componentToUpdate = components[0];
            if (!!componentId) {
                componentToUpdate = components.find(
                    (component: any) => component.id === +componentId,
                );
                if (!componentToUpdate) {
                    return ctx.badRequest(
                        `Component with ID ${componentId} not found in dynamic zone ${dynamicZone}`,
                    );
                }
            } else {
                componentId = components[0].id;
            }
            return await strapi
                .service('api::medias.medias')
                .setEntityDynamicZoneFiles(
                    ctx,
                    `api::${model.info?.singularName}.${model.info?.singularName}`,
                    model,
                    entityWithUUID,
                    dynamicZone,
                    componentType,
                    componentToUpdate,
                    files,
                    uploadPath,
                );
        } catch (e) {
            console.log('ERROR', e);
        }
    },
};
