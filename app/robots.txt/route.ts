import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return new NextResponse(
    `User-agent: *
Disallow: /orders/
Disallow: /messages/
Disallow: /account/
Disallow: /admin/
Sitemap: ${baseUrl}/sitemap.xml
`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}

