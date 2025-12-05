const SibApiV3Sdk = require('sib-api-v3-sdk');

const apiKey = SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
apiKey.apiKey = process.env.EMAIL_BREVO_API_KEY;

export default async function getBrevoInstance(instanceName: string) {
    return new SibApiV3Sdk[instanceName]();
}
