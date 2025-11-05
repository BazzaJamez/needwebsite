import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ServiceFormWrapper } from "@/components/services/ServiceFormWrapper";
import { updateServiceAction } from "./actions";

export const metadata: Metadata = {
  title: "Edit Service",
  description: "Edit your service listing",
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Get service for editing (includes inactive services)
 */
async function getServiceForEdit(slug: string, sellerId: string) {
  const service = await db.service.findUnique({
    where: { slug },
    include: {
      packages: {
        orderBy: {
          tier: "asc",
        },
      },
    },
  });

  if (!service || service.sellerId !== sellerId) {
    return null;
  }

  return service;
}

export default async function ServiceEditorPage({ params }: Props) {
  const { slug } = await params;

  // Require seller role
  let user;
  try {
    user = await requireRole("seller");
  } catch {
    redirect(`/signin?next=/services/${slug}/editor`);
  }

  // Fetch service
  const service = await getServiceForEdit(slug, user.id);

  if (!service) {
    notFound();
  }

  // Prepare initial data for form
  // Ensure packages are sorted: basic, standard, premium
  const sortedPackages = [...service.packages].sort((a, b) => {
    const order = { basic: 0, standard: 1, premium: 2 };
    return order[a.tier] - order[b.tier];
  });

  const initialData = {
    title: service.title,
    category: service.category,
    description: service.description,
    tags: (service.tags as string[]) || [],
    gallery: (service.gallery as string[]) || [],
    packages: sortedPackages.map((pkg) => ({
      tier: pkg.tier as "basic" | "standard" | "premium",
      priceMinor: pkg.priceMinor,
      deliveryDays: pkg.deliveryDays,
      revisions: pkg.revisions,
      features: (pkg.features as string[]) || [],
    })),
    isActive: service.isActive,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-h1 font-semibold tracking-[-0.01em]">
          Edit Service
        </h1>
        <p className="text-muted">
          Update your service details and pricing packages
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <ServiceFormWrapper
            slug={slug}
            updateAction={updateServiceAction}
            initialData={initialData}
            mode="edit"
          />
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl border border-border bg-elev p-6 shadow-1">
            <h2 className="mb-4 text-h3 font-semibold">Service Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted">Status:</span>{" "}
                <span
                  className={
                    service.isActive
                      ? "text-success font-medium"
                      : "text-muted font-medium"
                  }
                >
                  {service.isActive ? "Published" : "Draft"}
                </span>
              </div>
              <div>
                <span className="text-muted">Created:</span>{" "}
                <span className="font-medium">
                  {new Date(service.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted">Last updated:</span>{" "}
                <span className="font-medium">
                  {new Date(service.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
