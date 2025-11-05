"use client";

import { trackResultClick } from "@/lib/client/search-analytics";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/shared/cn";

export interface ServiceCardProps {
  id: string;
  slug: string;
  title: string;
  coverImage?: string | null;
  seller?: {
    name: string;
    avatarUrl?: string | null;
    rating?: number;
  } | null;
  category?: string;
  deliveryDays?: number;
  priceMinor: number;
  currency?: string;
  className?: string;
}

function formatPrice(amountMinor: number, currency: string = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amountMinor / 100);
}

function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    // Allow relative URLs and common image domains
    return (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:" ||
      url.startsWith("/")
    );
  } catch {
    // Relative URL
    return url.startsWith("/");
  }
}

export function ServiceCard({
  id,
  slug,
  title,
  coverImage,
  seller,
  category,
  deliveryDays,
  priceMinor,
  currency = "USD",
  className,
}: ServiceCardProps) {
  const handleClick = () => {
    trackResultClick(id, slug);
  };

  const hasValidImage = isValidImageUrl(coverImage);

  return (
    <Link href={`/services/${slug}`} onClick={handleClick}>
      <article
        className={cn(
          "group overflow-hidden rounded-2xl bg-elev shadow-1 transition hover:-translate-y-0.5 hover:shadow-2",
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-[3/2] bg-border overflow-hidden">
          {hasValidImage && coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition group-hover:scale-[1.01]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                // Fallback to placeholder on error
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-elev flex items-center justify-center">
              <span className="text-muted text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2 p-4">
          {/* Title */}
          <h3 className="line-clamp-2 text-[1.02rem] font-semibold tracking-[-0.01em] text-bg">
            {title}
          </h3>

          {/* Seller info */}
          {seller && (
            <div className="flex items-center gap-2 text-sm text-muted">
              {seller.avatarUrl && isValidImageUrl(seller.avatarUrl) && (
                <Image
                  src={seller.avatarUrl}
                  alt={seller.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              )}
              <span>
                by {seller.name}
                {seller.rating && ` • ★ ${seller.rating.toFixed(1)}`}
              </span>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              {category && (
                <span className="rounded-2xl bg-accent-100 px-2.5 py-1 text-xs text-accent font-medium">
                  {category}
                </span>
              )}
              {deliveryDays && (
                <span className="rounded-2xl bg-elev px-2.5 py-1 text-xs text-muted border border-border font-medium">
                  {deliveryDays} {deliveryDays === 1 ? "day" : "days"}
                </span>
              )}
            </div>
            <div className="text-sm" style={{ fontFeatureSettings: '"tnum" 1' }}>
              <span className="text-muted mr-1">From</span>
              <span className="font-semibold text-bg">
                {formatPrice(priceMinor, currency)}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}