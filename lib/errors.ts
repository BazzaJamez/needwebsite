/**
 * Shared error types for API handlers
 * 
 * All API errors should use these types for consistent error handling
 * and proper HTTP status codes.
 */

import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to JSON response format
   */
  toJSON() {
    return {
      error: this.message,
      code: this.code,
    };
  }
}

/**
 * Validation error (400)
 * Used for invalid input data (Zod validation failures, etc.)
 */
export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details,
    };
  }
}

/**
 * Authentication error (401)
 * Used when user is not authenticated
 */
export class AuthError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "AUTH_ERROR");
  }
}

/**
 * Authorization error (403)
 * Used when user is authenticated but lacks permission
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN_ERROR");
  }
}

/**
 * Not found error (404)
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

/**
 * Internal server error (500)
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_ERROR");
  }
}

/**
 * Helper to handle errors in API route handlers
 * Converts errors to appropriate AppError instances and returns JSON response
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API error:", error);

  // If it's already an AppError, use it directly
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // Handle Zod validation errors
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  ) {
    const validationError = new ValidationError(
      "Validation failed",
      error
    );
    return NextResponse.json(validationError.toJSON(), {
      status: validationError.statusCode,
    });
  }

  // Handle standard Error instances with known messages
  if (error instanceof Error) {
    if (error.message.includes("Unauthorized")) {
      const authError = new AuthError(error.message);
      return NextResponse.json(authError.toJSON(), {
        status: authError.statusCode,
      });
    }

    if (error.message.includes("Forbidden")) {
      const forbiddenError = new ForbiddenError(error.message);
      return NextResponse.json(forbiddenError.toJSON(), {
        status: forbiddenError.statusCode,
      });
    }

    if (error.message.includes("not found")) {
      const notFoundError = new NotFoundError(error.message);
      return NextResponse.json(notFoundError.toJSON(), {
        status: notFoundError.statusCode,
      });
    }
  }

  // Default to internal server error
  const internalError = new InternalServerError();
  return NextResponse.json(internalError.toJSON(), {
    status: internalError.statusCode,
  });
}

