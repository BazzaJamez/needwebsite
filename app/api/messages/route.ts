import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MessageCreate, MessageThreadCreate } from "@/lib/shared/validation";
import { getCurrentUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

/**
 * Redact email addresses and phone numbers from message body
 */
function redactPII(text: string): string {
  // Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  // Phone pattern (various formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

  return text
    .replace(emailRegex, "[email redacted]")
    .replace(phoneRegex, "[phone redacted]");
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if creating thread or sending message
    if (body.threadId) {
      // Sending message to existing thread
      const data = MessageCreate.parse(body);

      // Verify thread exists and user is a participant
      const thread = await db.messageThread.findUnique({
        where: { id: data.threadId },
        include: {
          participants: true,
          order: true,
        },
      });

      if (!thread) {
        return NextResponse.json(
          { error: "Thread not found" },
          { status: 404 }
        );
      }

      // Check if user is a participant
      const isParticipant = thread.participants.some(
        (p) => p.userId === user.id
      );
      if (!isParticipant) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Redact PII if thread doesn't have an orderId (pre-order)
      const shouldRedact = !thread.orderId;
      const bodyText = shouldRedact ? redactPII(data.body) : data.body;

      // Create message
      const message = await db.message.create({
        data: {
          threadId: data.threadId,
          senderId: user.id,
          body: bodyText,
          attachments: data.attachments || [],
          redacted: shouldRedact,
          readBy: [user.id], // Mark as read by sender
        },
      });

      // Update thread's lastMessageAt
      await db.messageThread.update({
        where: { id: data.threadId },
        data: {
          lastMessageAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          messageId: message.id,
          threadId: message.threadId,
          body: message.body,
          redacted: message.redacted,
          createdAt: message.createdAt,
        },
        { status: 201 }
      );
    } else {
      // Creating new thread
      const data = MessageThreadCreate.parse(body);

      // Verify user is one of the participants
      if (!data.participantIds.includes(user.id)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // If orderId is provided, verify participants match order buyer/seller
      if (data.orderId) {
        const order = await db.order.findUnique({
          where: { id: data.orderId },
        });

        if (!order) {
          return NextResponse.json(
            { error: "Order not found" },
            { status: 404 }
          );
        }

        const validParticipants = [order.buyerId, order.sellerId];
        const hasValidParticipants = data.participantIds.every((id) =>
          validParticipants.includes(id)
        );

        if (!hasValidParticipants) {
          return NextResponse.json(
            {
              error: "Participants must be order buyer and seller",
            },
            { status: 400 }
          );
        }
      }

      // Create thread
      const thread = await db.messageThread.create({
        data: {
          orderId: data.orderId || null,
          participants: {
            create: data.participantIds.map((userId) => ({
              userId,
            })),
          },
        },
      });

      return NextResponse.json(
        { threadId: thread.id },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Message API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
