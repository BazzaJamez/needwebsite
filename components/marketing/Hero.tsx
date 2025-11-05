import { HeroSearch } from "@/components/shared/HeroSearch";

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div className="text-center">
          <h1 className="mx-auto max-w-4xl text-[2.986rem] font-bold leading-[1.1] tracking-[-0.01em] text-bg md:text-[3.583rem]">
            Find expert talent
            <br />
            for your next project
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Connect with skilled professionals across design, development, marketing, and more.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-10 max-w-3xl">
          <HeroSearch />
        </div>

        {/* Trust strip */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            Trusted by <span className="font-semibold text-bg">2,000+</span> customers worldwide
          </p>
        </div>
      </div>
    </section>
  );
}

