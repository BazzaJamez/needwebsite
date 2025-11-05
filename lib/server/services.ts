import { db } from "./db";
import type { Prisma } from "@prisma/client";

// Service list item with seller info
export type ServiceListItem = Prisma.ServiceGetPayload<{
  include: {
    seller: {
      include: {
        reputation: true;
      };
    };
    packages: {
      orderBy: {
        tier: "asc";
      };
    };
  };
}>;

// Service detail with full relations
export type ServiceDetail = Prisma.ServiceGetPayload<{
  include: {
    seller: {
      include: {
        reputation: true;
      };
    };
    packages: {
      orderBy: {
        tier: "asc";
      };
    };
  };
}>;

export interface SearchFilters {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  delivery?: number;
  rating?: number;
  sort?: "relevance" | "rating" | "newest" | "price_asc" | "price_desc";
  limit?: number;
  cursor?: string;
}

/**
 * Search services with filters and pagination
 */
export async function searchServices(filters: SearchFilters = {}) {
  const {
    q,
    category,
    min,
    max,
    delivery,
    rating,
    sort = "relevance",
    limit = 20,
    cursor,
  } = filters;

  // Build where clause
  const where: Prisma.ServiceWhereInput = {
    isActive: true,
    ...(category && { category }),
    ...(min !== undefined || max !== undefined
      ? {
          packages: {
            some: {
              ...(min !== undefined && { priceMinor: { gte: min } }),
              ...(max !== undefined && { priceMinor: { lte: max } }),
            },
          },
        }
      : {}),
    ...(delivery !== undefined
      ? {
          packages: {
            some: {
              deliveryDays: { lte: delivery },
            },
          },
        }
      : {}),
    ...(rating !== undefined
      ? {
          seller: {
            reputation: {
              ratingAvg: { gte: rating },
            },
          },
        }
      : {}),
    // Text search (basic implementation - for production, use full-text search)
    // Note: SQLite doesn't support case-insensitive mode well
    // For production, use external search index or FTS5
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };

  // Build orderBy
  let orderBy: Prisma.ServiceOrderByWithRelationInput[] = [];
  switch (sort) {
    case "rating":
      orderBy = [{ seller: { reputation: { ratingAvg: "desc" } } }];
      break;
    case "newest":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "price_asc":
      orderBy = [{ basePrice: "asc" }];
      break;
    case "price_desc":
      orderBy = [{ basePrice: "desc" }];
      break;
    case "relevance":
    default:
      // Default: newest first
      orderBy = [{ createdAt: "desc" }];
      break;
  }

  // Execute query
  const services = await db.service.findMany({
    where,
    include: {
      seller: {
        include: {
          reputation: true,
        },
      },
      packages: {
        orderBy: {
          tier: "asc",
        },
      },
    },
    orderBy,
    take: limit + 1, // Take one extra to check if there's more
    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),
  });

  // Check if there's a next page
  const hasMore = services.length > limit;
  const items = hasMore ? services.slice(0, limit) : services;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}

/**
 * Get service by slug with full details
 */
export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  return db.service.findUnique({
    where: {
      slug,
      isActive: true,
    },
    include: {
      seller: {
        include: {
          reputation: true,
        },
      },
      packages: {
        orderBy: {
          tier: "asc",
        },
      },
    },
  });
}

/**
 * Get service by ID with full details
 */
export async function getServiceById(id: string): Promise<ServiceDetail | null> {
  return db.service.findUnique({
    where: {
      id,
      isActive: true,
    },
    include: {
      seller: {
        include: {
          reputation: true,
        },
      },
      packages: {
        orderBy: {
          tier: "asc",
        },
      },
    },
  });
}

/**
 * Get package by service ID and tier
 */
export async function getPackageByServiceAndTier(
  serviceId: string,
  tier: "basic" | "standard" | "premium"
) {
  return db.package.findUnique({
    where: {
      serviceId_tier: {
        serviceId,
        tier,
      },
    },
    include: {
      service: {
        include: {
          seller: {
            include: {
              reputation: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get popular services (by order count or rating)
 */
export async function getPopularServices(limit: number = 12) {
  // For now, return newest active services
  // In production, aggregate order counts or use rating
  return db.service.findMany({
    where: {
      isActive: true,
    },
    include: {
      seller: {
        include: {
          reputation: true,
        },
      },
      packages: {
        orderBy: {
          tier: "asc",
        },
        take: 1, // Just get the basic package for listing
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

/**
 * Get services by category
 */
export async function getServicesByCategory(category: string, limit: number = 20) {
  return db.service.findMany({
    where: {
      category,
      isActive: true,
    },
    include: {
      seller: {
        include: {
          reputation: true,
        },
      },
      packages: {
        orderBy: {
          tier: "asc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

