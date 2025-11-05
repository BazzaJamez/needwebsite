"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

type ServiceAnalyticsProps = {
  serviceId: string;
  serviceSlug: string;
  sellerId: string;
  category: string;
};

/**
 * Track service page analytics
 */
export function useServiceAnalytics({
  serviceId,
  serviceSlug,
  sellerId,
  category,
}: ServiceAnalyticsProps) {
  useEffect(() => {
    track("service_viewed", {
      serviceId,
      serviceSlug,
      sellerId,
      category,
    });
  }, [serviceId, serviceSlug, sellerId, category]);
}

/**
 * Track package switch
 */
export function trackPackageSwitch(
  serviceId: string,
  fromTier: string,
  toTier: string
) {
  track("package_switched", {
    serviceId,
    fromTier,
    toTier,
  });
}

/**
 * Track CTA click (Buy Now, Contact Seller, etc.)
 */
export function trackCTAClick(
  serviceId: string,
  ctaType: "buy_now" | "contact_seller" | "quote"
) {
  track("cta_clicked", {
    serviceId,
    ctaType,
  });
}

