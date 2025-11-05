import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import { OrderCreate } from "@/lib/shared/validators";
import { trackServer } from "@/lib/analytics/track";
import { z } from "zod";

/**
 * GET /api/orders
 * List orders filtered by buyer or seller role
 * Query params:
 * - role: "buyer" | "seller" (defaults to user's role)
 * - status: OrderStatus (optional filter)
 * - limit: number (default 20, max 100)
 * - cursor: string (pagination cursor)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") as "buyer" | "seller" | null;
    const status = searchParams.get("status");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100
    );
    const cursor = searchParams.get("cursor");

    // Determine role - default to user's role
    const filterRole = role || user.role || "buyer";
    if (filterRole !== "buyer" && filterRole !== "seller") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'buyer' or 'seller'" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      [filterRole === "buyer" ? "buyerId" : "sellerId"]: user.id,
    };

    if (status) {
      where.status = status;
    }

    // Build query
    const query: any = {
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        deliveries: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        review: {
          select: {
            rating: true,
            body: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1, // Fetch one extra to determine if there's a next page
    };

    // Cursor-based pagination
    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }

    const orders = await db.order.findMany(query);

    // Check if there's a next page
    const hasNextPage = orders.length > limit;
    const items = hasNextPage ? orders.slice(0, limit) : orders;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return NextResponse.json({
      orders: items,
      pagination: {
        hasNextPage,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("Failed to list orders:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to list orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create order from service/package
 * Body: OrderCreate schema
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Require buyer role
    if (user.role !== "buyer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only buyers can create orders" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validated = OrderCreate.parse(body);

    // Ensure buyerId matches authenticated user (or admin can create for others)
    if (validated.buyerId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "buyerId must match authenticated user" },
        { status: 403 }
      );
    }

    // Fetch service and package
    const service = await db.service.findUnique({
      where: { id: validated.serviceId },
      include: {
        packages: true,
        seller: {
          select: {
            id: true,
            role: true,
            isSuspended: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (!service.isActive) {
      return NextResponse.json(
        { error: "Service is not active" },
        { status: 400 }
      );
    }

    if (service.seller.isSuspended) {
      return NextResponse.json(
        { error: "Seller is suspended" },
        { status: 400 }
      );
    }

    // Find package
    const packageObj = service.packages.find(
      (pkg) => pkg.tier === validated.packageTier
    );

    if (!packageObj) {
      return NextResponse.json(
        { error: "Package not found for the specified tier" },
        { status: 404 }
      );
    }

    // Validate invariant: buyerId !== sellerId
    if (service.sellerId === validated.buyerId) {
      return NextResponse.json(
        { error: "Buyer cannot be the same as seller" },
        { status: 400 }
      );
    }

    // Calculate total amount (package price + addons)
    let totalAmount = packageObj.priceMinor;
    if (validated.addons && validated.addons.length > 0) {
      totalAmount += validated.addons.reduce(
        (sum, addon) => sum + addon.amount,
        0
      );
    }

    // Create order
    const order = await db.order.create({
      data: {
        buyerId: validated.buyerId,
        sellerId: service.sellerId,
        serviceId: validated.serviceId,
        packageTier: validated.packageTier,
        status: "awaiting_payment",
        amountMinor: totalAmount,
        currency: "USD", // Default currency
        requirements: validated.requirements || null,
        attachments: null, // Can be added later
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

    // Track analytics event
    trackServer("order_created", {
      actorId: user.id,
      orderId: order.id,
      serviceId: service.id,
      amountMinor: totalAmount,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
