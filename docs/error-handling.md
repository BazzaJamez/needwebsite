# Error Handling & Toast Notifications

This project uses a centralized error handling system with toast notifications for user feedback.

## Setup

After cloning or pulling changes, install dependencies:

```bash
npm install
```

This will install `sonner` for toast notifications.

## Architecture

### Server-Side (`lib/errors.ts`)

Custom error classes for API handlers:

- `ValidationError` (400) - Invalid input data
- `AuthError` (401) - Not authenticated
- `ForbiddenError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `InternalServerError` (500) - Server errors

All errors return consistent JSON format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional, for validation errors
}
```

### Client-Side (`lib/client/api-error.ts` & `lib/client/api-call.ts`)

Utilities for handling API responses and displaying toast notifications:

- `extractApiError()` - Extracts error message from API response
- `handleApiResponse()` - Checks if response is an error
- `apiCall()` - Makes API calls with automatic error handling and toast notifications
- `useApiCall()` - React hook version of `apiCall()`

## Usage

### In API Route Handlers

```typescript
import { handleApiError, NotFoundError, ValidationError } from "@/lib/errors";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await db.service.findUnique({ where: { id: params.id } });
    
    if (!service) {
      return handleApiError(new NotFoundError("Service not found"));
    }
    
    return NextResponse.json({ service });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### In Client Components

```typescript
"use client";

import { toast } from "sonner";
import { apiCall } from "@/lib/client/api-call";

export function MyComponent() {
  const handleSubmit = async () => {
    const result = await apiCall("/api/services", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (result.ok) {
      toast.success("Service created successfully!");
      // Handle success
    }
    // Error toast is automatically shown by apiCall
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Using the Hook

```typescript
"use client";

import { useApiCall } from "@/lib/client/api-call";

export function MyComponent() {
  const { callApi } = useApiCall();

  const handleSubmit = async () => {
    const result = await callApi("/api/services", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (result.ok) {
      // Handle success
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

## Toast Notifications

Toast notifications are automatically displayed for errors. For success messages, call `toast.success()` manually:

```typescript
import { toast } from "sonner";

toast.success("Operation completed successfully");
toast.error("Something went wrong"); // Usually handled automatically
toast.info("Information message");
toast.warning("Warning message");
```

## Examples

See `lib/client/api-call.example.tsx` for complete examples of:
- Creating a service
- Updating a service
- Deleting a service

All examples include proper error handling and toast notifications.

