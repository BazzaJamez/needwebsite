import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireRole } from "@/lib/server/auth";
import { ServiceUpdateSchema } from "@/lib/validation/service";
import { trackServer } from "@/lib/analytics/track";
import { nanoid } from "nanoid";
import {
  handleApiError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "@/lib/errors";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Generate service slug from title and ID
 */
function toServiceSlug(title: string, id: string): string {
  const kebab = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const shortId = id.slice(0, 4);
  return `${kebab}-${shortId}`;
}

/**
 * PATCH /api/services/[id] - Update service (seller only)
 */
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    // Require seller role
    const user = await requireRole("seller");

    // Resolve params (Next.js 16 params are async)
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;

    // Find the service and verify ownership
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { packages: true },
    });

    if (!service) {
      return handleApiError(new NotFoundError("Service not found"));
    }

    // Verify seller owns this service
    if (service.sellerId !== user.id && user.role !== "admin") {
      return handleApiError(
        new ForbiddenError("You can only update your own services")
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = ServiceUpdateSchema.parse(body);

    // Prepare update data
    const updateData: {
      title?: string;
      category?: string;
      description?: string;
      tags?: string[];
      gallery?: string[];
      isActive?: boolean;
      slug?: string;
      packages?: {
        deleteMany: {};
        create: Array<{
          tier: string;
          priceMinor: number;
          deliveryDays: number;
          revisions: number;
          features: string[];
        }>;
      };
    } = {};

    if (validated.title !== undefined) {
      updateData.title = validated.title;
      // Regenerate slug if title changes - ensure uniqueness
      let newSlug = toServiceSlug(validated.title, serviceId);
      let attempts = 0;
      while (attempts < 5) {
        const existing = await db.service.findUnique({
          where: { slug: newSlug },
        });

        if (!existing || existing.id === serviceId) break;

        // Regenerate with different ID suffix
        const newId = nanoid();
        newSlug = toServiceSlug(validated.title, newId);
        attempts++;
      }
      updateData.slug = newSlug;
    }

    if (validated.category !== undefined) {
      updateData.category = validated.category;
    }

    if (validated.description !== undefined) {
      updateData.description = validated.description;
    }

    if (validated.tags !== undefined) {
      updateData.tags = validated.tags;
    }

    if (validated.gallery !== undefined) {
      updateData.gallery = validated.gallery;
    }

    if (validated.isActive !== undefined) {
      updateData.isActive = validated.isActive;
    }

    // Update packages if provided
    if (validated.packages !== undefined) {
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
      where: { id: serviceId },
      data: updateData,
      include: {
        packages: {
          orderBy: {
            priceMinor: "asc",
          },
        },
      },
    });

    // Track analytics event
    trackServer("service_updated", {
      actorId: user.id,
      serviceId: updatedService.id,
      slug: updatedService.slug,
    });

    return NextResponse.json(
      {
        id: updatedService.id,
        slug: updatedService.slug,
        title: updatedService.title,
        category: updatedService.category,
        description: updatedService.description,
        tags: updatedService.tags,
        gallery: updatedService.gallery,
        isActive: updatedService.isActive,
        packages: updatedService.packages.map((pkg) => ({
          id: pkg.id,
          tier: pkg.tier,
          priceMinor: pkg.priceMinor,
          deliveryDays: pkg.deliveryDays,
          revisions: pkg.revisions,
          features: pkg.features,
        })),
        updatedAt: updatedService.updatedAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors specifically
    if (
      error &&
      typeof error === "object" &&
      "issues" in error &&
      Array.isArray((error as { issues: unknown[] }).issues)
    ) {
      return handleApiError(
        new ValidationError("Validation failed", error)
      );
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/services/[id] - Soft delete service (seller only)
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    // Require seller role
    const user = await requireRole("seller");

    // Resolve params (Next.js 16 params are async)
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;

    // Find the service and verify ownership
    const service = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return handleApiError(new NotFoundError("Service not found"));
    }

    // Verify seller owns this service
    if (service.sellerId !== user.id && user.role !== "admin") {
      return handleApiError(
        new ForbiddenError("You can only delete your own services")
      );
    }

    // Soft delete by setting isActive to false
    const updatedService = await db.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });

    // Track analytics event
    trackServer("service_deleted", {
      actorId: user.id,
      serviceId: updatedService.id,
      slug: updatedService.slug,
    });

    return NextResponse.json(
      {
        id: updatedService.id,
        slug: updatedService.slug,
        isActive: updatedService.isActive,
        message: "Service deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

