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
export function ServiceAnalytics({
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

  return null;
}

