export default ({ env }) => ({
    // url: env('ADMIN_URL', '/service/admin'),
    flags: {
        nps: env.bool('FLAG_NPS', true),
        promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    watchIgnoreFiles: ['**/private-pdf/**'],
    auth: {
        secret: env('ADMIN_JWT_SECRET', '4kF4QMfpfadDzmPbnAPO7g'), // to be verified later
    },
    apiToken: {
        salt: env('API_TOKEN_SALT', 'randomlyGeneratedSalt123'), // to be verified later
    },
    transfer: {
        token: {
            salt: env('TRANSFER_TOKEN_SALT', 'randomlyGeneratedSalt123'), // to be verified later
        },
    },
    autoReload: {
        enabled: true,
        interval: 500,
    },
    admin: {
        watchAdmin: true,
    },
});
