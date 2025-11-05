import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/server/db";

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = getStripe()!.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    // Handle payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Get order from metadata
      const orderId = paymentIntent.metadata.orderId;
      if (!orderId) {
        console.error("PaymentIntent missing orderId metadata");
        return NextResponse.json({ received: true });
      }

      // Find order
      const order = await db.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        console.error(`Order ${orderId} not found`);
        return NextResponse.json({ received: true });
      }

      // Verify payment amount matches order amount
      if (paymentIntent.amount !== order.amountMinor) {
        console.error(
          `Payment amount mismatch: ${paymentIntent.amount} vs ${order.amountMinor}`
        );
        return NextResponse.json({ received: true });
      }

      // Only transition if currently awaiting_payment
      if (order.status === "awaiting_payment") {
        // Transition order to in_escrow
        // Note: We use the seller's ID for the transition since this is an automated webhook
        // In production, you might want a system user or different permission model
        await db.order.update({
          where: { id: orderId },
          data: {
            status: "in_escrow",
            escrowId: paymentIntent.id,
            paidAt: new Date(paymentIntent.created * 1000),
          },
        });

        console.log(`Order ${orderId} transitioned to in_escrow`);
      } else {
        console.log(
          `Order ${orderId} is in status ${order.status}, skipping transition`
        );
      }
    }

    // Handle other Stripe events as needed
    // e.g., payment_intent.payment_failed, charge.refunded, etc.

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

