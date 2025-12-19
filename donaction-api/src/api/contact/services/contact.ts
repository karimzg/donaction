/**
 * contact service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::contact.contact', ({ strapi}) => ({
    async sendMsgToAdmin(contact: {email: string; object: string; msg: string}) {
        const emailService = strapi.plugins['email'].services.email;
        const html = `<p>Email: ${contact.email}</p><p>Objet: ${contact.object}</p><p>Message: ${contact.msg}</p>`;
        const subject = `Nouveau message du formulaire de contact Donaction.fr | ${contact.object}`;
        return await emailService.send({
            to: 'hello@donaction.fr',
            bcc: 'k.zgoulli@gmail.com',
            from: contact.email,
            replyTo: contact.email,
            html,
            subject,
        });
    }
}));
