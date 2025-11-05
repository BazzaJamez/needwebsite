import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@/components/analytics/Analytics";
import { getFeatureFlags } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Find top freelancers fast",
  description: "Hire trusted experts across design, development, and marketing.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const flags = getFeatureFlags();

  return (
    <html lang="en">
      <body className="antialiased">
        <Providers flags={flags}>
          <Analytics />
          {children}
        </Providers>
      </body>
    </html>
  );
}
