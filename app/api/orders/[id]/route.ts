import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import {
  OrderPay,
  OrderStart,
  DeliverySubmit,
  RevisionRequest,
  OrderComplete,
  OrderStatus,
} from "@/lib/shared/validators";
import {
  canTransition,
  validateTransition,
} from "@/lib/shared/order-state-machine";
import { trackServer } from "@/lib/analytics/track";
import { z } from "zod";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/orders/[id]
 * Update order status with state machine transitions
 * 
 * Body: {
 *   action: "pay" | "start" | "deliver" | "request_revision" | "complete"
 *   ...action-specific fields
 * }
 */
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Fetch order
    const order = await db.order.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            sellerId: true,
          },
        },
        deliveries: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify access (buyer, seller, or admin)
    const isBuyer = order.buyerId === user.id;
    const isSeller = order.sellerId === user.id;
    const isAdmin = user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have access to this order" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    let newStatus: z.infer<typeof OrderStatus>;
    let updateData: any = {};

    switch (action) {
      case "pay": {
        // Transition: awaiting_payment -> in_escrow
        if (!isBuyer && !isAdmin) {
          return NextResponse.json(
            { error: "Only buyer can pay for order" },
            { status: 403 }
          );
        }

        const validated = OrderPay.parse(body);
        const validation = validateTransition(order.status, "in_escrow", {
          hasPayment: !!validated.paymentIntentId,
          hasEscrow: !!validated.escrowId,
        });

        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || "Invalid transition" },
            { status: 400 }
          );
        }

        newStatus = "in_escrow";
        updateData = {
          status: newStatus,
          escrowId: validated.escrowId,
          paidAt: new Date(),
        };
        break;
      }

      case "start": {
        // Transition: in_escrow -> in_progress
        if (!isSeller && !isAdmin) {
          return NextResponse.json(
            { error: "Only seller can start order" },
            { status: 403 }
          );
        }

        OrderStart.parse(body);
        const validation = validateTransition(order.status, "in_progress");

        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || "Invalid transition" },
            { status: 400 }
          );
        }

        newStatus = "in_progress";
        updateData = {
          status: newStatus,
        };
        break;
      }

      case "deliver": {
        // Transition: in_progress -> delivered
        if (!isSeller && !isAdmin) {
          return NextResponse.json(
            { error: "Only seller can deliver order" },
            { status: 403 }
          );
        }

        const validated = DeliverySubmit.parse(body);
        const validation = validateTransition(order.status, "delivered");

        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || "Invalid transition" },
            { status: 400 }
          );
        }

        // Create delivery record
        await db.delivery.create({
          data: {
            orderId: order.id,
            message: validated.message || null,
            files: validated.files || [],
            status: "submitted",
            deliveredAt: new Date(),
          },
        });

        newStatus = "delivered";
        updateData = {
          status: newStatus,
          deliveredAt: new Date(),
        };

        trackServer("delivery_submitted", {
          actorId: user.id,
          orderId: order.id,
        });
        break;
      }

      case "request_revision": {
        // Transition: delivered -> revision_requested
        if (!isBuyer && !isAdmin) {
          return NextResponse.json(
            { error: "Only buyer can request revision" },
            { status: 403 }
          );
        }

        const validated = RevisionRequest.parse(body);
        const validation = validateTransition(order.status, "revision_requested");

        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || "Invalid transition" },
            { status: 400 }
          );
        }

        // Update latest delivery status
        if (order.deliveries.length > 0) {
          await db.delivery.update({
            where: { id: order.deliveries[0].id },
            data: { status: "revision_requested" },
          });
        }

        newStatus = "revision_requested";
        updateData = {
          status: newStatus,
        };

        trackServer("revision_requested", {
          actorId: user.id,
          orderId: order.id,
        });
        break;
      }

      case "resume": {
        // Transition: revision_requested -> in_progress
        // Seller resumes work after revision request
        if (!isSeller && !isAdmin) {
          return NextResponse.json(
            { error: "Only seller can resume order after revision" },
            { status: 403 }
          );
        }

        const validation = validateTransition(order.status, "in_progress");

        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || "Invalid transition" },
            { status: 400 }
          );
        }

        newStatus = "in_progress";
        updateData = {
          status: newStatus,
        };
        break;
      }

      case "complete": {
        // Transition: delivered -> completed
        if (!isBuyer && !isAdmin) {
          return NextResponse.json(
            { error: "Only buyer can complete order" },
            { status: 403 }
          );
        }

        const validated = OrderComplete.parse(body);
        const validation = validateTransition(order.status, "completed", {
          deliveredAt: order.deliveredAt,
          autoCompleteDays: validated.autoComplete ? 7 : undefined,
        });

        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || "Invalid transition" },
            { status: 400 }
          );
        }

        newStatus = "completed";
        updateData = {
          status: newStatus,
          completedAt: new Date(),
        };

        // Update delivery status to accepted
        if (order.deliveries.length > 0) {
          await db.delivery.update({
            where: { id: order.deliveries[0].id },
            data: { status: "accepted" },
          });
        }

        trackServer("order_completed", {
          actorId: user.id,
          orderId: order.id,
        });
        break;
      }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Must be: pay, start, deliver, request_revision, resume, or complete",
          },
          { status: 400 }
        );
    }

    // Update order
    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    trackServer("order_status_changed", {
      actorId: user.id,
      orderId: order.id,
      fromStatus: order.status,
      toStatus: newStatus,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * Cancel order (transition: in_progress -> cancelled)
 * Only buyer or seller can cancel
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Fetch order
    const order = await db.order.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify access (buyer, seller, or admin)
    const isBuyer = order.buyerId === user.id;
    const isSeller = order.sellerId === user.id;
    const isAdmin = user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have access to this order" },
        { status: 403 }
      );
    }

    // Validate transition using state machine
    const validation = validateTransition(order.status, "cancelled");
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid transition" },
        { status: 400 }
      );
    }

    // TODO: Process refund if payment was made
    // Funds -> original source unless custom policy
    // This would integrate with payment provider (Stripe, etc.)

    // Update order
    const cancelledOrder = await db.order.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    trackServer("order_status_changed", {
      actorId: user.id,
      orderId: order.id,
      fromStatus: order.status,
      toStatus: "cancelled",
    });

    return NextResponse.json(cancelledOrder);
  } catch (error) {
    console.error("Failed to cancel order:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
