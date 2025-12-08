export function initGTag() {
  // Add GTM script dynamically
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GOOGLE_GA_TRACKING_ID}`; // Replace with your GTM ID
  document.head.appendChild(gtmScript);

  gtmScript.onload = () => {
    window.dataLayer = window.dataLayer || [];

    function gtag() {
      window.dataLayer.push(arguments);
    }

    window.gtag = gtag;
    // @ts-ignore
    window.gtag('js', new Date());
    window.gtag('config', import.meta.env.VITE_GOOGLE_GA_TRACKING_ID);
  };
}
