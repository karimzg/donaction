import getAccessToken from "./getAccessToken";
import {RECAPTCHA_KEY_URL} from "./endpoints";

interface IData {
    "displayName": string,
    "webSettings": {
        "allowedDomains": string[]
    },
}

export default async function updateRecaptchaKeyAuthorizedHosts(data: IData) {
    return new Promise(async (resolve, reject) => {
        try {
            /**
             * @Type {data}
             * {
             *     "displayName": string,
             *     "webSettings": {
             *        "allowedDomains": string[]
             *     },
             * }
             */
            const accessToken = await getAccessToken();

            const response = await fetch(RECAPTCHA_KEY_URL, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                console.log(response);
                reject(
                    `Failed to update Recaptcha key authorized hosts list: ${response.statusText}`
                );
            }

            const responseJson = await response.json();
            resolve(responseJson);
        } catch (e) {
            console.log(e);
            reject(`Error updating Recaptcha key authorized hosts list: ${e}`);
        }
    });
}
