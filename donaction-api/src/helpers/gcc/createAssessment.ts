import getAccessToken from "./getAccessToken";
import {RECAPTCHA_ASSESSMENT_URL} from "./endpoints";
// TODO: CHECK
// import fetch from "node-fetch";

const SCORE_THRESHOLD = 0.5;

interface IResponseJson {
  tokenProperties: {
    valid: boolean;
    invalidReason?: string;
    action: string;
  },
  riskAnalysis: {
    score: number;
    reasons: Array<any>;
  }
}
export default async function createAssessment({ token = "", recaptchaAction = "" }) {
  return new Promise(async (resolve, reject) => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(RECAPTCHA_ASSESSMENT_URL, {
        method: "POST",
        body: JSON.stringify({
          event: {
            token,
            siteKey: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
            expectedAction: recaptchaAction,
          },
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        reject(`Failed to create recaptcha assessment: ${response.statusText}`);
      }

      const responseJson = await response.json() as IResponseJson;

      if (!responseJson?.tokenProperties?.valid) {
        console.log(
          `The CreateAssessment call failed because the token was: ${responseJson?.tokenProperties?.invalidReason}`
        );
        resolve(null);
      }
      if (responseJson?.tokenProperties?.action === recaptchaAction) {
        console.log(
          `The reCAPTCHA score is: ${
            responseJson?.riskAnalysis?.score
          }, threshold is: ${SCORE_THRESHOLD}, isHuman: ${
            responseJson?.riskAnalysis?.score >= SCORE_THRESHOLD
          }`
        );
        responseJson?.riskAnalysis?.reasons.forEach((reason) => {
          console.log(reason);
        });

        resolve(
          responseJson?.riskAnalysis?.score > SCORE_THRESHOLD
            ? responseJson?.riskAnalysis?.score
            : null
        );
      } else {
        console.log(
          "The action attribute in your reCAPTCHA tag does not match the action you are expecting to score"
        );
        resolve(null);
      }
    } catch (e) {
      resolve(null);
    }
  });
}

