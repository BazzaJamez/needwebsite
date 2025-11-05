import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/server/services";
import { ServiceAnalytics } from "@/components/analytics/ServiceAnalytics";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found",
      description: "The service you're looking for doesn't exist.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const serviceUrl = `${baseUrl}/services/${slug}`;
  const ogImage = service.coverImage || `${baseUrl}/og-image.png`;

  return {
    title: service.title,
    description: service.description || `Hire ${service.seller.name || "a professional"} for ${service.title}`,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title: service.title,
      description: service.description || `Hire ${service.seller.name || "a professional"} for ${service.title}`,
      url: serviceUrl,
      siteName: "Marketplace",
      images: [
        {
          url: service.coverImage || `${baseUrl}/og?title=${encodeURIComponent(service.title)}`,
          width: 1200,
          height: 630,
          alt: service.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: service.title,
      description: service.description || `Hire ${service.seller.name || "a professional"} for ${service.title}`,
      images: [service.coverImage || `${baseUrl}/og?title=${encodeURIComponent(service.title)}`],
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;

  const service = await getServiceBySlug(slug);
  if (!service) {
    notFound();
  }

  return (
    <>
      <ServiceAnalytics
        serviceId={service.id}
        serviceSlug={service.slug}
        sellerId={service.sellerId}
        category={service.category}
      />
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <h1 className="mb-8 text-h1">{service.title}</h1>
        <p className="text-muted">Service details coming soon...</p>
      </div>
    </>
  );
}
