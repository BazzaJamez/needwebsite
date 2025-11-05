import { z } from "zod";

// Base schemas
export const Money = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.enum(["USD", "EUR", "GBP", "ZAR"]),
});

export const PackageTier = z.enum(["basic", "standard", "premium"]);

export const OrderStatus = z.enum([
  "draft",
  "awaiting_payment",
  "in_escrow",
  "in_progress",
  "delivered",
  "revision_requested",
  "completed",
  "cancelled",
  "disputed",
  "resolved_refund",
  "resolved_partial",
  "resolved_upheld",
]);

export type OrderStatusType = z.infer<typeof OrderStatus>;

// Order creation
export const OrderCreate = z.object({
  buyerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  packageTier: PackageTier,
  addons: z
    .array(
      z.object({
        id: z.string(),
        amount: z.number().int().nonnegative(),
      })
    )
    .optional(),
  requirements: z.record(z.string(), z.any()).optional(),
});

// Order payment transition (awaiting_payment -> in_escrow)
export const OrderPay = z.object({
  orderId: z.string().uuid(),
  paymentIntentId: z.string(),
  escrowId: z.string(),
});

// Order start transition (in_escrow -> in_progress)
export const OrderStart = z.object({
  orderId: z.string().uuid(),
});

// Delivery submission (in_progress -> delivered)
export const DeliverySubmit = z.object({
  orderId: z.string().uuid(),
  message: z.string().optional(),
  files: z.array(z.string().url()).default([]),
});

// Revision request (delivered -> revision_requested)
export const RevisionRequest = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

// Order complete (delivered -> completed)
export const OrderComplete = z.object({
  orderId: z.string().uuid(),
  autoComplete: z.boolean().default(false),
});

// Order cancel (in_progress -> cancelled)
export const OrderCancel = z.object({
  orderId: z.string().uuid(),
  reason: z.string().optional(),
});

// Order dispute (any -> disputed)
export const OrderDispute = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

// Dispute resolution
export const DisputeResolve = z.object({
  disputeId: z.string().uuid(),
  resolution: z.enum(["resolved_refund", "resolved_partial", "resolved_upheld"]),
  amountMinor: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

// Type exports
export type MoneyType = z.infer<typeof Money>;
export type OrderCreateType = z.infer<typeof OrderCreate>;
export type OrderPayType = z.infer<typeof OrderPay>;
export type OrderStartType = z.infer<typeof OrderStart>;
export type DeliverySubmitType = z.infer<typeof DeliverySubmit>;
export type RevisionRequestType = z.infer<typeof RevisionRequest>;
export type OrderCompleteType = z.infer<typeof OrderComplete>;
export type OrderCancelType = z.infer<typeof OrderCancel>;
export type OrderDisputeType = z.infer<typeof OrderDispute>;
export type DisputeResolveType = z.infer<typeof DisputeResolve>;

