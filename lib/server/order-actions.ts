"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  OrderPay,
  OrderStart,
  DeliverySubmit,
  RevisionRequest,
  OrderComplete,
  OrderCancel,
  OrderDispute,
  type OrderStatusType,
} from "@/lib/shared/validators";
import { canTransition, validateTransition } from "@/lib/shared/order-state-machine";

// TODO: Import Prisma client when available
// import { prisma } from "@/lib/server/prisma";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Transition order from awaiting_payment -> in_escrow
 * Requires payment and escrow to be created
 */
export async function payOrder(
  input: z.infer<typeof OrderPay>
): Promise<ActionResult<{ orderId: string; status: OrderStatusType }>> {
  try {
    const data = OrderPay.parse(input);

    // TODO: Fetch order from database
    // const order = await prisma.order.findUnique({
    //   where: { id: data.orderId },
    // });
    // if (!order) {
    //   return { success: false, error: "Order not found" };
    // }

    // Validate transition
    // const validation = validateTransition(order.status, "in_escrow", {
    //   hasPayment: !!data.paymentIntentId,
    //   hasEscrow: !!data.escrowId,
    // });
    // if (!validation.valid) {
    //   return { success: false, error: validation.error || "Invalid transition" };
    // }

    // TODO: Update order
    // const updated = await prisma.order.update({
    //   where: { id: data.orderId },
    //   data: {
    //     status: "in_escrow",
    //     escrowId: data.escrowId,
    //     paidAt: new Date(),
    //   },
    // });

    // TODO: Emit event: order_status_changed

    revalidatePath(`/orders/${data.orderId}`);
    return {
      success: true,
      data: { orderId: data.orderId, status: "in_escrow" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to process payment" };
  }
}

/**
 * Transition order from in_escrow -> in_progress
 * Seller starts work
 */
export async function startOrder(
  input: z.infer<typeof OrderStart>
): Promise<ActionResult<{ orderId: string; status: OrderStatusType }>> {
  try {
    const data = OrderStart.parse(input);

    // TODO: Fetch order and verify seller access
    // const order = await prisma.order.findUnique({
    //   where: { id: data.orderId },
    // });

    // Validate transition
    // if (!canTransition(order.status, "in_progress")) {
    //   return { success: false, error: "Invalid transition" };
    // }

    // TODO: Update order
    // const updated = await prisma.order.update({
    //   where: { id: data.orderId },
    //   data: { status: "in_progress" },
    // });

    revalidatePath(`/orders/${data.orderId}`);
    return {
      success: true,
      data: { orderId: data.orderId, status: "in_progress" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to start order" };
  }
}

/**
 * Submit delivery (in_progress -> delivered)
 * Seller delivers work
 */
export async function deliverOrder(
  input: z.infer<typeof DeliverySubmit>
): Promise<ActionResult<{ orderId: string; deliveryId: string }>> {
  try {
    const data = DeliverySubmit.parse(input);

    // TODO: Fetch order and verify seller access
    // const order = await prisma.order.findUnique({
    //   where: { id: data.orderId },
    // });

    // Validate transition
    // if (!canTransition(order.status, "delivered")) {
    //   return { success: false, error: "Invalid transition" };
    // }

    // TODO: Create delivery and update order
    // const delivery = await prisma.delivery.create({
    //   data: {
    //     orderId: data.orderId,
    //     message: data.message,
    //     files: data.files,
    //     status: "submitted",
    //   },
    // });

    // await prisma.order.update({
    //   where: { id: data.orderId },
    //   data: {
    //     status: "delivered",
    //     deliveredAt: new Date(),
    //   },
    // });

    // TODO: Emit event: delivery_submitted

    revalidatePath(`/orders/${data.orderId}`);
    return {
      success: true,
      data: { orderId: data.orderId, deliveryId: "pending" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to submit delivery" };
  }
}

/**
 * Request revision (delivered -> revision_requested)
 * Buyer requests changes
 */
export async function requestRevision(
  input: z.infer<typeof RevisionRequest>
): Promise<ActionResult<{ orderId: string; status: OrderStatusType }>> {
  try {
    const data = RevisionRequest.parse(input);

    // TODO: Fetch order and verify buyer access
    // const order = await prisma.order.findUnique({
    //   where: { id: data.orderId },
    // });

    // Validate transition
    // if (!canTransition(order.status, "revision_requested")) {
    //   return { success: false, error: "Invalid transition" };
    // }

    // TODO: Update latest delivery and order
    // await prisma.delivery.updateMany({
    //   where: { orderId: data.orderId, status: "submitted" },
    //   data: { status: "revision_requested" },
    // });

    // await prisma.order.update({
    //   where: { id: data.orderId },
    //   data: { status: "revision_requested" },
    // });

    // TODO: Emit event: revision_requested

    revalidatePath(`/orders/${data.orderId}`);
    return {
      success: true,
      data: { orderId: data.orderId, status: "revision_requested" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to request revision" };
  }
}

/**
 * Complete order (delivered -> completed)
 * Buyer accepts or auto-completes
 */
export async function completeOrder(
  input: z.infer<typeof OrderComplete>
): Promise<ActionResult<{ orderId: string; status: OrderStatusType }>> {
  try {
    const data = OrderComplete.parse(input);

    // TODO: Fetch order and verify buyer access (or admin for auto-complete)
    // const order = await prisma.order.findUnique({
    //   where: { id: data.orderId },
    // });

    // Validate transition
    // const validation = validateTransition(order.status, "completed", {
    //   deliveredAt: order.deliveredAt,
    //   autoCompleteDays: data.autoComplete ? 7 : undefined, // Example: 7 days
    // });
    // if (!validation.valid) {
    //   return { success: false, error: validation.error || "Invalid transition" };
    // }

    // TODO: Update order
    // await prisma.order.update({
    //   where: { id: data.orderId },
    //   data: {
    //     status: "completed",
    //     completedAt: new Date(),
    //   },
    // });

    // TODO: Emit event: order_completed

    revalidatePath(`/orders/${data.orderId}`);
    return {
      success: true,
      data: { orderId: data.orderId, status: "completed" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to complete order" };
  }
}

/**
 * Cancel order (in_progress -> cancelled)
 * Buyer or seller cancels (with refund rules)
 */
export async function cancelOrder(
  input: z.infer<typeof OrderCancel>
): Promise<ActionResult<{ orderId: string; status: OrderStatusType }>> {
  try {
    const data = OrderCancel.parse(input);

    // TODO: Fetch order and verify access (buyer or seller)
    // const order = await prisma.order.findUnique({
    //   where: { id: data.orderId },
    // });

    // Validate transition
    // if (!canTransition(order.status, "cancelled")) {
    //   return { success: false, error: "Invalid transition" };
    // }

    // TODO: Process refund (funds -> original source)
    // TODO: Update order
    // await prisma.order.update({
    //   where: { id: data.orderId },
    //   data: {
    //     status: "cancelled",
    //     cancelledAt: new Date(),
    //   },
    // });

    revalidatePath(`/orders/${data.orderId}`);
    return {
      success: true,
      data: { orderId: data.orderId, status: "cancelled" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to cancel order" };
  }
}

/**
 * Open dispute (any -> disputed)
 * Freezes order timers
 */
export async function openDispute(
  input: z.infer<typeof OrderDispute>
): Promise<ActionResult<{ orderId: string; disputeId: string }>> {
  try {
    const data = OrderDispute.parse(input);

    // TODO: Fetch order and verify access (buyer or seller)
    // const order = await prisma.order.findUnique({
    //   where: { id: data.orderId },
    // });

    // Validate transition
    // if (!canTransition(order.status, "disputed")) {
    //   return { success: false, error: "Invalid transition" };
    // }

    // TODO: Create dispute and update order
    // const dispute = await prisma.dispute.create({
    //   data: {
    //     orderId: data.orderId,
    //     openedById: currentUserId,
    //     reason: data.reason,
    //     notes: data.notes,
    //     status: "open",
    //   },
    // });

    // await prisma.order.update({
    //   where: { id: data.orderId },
    //   data: { status: "disputed" },
    // });

    // TODO: Emit event: dispute_opened

    revalidatePath(`/orders/${data.orderId}`);
    return {
      success: true,
      data: { orderId: data.orderId, disputeId: "pending" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to open dispute" };
  }
}

