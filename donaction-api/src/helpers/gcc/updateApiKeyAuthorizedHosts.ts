import getAccessToken from "./getAccessToken";
import {API_KEY_URL} from "./endpoints";

interface IData {
  "restrictions": {
    "browserKeyRestrictions": {
      "allowedReferrers": string[]
    }
  },
}
export default async function updateApiKeyAuthorizedHosts(data: IData) {
  return new Promise(async (resolve, reject) => {
    try {
      /**
       * @Type {data}
       * {
       *     "restrictions": {
       *         "browserKeyRestrictions": {
       *             "allowedReferrers": string[]
       *         }
       *     },
       * }
       */
      const accessToken: string = await getAccessToken();
      const response = await fetch(`${API_KEY_URL}?updateMask=restrictions`, {
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
          `Failed to update Api key authorized hosts list: ${response.statusText}`
        );
      }

      const responseJson = await response.json();
      resolve(responseJson);
    } catch (e) {
      console.log(e);
      reject(`Error updating api key authorized hosts list: ${e}`);
    }
  });
}
