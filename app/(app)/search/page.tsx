import type { Metadata } from "next";
import { ServiceCard } from "@/components/shared/ServiceCard";
import Link from "next/link";
import { SearchAnalytics } from "@/components/analytics/SearchAnalytics";
import { searchServices } from "@/lib/server/services";
import type { ServiceListItem } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Search Services",
  description: "Search for services across design, development, and marketing.",
};

export const revalidate = 30;

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    min?: string;
    max?: string;
    delivery?: string;
    rating?: string;
    sort?: "relevance" | "rating" | "newest" | "price_asc" | "price_desc";
  }>;
};

const categories = [
  "Web Design",
  "Logo Design",
  "WordPress",
  "Voice Over",
  "Video Editing",
  "Data Entry",
  "Graphic Design",
  "Content Writing",
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function getMinimumPrice(service: ServiceListItem): number {
  if (service.packages.length === 0) {
    return service.basePrice ?? 0;
  }
  return Math.min(...service.packages.map((pkg: { priceMinor: number }) => pkg.priceMinor));
}

function getMinimumDeliveryDays(service: ServiceListItem): number | undefined {
  if (service.packages.length === 0) return undefined;
  return Math.min(...service.packages.map((pkg: { deliveryDays: number }) => pkg.deliveryDays));
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedCategory = params.category || "";

  // Parse search filters
  const filters = {
    q: params.q,
    category: params.category,
    min: params.min ? parseInt(params.min, 10) : undefined,
    max: params.max ? parseInt(params.max, 10) : undefined,
    delivery: params.delivery ? parseInt(params.delivery, 10) : undefined,
    rating: params.rating ? parseFloat(params.rating) : undefined,
    sort: params.sort || "relevance",
    limit: 20,
  };

  // Fetch services
  const { items: services } = await searchServices(filters);

  return (
    <>
      <SearchAnalytics />
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <h1 className="mb-6 text-h1">Search Services</h1>

        {/* Filter Pills */}
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap gap-3">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <Link
                  key={category}
                  href={`/search?category=${encodeURIComponent(category)}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                  className={`rounded-2xl px-4 py-2 text-sm transition ${
                    isSelected
                      ? "bg-accent-100 text-accent ring-1 ring-accent"
                      : "bg-elev text-black hover:bg-elev border border-border"
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">Sort by:</span>
            <div className="flex gap-2">
              {sortOptions.map((option) => {
                const isSelected = (params.sort || "relevance") === option.value;
                return (
                  <Link
                    key={option.value}
                    href={`/search?${new URLSearchParams({
                      ...params,
                      sort: option.value,
                    } as Record<string, string>).toString()}`}
                    className={`rounded-2xl px-3 py-1.5 text-sm transition ${
                      isSelected
                        ? "bg-accent-100 text-accent ring-1 ring-accent"
                        : "bg-elev text-black hover:bg-elev border border-border"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Service Grid */}
        {services.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted mb-4">No services found.</p>
            <p className="text-sm text-muted">
              Try adjusting your filters or{" "}
              <Link href="/search" className="text-accent hover:underline">
                browse all services
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="hello grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service: ServiceListItem) => {
              const minPrice = getMinimumPrice(service);
              const minDeliveryDays = getMinimumDeliveryDays(service);

              return (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  slug={service.slug}
                  title={service.title}
                  coverImage={service.coverImage}
                  seller={{
                    name: service.seller.name ?? "Unknown",
                    avatarUrl: service.seller.avatarUrl,
                    rating: service.seller.reputation?.ratingAvg ?? undefined,
                  }}
                  category={service.category}
                  deliveryDays={minDeliveryDays}
                  priceMinor={minPrice}
                  currency="USD"
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

