import 'source-map-support/register';
import type { Core } from '@strapi/strapi';
import ImageKit from 'imagekit';
import UsersPermissionsInitializer from './helpers/users-extensions/_index';

const imagekitProvider = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export default {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    async register({ strapi }: { strapi: Core.Strapi }) {
        await UsersPermissionsInitializer(strapi.plugin('users-permissions'));
    },

    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    // bootstrap(/*{ strapi }*/) {},
    // CODE TO ADD LIFECYCLE TO USERS-PERMISSION
    async bootstrap({ strapi }: { strapi: Core.Strapi }) {
        strapi.db.lifecycles.subscribe(async (event) => {
            if (
                event.model.uid === 'plugin::upload.file' &&
                event.action === 'beforeCreate'
            ) {
                console.log(
                    '*************** EVENT *****************',
                    event.action,
                );
                console.log('*************** ', event.model.uid);
                if (event.params.data?.provider_metadata) {
                    const currentEnv =
                        process.env.IMAGEKIT_UPLOAD_ENVIRONMENT || 'production';
                    console.log('Current environment', currentEnv);
                    console.log(
                        '-----Provider metadata',
                        event.params.data.provider_metadata,
                    );
                    console.log(
                        '-----Provider fileId',
                        event.params.data.provider_metadata.fileId,
                    );

                    if (
                        currentEnv !==
                        event.params.data.provider_metadata.uploadEnvironment
                    ) {
                        let uploadEnvironmentNew = currentEnv;
                        switch (currentEnv) {
                            case 'development':
                            case 'staging':
                                uploadEnvironmentNew =
                                    event.params.data.provider_metadata
                                        .uploadEnvironment !== 'production'
                                        ? 'staging'
                                        : 'production';
                                break;
                        }
                        event.params.data.provider_metadata.uploadEnvironment =
                            uploadEnvironmentNew;
                        if (event.params.data.formats?.thumbnail) {
                            event.params.data.formats.thumbnail.provider_metadata.uploadEnvironment =
                                uploadEnvironmentNew;
                        }
                        await imagekitProvider
                            .updateFileDetails(
                                event.params.data.provider_metadata.fileId,
                                {
                                    customMetadata: {
                                        uploadEnvironment:
                                            event.params.data.provider_metadata
                                                .uploadEnvironment,
                                    },
                                },
                            )
                            .then((response) => {
                                console.log(
                                    'Metadata updated to ',
                                    event.params.data.provider_metadata
                                        .uploadEnvironment,
                                );
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                        if (event.params.data.formats?.thumbnail) {
                            await imagekitProvider
                                .updateFileDetails(
                                    event.params.data.formats.thumbnail
                                        .provider_metadata.fileId,
                                    {
                                        customMetadata: {
                                            uploadEnvironment:
                                                event.params.data
                                                    .provider_metadata
                                                    .uploadEnvironment,
                                        },
                                    },
                                )
                                .then((response) => {
                                    console.log(
                                        'Metadata thumbnail updated to ',
                                        event.params.data.provider_metadata
                                            .uploadEnvironment,
                                        response,
                                    );
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        }
                    }
                }
                console.log(
                    '***************************************************************************  ',
                );
            }
            // if (event.action === 'beforeFindOne' && event.model.uid === 'plugin::upload.folder') {
            //   console.log("-----Before Find One FOLDER", event);
            // } else if (event.action === 'afterFindOne' && event.model.uid === 'plugin::upload.folder'){
            //   console.log("-----Before Find One CORE", event);
            // } else if (event.action === 'beforeFindOne' && event.model.uid === 'strapi::core-store'){
            //   console.log("-----Before Find One CORE", event);
            // } else {
            //   console.log("*************** ", event.params);
            // }
            // console.log("*************************************************************************** ");
            // if (event.action === 'beforeCreate') {
            //   // do something
            // }
        });

        strapi.db.lifecycles.subscribe({
            models: ['plugin::users-permissions.user'],
            // async afterCreate(event) {
            //   console.log("afterCreate", event.result);
            //   // your code here
            //   // strapi.entityService.create('api::user-detail.user-detail', {
            //   //   data: {
            //   //     nick: event.result.username,
            //   //     users_permissions_user: event.result.id,
            //   //     // This enforces user-detail as published, instead of just a draft
            //   //     // https://forum.strapi.io/t/creating-entry-from-controller-goes-to-draft/22501/2
            //   //     publishedAt: new Date().getTime()
            //   //   },
            //   // });
            // },
            //async beforeCreate(event) {
            //  console.log("beforeCreate", event);
            //  if (event.model.uid === "plugin::upload.file") {
            //    console.log("File creation", event.params);
            //  }
            //},

            /* REMOVED: use /medias/user/{{uuid}}/files to set user.avatar */
            // async beforeUpdate(event) {
            //   const userId = event.params.where.id;
            //   const data = event.params.data;
            //   const previousUser = await strapi.db.query("plugin::users-permissions.user").findOne({
            //     where: { id: userId },
            //     populate: {
            //       avatar: true,
            //     }
            //   });
            //   if (data?.avatar) {
            //     const avatarId = data.avatar;
            //     if (avatarId !== previousUser.avatar?.id) {
            //       await strapi
            //         .service("api::klubr.klubr")
            //         .moveFileToFolder(null, previousUser.avatar, avatarId, `/Users`);
            //     }
            //   }
            //
            //
            //   // const connectionCode = event.params.data.code;
            //   // console.log("connectionCode", connectionCode);
            //   // if (connectionCode) {
            //   //   const member = await strapi.entityService.findMany("api::klubr-membre.klubr-membre", {
            //   //     filters: {
            //   //       code: {
            //   //         $eq: connectionCode
            //   //       }
            //   //     },
            //   //     fields: ['role', 'uuid', 'fonction'],
            //   //     populate: {
            //   //       users_permissions_user: true,
            //   //     }
            //   //   });
            //   //   console.log("Member", member);
            //   //   if (!member || member.length === 0) {
            //   //     event.state = 'Member not found';
            //   //     console.log("Member not found");
            //   //     throw new ForbiddenError(errorMessage);
            //   //   }
            //   //   // const userToUpdate = await strapi.entityService.findOne("plugin::users-permissions.user", );
            //   //
            //   //   // Check if user.role is already set and if klubr_membres.role differs from user.role
            //   //   console.log("Member role", member[0].role);
            //   //   // if (member[0].role && member[0].role !== event.result.role) {
            //   //   //   event.state = 'Member role differs from user role';
            //   //   //   console.log("Member role differs from user role");
            //   //   //   return;
            //   //   // }
            //   //   //
            //   //   // // update relation User.klubr_membres
            //   //   // event.params.data.klubr_membres = [member[0].id];
            //   // }
            //   // your code here
            //   // strapi.entityService.create('api::user-detail.user-detail', {
            //   //   data: {
            //   //     nick: event.result.username,
            //   //     users_permissions_user: event.result.id,
            //   //     // This enforces user-detail as published, instead of just a draft
            //   //     // https://forum.strapi.io/t/creating-entry-from-controller-goes-to-draft/22501/2
            //   //     publishedAt: new Date().getTime()
            //   //   },
            //   // });
            // }
        });
    },
};
