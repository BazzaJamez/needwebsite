import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dispute Resolution",
  description: "Resolve dispute",
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DisputeAdminPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-8 text-h1">Dispute: {id}</h1>
      <p className="text-muted">Side-by-side evidence and resolution actions coming soon...</p>
    </div>
  );
}

