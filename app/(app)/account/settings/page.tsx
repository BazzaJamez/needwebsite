import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account settings",
};

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-8 text-h1">Settings</h1>
      <p className="text-muted">Settings form coming soon...</p>
    </div>
  );
}

