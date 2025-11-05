"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/shared/cn";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

const CATEGORIES: Category[] = [
  { id: "design", name: "Design", emoji: "🎨" },
  { id: "development", name: "Development", emoji: "💻" },
  { id: "marketing", name: "Marketing", emoji: "📢" },
  { id: "writing", name: "Writing", emoji: "✍️" },
  { id: "video", name: "Video", emoji: "🎬" },
  { id: "music", name: "Music & Audio", emoji: "🎵" },
  { id: "business", name: "Business", emoji: "💼" },
  { id: "photography", name: "Photography", emoji: "📸" },
  { id: "analytics", name: "Analytics", emoji: "📊" },
  { id: "translation", name: "Translation", emoji: "🌐" },
];

export function PopularCategories() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    track("category_clicked", { category: categoryId });
    router.push(`/search?category=${encodeURIComponent(categoryId)}`);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-semibold tracking-[-0.01em] text-bg md:text-[1.728rem]">
          Popular Categories
        </h2>
        <div className="mt-8">
          {/* Desktop: grid layout */}
          <div className="hidden gap-4 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "group flex flex-col items-center justify-center gap-3 rounded-2xl bg-elev p-6 shadow-1 transition hover:-translate-y-0.5 hover:shadow-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  selectedCategory === category.id && "bg-accent-100 ring-2 ring-accent/20"
                )}
              >
                <span className="text-4xl">{category.emoji}</span>
                <span className="font-medium text-bg text-sm md:text-base">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto pb-2 md:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "group flex shrink-0 flex-col items-center justify-center gap-3 rounded-2xl bg-elev p-6 shadow-1 transition hover:-translate-y-0.5 hover:shadow-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  "min-w-[140px]",
                  selectedCategory === category.id && "bg-accent-100 ring-2 ring-accent/20"
                )}
              >
                <span className="text-4xl">{category.emoji}</span>
                <span className="font-medium text-bg text-sm text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

