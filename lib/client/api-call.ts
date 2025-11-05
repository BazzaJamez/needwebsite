"use client";

import { toast } from "sonner";
import { extractApiError, handleApiResponse } from "@/lib/client/api-error";

/**
 * Hook for making API calls with automatic error handling and toast notifications
 * 
 * Usage:
 * ```tsx
 * const { callApi } = useApiCall();
 * 
 * const handleSubmit = async () => {
 *   const result = await callApi("/api/services", {
 *     method: "POST",
 *     body: JSON.stringify(data),
 *   });
 *   
 *   if (result.ok) {
 *     toast.success("Service created successfully");
 *   }
 * };
 * ```
 */
export function useApiCall() {
  const callApi = async (
    url: string,
    options: RequestInit = {}
  ): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const result = await handleApiResponse(response);

      if (!result.ok) {
        toast.error(result.error);
        return result;
      }

      // Parse JSON if content-type is JSON
      const contentType = response.headers.get("content-type");
      let data: unknown = null;
      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          // Response might be empty
        }
      }

      return { ok: true, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      return { ok: false, error: errorMessage };
    }
  };

  return { callApi };
}

/**
 * Convenience function for API calls with toast notifications
 * Can be used outside of React components
 * 
 * Usage:
 * ```tsx
 * const result = await apiCall("/api/services", {
 *   method: "POST",
 *   body: JSON.stringify(data),
 * });
 * 
 * if (result.ok) {
 *   toast.success("Success!");
 * }
 * ```
 */
export async function apiCall(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const result = await handleApiResponse(response);

    if (!result.ok) {
      toast.error(result.error);
      return result;
    }

    // Parse JSON if content-type is JSON
    const contentType = response.headers.get("content-type");
    let data: unknown = null;
    if (contentType?.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        // Response might be empty
      }
    }

    return { ok: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    toast.error(errorMessage);
    return { ok: false, error: errorMessage };
  }
}

