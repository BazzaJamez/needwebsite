"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";

export function CTA() {
  const router = useRouter();

  const handleFindExpertClick = () => {
    track("cta_clicked", { cta: "find_expert" });
    router.push("/search");
  };

  const handlePostServiceClick = () => {
    track("cta_clicked", { cta: "post_service" });
    router.push("/services/new");
  };

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-accent px-6 py-12 text-center md:px-12 md:py-16">
          <h2 className="text-2xl font-bold tracking-[-0.01em] text-white md:text-[2.074rem]">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 md:text-lg">
            Find expert talent or start offering your services today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-accent hover:bg-elev"
              onClick={handleFindExpertClick}
            >
              Find your expert
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border-white bg-transparent text-white hover:bg-white/10"
              onClick={handlePostServiceClick}
            >
              Post your first service
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

