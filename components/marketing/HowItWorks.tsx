import { Search, FileText, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find talent",
    description: "Browse services or search by category, skill, or budget.",
  },
  {
    icon: FileText,
    title: "Start order",
    description: "Choose a package, provide requirements, and place your order.",
  },
  {
    icon: CheckCircle,
    title: "Get delivery",
    description: "Receive your completed work on time, with revisions if needed.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-semibold tracking-[-0.01em] text-bg md:text-[1.728rem]">
          How It Works
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group rounded-2xl bg-elev p-6 shadow-1 transition hover:-translate-y-0.5 hover:shadow-2"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-bg">{step.title}</h3>
                <p className="text-sm text-muted md:text-base">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

