import { Fetch } from '../../../utils/fetch';
import { FORM_CONFIG, SUBSCRIPTION } from './useSponsorshipForm.svelte';

/** Script patterns to detect the component entry point */
const SCRIPT_PATTERNS = [
  '/KlubrSponsorshipForm.es.js', // Production (pre-built)
  '/src/main.ts', // E2E/Dev mode (Vite transforms source)
  '/donaction-web-components/components/KlubrSponsorshipForm.es.js', // External integration
];

export async function initComponent(klubrUuid?: string, projectUuid?: string) {
  const script = Array.from(document.querySelectorAll('script')).find((s) =>
    SCRIPT_PATTERNS.some((pattern) => s.src.includes(pattern)),
  );

  const url = new URL(script?.src || '');
  const apiToken = url.searchParams.get('apiToken');

  if (!apiToken) {
    throw new Error("Can't find the api token");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await Fetch({
    endpoint: `/api/klubr-subscriptions/decrypt`,
    method: 'POST',
    data: {
      apiToken,
      klubrUuid,
      projectUuid,
    },
  });

  SUBSCRIPTION.allowProjectSelection = !result?.project;
  SUBSCRIPTION.allowKlubrContribution = result?.klubr?.trade_policy?.allowKlubrContribution;
  SUBSCRIPTION.token = apiToken;
  SUBSCRIPTION.klubr = result?.klubr;
  SUBSCRIPTION.project = result?.project;
  FORM_CONFIG.clubUuid = result.klubr.uuid;
  FORM_CONFIG.projectUuid = result?.project?.uuid || null;
}
