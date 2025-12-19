// const ImageKit = require("imagekit");
// const {slugify} = require("../../../helpers/string");

import { Context } from 'koa';
import { UID } from '@strapi/strapi';
import { slugify } from '../../../helpers/string';
import ImageKit from 'imagekit';

export default {
    // *********************************************************************
    // Public method : setEntityFiles
    // *********************************************************************
    async setEntityFiles(
        ctx: Context,
        modelId: string,
        entityWithUUID: any,
        files: any,
        uploadPath: string,
    ) {
        console.log('### Set entity files MEDIAS');
        // for each entry in files
        if (!files) {
            return ctx.badRequest(`File missing!`);
        }
        const filesObj = Object.entries(files);
        let errorMsg = [];
        let fieldsToUpdate = {};

        const model = strapi.contentTypes[modelId];
        if (!model) {
            return ctx.badRequest(`Model ${modelId} not found`);
        }
        const uploadPathLength = uploadPath.length;
        for (const [fieldName, file] of filesObj) {
            const keyIsFileField =
                model.attributes[fieldName]?.type === 'media';
            if (!keyIsFileField) {
                errorMsg.push('Field ' + fieldName + ' is not a file field');
            } else {
                // Specific code for each file field
                let name: string, alternativeText: string;
                switch (model.info?.singularName) {
                    case 'klubr-membre':
                        name = `${entityWithUUID.klubr.slug}_${entityWithUUID.fonction?.length ? entityWithUUID.fonction : entityWithUUID.prenom}`;
                        alternativeText = `${entityWithUUID.klubr.denomination} - ${entityWithUUID.prenom} ${entityWithUUID.nom}${entityWithUUID.fonction?.length ? ' ' + entityWithUUID.fonction + ' - ' : ' ' + entityWithUUID.fonction + ' de '}${entityWithUUID.klubr.denomination}`;
                        break;
                    case 'klub-projet':
                        name = `${entityWithUUID.klubr.slug}_${entityWithUUID.slug}`;
                        alternativeText = `${entityWithUUID.klubr.denomination} - ${entityWithUUID.titre}`;
                        break;
                    case 'klubr-house':
                        name = `${entityWithUUID.klubr.slug}_house`;
                        alternativeText = `${entityWithUUID.klubr.denomination} - Présentation`;
                        break;
                    case 'klubr':
                        name = `${entityWithUUID.slug}_logo`;
                        alternativeText = `Logo de ${entityWithUUID.denomination}`;
                        break;
                    case 'klubr-donateur':
                        name = `mecene`;
                        alternativeText = `Mécène`;
                        break;
                    default:
                        name = `${file['name']}`;
                        alternativeText = `${file['alternativeText']}`;
                        break;
                }

                if (name.length > 190 - uploadPathLength) {
                    name = name.substring(0, 190 - uploadPathLength);
                }
                console.log('### Upload file NAME', name);
                let createdFile;
                try {
                    createdFile =
                        await strapi.plugins.upload.services.upload.upload({
                            data: {
                                fileInfo: {
                                    name,
                                    alternativeText,
                                    caption: `filePath:${uploadPath}`,
                                },
                            },
                            files: file,
                        });
                } catch (e) {
                    console.log('Error creating file', e);
                    return false;
                }
                console.log('### Created file', createdFile);
                if (createdFile[0].id) {
                    fieldsToUpdate[fieldName] = createdFile[0].id;
                } else {
                    errorMsg.push(
                        'Field ' + fieldName + ' could not be created',
                    );
                }
                await strapi
                    .service('api::medias.medias')
                    .moveFileToFolder(
                        ctx,
                        entityWithUUID[fieldName],
                        createdFile[0].id,
                        uploadPath,
                        true,
                    );
            }
        }

        if (errorMsg.length > 0) {
            return ctx.badRequest(errorMsg.join(' - '));
        }
        console.log(
            '### Update entity',
            modelId,
            entityWithUUID.id,
            fieldsToUpdate,
        );
        try {
            return await strapi.documents(modelId as UID.ContentType).update({
                documentId: entityWithUUID.documentId,
                populate: '*',
                data: fieldsToUpdate,
            });
        } catch (e) {
            console.log('Error updating entity', e);
        }
        return false;
    },

    // *********************************************************************
    // Public method : setEntityDynamicZoneFiles
    // *********************************************************************
    async setEntityDynamicZoneFiles(
        ctx: Context,
        modelId: string,
        model: any,
        entityWithUUID: any,
        dynamicZone: any,
        componentType: any,
        componentToUpdate: any,
        files: any,
        uploadPath: string,
    ) {
        console.log('### Set entity DynamicZone files MEDIAS');
        // for each entry in files
        const filesObj = Object.entries(files);
        let errorMsg = [];
        let fieldsToUpdate = {};

        const dynamicZoneObj = model.attributes[dynamicZone];
        if (!dynamicZoneObj) {
            return ctx.badRequest(
                `Dynamyc Zone ${dynamicZone} not found in model ${model.info?.singularName}`,
            );
        }
        if (!dynamicZoneObj.components.includes(componentType)) {
            return ctx.badRequest(
                `Component ${componentType} not found in Dynamic Zone ${dynamicZone}`,
            );
        }

        const componentModel = strapi.components[componentType];
        if (!componentModel) {
            return ctx.badRequest(`Component ${componentType} not found`);
        }
        if (!componentToUpdate) {
            return ctx.badRequest(`Dynamic Zone ${dynamicZone} is empty`);
        }

        const uploadPathLength = uploadPath.length;
        for (const [fieldName, file] of filesObj) {
            console.log(
                '### Field name',
                fieldName,
                model.info?.singularName,
                componentType,
            );
            const keyIsFileField =
                componentModel.attributes[fieldName]?.type === 'media';
            if (!keyIsFileField) {
                errorMsg.push('Field ' + fieldName + ' is not a file field');
            } else {
                // Specific code for each file field
                let name, alternativeText;
                // Check within models with dynamic zones
                switch (model.info?.singularName) {
                    // case "klubr_membres":
                    //   name = `${entityWithUUID.klubr.slug}_${entityWithUUID.fonction?.length ? entityWithUUID.fonction : entityWithUUID.prenom}`;
                    //   alternativeText = `${entityWithUUID.klubr.denomination} - ${entityWithUUID.prenom} ${entityWithUUID.nom}${entityWithUUID.fonction?.length ? ' ' + entityWithUUID.fonction + ' - ' : ' ' + entityWithUUID.fonction + ' de '}${entityWithUUID.klubr.denomination}`;
                    //   break;
                    case 'klub-projet':
                        switch (componentType) {
                            case 'composant-atoms.section-texte-image':
                                name = `${slugify(componentToUpdate.titre)}`;
                                alternativeText = `${componentToUpdate.titre}`;
                                break;
                            case 'composant-atoms.slider':
                                name = `${entityWithUUID.klubr.slug}_slide`;
                                alternativeText = `${entityWithUUID.titre} - Slide`;
                                break;
                            default:
                                name = `${file['name']}`;
                                alternativeText = `${file['alternativeText']}`;
                                break;
                        }
                        break;
                    case 'klubr-house':
                        switch (componentType) {
                            case 'composant-atoms.section-texte-image':
                                name = `${slugify(componentToUpdate.titre)}`;
                                alternativeText = `${componentToUpdate.titre}`;
                                break;
                            // case "club-presentation.mot-du-dirigeant":
                            //   name = `${entityWithUUID.klubr.slug}_dirigeant`;
                            //   alternativeText = `${entityWithUUID.klubr.denomination} - Mot du dirigeant`;
                            //   break;
                            // case "club-presentation.section-citation":
                            //   name = `${entityWithUUID.klubr.slug}_citation`;
                            //   alternativeText = `${entityWithUUID.klubr.denomination} - Citation`;
                            //   break;
                            case 'club-presentation.pourquoi-klubr-accompagne':
                                name = `${entityWithUUID.klubr.slug}_pourquoi`;
                                alternativeText = `Pourquoi Klubr accompagne ${entityWithUUID.klubr.denomination}`;
                                break;
                            case 'composant-atoms.partner-item':
                                name = `${entityWithUUID.klubr.slug}_partner`;
                                alternativeText = `${entityWithUUID.klubr.denomination} - Partenaire`;
                                break;
                            // case "club-presentation.localisation":
                            //   name = `${entityWithUUID.klubr.slug}_localisation`;
                            //   alternativeText = `${entityWithUUID.klubr.denomination} - Localisation`;
                            //   break;
                            // case "club-presentation.club-presentation":
                            //   name = `${entityWithUUID.klubr.slug}_presentation`;
                            //   alternativeText = `${entityWithUUID.klubr.denomination} - Présentation`;
                            //   break;
                            default:
                                name = `${file['name']}`;
                                alternativeText = `${file['alternativeText']}`;
                                break;
                        }
                        break;
                    // case "klubrs":
                    //   name = `${entityWithUUID.slug}_logo`;
                    //   alternativeText = `Logo de ${entityWithUUID.denomination}`;
                    //   break;
                    // case "klubr_donateurs":
                    //   name = `mecene`;
                    //   alternativeText = `Mécène`;
                    //   break;
                    default:
                        name = `${file['name']}`;
                        alternativeText = `${file['alternativeText']}`;
                        break;
                }

                if (name.length > 190 - uploadPathLength) {
                    name = name.substring(0, 190 - uploadPathLength);
                }
                console.log('### Upload file NAME', name);
                // console.log("### Upload file", file);

                let createdFile;
                try {
                    createdFile =
                        await strapi.plugins.upload.services.upload.upload({
                            data: {
                                fileInfo: {
                                    name,
                                    alternativeText,
                                    caption: `filePath:${uploadPath}`,
                                },
                            },
                            files: file,
                        });
                } catch (e) {
                    console.log('Error creating file', e);
                    return false;
                }
                console.log('### Created file', createdFile);
                if (createdFile[0].id) {
                    console.log('### Entity', entityWithUUID);
                    console.log(
                        'fieldName',
                        fieldName,
                        componentToUpdate[fieldName],
                    );
                    const updatedItem = {
                        ...componentToUpdate,
                        [fieldName]: createdFile[0].id,
                    };
                    console.log('### New item', updatedItem);
                    // Récupération des autres composants non mis à jour + du composant mis à jour (Pour ne pas écraser les autres composants du même type)
                    fieldsToUpdate[dynamicZone] = [
                        ...entityWithUUID[dynamicZone].map((item: any) =>
                            item.__component === updatedItem.__component &&
                            item.id === updatedItem.id
                                ? updatedItem
                                : item,
                        ),
                    ];
                    console.log('### Fields to update', fieldsToUpdate);
                } else {
                    errorMsg.push(
                        'Field ' + fieldName + ' could not be created',
                    );
                }
                await strapi
                    .service('api::medias.medias')
                    .moveFileToFolder(
                        ctx,
                        componentToUpdate[fieldName],
                        createdFile[0].id,
                        uploadPath,
                        true,
                    );
            }
        }

        if (errorMsg.length > 0) {
            return ctx.badRequest(errorMsg.join(' - '));
        }
        return await strapi.documents(modelId as UID.ContentType).update({
            documentId: entityWithUUID.documentId,
            populate: '*',
            data: fieldsToUpdate,
        });
    },

    // *********************************************************************
    // Public method : moveFileToFolder
    // *********************************************************************
    async moveFileToFolder(
        ctx: Context,
        previousFile: any,
        newFileId: any,
        destinationPath: string,
        providerThumbnailMoveOnly: boolean = false,
    ) {
        console.log(
            '### Move file to folder',
            previousFile,
            newFileId,
            destinationPath,
        );
        const imagekitProvider = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });

        let newFile;
        newFile = await strapi
            .query('plugin::upload.file')
            .findOne({ where: { id: newFileId } });

        // *********************************************************************
        // Check if destinationPath (from API) and newFileFolderPath (from file) are the same
        // *********************************************************************
        console.log(
            '0. Check if destinationPath (from API) and newFileFolderPath (from file) are the same',
        );
        // ?.folderPath
        let newFileFolderPath = newFile.provider_metadata.filePath
            .split('/')
            .slice(0, -1)
            .join('/');
        destinationPath = destinationPath.replace(/\/$/, '');
        if (destinationPath !== newFileFolderPath) {
            console.error('Error: destinationPath !== newFile.folderPath');
            //return false;
        }

        // *********************************************************************
        // Delete previous File if exists and not if file is a SVG avatar
        // *********************************************************************
        await this.deleteFileIfNotAvatar(ctx, imagekitProvider, previousFile);

        // *********************************************************************
        // Create Strapi folder if not exists
        // *********************************************************************
        console.log('1. Create Strapi folder if not exists', destinationPath);
        const folders = await this.createStrapiFolderIfNotExists(
            ctx,
            destinationPath,
        );

        // *********************************************************************
        // Check if new file exists and is not an avatar SVG
        // *********************************************************************
        console.log('2. Check if new file exists and is not an avatar SVG');
        if (!newFile || newFile.provider_metadata.avatar) {
            console.log('File not found or is an avatar SVG');
            return true;
        }

        // *********************************************************************
        // Move file to folder Strapi (if folder exists)
        // *********************************************************************
        console.log('3. Move file to folder Strapi');
        if (folders[folders.length - 1]) {
            // Move file to folder Strapi
            newFile = await this.moveFileToStrapiFolder(
                ctx,
                folders[folders.length - 1],
                newFileId,
                'Avatar',
            );
        } else {
            console.error('Error creating Strapi folders');
            return false;
        }

        // *********************************************************************
        // Check if files already in ImageKit folder
        // *********************************************************************
        console.log('4. Check if files already in ImageKit folder');
        let shouldExit = false;
        shouldExit = await this.fileAlreadyInProviderFolder(
            imagekitProvider,
            newFile,
            destinationPath,
        );
        if (shouldExit && !providerThumbnailMoveOnly) {
            return true;
        }

        // *********************************************************************
        // Move file to folder ImageKit
        // *********************************************************************
        // console.log("5 Move file (thumbnail) to folder ImageKit");
        // await imagekitProvider.moveFile({
        //   sourceFilePath: newFile.formats.thumbnail.provider_metadata.filePath,
        //   destinationPath: destinationPath,
        // }).then(async response => {
        //   console.log("****************** THUMBNAIL MOVED to ", destinationPath, response);
        // }).catch(error => {
        //   console.log("Error moving thumbnail", error);
        // });

        // *********************************************************************
        // Move file (thumbnail) to folder ImageKit
        // *********************************************************************
        if (shouldExit && !!providerThumbnailMoveOnly) {
            return true;
        }
        console.log('6 Move file (original) to folder ImageKit');
        await imagekitProvider
            .moveFile({
                sourceFilePath: newFile.provider_metadata.filePath,
                destinationPath: destinationPath,
            })
            .then(async (response) => {
                console.log(
                    '****************** FILE MOVED to ',
                    destinationPath,
                    response,
                );
                const fileName = newFile.provider_metadata.filePath
                    .split('/')
                    .pop();
                // try imagekitProvider.listFiles until both files are found, 5 times max every 2 seconds
                let tries = 0;
                const interval = 2000;
                const maxTries = 14;
                // *********************************************************************
                // Move file (original) to folder ImageKit
                // *********************************************************************
                console.log('6.a. Search for files in ImageKit folder');
                const searchFiles = () => {
                    return new Promise((resolve, reject) => {
                        const attemptSearch = async (tries = 0) => {
                            await imagekitProvider
                                .listFiles({
                                    // searchQuery : '"customMetadata.strapiHash" IN ["' + newFile.hash + '","thumbnail_' + newFile.hash + '"]',
                                    searchQuery:
                                        '"customMetadata.strapiHash" IN ["' +
                                        newFile.hash +
                                        '"]',
                                    path: destinationPath,
                                })
                                .then(async (result) => {
                                    console.log(
                                        '######## LISTE #######',
                                        result.length,
                                    );
                                    if (result.length > 0) {
                                        // *********************************************************************
                                        // Update file metadata in Strapi
                                        // *********************************************************************
                                        console.log(
                                            '6.b. Update file metadata in Strapi',
                                        );
                                        const mainFileIndex = result.findIndex(
                                            (file) =>
                                                !file['customMetadata']
                                                    .thumbnail,
                                        );
                                        const thumbnailFileIndex =
                                            result.findIndex(
                                                (file) =>
                                                    !!file['customMetadata']
                                                        .thumbnail,
                                            );
                                        newFile.provider_metadata.fileId =
                                            result[mainFileIndex]['fileId'];
                                        newFile.provider_metadata.filePath =
                                            result[mainFileIndex]['filePath'];
                                        await strapi
                                            .query('plugin::upload.file')
                                            .update({
                                                where: { id: newFileId },
                                                data: {
                                                    provider_metadata:
                                                        newFile.provider_metadata,
                                                    url: result[mainFileIndex][
                                                        'url'
                                                    ],
                                                    // formats: {
                                                    //   thumbnail: {
                                                    //     ...newFile.formats.thumbnail,
                                                    //     url: result[thumbnailFileIndex].url,
                                                    //     provider_metadata: {
                                                    //       ...newFile.formats.thumbnail.provider_metadata,
                                                    //       fileId: result[thumbnailFileIndex].fileId,
                                                    //       filePath: result[thumbnailFileIndex].filePath,
                                                    //     }
                                                    //   }
                                                    // }
                                                },
                                            });
                                        resolve(1);
                                    } else if (tries < maxTries) {
                                        setTimeout(
                                            () => attemptSearch(tries + 1),
                                            interval,
                                        );
                                    } else {
                                        resolve(1);
                                    }
                                })
                                .catch(reject);
                        };
                        attemptSearch();
                    });
                };

                // Todo : check result is true, otherwise generate error
                const result = await searchFiles();
                console.log('Search result', result);
                return result;
            })
            .catch((error) => {
                console.log('Error moving file', error);
            });
        return true;
    },
    // *********************************************************************
    // Private methods
    // *********************************************************************
    async createStrapiFolderIfNotExists(ctx: Context, folderPath: string) {
        try {
            const folderService = strapi.plugins.upload.services.folder;
            const folders = [];
            const folderSlugs = folderPath
                .split('/')
                .filter((slug) => slug !== '');
            for (let i = 0; i < folderSlugs.length; i++) {
                const parent = i === 0 ? null : folders[i - 1];
                const folder = await strapi
                    .query('plugin::upload.folder')
                    .findOne({ where: { name: folderSlugs[i], parent } });
                if (!folder) {
                    console.log('   a. Creating Strapi folder', folderSlugs[i]);
                    folders.push(
                        await folderService.create({
                            name: folderSlugs[i],
                            parent: parent?.id,
                        }),
                    );
                } else {
                    folders.push(folder);
                }
            }
            return folders;
        } catch (e) {
            console.log('Error creating Strapi folder', e);
            return [];
        }
    },
    async deleteFileIfNotAvatar(ctx: Context, provider: any, file: any) {
        console.log(
            '0. Check if file exists and is not an avatar SVG',
            file?.id,
            file?.provider_metadata?.avatar,
        );
        if (file?.id && !file.provider_metadata.avatar) {
            await strapi.query('plugin::upload.file').delete({
                where: { id: file.id },
            });
            const currentEnv =
                process.env.IMAGEKIT_UPLOAD_ENVIRONMENT || 'production';
            let canDelete =
                currentEnv === file.provider_metadata?.uploadEnvironment;
            await provider
                .getFileDetails(file.provider_metadata.fileId)
                .then((response: any) => {
                    console.log(
                        '----- DELETE IMAGE KIT: file infos -----',
                        response,
                        file.provider_metadata.fileId,
                        response?.customMetadata,
                    );
                    canDelete =
                        currentEnv ===
                        response.customMetadata.uploadEnvironment;
                })
                .catch((error) => {
                    console.error(
                        '!!!!!!  DELETE IMAGE KIT FILE error !!!!!!',
                        error,
                        file.provider_metadata.fileId,
                    );
                });
            console.log(
                'Can delete',
                canDelete,
                currentEnv,
                file.provider_metadata?.uploadEnvironment,
            );
            if (!!canDelete) {
                try {
                    provider
                        .deleteFile(file.provider_metadata.fileId)
                        .then((response: any) => {
                            strapi.log.info(
                                `File deleted. ID:${file.provider_metadata.fileId}`,
                            );
                        })
                        .catch((error: any) => {
                            console.log('Delete File ERROR', error);
                        });
                    provider
                        .deleteFile(
                            file.formats['thumbnail'].provider_metadata.fileId,
                        )
                        .then((response: any) => {
                            strapi.log.info(
                                `File deleted. ID:${file.provider_metadata.fileId}`,
                            );
                        })
                        .catch((error: any) => {
                            console.log('Delete Thumbnail ERROR', error);
                        });
                } catch (e) {}
            }

            // todo: if many versions, delete them
            // imagekitProvider.getFileVersions(previousFile.provider_metadata.fileId).then(response => {
            //   console.log("File versions", response);
            // }).catch(error => {
            //   console.log(error);
            // });
        }
    },
    async moveFileToStrapiFolder(
        ctx: Context,
        folder: any,
        fileId: number,
        caption: any,
    ) {
        return await strapi.query('plugin::upload.file').update({
            where: { id: fileId },
            data: {
                caption,
                folderPath: folder.path,
            },
        });
    },
    async fileAlreadyInProviderFolder(
        provider: any,
        file: any,
        destinationPath: string,
    ) {
        return await provider
            .getFileDetails(file.provider_metadata.fileId)
            .then((response: any) => {
                const newFileFolderPath = response.filePath
                    .split('/')
                    .slice(0, -1)
                    .join('/');
                if (newFileFolderPath === destinationPath) {
                    console.log(
                        '--File found in ImageKit folder--',
                        destinationPath,
                    );
                    return true;
                } else {
                    console.log(
                        '--File not found in ImageKit folder--',
                        destinationPath,
                        'File is in ',
                        newFileFolderPath,
                    );
                    return false;
                }
            })
            .catch((error: any) => {
                console.log(error);
                return false;
            });
    },
};
