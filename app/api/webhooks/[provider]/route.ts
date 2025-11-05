import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{ provider: string }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  const { provider } = await params;

  // Delegate to provider-specific handlers
  if (provider === "stripe") {
    // Import and call Stripe handler
    const { POST: stripeHandler } = await import("../stripe/route");
    return stripeHandler(request);
  }

  return NextResponse.json(
    { error: `Unsupported webhook provider: ${provider}` },
    { status: 400 }
  );
}

