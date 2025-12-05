export const createRecaptchaToken = (siteKey: string, action: 'CREATE_CONTACT_FORM'): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      grecaptcha.enterprise.ready(async () => {
        const formToken = await grecaptcha.enterprise.execute(siteKey, { action });
        resolve(formToken);
      });
    } catch (e) {
      reject(null);
    }
  });
};
