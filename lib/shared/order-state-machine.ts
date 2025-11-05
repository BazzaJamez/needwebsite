/**
 * Order state machine transitions
 * Validates allowed status transitions according to domain model
 */

import type { OrderStatusType } from "./validation";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["awaiting_payment"],
  awaiting_payment: ["in_escrow", "cancelled"],
  in_escrow: ["in_progress"],
  in_progress: ["delivered", "cancelled", "disputed"],
  delivered: ["completed", "revision_requested", "disputed"],
  revision_requested: ["in_progress"],
  // Dispute resolutions can transition from disputed
  disputed: ["resolved_refund", "resolved_partial", "resolved_upheld"],
  // Terminal states
  completed: [],
  cancelled: [],
  resolved_refund: [],
  resolved_partial: [],
  resolved_upheld: [],
};

export function canTransition(
  from: OrderStatusType,
  to: OrderStatusType
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: OrderStatusType): OrderStatusType[] {
  return (ALLOWED_TRANSITIONS[current] ?? []) as OrderStatusType[];
}

/**
 * Validates transition with additional business rules
 */
export function validateTransition(
  from: OrderStatusType,
  to: OrderStatusType,
  context?: {
    hasPayment?: boolean;
    hasEscrow?: boolean;
    deliveredAt?: Date | null;
    autoCompleteDays?: number;
  }
): { valid: boolean; error?: string } {
  if (!canTransition(from, to)) {
    return {
      valid: false,
      error: `Invalid transition from ${from} to ${to}`,
    };
  }

  // Specific rule: in_escrow requires payment and escrow
  if (to === "in_escrow") {
    if (!context?.hasPayment) {
      return { valid: false, error: "Payment required to enter escrow" };
    }
    if (!context?.hasEscrow) {
      return { valid: false, error: "Escrow required to enter escrow state" };
    }
  }

  // Specific rule: completed requires delivery or auto-complete
  if (to === "completed") {
    if (!context?.deliveredAt && !context?.autoCompleteDays) {
      return {
        valid: false,
        error: "Order must be delivered before completion",
      };
    }
  }

  return { valid: true };
}

