"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/server/db";
import { requireRole } from "@/lib/server/auth";
import { ServiceCreateSchema } from "@/lib/validation/service";
import { trackServer } from "@/lib/analytics/track";
import type { ServiceCreateInput } from "@/lib/validation/service";

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

export async function createServiceAction(
  data: ServiceCreateInput
): Promise<{ slug: string } | { error: string }> {
  try {
    // Require seller role
    const user = await requireRole("seller");

    // Validate input
    const validated = ServiceCreateSchema.parse(data);

    // Generate service ID and slug
    const serviceId = nanoid();
    let slug = toServiceSlug(validated.title, serviceId);

    // Ensure slug is unique (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.service.findUnique({
        where: { slug },
      });

      if (!existing) break;

      // Regenerate with different ID
      const newId = nanoid();
      slug = toServiceSlug(validated.title, newId);
      attempts++;
    }

    // Create service with packages in a transaction
    const service = await db.service.create({
      data: {
        id: serviceId,
        sellerId: user.id,
        title: validated.title,
        slug,
        description: validated.description,
        category: validated.category,
        tags: validated.tags || [],
        gallery: validated.gallery || [],
        isActive: validated.isActive,
        packages: {
          create: validated.packages.map((pkg) => ({
            tier: pkg.tier,
            priceMinor: pkg.priceMinor,
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions,
            features: pkg.features,
          })),
        },
      },
      include: {
        packages: true,
      },
    });

    // Track analytics event
    trackServer("service_created", {
      actorId: user.id,
      serviceId: service.id,
      slug: service.slug,
      isActive: service.isActive,
    });

    return { slug: service.slug };
  } catch (error) {
    console.error("Service creation error:", error);

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return { error: "Only sellers can create services" };
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
      error: error instanceof Error ? error.message : "Failed to create service",
    };
  }
}

