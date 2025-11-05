import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OrderCreate } from "@/lib/shared/validation";
import { getCurrentUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { getPackageByServiceAndTier, getServiceById } from "@/lib/server/services";
import Stripe from "stripe";

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripe;
}

// Checkout request schema (client sends this)
const CheckoutRequest = z.object({
  serviceId: z.string().uuid(),
  packageTier: z.enum(["basic", "standard", "premium"]),
  addons: z
    .array(
      z.object({
        id: z.string(),
        amount: z.number().int().nonnegative(),
      })
    )
    .optional(),
  requirements: z.record(z.string(), z.any()).optional(),
  currency: z.enum(["USD", "EUR", "GBP", "ZAR"]).default("USD"),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = CheckoutRequest.parse(body);

    // Get service and package
    const service = await getServiceById(validated.serviceId);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (!service.isActive) {
      return NextResponse.json({ error: "Service is not active" }, { status: 400 });
    }

    // Prevent self-purchase
    if (service.sellerId === user.id) {
      return NextResponse.json(
        { error: "Cannot purchase your own service" },
        { status: 400 }
      );
    }

    // Get package
    const packageData = await getPackageByServiceAndTier(
      validated.serviceId,
      validated.packageTier
    );
    if (!packageData) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    // Calculate totals server-side
    const packageAmount = packageData.priceMinor;
    const addonsAmount =
      validated.addons?.reduce((sum, addon) => sum + addon.amount, 0) || 0;
    const totalAmount = packageAmount + addonsAmount;

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      );
    }

    // Check idempotency key (if provided)
    const idempotencyKey = request.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      const existingOrder = await db.order.findFirst({
        where: {
          buyerId: user.id,
          serviceId: validated.serviceId,
          packageTier: validated.packageTier,
          status: "awaiting_payment",
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingOrder) {
        // Return existing order's payment intent
        const paymentIntent = await getStripe()!.paymentIntents.retrieve(
          existingOrder.escrowId || ""
        );
        return NextResponse.json({
          orderId: existingOrder.id,
          clientSecret: paymentIntent.client_secret,
        });
      }
    }

    // Create order in database
    const order = await db.order.create({
      data: {
        buyerId: user.id,
        sellerId: service.sellerId,
        serviceId: validated.serviceId,
        packageTier: validated.packageTier,
        status: "awaiting_payment",
        amountMinor: totalAmount,
        currency: validated.currency,
        requirements: validated.requirements || undefined,
        attachments: [],
      },
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await getStripe()!.paymentIntents.create(
      {
        amount: totalAmount,
        currency: validated.currency.toLowerCase(),
        metadata: {
          orderId: order.id,
          serviceId: validated.serviceId,
          buyerId: user.id,
          sellerId: service.sellerId,
        },
        description: `Order ${order.id} - ${service.title} (${validated.packageTier})`,
      },
      {
        idempotencyKey: idempotencyKey || `order-${order.id}`,
      }
    );

    // Update order with payment intent ID (use as escrowId temporarily)
    await db.order.update({
      where: { id: order.id },
      data: {
        escrowId: paymentIntent.id,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        currency: validated.currency,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
