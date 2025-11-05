"use client";

import { useEffect, useRef } from "react";

type Message = {
  id: string;
  threadId: string;
  body: string;
  redacted: boolean;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

type MessageListProps = {
  messages: Array<{
    id: string;
    body: string | null;
    redacted: boolean;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
    };
  }>;
  currentUserId: string;
};

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender.id === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {message.sender.avatarUrl ? (
                <img
                  src={message.sender.avatarUrl}
                  alt={message.sender.name || "User"}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-accent">
                  {(message.sender.name || "U")[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
              <div className="text-xs text-muted">
                {message.sender.name || "Unknown"} •{" "}
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div
                className={`rounded-2xl px-4 py-2 ${
                  isOwn
                    ? "bg-accent text-white"
                    : "bg-elev text-bg"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                {message.redacted && (
                  <p className="mt-1 text-xs opacity-70">
                    This message was redacted for security
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

