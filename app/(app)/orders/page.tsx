import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "View your orders",
};

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-8 text-h1">Orders</h1>
      <div className="space-y-4">
        <p className="text-muted">Tabbed view: Buying, Selling, Completed, Disputes</p>
        <p className="text-muted">Orders list coming soon...</p>
      </div>
    </div>
  );
}

