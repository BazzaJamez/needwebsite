import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Fees",
  description: "Transparent pricing and escrow protection for buyers and sellers.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing & Fees",
    description: "Transparent pricing and escrow protection for buyers and sellers.",
    url: "/pricing",
    siteName: "Marketplace",
    images: [
      {
        url: "/og?title=Pricing & Fees",
        width: 1200,
        height: 630,
        alt: "Pricing & Fees",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Fees",
    description: "Transparent pricing and escrow protection for buyers and sellers.",
    images: ["/og-image.png"],
  },
};

export const revalidate = 3600;

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-8 text-h1">Pricing & Fees</h1>
      <p className="text-muted">Pricing information coming soon...</p>
    </div>
  );
}

