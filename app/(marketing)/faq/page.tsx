import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Common questions about our marketplace platform.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Frequently Asked Questions",
    description: "Common questions about our marketplace platform.",
    url: "/faq",
    siteName: "Marketplace",
    images: [
      {
        url: "/og?title=Frequently Asked Questions",
        width: 1200,
        height: 630,
        alt: "FAQ",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions",
    description: "Common questions about our marketplace platform.",
    images: ["/og-image.png"],
  },
};

export const revalidate = 3600;

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-8 text-h1">Frequently Asked Questions</h1>
      <p className="text-muted">FAQ content coming soon...</p>
    </div>
  );
}

