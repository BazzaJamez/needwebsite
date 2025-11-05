import { NextResponse } from "next/server";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  // TODO: Fetch top services from database
  const services: string[] = [];
  
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: new URL("/", baseUrl).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: new URL("/categories", baseUrl).toString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: new URL("/pricing", baseUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: new URL("/faq", baseUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...services.map((slug) => ({
      url: new URL(`/services/${slug}`, baseUrl).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return NextResponse.json(sitemap);
}

