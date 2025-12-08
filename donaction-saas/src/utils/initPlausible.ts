export enum WC_COMPONENTS {
  'klubrSponsorshipForm' = 'klubr-sponsorship-form'
}

export function initPlausible() {
  const script = document.createElement('script');
  script.src =
    import.meta.env.VITE_PLAUSIBLE_DATA_DOMAIN === 'donaction.fr-local'
      ? 'https://plausible.io/js/script.revenue.local.js'
      : 'https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js';
  script.setAttribute('data-domain', import.meta.env.VITE_PLAUSIBLE_DATA_DOMAIN);
  script.defer = true;

  const scriptDoc = document.createElement('script');
  scriptDoc.innerHTML = `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`;
  document.head?.appendChild(script);
  document.head?.appendChild(scriptDoc);
}
