/**
 * Lightweight analytics event tracking.
 * Dispatches events to Umami (if configured) and provides a type-safe
 * interface for tracking key user actions across the app.
 */

type EventName =
  | "signup_start"
  | "signup_complete"
  | "signin"
  | "profile_create"
  | "compatibility_check"
  | "report_view"
  | "report_share"
  | "upgrade_click"
  | "upgrade_complete"
  | "chat_start"
  | "chat_message"
  | "quick_match"
  | "onboarding_complete"
  | "install_prompt_shown"
  | "install_accepted";

interface EventData {
  [key: string]: string | number | boolean;
}

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, string | number>) => void;
    };
  }
}

/**
 * Track a user action. Fires to Umami if available, and logs in development.
 */
export function trackEvent(name: EventName, data?: EventData): void {
  // Umami analytics
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(name, data as Record<string, string | number>);
  }

  // Development logging
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${name}`, data || "");
  }
}

/**
 * Track a page view with custom properties.
 */
export function trackPageView(path: string, referrer?: string): void {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track("page_view", { path, ...(referrer ? { referrer } : {}) });
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] page_view`, { path, referrer });
  }
}
