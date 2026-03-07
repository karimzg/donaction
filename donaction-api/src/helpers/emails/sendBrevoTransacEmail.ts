import getBrevoInstance from './getBrevoInstance';
import * as fs from 'fs';
import { ADMIN_EMAIL_PRIMARY, ADMIN_EMAIL_BCC } from './emailConstants';

export interface BrevoEmailRecipient {
    email: string;
    name?: string;
}

export interface BrevoEmailAttachment {
    filename: string;
    path: string;
}

export interface BrevoTransacEmailProps {
    /** Brevo template ID (use BREVO_TEMPLATES constants) */
    templateId: number;
    /** Template variables — Brevo accepts strings and numbers natively */
    params: Record<string, string | number>;
    /** Tags for categorization and analytics */
    tags: string[];
    /** Recipients — required unless destIsAdmin is true */
    to?: BrevoEmailRecipient[];
    /** Email subject — optional when template defines its own */
    subject?: string;
    /** Sender override — defaults to Klubr / hello@donaction.fr */
    from?: BrevoEmailRecipient;
    /** File attachments */
    attachments?: BrevoEmailAttachment[];
    /** When true, auto-routes to ADMIN_EMAIL_PRIMARY with ADMIN_EMAIL_BCC */
    destIsAdmin?: boolean;
}

const BREVO_TEMPLATES = {
    ADMIN_ALERT: 27,
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

async function sendBrevoTransacEmail(props: BrevoTransacEmailProps) {
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

            // When destIsAdmin is true, route to centralized admin email + BCC
            const recipients = props.destIsAdmin
                ? [{ email: ADMIN_EMAIL_PRIMARY, name: 'Admin Donaction' }]
                : props.to;
            const bcc = props.destIsAdmin
                ? [{ email: ADMIN_EMAIL_BCC }]
                : undefined;

            const res = await apiInstance.sendTransacEmail({
                subject: props.subject,
                from: props.from || { name: 'Klubr', email: 'hello@donaction.fr' },
                to:
                    process.env.EMAIL_BREVO_ENV !== 'prod'
                        ? [
                              // { email: 'hamach78@gmail.com' },
                              { email: 'k.zgoulli@gmail.com' },
                          ]
                        : recipients,
                bcc:
                    process.env.EMAIL_BREVO_ENV !== 'prod'
                        ? undefined
                        : bcc,
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
