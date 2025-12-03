export default {
    routes: [
        {
            method: 'POST',
            path: '/klubr-subscriptions/decrypt',
            handler: 'klubr-subscription.decrypt',
            config: {
                policies: [],
            },
        },
    ],
};
