/**
 * klub-don-payment router. by klub
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/klub-don-payments/check',
            handler: 'klub-don-payment.check',
            config: {},
        },
        {
            method: 'POST',
            path: '/klub-don-payments/stripe-web-hooks',
            handler: 'klub-don-payment.stripeWebHooks',
            config: {
                auth: false, // Webhooks don’t require authentication
            },
        },
        {
            method: 'POST',
            path: '/klub-don-payments/create-payment-intent',
            handler: 'klub-don-payment.createPaymentIntent',
            config: {},
        },
    ],
};
