import { db } from "./db";
import type { OrderStatus } from "@prisma/client";
import { canTransition } from "@/lib/shared/order-state-machine";

/**
 * Transition order to a new status with validation
 */
export async function transitionOrder(
  orderId: string,
  newStatus: OrderStatus,
  userId: string,
  metadata?: {
    escrowId?: string;
    paidAt?: Date;
    deliveredAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  }
) {
  // Get current order
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Verify user has permission
  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new Error("Unauthorized");
  }

  // Validate transition
  if (!canTransition(order.status, newStatus)) {
    throw new Error(
      `Invalid transition from ${order.status} to ${newStatus}`
    );
  }

  // Build update data
  const updateData: {
    status: OrderStatus;
    escrowId?: string;
    paidAt?: Date;
    deliveredAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  } = {
    status: newStatus,
  };

  // Update timestamps based on status
  switch (newStatus) {
    case "in_escrow":
      if (metadata?.escrowId) updateData.escrowId = metadata.escrowId;
      if (metadata?.paidAt) updateData.paidAt = metadata.paidAt;
      break;
    case "delivered":
      if (metadata?.deliveredAt) updateData.deliveredAt = metadata.deliveredAt;
      break;
    case "completed":
      if (metadata?.completedAt) updateData.completedAt = metadata.completedAt;
      break;
    case "cancelled":
      if (metadata?.cancelledAt) updateData.cancelledAt = metadata.cancelledAt;
      break;
  }

  // Update order
  return db.order.update({
    where: { id: orderId },
    data: updateData,
  });
}

/**
 * Get order by ID with full relations
 */
export async function getOrderById(orderId: string, userId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: true,
      seller: {
        include: {
          reputation: true,
        },
      },
      service: {
        include: {
          packages: true,
        },
      },
      deliveries: {
        orderBy: {
          createdAt: "desc",
        },
      },
      review: true,
      dispute: true,
    },
  });

  if (!order) {
    return null;
  }

  // Verify user has permission
  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new Error("Unauthorized");
  }

  return order;
}

/**
 * Get orders for a user (buyer or seller)
 */
export async function getOrdersForUser(
  userId: string,
  role: "buyer" | "seller",
  status?: OrderStatus,
  limit: number = 20,
  cursor?: string
) {
  const where: {
    buyerId?: string;
    sellerId?: string;
    status?: OrderStatus;
  } = {
    ...(role === "buyer" ? { buyerId: userId } : { sellerId: userId }),
    ...(status && { status }),
  };

  const orders = await db.order.findMany({
    where,
    include: {
      buyer: true,
      seller: {
        include: {
          reputation: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
        },
      },
      deliveries: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
      review: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1,
    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),
  });

  const hasMore = orders.length > limit;
  const items = hasMore ? orders.slice(0, limit) : orders;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}

/**
 * Submit delivery for an order
 */
export async function submitDelivery(
  orderId: string,
  sellerId: string,
  data: {
    message?: string;
    files?: string[];
  }
) {
  // Verify order exists and seller owns it
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.sellerId !== sellerId) {
    throw new Error("Unauthorized");
  }

  if (order.status !== "in_progress") {
    throw new Error(`Cannot deliver order in status: ${order.status}`);
  }

  // Create delivery
  const delivery = await db.delivery.create({
    data: {
      orderId,
      message: data.message,
      files: data.files || [],
      status: "submitted",
      deliveredAt: new Date(),
    },
  });

  // Transition order to delivered
  await transitionOrder(orderId, "delivered", sellerId, {
    deliveredAt: new Date(),
  });

  return delivery;
}

/**
 * Request revision for a delivered order
 */
export async function requestRevision(
  orderId: string,
  buyerId: string,
  data: {
    reason: string;
    notes?: string;
  }
) {
  // Verify order exists and buyer owns it
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.buyerId !== buyerId) {
    throw new Error("Unauthorized");
  }

  if (order.status !== "delivered") {
    throw new Error(`Cannot request revision for order in status: ${order.status}`);
  }

  // Update latest delivery status
  const latestDelivery = await db.delivery.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  if (latestDelivery) {
    await db.delivery.update({
      where: { id: latestDelivery.id },
      data: { status: "revision_requested" },
    });
  }

  // Transition order to revision_requested
  await transitionOrder(orderId, "revision_requested", buyerId);

  return order;
}

/**
 * Complete an order (buyer accepts delivery)
 */
export async function completeOrder(
  orderId: string,
  buyerId: string,
  autoComplete: boolean = false
) {
  // Verify order exists and buyer owns it
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.buyerId !== buyerId) {
    throw new Error("Unauthorized");
  }

  if (order.status !== "delivered") {
    throw new Error(`Cannot complete order in status: ${order.status}`);
  }

  // Transition order to completed
  await transitionOrder(orderId, "completed", buyerId, {
    completedAt: new Date(),
  });

  return order;
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  orderId: string,
  userId: string,
  data: {
    reason?: string;
  }
) {
  // Verify order exists
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Verify user has permission (buyer or seller)
  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new Error("Unauthorized");
  }

  if (order.status !== "in_progress") {
    throw new Error(`Cannot cancel order in status: ${order.status}`);
  }

  // Transition order to cancelled
  await transitionOrder(orderId, "cancelled", userId, {
    cancelledAt: new Date(),
  });

  return order;
}

