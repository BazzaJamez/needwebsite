function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface Testimonial {
  name: string;
  role: string;
  company?: string;
  quote: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Founder",
    company: "TechStart Inc",
    quote: "Found the perfect developer for our MVP. Fast delivery and exactly what we needed.",
    avatar: undefined,
  },
  {
    name: "Michael Rodriguez",
    role: "Marketing Director",
    company: "Growth Co",
    quote: "The design quality exceeded expectations. Professional and responsive throughout.",
    avatar: undefined,
  },
  {
    name: "Emma Thompson",
    role: "Content Manager",
    company: "MediaWorks",
    quote: "Outstanding writing services. Helped us scale content production significantly.",
    avatar: undefined,
  },
];

export function Testimonials() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-semibold tracking-[-0.01em] text-bg md:text-[1.728rem]">
          What Our Customers Say
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl bg-elev p-6 shadow-1 transition hover:shadow-2"
            >
              <div className="mb-4 flex items-center gap-4">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent font-semibold">
                    {getInitials(testimonial.name)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-bg">{testimonial.name}</div>
                  <div className="text-sm text-muted">
                    {testimonial.role}
                    {testimonial.company && ` • ${testimonial.company}`}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted md:text-base">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

