"use server";

import { z } from "zod";
import {
  DisputeResolve,
  type OrderStatusType,
} from "@/lib/shared/validators";
import { canTransition } from "@/lib/shared/order-state-machine";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Resolve dispute (disputed -> resolved_*)
 * Admin action
 */
export async function resolveDispute(
  input: z.infer<typeof DisputeResolve>
): Promise<ActionResult<{ disputeId: string; resolution: string }>> {
  try {
    const data = DisputeResolve.parse(input);

    // TODO: Fetch dispute and verify admin access
    // const dispute = await prisma.dispute.findUnique({
    //   where: { id: data.disputeId },
    //   include: { order: true },
    // });

    // Validate transition
    // if (!canTransition(dispute.order.status, data.resolution)) {
    //   return { success: false, error: "Invalid resolution transition" };
    // }

    // TODO: Update dispute and order
    // await prisma.dispute.update({
    //   where: { id: data.disputeId },
    //   data: {
    //     status: data.resolution,
    //     resolution: {
    //       type: data.resolution,
    //       amount: data.amountMinor,
    //       notes: data.notes,
    //       resolvedBy: currentUserId,
    //       resolvedAt: new Date(),
    //     },
    //   },
    // });

    // await prisma.order.update({
    //   where: { id: dispute.orderId },
    //   data: { status: data.resolution },
    // });

    // TODO: Process refund if applicable
    // TODO: Emit event: dispute_resolved

    return {
      success: true,
      data: { disputeId: data.disputeId, resolution: data.resolution },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to resolve dispute" };
  }
}

