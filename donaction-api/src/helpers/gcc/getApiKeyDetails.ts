import getAccessToken from "./getAccessToken";
import {API_KEY_URL} from "./endpoints";
import logger from "../../../config/logger";


interface IResponseJSON {
    "name": string,
    "displayName": string,
    "createTime": number,
    "uid": string,
    "updateTime": number,
    "restrictions": {
        "browserKeyRestrictions": {
            "allowedReferrers": string[]
        }
    },
    "etag": string
}

export default async function getApiKeyDetails(): Promise<IResponseJSON> {
    return new Promise(async (resolve, reject) => {
        try {
            /**
             * @type {responseJson}
             * {
             *     "name": string,
             *     "displayName": "Klubr - Maps/Analytics/Recaptcha API Key - Local",
             *     "createTime": DateTime,
             *     "uid": string,
             *     "updateTime": DateTime,
             *     "restrictions": {
             *         "browserKeyRestrictions": {
             *             "allowedReferrers": string[]
             *         }
             *     },
             *     "etag": string
             * }
             */
            console.log("00 - getApiKeyDetails called");
            const accessToken: string = await getAccessToken();
            console.log("01 - accessToken", accessToken);
            console.log("01 - API_KEY_URL", API_KEY_URL);
            const response = await fetch(API_KEY_URL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                reject(`Failed to get Api key details: ${response.statusText}`);
            }

            const responseJson = await response.json();
            resolve(responseJson as IResponseJSON);
        } catch (e) {
            console.log(e);
            reject(`Failed to get Api key details: ${e}`);
        }
    });
}
