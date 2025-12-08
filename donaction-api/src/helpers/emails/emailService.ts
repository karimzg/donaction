// export interface email {
//   to: string;
//   from: string;
//   html: string;
//   subject: string;
//   tags: string[];
// }
const SibApiV3Sdk = require('sib-api-v3-sdk');
const fs = require('fs');

const sendEmailViaStrapiProvider = async (emailPayload) => {
    console.log('sendEmailViaStrapiProvider');
    const emailService = strapi.plugins['email'].services.email;
    const { to, from, html, subject, attachments, tags } = emailPayload;
    return await emailService.send({
        to,
        from: 'hello@donaction.fr',
        html,
        subject,
        attachments,
    });
};

export default async function sendEmail(emailPayload) {
    console.log('sendEmail');

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_BREVO_API_KEY;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    let { to, cc, bcc, from, html, subject, attachments, tags } = emailPayload;
    let senderName = 'Klubr';

    // Set sender name based on tags
    if (
        tags.includes('email-don-donateur') ||
        tags.includes('email-don-club-leader')
    ) {
        senderName = 'Klubr | Dons';
    } else if (
        tags.includes('email-project-request-validation') ||
        tags.includes('email-project-validation')
    ) {
        senderName = 'Klubr | Projet';
    } else if (
        tags.includes('email-invitation-club') ||
        tags.includes('email-invitation-membre')
    ) {
        senderName = 'Klubr | Invitation';
    }
    // Add environment tag
    tags = [...tags, `env-${process.env.EMAIL_BREVO_ENV}`];
    // Format attachments
    const formattedAttachments = attachments?.map((attachment) => {
        const fileContent = fs.readFileSync(attachment.path).toString('base64');
        return {
            name: attachment.filename,
            content: fileContent,
        };
    });
    // !!attachments && console.log('attachments', attachments);

    sendSmtpEmail = {
        to:
            process.env.ENVIRONMENT === 'production'
                ? [
                      {
                          email: to,
                      },
                  ]
                : [
                      { email: 'hamach78@gmail.com' },
                      { email: 'k.zgoulli@gmail.com' },
                  ],
        sender: {
            email: from || 'hello@donaction.fr',
            name: senderName,
        },
        subject,
        htmlContent: html,
        // templateId: 5,
        // params: {
        //   name: 'John',
        //   surname: 'Doe'
        // },
        attachment: formattedAttachments,
        tags,
        bcc: bcc
            ? [
                  {
                      email: bcc,
                      // name: 'Karim Z.',
                  },
              ]
            : undefined,
        // headers: {
        //   'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
        // }
    };

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        // console.log('-----------------------------------------------------------');
        // console.log('API called successfully. Returned data: ');
        // console.log(data);
        // console.log('Sender > dest', from, senderName, to);
        // console.log('-----------------------------------------------------------');
        return data;
    } catch (error) {
        // console.log('-----------------------------------------------------------');
        // console.log('API called ERROR. Returned data: ');
        // console.error(error);
        // console.log('Sender > dest', from, senderName, to);
        // console.log('-----------------------------------------------------------');
        throw error;
    }
}
