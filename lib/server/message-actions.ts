"use server";

import { revalidatePath } from "next/cache";
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

  let redacted = text
    .replace(emailRegex, "[email redacted]")
    .replace(phoneRegex, "[phone redacted]");

  return redacted;
}

/**
 * Send a message in a thread
 */
export async function sendMessage(input: z.infer<typeof MessageCreate>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false as const, error: "Unauthorized" };
    }

    const data = MessageCreate.parse(input);

    // Verify thread exists and user is a participant
    const thread = await db.messageThread.findUnique({
      where: { id: data.threadId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        order: true,
      },
    });

    if (!thread) {
      return { success: false as const, error: "Thread not found" };
    }

    // Check if user is a participant
    const isParticipant = thread.participants.some(
      (p) => p.userId === user.id
    );
    if (!isParticipant) {
      return { success: false as const, error: "Unauthorized" };
    }

    // Redact PII if thread doesn't have an orderId (pre-order)
    const shouldRedact = !thread.orderId;
    const body = shouldRedact ? redactPII(data.body) : data.body;

    // Create message
    const message = await db.message.create({
      data: {
        threadId: data.threadId,
        senderId: user.id,
        body,
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

    revalidatePath(`/messages/${data.threadId}`);

    return {
      success: true as const,
      data: {
        id: message.id,
        threadId: message.threadId,
        body: message.body,
        redacted: message.redacted,
        createdAt: message.createdAt,
        sender: {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: error.errors[0]?.message || "Validation failed",
      };
    }
    return { success: false as const, error: "Failed to send message" };
  }
}

/**
 * Create a new message thread
 */
export async function createThread(
  input: z.infer<typeof MessageThreadCreate>
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false as const, error: "Unauthorized" };
    }

    const data = MessageThreadCreate.parse(input);

    // Verify user is one of the participants
    if (!data.participantIds.includes(user.id)) {
      return { success: false as const, error: "Unauthorized" };
    }

    // If orderId is provided, verify participants match order buyer/seller
    if (data.orderId) {
      const order = await db.order.findUnique({
        where: { id: data.orderId },
      });

      if (!order) {
        return { success: false as const, error: "Order not found" };
      }

      const validParticipants = [order.buyerId, order.sellerId];
      const hasValidParticipants = data.participantIds.every((id) =>
        validParticipants.includes(id)
      );

      if (!hasValidParticipants) {
        return {
          success: false as const,
          error: "Participants must be order buyer and seller",
        };
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

    revalidatePath("/messages");

    return {
      success: true as const,
      data: { threadId: thread.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: error.errors[0]?.message || "Validation failed",
      };
    }
    return { success: false as const, error: "Failed to create thread" };
  }
}

