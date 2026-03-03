/**
 * newsletter service
 */

import { factories } from '@strapi/strapi';
import { sendEmailViaStrapiProvider } from '../../../helpers/emails/emailService';

export default factories.createCoreService(
    'api::newsletter.newsletter',
    () => ({
        async sendMsgToAdmin(newsletter: { email: string }) {
            const html = `<p>Email: ${newsletter.email}</p>`;
            const subject = `Nouvel inscrit à la newsletter Donaction.fr`;

            return await sendEmailViaStrapiProvider({
                to: '',
                from: newsletter.email,
                replyTo: newsletter.email,
                html,
                subject,
                destIsAdmin: true,
            });
        },
    }),
);
