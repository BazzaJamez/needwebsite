import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/server/db";
import { requireRole } from "@/lib/server/auth";
import {
  ServiceCreateSchema,
  ServiceListQuerySchema,
} from "@/lib/validation/service";
import { trackServer } from "@/lib/analytics/track";
import { Prisma } from "@prisma/client";
import {
  handleApiError,
  ValidationError,
  NotFoundError,
} from "@/lib/errors";

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
 * GET /api/services - List all services with query filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validated = ServiceListQuerySchema.parse(queryParams);

    // Build Prisma where clause
    const where: Prisma.ServiceWhereInput = {
      isActive: true, // Only show active services by default
    };

    // Filter by category
    if (validated.category) {
      where.category = validated.category;
    }

    // Filter by search query (search in title, description, tags)
    if (validated.q) {
      where.OR = [
        { title: { contains: validated.q, mode: "insensitive" } },
        { description: { contains: validated.q, mode: "insensitive" } },
      ];
    }

    // Filter by price range (using minimum package price)
    if (validated.min !== undefined || validated.max !== undefined) {
      where.packages = {
        some: {},
      };

      if (validated.min !== undefined && validated.max !== undefined) {
        where.packages = {
          some: {
            priceMinor: {
              gte: validated.min,
              lte: validated.max,
            },
          },
        };
      } else if (validated.min !== undefined) {
        where.packages = {
          some: {
            priceMinor: {
              gte: validated.min,
            },
          },
        };
      } else if (validated.max !== undefined) {
        where.packages = {
          some: {
            priceMinor: {
              lte: validated.max,
            },
          },
        };
      }
    }

    // Determine initial orderBy for database query
    // Note: Price sorting needs to be done in-memory after fetching packages
    let orderBy: Prisma.ServiceOrderByWithRelationInput = {};
    const needsInMemorySort = ["price_asc", "price_desc", "rating"].includes(validated.sort);
    
    if (!needsInMemorySort) {
      switch (validated.sort) {
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "relevance":
        default:
          orderBy = { createdAt: "desc" };
          break;
      }
    }

    // Fetch services with packages and seller info
    const services = await db.service.findMany({
      where,
      orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
      include: {
        packages: {
          orderBy: {
            priceMinor: "asc",
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            reputation: {
              select: {
                ratingAvg: true,
                ratingCount: true,
              },
            },
          },
        },
      },
    });

    // Sort services in-memory if needed
    let sortedServices = [...services];
    if (needsInMemorySort) {
      switch (validated.sort) {
        case "price_asc":
          sortedServices.sort((a, b) => {
            const aMinPrice = Math.min(...a.packages.map((p) => p.priceMinor));
            const bMinPrice = Math.min(...b.packages.map((p) => p.priceMinor));
            return aMinPrice - bMinPrice;
          });
          break;
        case "price_desc":
          sortedServices.sort((a, b) => {
            const aMinPrice = Math.min(...a.packages.map((p) => p.priceMinor));
            const bMinPrice = Math.min(...b.packages.map((p) => p.priceMinor));
            return bMinPrice - aMinPrice;
          });
          break;
        case "rating":
          sortedServices.sort((a, b) => {
            const aRating = a.seller.reputation?.ratingAvg ?? 0;
            const bRating = b.seller.reputation?.ratingAvg ?? 0;
            return bRating - aRating;
          });
          break;
      }
    }

    // Get total count for pagination metadata
    const total = await db.service.count({ where });

    return NextResponse.json(
      {
        services: sortedServices.map((service) => ({
          id: service.id,
          slug: service.slug,
          title: service.title,
          description: service.description,
          category: service.category,
          tags: service.tags,
          coverImage: service.coverImage,
          gallery: service.gallery,
          packages: service.packages.map((pkg) => ({
            id: pkg.id,
            tier: pkg.tier,
            priceMinor: pkg.priceMinor,
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions,
            features: pkg.features,
          })),
          seller: {
            id: service.seller.id,
            name: service.seller.name,
            avatarUrl: service.seller.avatarUrl,
            ratingAvg: service.seller.reputation?.ratingAvg ?? 0,
            ratingCount: service.seller.reputation?.ratingCount ?? 0,
          },
          createdAt: service.createdAt.toISOString(),
          updatedAt: service.updatedAt.toISOString(),
        })),
        total,
        filters: {
          q: validated.q,
          category: validated.category,
          min: validated.min,
          max: validated.max,
          sort: validated.sort,
        },
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
        new ValidationError("Invalid query parameters", error)
      );
    }
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require seller role
    const user = await requireRole("seller");

    // Parse and validate request body
    const body = await request.json();
    const validated = ServiceCreateSchema.parse(body);

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

    return NextResponse.json(
      {
        id: service.id,
        slug: service.slug,
      },
      { status: 201 }
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

