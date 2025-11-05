import { MetadataRoute } from "next";
import { db } from "@/lib/server/db";

/**
 * List public service slugs for sitemap
 * Returns top N services (by popularity/rating in production)
 */
async function listPublicServiceSlugs(limit: number = 100): Promise<string[]> {
  try {
    const services = await db.service.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return services.map((s: { slug: string }) => s.slug);
  } catch (error) {
    // Database may not be available during build or tables may not exist yet
    // Return empty array to allow build to complete
    console.warn("Failed to fetch services for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
  const services = await listPublicServiceSlugs(); // top N nightly

  return [
    {
      url: new URL("/", base).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: new URL("/categories", base).toString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: new URL("/pricing", base).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: new URL("/faq", base).toString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...services.map((slug: string) => ({
      url: new URL(`/services/${slug}`, base).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

