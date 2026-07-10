import { useEffect } from 'react';
import { readCookieConsent } from './useFacilCookieConsent';

const GA_ID = 'G-LTTHTJ6JBC';

export function useFacilAnalytics() {
  useEffect(() => {
    const consent = readCookieConsent();
    if (!consent?.analytics) return;

    const scriptId = 'facil-ga-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    `;
    document.head.appendChild(inline);
  }, []);
}
