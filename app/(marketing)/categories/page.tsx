import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Categories",
  description: "Explore services across design, development, and marketing categories.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Browse Categories",
    description: "Explore services across design, development, and marketing categories.",
    url: "/categories",
    siteName: "Marketplace",
    images: [
      {
        url: "/og?title=Browse Categories",
        width: 1200,
        height: 630,
        alt: "Browse Categories",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Categories",
    description: "Explore services across design, development, and marketing categories.",
    images: ["/og-image.png"],
  },
};

export const revalidate = 300;

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-8 text-h1">Browse Categories</h1>
      <p className="text-muted">Category grid coming soon...</p>
    </div>
  );
}

