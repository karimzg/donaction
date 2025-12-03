/**
 * contact service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::contact.contact', ({ strapi}) => ({
    async sendMsgToAdmin(contact: {email: string; object: string; msg: string}) {
        const emailService = strapi.plugins['email'].services.email;
        const html = `<p>Email: ${contact.email}</p><p>Objet: ${contact.object}</p><p>Message: ${contact.msg}</p>`;
        const subject = `Nouveau message du formulaire de contact Klubr.fr | ${contact.object}`;
        return await emailService.send({
            to: 'hello@klubr.fr',
            bcc: 'k.zgoulli@gmail.com',
            from: contact.email,
            replyTo: contact.email,
            html,
            subject,
        });
    }
}));
