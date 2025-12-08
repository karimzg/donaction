const API_KEY_URL = `https://apikeys.googleapis.com/v2/projects/${process.env.GOOGLE_PROJECT_NUMBER}/locations/global/keys/${process.env.GOOGLE_API_KEY_ID}`;
const RECAPTCHA_KEY_URL = `https://recaptchaenterprise.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID}/keys/${process.env.GOOGLE_RECAPTCHA_SITE_KEY}`;
const RECAPTCHA_ASSESSMENT_URL = `https://recaptchaenterprise.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID}/assessments`;

export {
    API_KEY_URL,
    RECAPTCHA_KEY_URL,
    RECAPTCHA_ASSESSMENT_URL
}
