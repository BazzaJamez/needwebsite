"use server";

import { db } from "@/lib/server/db";
import { requireRole } from "@/lib/server/auth";
import { ServiceUpdateSchema } from "@/lib/validation/service";
import { getServiceBySlug } from "@/lib/server/services";
import { trackServer } from "@/lib/analytics/track";
import type { ServiceUpdateInput } from "@/lib/validation/service";

export async function updateServiceAction(
  slug: string,
  data: ServiceUpdateInput
): Promise<{ slug: string } | { error: string }> {
  try {
    // Require seller role
    const user = await requireRole("seller");

    // Get existing service
    const existingService = await getServiceBySlug(slug);
    if (!existingService) {
      return { error: "Service not found" };
    }

    // Verify ownership
    if (existingService.sellerId !== user.id) {
      return { error: "You can only edit your own services" };
    }

    // Note: getServiceBySlug only returns active services, but for editing
    // we need to allow editing inactive services too
    const serviceForEdit = await db.service.findUnique({
      where: { slug },
      include: { packages: true },
    });

    if (!serviceForEdit) {
      return { error: "Service not found" };
    }

    if (serviceForEdit.sellerId !== user.id) {
      return { error: "You can only edit your own services" };
    }

    // Validate input
    const validated = ServiceUpdateSchema.parse(data);

    // Prepare update data
    const updateData: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string[];
      gallery?: string[];
      isActive?: boolean;
      packages?: {
        deleteMany: {};
        create: Array<{
          tier: "basic" | "standard" | "premium";
          priceMinor: number;
          deliveryDays: number;
          revisions: number;
          features: string[];
        }>;
      };
    } = {};

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined)
      updateData.description = validated.description;
    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.tags !== undefined) updateData.tags = validated.tags;
    if (validated.gallery !== undefined) updateData.gallery = validated.gallery;
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;

    // Update packages if provided
    if (validated.packages) {
      updateData.packages = {
        deleteMany: {}, // Delete all existing packages
        create: validated.packages.map((pkg) => ({
          tier: pkg.tier,
          priceMinor: pkg.priceMinor,
          deliveryDays: pkg.deliveryDays,
          revisions: pkg.revisions,
          features: pkg.features,
        })),
      };
    }

    // Update service
    const updatedService = await db.service.update({
      where: { slug },
      data: updateData,
      include: {
        packages: true,
      },
    });

    // Track analytics event
    trackServer("service_updated", {
      actorId: user.id,
      serviceId: updatedService.id,
      slug: updatedService.slug,
    });

    return { slug: updatedService.slug };
  } catch (error) {
    console.error("Service update error:", error);

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return { error: "Only sellers can update services" };
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { error: "Unauthorized" };
    }

    // Zod validation errors
    if (error && typeof error === "object" && "issues" in error) {
      return {
        error: "Validation failed. Please check your input.",
      };
    }

    return {
      error: error instanceof Error ? error.message : "Failed to update service",
    };
  }
}

