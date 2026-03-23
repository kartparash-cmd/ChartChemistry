"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cookie-consent-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cookie-consent-change", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem("cookie-consent") === "accepted";
}

function getServerSnapshot() {
  return false;
}

export function AnalyticsLoader() {
  const consented = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!consented) return null;

  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiSiteId = process.env.NEXT_PUBLIC_UMAMI_SITE_ID;

  if (!umamiUrl || !umamiSiteId) return null;

  return (
    <Script
      src={`${umamiUrl}/script.js`}
      data-website-id={umamiSiteId}
      strategy="afterInteractive"
    />
  );
}
