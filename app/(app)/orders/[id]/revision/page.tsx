import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Revision",
  description: "Request revision for order",
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RevisionPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-8 text-h1">Request Revision: {id}</h1>
      <p className="text-muted">Revision request form coming soon...</p>
    </div>
  );
}

