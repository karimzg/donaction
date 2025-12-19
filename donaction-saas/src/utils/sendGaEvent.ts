import { SUBSCRIPTION } from '../components/sponsorshipForm/logic/useSponsorshipForm.svelte';

const analyticsEnabled = import.meta.env.VITE_ACTIVATE_ANALYTICS === 'true';
export const sendGaEvent = (data: {
  category?: string;
  label?: string;
  value?: number;
  path?: string;
  step?: number;
  klub_slug?: string;
  project_slug?: string;
  klub_uuid?: string;
  project_uuid?: string;
  revenue?: any;
}) => {
  if (analyticsEnabled && window.plausible) {
    window.plausible(data?.category || 'custom_event', {
      props: {
        // step: data?.step,
        // value: data?.value,
        event_label: `${data?.label || data?.category}${data?.step ? ' => step: ' + data?.step : ''}`,
        klub_slug: SUBSCRIPTION.klubr?.slug,
        // klub_uuid: SUBSCRIPTION.klubr?.uuid,
        project_slug: SUBSCRIPTION.project?.slug,
        // project_uuid: SUBSCRIPTION.project?.uuid,
        revenue: data?.revenue,
        from_sponsorship_form: true
        // page_path: window.location.href
      }
    });
  }
};
