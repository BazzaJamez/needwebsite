/**
 * Client-side API error handling utilities
 * 
 * Helps extract error messages from API responses and display them in toast notifications
 */

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Extract error message from API response
 * Handles both our standardized error format and generic error responses
 */
export async function extractApiError(
  response: Response
): Promise<string> {
  try {
    const data: ApiErrorResponse | { message?: string } = await response.json();
    
    // Handle our standardized error format
    if ("error" in data && typeof data.error === "string") {
      return data.error;
    }
    
    // Handle generic error format
    if ("message" in data && typeof data.message === "string") {
      return data.message;
    }
    
    // Fallback to status text
    return response.statusText || "An error occurred";
  } catch {
    // If response is not JSON, return status text
    return response.statusText || "An error occurred";
  }
}

/**
 * Check if response is an error response
 */
export function isErrorResponse(response: Response): boolean {
  return !response.ok;
}

/**
 * Handle API error and return error message
 * This is a convenience function that combines extractApiError and isErrorResponse
 */
export async function handleApiResponse(
  response: Response
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (response.ok) {
    return { ok: true };
  }
  
  const error = await extractApiError(response);
  return { ok: false, error };
}

