import {GoogleAuth} from "google-auth-library";

export default async function getAccessToken(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
        console.log("000 - getAccessToken");
      const auth = new GoogleAuth({
        scopes: "https://www.googleapis.com/auth/cloud-platform",
      });
        console.log("000 - getAccessToken", auth);
      const client = await auth.getClient();
        console.log("001 - getAccessToken", client);
      const res = await client.getAccessToken();
        console.log("002 - getAccessToken", res?.token);

      resolve(res?.token);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  })
}
