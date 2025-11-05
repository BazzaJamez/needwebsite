import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get dynamic data from query params
    const title = searchParams.get("title") || "Marketplace";
    const description = searchParams.get("description") || "Find top freelancers fast";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            backgroundImage: "linear-gradient(to bottom, #fff1e6, #ffffff)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px",
              maxWidth: "1200px",
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.1,
                color: "#0b0b0c",
                textAlign: "center",
                marginBottom: "24px",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 400,
                lineHeight: 1.5,
                color: "#6b7280",
                textAlign: "center",
                maxWidth: "800px",
              }}
            >
              {description}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "48px",
                fontSize: 24,
                color: "#ff6a00",
                fontWeight: 600,
              }}
            >
              Marketplace
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}

