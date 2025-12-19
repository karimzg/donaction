import {GoogleAuth} from "google-auth-library";

export default async function getAccessToken(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const auth = new GoogleAuth({
        scopes: "https://www.googleapis.com/auth/cloud-platform",
      });

      const client = await auth.getClient();
      const res = await client.getAccessToken();

      resolve(res?.token);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  })
}
