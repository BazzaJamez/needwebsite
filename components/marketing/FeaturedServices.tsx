import Link from "next/link";
import { ServiceCard } from "@/components/shared/ServiceCard";
import type { ServiceListItem } from "@/lib/server/services";

interface FeaturedServicesProps {
  services: ServiceListItem[];
}

function getMinimumPrice(service: ServiceListItem): number {
  if (service.packages.length === 0) {
    return service.basePrice ?? 0;
  }
  return Math.min(...service.packages.map((pkg) => pkg.priceMinor));
}

function getMinimumDeliveryDays(service: ServiceListItem): number | undefined {
  if (service.packages.length === 0) return undefined;
  return Math.min(...service.packages.map((pkg) => pkg.deliveryDays));
}

export function FeaturedServices({ services }: FeaturedServicesProps) {
  if (services.length === 0) {
    return (
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-[-0.01em] text-bg md:text-[1.728rem]">
            Featured Services
          </h2>
          <div className="mt-8 text-center">
            <p className="text-muted mb-4">No services available yet.</p>
            <Link
              href="/search"
              className="text-accent hover:underline font-medium"
            >
              Browse all services →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-[-0.01em] text-bg md:text-[1.728rem]">
            Featured Services
          </h2>
          <Link
            href="/search"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all →
          </Link>
        </div>

        {/* Grid: 1 col mobile, 2 tablet, 3-4 desktop */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => {
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
      </div>
    </section>
  );
}

