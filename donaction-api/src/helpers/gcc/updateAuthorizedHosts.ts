import getApiKeyDetails from './getApiKeyDetails';
import getRecaptchaKeyDetails from './getRecaptchaKeyDetails';
import updateApiKeyAuthorizedHosts from './updateApiKeyAuthorizedHosts';
import updateRecaptchaKeyAuthorizedHosts from './updateRecaptchaKeyAuthorizedHosts';

async function updatedApiKey({ host, remove }) {
    return new Promise(async (resolve, reject) => {
        try {
            const apiKeyDetails = await getApiKeyDetails();
            const response = await updateApiKeyAuthorizedHosts({
                restrictions: {
                    browserKeyRestrictions: {
                        allowedReferrers: Array.from(
                            new Set(
                                [
                                    ...(apiKeyDetails?.restrictions
                                        ?.browserKeyRestrictions
                                        ?.allowedReferrers || []),
                                    host,
                                ].filter((_) => (!remove ? true : _ !== host)),
                            ),
                        ),
                    },
                },
            });
            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
}

async function updateRecaptchaKey({ host, remove }) {
    return new Promise(async (resolve, reject) => {
        try {
            const formatHost = (url) =>
                url
                    .replace(/^https?:\/\//, '')
                    .replace(/:\d+$/, '')
                    .replace(/\/.*$/, '');
            const recaptchaKeyDetails = await getRecaptchaKeyDetails();
            const allowedDomains = Array.from(
                new Set(
                    [
                        ...(recaptchaKeyDetails?.webSettings?.allowedDomains ||
                            []),
                        host,
                    ]
                        .map((url) => formatHost(url))
                        .filter((_) =>
                            !remove ? true : _ !== formatHost(host),
                        ),
                ),
            );
            const response = await updateRecaptchaKeyAuthorizedHosts({
                displayName: recaptchaKeyDetails?.displayName,
                webSettings: {
                    allowedDomains:
                        allowedDomains.length > 0
                            ? allowedDomains
                            : ['donaction.fr'],
                },
            });
            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
}

export default async function updateAuthorizedHosts({ host, remove }): Promise<{
    resApiKey: any;
    resRecaptchaKey: any;
}> {
    return new Promise(async (resolve, reject) => {
        try {
            const resApiKey = await updatedApiKey({
                host,
                remove,
            });
            const resRecaptchaKey = await updateRecaptchaKey({
                host,
                remove,
            });

            resolve({
                resApiKey,
                resRecaptchaKey,
            });
        } catch (e) {
            reject(e);
        }
    });
}
