import { NextRequest, NextResponse } from "next/server";

export const revalidate = 30;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const delivery = searchParams.get("delivery");
  const rating = searchParams.get("rating");
  const sort = searchParams.get("sort") || "relevance";
  
  // TODO: Query database/search index
  // TODO: Return results + facets
  
  return NextResponse.json({
    results: [],
    facets: {},
    total: 0,
  });
}

