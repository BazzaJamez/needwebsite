import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your profile",
};

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-8 text-h1">Profile</h1>
      <p className="text-muted">Profile editor coming soon...</p>
    </div>
  );
}

