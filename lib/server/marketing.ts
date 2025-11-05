import { db } from "./db";
import type { ServiceListItem } from "./services";

/**
 * Get featured services for homepage
 * Returns top services with seller info and minimum package price
 */
export async function getFeaturedServices(limit: number = 12): Promise<ServiceListItem[]> {
  const services = await db.service.findMany({
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  // Sort by rating in memory (more reliable when some sellers don't have reputation)
  services.sort((a, b) => {
    const ratingA = a.seller.reputation?.ratingAvg ?? 0;
    const ratingB = b.seller.reputation?.ratingAvg ?? 0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return services;
}

/**
 * Get marketplace aggregate statistics
 */
export async function getMarketplaceStats() {
  // Get total active services
  const totalServices = await db.service.count({
    where: {
      isActive: true,
    },
  });

  // Get total orders (completed + in progress)
  const totalOrders = await db.order.count({
    where: {
      status: {
        in: ["completed", "in_progress", "delivered", "in_escrow"],
      },
    },
  });

  // Get average rating from reputation table
  const avgRatingResult = await db.reputation.aggregate({
    _avg: {
      ratingAvg: true,
    },
    where: {
      ratingCount: {
        gt: 0,
      },
    },
  });
  const avgRating = avgRatingResult._avg.ratingAvg ?? 0;

  // Get active sellers (users with at least one active service)
  const activeSellers = await db.user.count({
    where: {
      role: "seller",
      services: {
        some: {
          isActive: true,
        },
      },
      isSuspended: false,
    },
  });

  return {
    totalServices,
    totalOrders,
    avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    activeSellers,
  };
}

