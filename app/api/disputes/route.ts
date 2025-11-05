import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Open dispute, freeze timers
    
    return NextResponse.json(
      { disputeId: "pending" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  // TODO: Admin list disputes
  
  return NextResponse.json({
    disputes: [],
    total: 0,
  });
}

