/**
 * contact service
 */

import { factories } from '@strapi/strapi';
import { sendEmailViaStrapiProvider } from '../../../helpers/emails/emailService';

export default factories.createCoreService('api::contact.contact', () => ({
    async sendMsgToAdmin(contact: { email: string; object: string; msg: string }) {
        const html = `<p>Email: ${contact.email}</p><p>Objet: ${contact.object}</p><p>Message: ${contact.msg}</p>`;
        const subject = `Nouveau message du formulaire de contact Donaction.fr | ${contact.object}`;

        return await sendEmailViaStrapiProvider({
            to: '',
            from: contact.email,
            replyTo: contact.email,
            html,
            subject,
            destIsAdmin: true,
        });
    },
}));
