export default {
    routes: [
        {
            method: 'POST',
            path: '/stripe-connect/accounts',
            handler: 'stripe-connect.createAccount',
            config: {
                auth: {
                    scope: ['authenticated'],
                },
            },
        },
        {
            method: 'POST',
            path: '/stripe-connect/accounts/:accountId/onboarding-link',
            handler: 'stripe-connect.generateOnboardingLink',
            config: {
                auth: {
                    scope: ['authenticated'],
                },
            },
        },
        {
            method: 'POST',
            path: '/stripe-connect/accounts/:accountId/sync',
            handler: 'stripe-connect.syncAccount',
            config: {
                auth: {
                    scope: ['authenticated'],
                },
            },
        },
        {
            method: 'GET',
            path: '/stripe-connect/accounts/:accountId',
            handler: 'stripe-connect.getAccount',
            config: {
                auth: {
                    scope: ['authenticated'],
                },
            },
        },
        {
            method: 'POST',
            path: '/stripe-connect/webhook',
            handler: 'stripe-connect.handleWebhook',
            config: {
                auth: false, // Public endpoint - signature verification in middleware
                middlewares: [
                    'api::stripe-connect.verify-webhook-signature',
                ],
            },
        },
    ],
};
