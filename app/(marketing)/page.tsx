import type { Metadata } from "next";
import { getFeaturedServices, getMarketplaceStats } from "@/lib/server/marketing";
import { trackServer } from "@/lib/analytics/track";
import { Hero } from "@/components/marketing/Hero";
import { PopularCategories } from "@/components/marketing/PopularCategories";
import { FeaturedServices } from "@/components/marketing/FeaturedServices";
import { StatBand } from "@/components/marketing/StatBand";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CTA } from "@/components/marketing/CTA";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find top freelancers fast",
  description: "Hire trusted experts across design, development, and marketing. Connect with skilled professionals for your next project.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Find top freelancers fast",
    description: "Hire trusted experts across design, development, and marketing.",
    url: "/",
    siteName: "Marketplace",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find top freelancers fast",
    description: "Hire trusted experts across design, development, and marketing.",
  },
};

export default async function HomePage() {
  // Fetch data in parallel
  const [services, stats] = await Promise.all([
    getFeaturedServices(12),
    getMarketplaceStats(),
  ]);

  // Track page view (server-side)
  trackServer("home_viewed", {
    totalServices: stats.totalServices,
    totalOrders: stats.totalOrders,
  });

  return (
    <>
      <Hero />
      <PopularCategories />
      <FeaturedServices services={services} />
      {/*    */}
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  );
}
