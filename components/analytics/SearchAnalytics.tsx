"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";
import { useSearchParams } from "next/navigation";

/**
 * Track search page analytics
 */
export function SearchAnalytics() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;
    const sort = searchParams.get("sort") || "relevance";

    track("search_started", {
      query,
      category,
      sort,
    });
  }, [searchParams]);

  return null;
}
