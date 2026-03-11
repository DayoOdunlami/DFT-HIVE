/**
 * GA4Script — injects the Google Analytics 4 gtag script.
 * Only renders when NEXT_PUBLIC_GA4_ID is set.
 * Import in app/handbook/layout.tsx inside <head>.
 */
import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export function GA4Script() {
  if (!GA4_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
