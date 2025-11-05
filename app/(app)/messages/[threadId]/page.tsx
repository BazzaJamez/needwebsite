import { getCurrentUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { redirect } from "next/navigation";
import { MessageList } from "@/components/messages/MessageList";
import { MessageComposer } from "@/components/messages/MessageComposer";

type Props = {
  params: Promise<{ threadId: string }>;
};

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: Props) {
  const { threadId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  // Fetch thread with participants and messages
  const thread = await db.messageThread.findUnique({
    where: { id: threadId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!thread) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <h1 className="mb-8 text-h1">Thread not found</h1>
        <p className="text-muted">This conversation doesn't exist or you don't have access.</p>
      </div>
    );
  }

  // Verify user is a participant
  const isParticipant = thread.participants.some((p) => p.userId === user.id);
  if (!isParticipant) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <h1 className="mb-8 text-h1">Access Denied</h1>
        <p className="text-muted">You don't have access to this conversation.</p>
      </div>
    );
  }

  const otherParticipant = thread.participants.find((p) => p.userId !== user.id)?.user;
  const order = thread.orderId
    ? await db.order.findUnique({
        where: { id: thread.orderId },
        select: {
          id: true,
          status: true,
          service: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      })
    : null;

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-4xl flex-col px-6 py-8">
      {/* Thread Header */}
      <div className="mb-6 border-b border-border pb-4">
        <h1 className="text-h2">
          {otherParticipant?.name || "Unknown User"}
        </h1>
        {order && (
          <p className="text-sm text-muted">
            Order: {order.service.title}
          </p>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={thread.messages}
          currentUserId={user.id}
        />
      </div>

      {/* Message Composer */}
      <div className="border-t border-border pt-4">
        <MessageComposer threadId={threadId} />
      </div>
    </div>
  );
}
