import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deliver Order",
  description: "Submit delivery for order",
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeliverOrderPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-8 text-h1">Deliver Order: {id}</h1>
      <p className="text-muted">Delivery form coming soon...</p>
    </div>
  );
}

