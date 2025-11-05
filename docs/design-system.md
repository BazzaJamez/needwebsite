Design System — Marketplace UI

Calm, fast, obvious. Typography first. Spacious layouts. Understated motion. One accent color (not green).

0) Principles

Clarity over decoration. Every pixel explains or enables an action.

Trust by default. Legible pricing, transparent delivery, real ratings.

Comfortable density. 8pt grid, generous white space, sharp hierarchy.

Predictable motion. Easing = cubic-bezier(0.2, 0.8, 0.2, 1), 200–250ms.

1) Tokens

Place tokens in styles/tokens.css and mirror in tailwind.config.ts. Never hardcode values.

/* styles/tokens.css */
:root {
  /* brand */
  --color-accent: #ff6a00;          /* Ember (primary accent) */
  --color-accent-600: #ff6a00;
  --color-accent-700: #e65f00;
  --color-accent-100: #fff1e6;

  /* neutrals */
  --color-bg: #0b0b0c;              /* dark text-on-light guard (used for text) */
  --color-surface: #ffffff;         /* base surface */
  --color-elev: #fcfcfd;            /* elevated cards */
  --color-muted: #6b7280;           /* secondary text */
  --color-border: #e5e7eb;          /* lines/dividers */

  /* feedback (no green) */
  --color-success: #0ea5e9;         /* cyan */
  --color-warning: #f59e0b;         /* amber */
  --color-danger:  #ef4444;         /* red */
  --color-info:    #3b82f6;         /* blue */

  /* typography */
  --font-sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

  /* type scale (1.20 modular) */
  --text-2xl: 3.583rem;  /* hero */
  --text-xl:  2.986rem;
  --text-lg:  2.488rem;
  --text-h1:  2.074rem;
  --text-h2:  1.728rem;
  --text-h3:  1.44rem;
  --text-h4:  1.2rem;
  --text-base:1rem;
  --text-sm:  0.889rem;
  --text-xs:  0.79rem;

  /* spacing / radius / shadow */
  --space-1: 4px;  --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 40px; --space-8: 56px; --space-9: 80px;
  --radius-sm: .5rem; --radius-md: .75rem; --radius-lg: 1rem; --radius-xl: 1.25rem; --radius-2xl: 1.75rem;
  --shadow-1: 0 1px 2px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.06);
  --shadow-2: 0 2px 6px rgba(0,0,0,.10), 0 8px 24px rgba(0,0,0,.08);

  /* motion */
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-fast: 150ms; --dur-base: 200ms; --dur-slow: 300ms;
}


Tailwind bridge (extend only; do not duplicate colors elsewhere):

// tailwind.config.ts
import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--color-accent)",
          100: "var(--color-accent-100)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
        },
        surface: "var(--color-surface)",
        elev: "var(--color-elev)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
    },
  },
  plugins: [],
} satisfies Config;

2) Typography

Display/Hero: --text-2xl / --text-xl with tight tracking (-0.01em) and line-height 1.05–1.15 for punchy headlines (Fiverr/Cloudflare vibe).

Headings: h1–h4 map to --text-h1…--text-h4 (lh ≥ 1.25).

Body: --text-base (lh 1.6), secondary text uses --color-muted.

Numbers: Use tabular nums for prices/metrics (font-feature-settings: "tnum" 1;).

3) Layout, Grid & Breakpoints

8pt grid; negative margins avoided.

Max content width: 1200–1280px, with generous gutters (24–32px).

Breakpoints (Tailwind defaults): sm 640, md 768, lg 1024, xl 1280, 2xl 1536.

Section spacing: desktop --space-8 top & bottom; mobile --space-6.

4) Elevation, Surfaces & Dividers

Base pages on surface with cards on elev and shadow-1/2.

Use borders sparingly; prefer shadow and spacing to separate regions.

Dividers are border color at 1px with 16–24px breathing room.

5) Motion

Micro-interactions: 150–200ms. Entrance transitions 200–300ms.

Hover: subtle translateY(-1px) on cards/buttons, shadow step up.

Page transitions: fade+slide 8–12px, same easing for consistency.

6) Accessibility

Text contrast ≥ 4.5:1.

Focus: outline or ring using accent at 2px, offset by 2px.

Hit targets ≥ 44×44px. Skip links present. Reduced motion respected.

7) Core Components
7.1 Buttons

Sizes: sm (36), md (40), lg (48) height, radius xl.

Primary: accent background, white text.

Secondary: white background, accent text, subtle border.

Ghost: transparent, text in neutral, bg on hover.

Danger: red background, white text.

// components/ui/button.tsx (shadcn + cva)
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/shared/cn";

const button = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-700 shadow-1",
        secondary: "bg-white text-accent border border-border hover:bg-accent-100",
        ghost: "text-black hover:bg-elev",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-5 text-[1.02rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}

7.2 Inputs

Large, calm fields like the Fiverr search—48–56px tall.

Placeholder is muted; label floats or sits above, never inside.

Success uses cyan, not green.

/* class recipe */
"bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"

7.3 Pills / Chips (filters)

Rounded 2xl, 40–44px height, ghost style by default.

Selected state: accent bg accent-100 + accent text; add a subtle ring-1.

7.4 Cards

ServiceCard (grid/list):

Top: preview image 3:2 (use next/image).

Body: title (two lines max), seller avatar+name+rating, feature tags.

Meta: “From” price, delivery chip (e.g., “3 days”).

Hover: lift 1–2px, shadow-2, image scales 1.01.

StatBand (Cloudflare-style):

Large numbers with labels underneath, even spacing, optional soft gradient background using accent-100.

7.5 Hero (marketing)

Headline at --text-xl/--text-2xl.

Search bar centered under headline (max width ~720px).

One primary CTA (accent) and one secondary (outline).

7.6 Navigation

Top bar: 64–72px, sticky with soft shadow on scroll.

Active link: text underline offset 6px or pill highlight.

7.7 Messaging elements

Threads list with last message preview, timestamp right-aligned.

Bubbles with rounded-2xl; outgoing uses accent-100 background.

Composer: 48px tall, attachments on the right, send on Enter (Shift+Enter newline).

7.8 Badges & Ratings

Rating stars use accent or neutral—no green.

Verification badge = subtle outline + check glyph (not filled).

8) Content Guidelines

Voice: concise, neutral, supportive. Imperatives over questions.

Headlines: ≤ 8 words. Subheads: one sentence.

Buttons: short verbs (“Start free”, “Get a quote”).

Errors: explain impact + next step.
“Payment failed. Try again or use another card.”

9) Patterns for Key Pages
9.1 Home (inspired by the screenshots)

Hero: bold line-break headline + oversized search.

Popular services pills: horizontally scrollable on mobile.

Stat band: 3–4 metrics (e.g., orders completed, avg. rating).

Featured categories: cards in a 3×2 or 4×2 grid.

Trust strip: logos, testimonials.

Footer: sitemap columns, language, currency.

9.2 Service Listing

Left: collapsible filters. Right: responsive grid (2–4 columns).

Sort: Relevance (default), Rating, Newest, Price ↑/↓.

Infinite scroll or “Load more” (no numeric pagination).

9.3 Service Detail

Gallery top, details and packages right rail.

Package switcher (Basic/Standard/Premium) with features table.

CTA: “Continue” → quote/checkout; sticky on scroll.

9.4 Checkout & Order

Steps: Options → Requirements → Pay → Confirmation.

Clear price breakdown; totals prominent; success color = cyan.

10) Example Snippets
10.1 Search Bar (Hero)
export function HeroSearch() {
  return (
    <form className="mx-auto flex h-14 max-w-3xl items-center rounded-2xl border border-border bg-white pl-4 pr-1 shadow-1 transition focus-within:shadow-2">
      <input
        className="w-full bg-transparent text-base outline-none placeholder:text-muted"
        placeholder="Find talent across 700+ categories"
        aria-label="Search services"
      />
      <button className="h-12 rounded-xl bg-accent px-5 font-medium text-white transition hover:bg-accent-700">
        Search
      </button>
    </form>
  );
}

10.2 Service Card (essentials)
export function ServiceCard() {
  return (
    <article className="group overflow-hidden rounded-2xl bg-elev shadow-1 transition hover:-translate-y-0.5 hover:shadow-2">
      <div className="relative aspect-[3/2]">
        {/* <Image ... fill className="object-cover transition group-hover:scale-[1.01]" /> */}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-[1.02rem] font-semibold tracking-[-0.01em]">
          Clean landing page with AI-ready components
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted">
          {/* avatar */}
          <span>by Alex • ★ 4.9</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2">
            <span className="rounded-2xl bg-accent-100 px-2.5 py-1 text-xs text-accent">
              Web
            </span>
            <span className="rounded-2xl bg-elev px-2.5 py-1 text-xs text-muted border border-border">
              3 days
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted mr-1">From</span>
            <span className="font-semibold">$450</span>
          </div>
        </div>
      </div>
    </article>
  );
}

11) Illustration & Imagery

Prefer vector, geometric accents (subtle orange gradients) reminiscent of Cloudflare’s spheres—but keep them lightweight and secondary.

Photography: clean, soft light, neutral backgrounds. Avoid high-contrast neon.

12) Analytics & Empty States

Empty states teach: one sentence + primary action (e.g., “Refine filters”).

Track: search_started, service_viewed, add_to_quote, checkout_started, order_created, message_sent, review_submitted.

13) Do/Don’t

Do

Keep one accent color (Ember).

Use large, confident headlines and roomy search.

Favor cards over borders.

Don’t

Use green anywhere for actions or success.

Add heavy shadows or busy gradients.

Over-animate.

14) Implementation Checklist

 Add styles/tokens.css and wire Tailwind tokens.

 Install shadcn/ui & Radix; wrap primitives in components/ui/*.

 Create HeroSearch, Pill, ServiceCard, StatBand, Rating components.

 Enforce design via Cursor Project Rules (.cursor/rules/design-system.mdc).

 Audit contrast & focus rings before launch.

Palette Summary (no green)

Accent: Ember #ff6a00

Success: Cyan #0ea5e9

Warning: Amber #f59e0b

Danger: Red #ef4444

Info: Blue #3b82f6

Surfaces/Neutrals: white / near-white with charcoal text