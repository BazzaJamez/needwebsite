import { db } from "./db";

type UserRole = "buyer" | "seller" | "admin";

/**
 * Dashboard summary data
 */
export interface DashboardSummary {
  ordersLast30d: number;
  gmvLast30d: number; // Gross Merchandise Value in minor units (cents)
  avgRating: number;
  unreadMessages: number;
}

/**
 * Dashboard order with minimal fields for table display
 */
export interface DashboardOrder {
  id: string;
  status: string;
  amountMinor: number;
  currency: string;
  updatedAt: Date;
  // For buyer: seller name; for seller: buyer name
  counterpartName: string | null;
  counterpartAvatarUrl: string | null;
  serviceTitle: string;
}

/**
 * Dashboard thread preview
 */
export interface DashboardThread {
  id: string;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  counterpartName: string | null;
  counterpartAvatarUrl: string | null;
  orderId: string | null;
}

/**
 * Get dashboard summary KPIs for a user
 */
export async function getDashboardSummary(
  userId: string,
  role: UserRole
): Promise<DashboardSummary> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Orders count and GMV for last 30 days
  const ordersWhere =
    role === "buyer"
      ? {
          buyerId: userId,
          createdAt: { gte: thirtyDaysAgo },
        }
      : {
          sellerId: userId,
          createdAt: { gte: thirtyDaysAgo },
        };

  const orders = await db.order.findMany({
    where: ordersWhere,
    select: {
      amountMinor: true,
    },
  });

  const ordersLast30d = orders.length;
  const gmvLast30d = orders.reduce(
    (sum: number, order: { amountMinor: number }) => sum + order.amountMinor,
    0
  );

  // Average rating (for sellers: received ratings; for buyers: N/A, return 0)
  let avgRating = 0;
  if (role === "seller") {
    const reputation = await db.reputation.findUnique({
      where: { userId },
    });
    avgRating = reputation?.ratingAvg ?? 0;
  }

  // Unread messages count
  // Get all messages in threads where user is a participant
  const userThreads = await db.messageThreadParticipant.findMany({
    where: { userId },
    select: { threadId: true },
  });

  const threadIds = userThreads.map((ut: { threadId: string }) => ut.threadId);

  // Fetch messages sent by others in these threads
  const messages = await db.message.findMany({
    where: {
      threadId: { in: threadIds },
      senderId: { not: userId },
    },
    select: {
      readBy: true,
    },
  });

  // Count messages where userId is not in readBy array (JSON array)
  const unreadMessages = messages.filter((msg: { readBy: unknown }) => {
    const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
    return !readBy.includes(userId);
  }).length;

  return {
    ordersLast30d,
    gmvLast30d,
    avgRating,
    unreadMessages,
  };
}

/**
 * Get recent orders for dashboard table
 */
export async function getDashboardOrders(
  userId: string,
  role: UserRole,
  limit = 10
): Promise<DashboardOrder[]> {
  const orders = await db.order.findMany({
    where:
      role === "buyer"
        ? { buyerId: userId }
        : { sellerId: userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      buyer: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
      seller: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
      service: {
        select: {
          title: true,
        },
      },
    },
  });

  return orders.map((order: {
    id: string;
    status: string;
    amountMinor: number;
    currency: string;
    updatedAt: Date;
    buyer: { name: string | null; avatarUrl: string | null };
    seller: { name: string | null; avatarUrl: string | null };
    service: { title: string };
  }) => ({
    id: order.id,
    status: order.status,
    amountMinor: order.amountMinor,
    currency: order.currency,
    updatedAt: order.updatedAt,
    counterpartName:
      role === "buyer" ? order.seller.name : order.buyer.name,
    counterpartAvatarUrl:
      role === "buyer" ? order.seller.avatarUrl : order.buyer.avatarUrl,
    serviceTitle: order.service.title,
  }));
}

/**
 * Get recent message threads for dashboard preview
 */
export async function getDashboardThreads(
  userId: string,
  limit = 5
): Promise<DashboardThread[]> {
  // Get threads where user is a participant
  const participantRecords = await db.messageThreadParticipant.findMany({
    where: { userId },
    include: {
      thread: {
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              body: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: {
      thread: {
        lastMessageAt: "desc",
      },
    },
    take: limit,
  });

  // Get unread counts per thread
  const threadIds = participantRecords.map(
    (p: { threadId: string }) => p.threadId
  );

  const allMessages = await db.message.findMany({
    where: {
      threadId: { in: threadIds },
      senderId: { not: userId },
    },
    select: {
      threadId: true,
      readBy: true,
    },
  });

  // Group by threadId and count unread
  const unreadMap = new Map<string, number>();
  threadIds.forEach((threadId: string) => unreadMap.set(threadId, 0));

  allMessages.forEach((msg: { threadId: string; readBy: unknown }) => {
    const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
    if (!readBy.includes(userId)) {
      const current = unreadMap.get(msg.threadId) ?? 0;
      unreadMap.set(msg.threadId, current + 1);
    }
  });

  return participantRecords.map((participant: {
    threadId: string;
    thread: {
      id: string;
      lastMessageAt: Date | null;
      orderId: string | null;
      participants: Array<{
        userId: string;
        user: { id: string; name: string | null; avatarUrl: string | null };
      }>;
      messages: Array<{ body: string | null; createdAt: Date }>;
    };
  }) => {
    const thread = participant.thread;
    const otherParticipants = thread.participants.filter(
      (p: { userId: string }) => p.userId !== userId
    );
    const counterpart = otherParticipants[0]?.user;

    return {
      id: thread.id,
      lastMessageAt: thread.lastMessageAt,
      lastMessagePreview: thread.messages[0]?.body?.substring(0, 100) ?? null,
      unreadCount: unreadMap.get(thread.id) ?? 0,
      counterpartName: counterpart?.name ?? null,
      counterpartAvatarUrl: counterpart?.avatarUrl ?? null,
      orderId: thread.orderId ?? null,
    };
  });
}

