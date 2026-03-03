export default ({ env }: { env: any }) => ({
    'users-permissions': {
        enabled: true,
        config: {
            jwtSecret: env('JWT_SECRET'),
            register: {
                allowedFields: [
                    'confirmPassword',
                    'avatar',
                    'acceptConditions',
                    'uuid',
                ],
            },
        },
    },
    'email': {
        config: {
            provider: env('EMAIL_PROVIDER'),
            providerOptions: {
                host: env('EMAIL_SMTP_HOST', 'smtp-relay.brevo.com'),
                port: env('EMAIL_SMTP_PORT', 587),
                auth: {
                    user: env('EMAIL_SMTP_USER'),
                    pass: env('EMAIL_SMTP_PASS'),
                },
            },
            settings: {
                defaultFrom: env('EMAIL_ADDRESS_FROM', 'hello@donaction.fr'),
                defaultReplyTo: env('EMAIL_ADDRESS_REPLY', 'hello@donaction.fr'),
            },
        },
    },
    // ...

    'upload': {
        config: {
            provider: 'strapi-provider-upload-imagekit',
            providerOptions: {
                publicKey: env(
                    'IMAGEKIT_PUBLIC_KEY',
                    'public_RCyQUNInPm95n2AS1dPjEs/IUd8=',
                ),
                privateKey: env(
                    'IMAGEKIT_PRIVATE_KEY',
                    'private_eq9iVY+7xHjWAENqdbaE6CEWF2o=',
                ),
                urlEndpoint: env(
                    'IMAGEKIT_URL_ENDPOINT',
                    'https://ik.imagekit.io/donaction',
                ),
                params: {
                    folderAvatars: env('IMAGEKIT_STRAPI_AVATAR_FOLDER', '/11'),
                    folderAvatarsMen: env(
                        'IMAGEKIT_STRAPI_AVATAR_FOLDER_MEN',
                        '/11/12',
                    ),
                    folderAvatarsWomen: env(
                        'IMAGEKIT_STRAPI_AVATAR_FOLDER_WOMEN',
                        '/11/13',
                    ),
                    imagekitStrapiFolders: env(
                        'IMAGEKIT_STRAPI_FOLDERS',
                        '/11,/11/12,/11/13,/3,/20',
                    ),
                    imageKitStrapiFoldersMatch: env(
                        'IMAGEKIT_STRAPI_FOLDERS_MATCH',
                        '/Avatars,/Avatars/Men,/Avatars/Women,/Misc,/Pages',
                    ),
                    uploadEnvironment: env(
                        'IMAGEKIT_UPLOAD_ENVIRONMENT',
                        'production',
                    ),
                },
            },
            breakpoints: {
                xlarge: undefined,
                thumbnail: undefined,
            },
            //   actionOptions: {
            //     upload: {},
            //     delete: {},
            //   },
        },
    },
    'strapi-advanced-uuid': {
        enabled: true,
    },
    // "location-field": {
    //     enabled: true,
    //     config: {
    //         fields: ["photo", "rating"], // optional
    //         // You need to enable "Autocomplete API" and "Places API" in your Google Cloud Console
    //         googleMapsApiKey: env("GOOGLE_MAPS_API_KEY"),
    //         // See https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest
    //         autocompletionRequestOptions: {},
    //     },
    // },
});
