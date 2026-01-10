/**
 * newsletter controller
 */

import { factories } from '@strapi/strapi';
import createAssessment from '../../../helpers/gcc/createAssessment';
import { removeId } from '../../../helpers/sanitizeHelpers';

export default factories.createCoreController(
    'api::newsletter.newsletter',
    ({ strapi }) => ({
        async create(ctx) {
            const { formToken, ...cleanData } = ctx.request.body?.data || {};
            if (!formToken) {
                return ctx.badRequest('Missing reCaptcha token.');
            }
            ctx.request.body.data = cleanData;
            const result = await createAssessment({
                token: formToken,
                recaptchaAction: 'CREATE_NEWSLETTER_FORM',
            });
            if (!result) {
                return ctx.badRequest('Captcha verification failed');
            }
            const entity = await super.create(ctx);
            if (entity) {
                await strapi.services[
                    'api::newsletter.newsletter'
                ].sendMsgToAdmin(entity.data.attributes);
            }
            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },
    }),
);
