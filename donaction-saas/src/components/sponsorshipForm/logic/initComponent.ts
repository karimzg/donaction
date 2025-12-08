import { Fetch } from '../../../utils/fetch';
import { FORM_CONFIG, SUBSCRIPTION } from './useSponsorshipForm.svelte';

export async function initComponent(klubrUuid?: string, projectUuid?: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const script = Array.from(document.querySelectorAll('script')).find((script) =>
        script.src.includes(
          // TODO: @Med make this conditional
          '/KlubrSponsorshipForm.es.js' // For local tests
          // '/donaction-web-components/components/KlubrSponsorshipForm.es.js' // For integration with other sites
        )
      );

      const url = new URL(script?.src || '');
      const apiToken = url.searchParams.get('apiToken');

      if (!apiToken) {
        throw new Error("Can't find the api token");
      }

      const result = await Fetch({
        endpoint: `/api/klubr-subscriptions/decrypt`,
        method: 'POST',
        data: {
          apiToken,
          klubrUuid,
          projectUuid
        }
      });

      SUBSCRIPTION.allowProjectSelection = !result?.project;
      SUBSCRIPTION.allowKlubrContribution = result?.klubr?.trade_policy?.allowKlubrContribution;
      SUBSCRIPTION.token = apiToken;
      SUBSCRIPTION.klubr = result?.klubr;
      SUBSCRIPTION.project = result?.project;
      FORM_CONFIG.clubUuid = result.klubr.uuid;
      FORM_CONFIG.projectUuid = result?.project?.uuid || null;
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
