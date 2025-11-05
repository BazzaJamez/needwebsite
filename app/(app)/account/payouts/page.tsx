import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payouts",
  description: "Manage payouts",
};

export const dynamic = "force-dynamic";

export default function PayoutsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-8 text-h1">Payouts</h1>
      <p className="text-muted">Payout management coming soon...</p>
    </div>
  );
}

