import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your messages",
};

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-8 text-h1">Messages</h1>
      <p className="text-muted">Inbox with infinite scroll coming soon...</p>
    </div>
  );
}

