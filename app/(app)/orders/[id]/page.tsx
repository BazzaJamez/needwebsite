import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Order ${id}`,
    description: "Order details and timeline",
  };
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  
  // TODO: Fetch order and verify access (buyer, seller, or admin)
  // const order = await getOrder(id);
  // if (!order || !hasAccess(order)) notFound();
  
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-8 text-h1">Order: {id}</h1>
      <div className="space-y-4">
        <p className="text-muted">Order timeline, files, and requirements coming soon...</p>
      </div>
    </div>
  );
}

