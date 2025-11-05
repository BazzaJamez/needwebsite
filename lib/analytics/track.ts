/**
 * Analytics tracking
 * 
 * No-op console logger for development; vendor hook ready for production.
 * All events include: actorId, ip, userAgent, ts per domain model.
 */

type EventProperties = Record<string, unknown> & {
  actorId?: string;
  ip?: string;
  userAgent?: string;
  ts?: number;
};

type AnalyticsEvent = {
  event: string;
  properties: EventProperties;
};

// Future vendor integration (PostHog, Mixpanel, etc.)
let vendorHook: ((event: AnalyticsEvent) => void) | null = null;

/**
 * Set vendor hook for production analytics
 */
export function setAnalyticsVendor(hook: (event: AnalyticsEvent) => void) {
  vendorHook = hook;
}

/**
 * Track an analytics event
 */
export function track(event: string, properties: EventProperties = {}) {
  const eventData: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      ts: properties.ts || Date.now(),
    },
  };

  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event, eventData.properties);
  }

  // Call vendor hook if set
  if (vendorHook) {
    try {
      vendorHook(eventData);
    } catch (error) {
      console.error("[Analytics] Vendor hook error:", error);
    }
  }
}

/**
 * Track pageview
 */
export function trackPageView(path: string, properties: EventProperties = {}) {
  track("pageview", {
    ...properties,
    path,
  });
}

/**
 * Server-side track helper
 * Includes request context (ip, userAgent)
 */
export function trackServer(
  event: string,
  properties: EventProperties & {
    actorId?: string;
    ip?: string;
    userAgent?: string;
  }
) {
  track(event, {
    ...properties,
    ts: Date.now(),
  });
}

