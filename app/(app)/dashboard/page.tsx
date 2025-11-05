import { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/server/auth";

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';
import { OrderStatus } from "@prisma/client";
import {
  getDashboardSummary,
  getDashboardOrders,
  getDashboardThreads,
} from "@/lib/server/dashboard";
import { trackServer } from "@/lib/analytics/track";
import { KpiCard } from "@/components/shared/KpiCard";
import { StatusChip } from "@/components/shared/StatusChip";
import { EmptyState } from "@/components/shared/EmptyState";
import { QuickActionButton } from "@/components/shared/QuickActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Format currency amount from minor units (cents) to display string
 */
function formatCurrency(amountMinor: number, currency: string = "USD"): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Dashboard page - role-aware summary for buyers and sellers
 */
export default async function DashboardPage() {
  const user = await requireAuth();

  // Track dashboard view
  trackServer("dashboard_viewed", {
    actorId: user.id,
    role: user.role,
  });

  // Fetch dashboard data
  const [summary, orders, threads] = await Promise.all([
    getDashboardSummary(user.id, user.role ?? "buyer"),
    getDashboardOrders(user.id, user.role ?? "buyer", 10),
    getDashboardThreads(user.id, 5),
  ]);

  const isBuyer = user.role === "buyer";
  const isSeller = user.role === "seller";

  // Format GMV for display
  const gmvDisplay = formatCurrency(summary.gmvLast30d, "USD");

  // Role-aware sections
  const roleSections = {
    buyer: {
      ordersTitle: "Active orders",
      ordersSubtitle: "Orders awaiting delivery",
      messagesTitle: "Messages",
      recentViewsTitle: "Recent views",
    },
    seller: {
      ordersTitle: "Open orders",
      ordersSubtitle: "Orders in progress",
      messagesTitle: "Messages",
      payoutsTitle: "Payouts",
      ratingsTitle: "Ratings",
    },
  };

  const sections = isBuyer ? roleSections.buyer : roleSections.seller;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-h1 font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted">
          {isBuyer
            ? "Track your orders and messages"
            : "Manage your orders, ratings, and payouts"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Orders (last 30d)"
          value={summary.ordersLast30d}
        />
        {isSeller && (
          <>
            <KpiCard
              label="GMV (last 30d)"
              value={gmvDisplay}
            />
            <KpiCard
              label="Avg rating"
              value={summary.avgRating > 0 ? summary.avgRating.toFixed(1) : "—"}
            />
          </>
        )}
        <KpiCard
          label="Unread messages"
          value={summary.unreadMessages}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        {isSeller && (
          <QuickActionButton
            href="/services/new"
            variant="primary"
            action="create_service"
          >
            Create a Service
          </QuickActionButton>
        )}
        <QuickActionButton href="/search" action="browse_services">
          Browse Services
        </QuickActionButton>
        <QuickActionButton href="/messages" action="go_to_messages">
          Go to Messages
        </QuickActionButton>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>{sections.ordersTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                        Order
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                        Status
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted">
                        Amount
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border transition hover:bg-elev"
                      >
                        <td className="py-3">
                          <Link
                            href={`/orders/${order.id}`}
                            className="block font-medium text-bg hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
                          >
                            {order.serviceTitle}
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                            {order.counterpartAvatarUrl && (
                              <Avatar className="h-4 w-4">
                                <AvatarImage
                                  src={order.counterpartAvatarUrl}
                                  alt={order.counterpartName ?? ""}
                                />
                                <AvatarFallback>
                                  {(order.counterpartName ?? "U")[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span>
                              {isBuyer ? "Seller" : "Buyer"}:{" "}
                              {order.counterpartName ?? "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <StatusChip status={order.status as OrderStatus} />
                        </td>
                        <td className="py-3 text-right tabular-nums font-medium">
                          {formatCurrency(order.amountMinor, order.currency)}
                        </td>
                        <td className="py-3 text-right text-sm text-muted">
                          {formatRelativeTime(order.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No orders yet"
                description={
                  isBuyer
                    ? "Start browsing services to place your first order."
                    : "Orders will appear here once buyers place orders."
                }
                action={
                  isBuyer
                    ? {
                        label: "Browse Services",
                        href: "/search",
                      }
                    : {
                        label: "Create a Service",
                        href: "/services/new",
                      }
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Messages Preview */}
        <Card>
          <CardHeader>
            <CardTitle>{sections.messagesTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {threads.length > 0 ? (
              <div className="space-y-3">
                {threads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/messages/${thread.id}`}
                    className="block rounded-lg p-3 transition hover:bg-elev focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        {thread.counterpartAvatarUrl && (
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage
                              src={thread.counterpartAvatarUrl}
                              alt={thread.counterpartName ?? ""}
                            />
                            <AvatarFallback>
                              {(thread.counterpartName ?? "U")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-medium text-bg">
                              {thread.counterpartName ?? "Unknown"}
                            </span>
                            {thread.unreadCount > 0 && (
                              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                          {thread.lastMessagePreview && (
                            <p className="truncate text-sm text-muted">
                              {thread.lastMessagePreview}
                            </p>
                          )}
                        </div>
                      </div>
                      {thread.lastMessageAt && (
                        <div className="flex-shrink-0 text-xs text-muted">
                          {formatRelativeTime(thread.lastMessageAt)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No messages yet"
                description="Your message threads will appear here."
                action={{
                  label: "Go to Messages",
                  href: "/messages",
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
