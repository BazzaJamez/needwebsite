import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard",
};

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-8 text-h1">Admin Dashboard</h1>
      <p className="text-muted">Admin stats and queues coming soon...</p>
    </div>
  );
}

