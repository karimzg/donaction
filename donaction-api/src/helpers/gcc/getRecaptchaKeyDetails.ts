import getAccessToken from "./getAccessToken";
import {RECAPTCHA_KEY_URL} from "./endpoints";

interface IResponseJSON {
  "name": string,
  "displayName": string,
  "webSettings": {
    "allowAllDomains": boolean,
    "allowedDomains": string[],
    "allowAmpTraffic": boolean,
    "integrationType": string,
    "challengeSecurityPreference": string
  },
  "labels": {},
  "createTime": number
}
export default async function getRecaptchaKeyDetails(): Promise<IResponseJSON> {
  return new Promise(async (resolve, reject) => {
    try {
      /**
       * @type {responseJson}
       * {
       *     "name": string,
       *     "displayName": "Klubr - ReCaptcha API Key - Local",
       *     "webSettings": {
       *         "allowAllDomains": boolean,
       *         "allowedDomains": string[],
       *         "allowAmpTraffic": boolean,
       *         "integrationType": "SCORE",
       *         "challengeSecurityPreference": "CHALLENGE_SECURITY_PREFERENCE_UNSPECIFIED"
       *     },
       *     "labels": {},
       *     "createTime": DateTime
       * }
       */
      const accessToken: string = await getAccessToken();
      const response = await fetch(RECAPTCHA_KEY_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        reject(`Failed to get Recaptcha key details: ${response.statusText}`);
      }

      const responseJson = await response.json();
      resolve(responseJson as IResponseJSON);
    } catch (e) {
      console.log(e);
      reject(`Failed to get Recaptcha key details: ${e}`);
    }
  });
}