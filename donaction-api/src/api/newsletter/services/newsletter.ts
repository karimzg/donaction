/**
 * newsletter service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService(
    'api::newsletter.newsletter',
    ({ strapi }) => ({
        async sendMsgToAdmin(newsletter: { email: string }) {
            console.log('sendMsgToAdmin', newsletter);
            const emailService = strapi.plugins['email'].services.email;
            const html = `<p>Email: ${newsletter.email}</p>`;
            const subject = `Nouvel inscrit à la newsletter Klubr.fr`;
            return await emailService.send({
                to: 'hello@klubr.fr',
                bcc: 'k.zgoulli@gmail.com',
                from: newsletter.email,
                replyTo: newsletter.email,
                html,
                subject,
            });
        },
    }),
);
