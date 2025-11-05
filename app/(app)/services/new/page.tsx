import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/server/auth";
import { ServiceFormWrapper } from "@/components/services/ServiceFormWrapper";

export const metadata: Metadata = {
  title: "New Service",
  description: "Create a new service listing",
};

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  // Require seller role - redirects if not authenticated or not seller
  try {
    await requireRole("seller");
  } catch {
    redirect("/signin?next=/services/new");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-h1 font-semibold tracking-[-0.01em]">
          Create New Service
        </h1>
        <p className="text-muted">
          Add your service to the marketplace and start receiving orders
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <ServiceFormWrapper mode="create" />
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl border border-border bg-elev p-6 shadow-1">
            <h2 className="mb-4 text-h3 font-semibold">Preview</h2>
            <p className="text-sm text-muted">
              Your service will be reviewed before going live. You can edit
              details and publish later from the editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
