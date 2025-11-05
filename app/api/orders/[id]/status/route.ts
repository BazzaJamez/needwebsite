import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { action } = body;
    
    // Valid actions: "pay" | "start" | "deliver" | "request_revision" | "complete" | "cancel"
    // TODO: Enforce order state machine server-side
    
    return NextResponse.json({ orderId: id, status: "updated" });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid transition" },
      { status: 400 }
    );
  }
}

