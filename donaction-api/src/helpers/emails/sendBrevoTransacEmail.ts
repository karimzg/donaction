import getBrevoInstance from './getBrevoInstance';
import * as fs from 'fs';

const BREVO_TEMPLATES = {
    FORGOT_PASSWORD: 9,
    MEMBER_INVITATION: 5,
    MEMBER_RELAUNCH: 24,
    CLUB_CAMPAIGN: 16,
    CLUB_CREATION: 11,
    CLUB_INVOICE: 13,
    PROJECT_VALIDATION: 10,
    DONATION_ADMIN_NOTIFICATION: 7,
    DONATION_DONOR_CONFIRMATION: 8,
    DONATION_DONOR_RELAUNCH: 21,
};

async function sendBrevoTransacEmail(props: any) {
    return new Promise(async (resolve, reject) => {
        try {
            const apiInstance = await getBrevoInstance(
                'TransactionalEmailsApi',
            );
            const formattedAttachments = props?.attachments?.map(
                (attachment: any) => {
                    const fileContent = fs
                        .readFileSync(attachment.path)
                        .toString('base64');
                    return {
                        name: attachment.filename,
                        content: fileContent,
                    };
                },
            );
            const res = await apiInstance.sendTransacEmail({
                subject: props.subject,
                from: props.from || { name: 'Klubr', email: 'hello@donaction.fr' },
                to:
                    process.env.EMAIL_BREVO_ENV !== 'prod'
                        ? [
                              // { email: 'hamach78@gmail.com' },
                              { email: 'k.zgoulli@gmail.com' },
                          ]
                        : props.to,
                templateId: props.templateId,
                params: {
                    ...props.params,
                    NEXT_URL: process.env.NEXTAUTH_URL,
                    SHOW_SOCIAL_MEDIA_LINKS:
                        process.env.SHOW_SOCIAL_MEDIA_LINKS,
                },
                attachment: formattedAttachments,
                tags: [...props.tags, `env-${process.env.EMAIL_BREVO_ENV}`],
            });
            resolve(res);
        } catch (e) {
            reject(e);
        }
    });
}

export { sendBrevoTransacEmail, BREVO_TEMPLATES };
