"use client";

import { track } from "@/lib/analytics/track";

/**
 * Track order-related events
 */

export function trackDeliverySubmitted(orderId: string) {
  track("delivery_submitted", {
    orderId,
  });
}

export function trackRevisionRequested(orderId: string, reason?: string) {
  track("revision_requested", {
    orderId,
    reason,
  });
}

export function trackOrderCompleted(orderId: string) {
  track("order_completed", {
    orderId,
  });
}

export function trackOrderCreated(orderId: string, serviceId: string) {
  track("order_created", {
    orderId,
    serviceId,
  });
}

export function trackOrderStatusChanged(
  orderId: string,
  fromStatus: string,
  toStatus: string
) {
  track("order_status_changed", {
    orderId,
    fromStatus,
    toStatus,
  });
}

export function trackQuoteSent(quoteId: string, serviceId: string) {
  track("quote_sent", {
    quoteId,
    serviceId,
  });
}

export function trackCheckoutStarted(serviceId: string, packageTier: string) {
  track("checkout_started", {
    serviceId,
    packageTier,
  });
}

export function trackReviewSubmitted(orderId: string, rating: number) {
  track("review_submitted", {
    orderId,
    rating,
  });
}

export function trackPayoutRequested(payoutId: string, amountMinor: number) {
  track("payout_requested", {
    payoutId,
    amountMinor,
  });
}

export function trackPayoutPaid(payoutId: string) {
  track("payout_paid", {
    payoutId,
  });
}

export function trackDisputeOpened(orderId: string, reason: string) {
  track("dispute_opened", {
    orderId,
    reason,
  });
}

export function trackDisputeResolved(
  disputeId: string,
  resolution: string
) {
  track("dispute_resolved", {
    disputeId,
    resolution,
  });
}

