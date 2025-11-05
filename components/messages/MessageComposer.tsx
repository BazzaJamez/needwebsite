"use client";

import { useState, useTransition } from "react";
import { sendMessage } from "@/lib/server/message-actions";
import { Button } from "@/components/ui/button";

type MessageComposerProps = {
  threadId: string;
};

export function MessageComposer({ threadId }: MessageComposerProps) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || isPending) return;

    const messageBody = body.trim();
    setBody(""); // Clear input immediately for optimistic UI
    setError(null);

    startTransition(async () => {
      const result = await sendMessage({
        threadId,
        body: messageBody,
        attachments: [],
      });

      if (!result.success) {
        setError(result.error);
        setBody(messageBody); // Restore message on error
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type your message..."
          rows={3}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-base outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/50 resize-none"
          disabled={isPending}
          maxLength={5000}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!body.trim() || isPending}
        >
          {isPending ? "Sending..." : "Send"}
        </Button>
      </div>
      {error && (
        <div className="rounded-xl bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      <p className="text-xs text-muted">
        {body.length}/5000 characters
      </p>
    </form>
  );
}

