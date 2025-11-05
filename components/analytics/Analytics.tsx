"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/track";

/**
 * Client-side analytics component
 * Tracks pageviews automatically
 */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const path = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}

