"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { track } from "@/lib/analytics/track";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    track("hero_search_started", { query: query.trim() });
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex h-14 max-w-3xl items-center rounded-2xl border border-border bg-white pl-4 pr-1 shadow-1 transition focus-within:shadow-2"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-transparent text-base outline-none placeholder:text-muted"
        placeholder="Find talent across 700+ categories"
        aria-label="Search services"
      />
      <button
        type="submit"
        className="h-12 rounded-xl bg-accent px-5 font-medium text-white transition hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Search
      </button>
    </form>
  );
}

