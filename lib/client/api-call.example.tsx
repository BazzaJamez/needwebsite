/**
 * Example usage of API calls with toast notifications
 * 
 * This file demonstrates how to use the error handling system
 * in client components that call the services API.
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiCall } from "@/lib/client/api-call";

/**
 * Example: Creating a service
 */
export function ExampleCreateService() {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    
    const result = await apiCall("/api/services", {
      method: "POST",
      body: JSON.stringify({
        title: "Example Service",
        category: "Design",
        description: "An example service",
        packages: [
          {
            tier: "basic",
            priceMinor: 5000,
            deliveryDays: 3,
            revisions: 0,
            features: ["Feature 1"],
          },
          {
            tier: "standard",
            priceMinor: 10000,
            deliveryDays: 5,
            revisions: 1,
            features: ["Feature 1", "Feature 2"],
          },
          {
            tier: "premium",
            priceMinor: 20000,
            deliveryDays: 7,
            revisions: 2,
            features: ["Feature 1", "Feature 2", "Feature 3"],
          },
        ],
        isActive: false,
      }),
    });

    setLoading(false);

    if (result.ok) {
      toast.success("Service created successfully");
      // Handle success (e.g., redirect or refresh)
    }
    // Error toast is automatically shown by apiCall
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? "Creating..." : "Create Service"}
    </button>
  );
}

/**
 * Example: Updating a service
 */
export function ExampleUpdateService({ serviceId }: { serviceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);

    const result = await apiCall(`/api/services/${serviceId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Updated Title",
        isActive: true,
      }),
    });

    setLoading(false);

    if (result.ok) {
      toast.success("Service updated successfully");
    }
    // Error toast is automatically shown by apiCall
  };

  return (
    <button onClick={handleUpdate} disabled={loading}>
      {loading ? "Updating..." : "Update Service"}
    </button>
  );
}

/**
 * Example: Deleting a service
 */
export function ExampleDeleteService({ serviceId }: { serviceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    setLoading(true);

    const result = await apiCall(`/api/services/${serviceId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (result.ok) {
      toast.success("Service deleted successfully");
      // Handle success (e.g., redirect or refresh)
    }
    // Error toast is automatically shown by apiCall
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete Service"}
    </button>
  );
}

