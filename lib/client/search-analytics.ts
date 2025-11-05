"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

type SearchAnalyticsProps = {
  query?: string;
  category?: string;
  sort?: string;
  resultsCount?: number;
};

/**
 * Track search page analytics
 */
export function useSearchAnalytics({
  query,
  category,
  sort,
  resultsCount,
}: SearchAnalyticsProps) {
  useEffect(() => {
    // Track pageview
    track("search_started", {
      query,
      category,
      sort: sort || "relevance",
      resultsCount,
    });
  }, [query, category, sort, resultsCount]);
}

/**
 * Track filter changes
 */
export function trackFilterChange(filters: {
  category?: string;
  min?: number;
  max?: number;
  delivery?: number;
  rating?: number;
  sort?: string;
}) {
  track("filters_changed", filters);
}

/**
 * Track result click
 */
export function trackResultClick(serviceId: string, serviceSlug: string) {
  track("result_clicked", {
    serviceId,
    serviceSlug,
  });
}

