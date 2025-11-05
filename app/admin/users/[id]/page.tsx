import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage user",
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function UserAdminPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-8 text-h1">Manage User: {id}</h1>
      <p className="text-muted">User actions: suspend/verify coming soon...</p>
    </div>
  );
}

