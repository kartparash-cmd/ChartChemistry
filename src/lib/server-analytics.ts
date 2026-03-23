/**
 * Server-side event logging for revenue and funnel events.
 *
 * Outputs structured JSON to stdout (picked up by Vercel logs) and
 * optionally forwards events to the Umami server-side tracking API
 * when NEXT_PUBLIC_UMAMI_URL and NEXT_PUBLIC_UMAMI_SITE_ID are set.
 */

type ServerEventName =
  | "revenue_upgrade"
  | "revenue_single_report"
  | "revenue_payment_failed"
  | "revenue_churn"
  | "report_generated"
  | "user_signup";

interface ServerEventData {
  [key: string]: string | number | boolean | null | undefined;
}

interface ServerEvent {
  event: ServerEventName;
  timestamp: string;
  userId?: string;
  metadata?: ServerEventData;
}

/**
 * Log a server-side analytics event.
 *
 * 1. Writes structured JSON to console.log (appears in Vercel function logs).
 * 2. Fires a non-blocking POST to the Umami server-side API if configured.
 */
export function logServerEvent(
  eventName: ServerEventName,
  data: ServerEventData = {}
): void {
  const { userId, ...metadata } = data;

  const entry: ServerEvent = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...(userId ? { userId: String(userId) } : {}),
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
  };

  // 1. Structured log for Vercel
  console.log(JSON.stringify(entry));

  // 2. Forward to Umami server-side API (fire-and-forget)
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiSiteId = process.env.NEXT_PUBLIC_UMAMI_SITE_ID;

  if (umamiUrl && umamiSiteId) {
    fetch(`${umamiUrl}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "ChartChemistry/1.0 (server)" },
      body: JSON.stringify({
        type: "event",
        payload: {
          website: umamiSiteId,
          name: eventName,
          url: "/server",
          data: { ...metadata, ...(userId ? { userId: String(userId) } : {}) },
        },
      }),
    }).catch((err) => {
      console.warn(`[server-analytics] Umami send failed: ${err instanceof Error ? err.message : "unknown"}`);
    });
  }
}
