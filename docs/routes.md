Routes — IA, URL rules, and SEO

Source of truth for all app and API paths. Uses route groups to separate shells without changing URLs.

0) Conventions

Route groups: (marketing), (auth), (app), (admin)

Dynamic segments: [id], [slug], catch-all [...parts]

Locale/currency: query params (?lang=en&cur=USD) for v1; add i18n subpaths later if needed.

Revalidation: public pages revalidate: 60; private pages no-store.

Canonical base URL: set metadataBase in next.config.*.

1) Directory tree (App Router)
app/
  (marketing)/
    page.tsx                       # Home
    categories/
      page.tsx                     # Top categories hub
    pricing/
      page.tsx
    faq/
      page.tsx
    sitemap.xml/route.ts           # Marketing sitemap segment
    robots.txt/route.ts
  (auth)/
    signin/page.tsx
    signup/page.tsx
    reset-password/page.tsx
    verify/[token]/page.tsx
  (app)/
    layout.tsx                     # App shell (nav, account switcher)
    dashboard/page.tsx
    search/
      page.tsx                     # ?q=&category=&sort=
    services/
      new/page.tsx                 # Seller create service
      [slug]/
        page.tsx                   # Service details
        editor/page.tsx            # Seller edit (guarded)
    orders/
      page.tsx                     # Buyer & Seller views (tabbed)
      [id]/
        page.tsx                   # Order room (timeline)
        deliver/page.tsx
        revision/page.tsx
    messages/
      page.tsx
      [threadId]/page.tsx
    account/
      profile/page.tsx
      settings/page.tsx
      payouts/page.tsx
  (admin)/
    page.tsx
    users/[id]/page.tsx
    disputes/[id]/page.tsx

  api/
    checkout/route.ts              # POST create order & escrow
    webhooks/[provider]/route.ts   # POST payment, uploads, email, etc.
    search/route.ts                # GET search services (SSR helper)
    messages/route.ts              # POST create thread/message
    orders/[id]/status/route.ts    # PATCH transition status
    disputes/route.ts              # POST open; GET list (admin)
    uploads/route.ts               # POST signed URLs
    sitemap/route.ts               # Global sitemap (app + dynamic)
    health/route.ts                # GET health for uptime

2) Public marketing routes
Path	Purpose	Caching	Notes
/	Hero with big search, popular pills	revalidate: 60	Pull featured services/categories
/categories	Explore categories grid	revalidate: 300	Link to prefiltered search
/pricing	How fees/escrow work	revalidate: 3600	Trust content
/faq	Common questions	revalidate: 3600	
/robots.txt	Robots policy	static	Exclude /orders, /messages, /account, /admin
/sitemap.xml	Sitemap index	revalidate: 3600	Links to segment sitemaps

Metadata snippet (per page):

export const metadata = {
  title: "Find top freelancers fast",
  description: "Hire trusted experts across design, development, and marketing.",
  alternates: { canonical: "/" }
}

3) App (authenticated) routes
Search & discovery

/search – query params:
q, category, min, max, delivery, rating, sort=relevance|rating|newest|price_asc|price_desc
Caching: revalidate: 30 for SSR shell; data via RSC fetch with cache key from params.

Services

/services/[slug] – public detail page; static params for popular services.

GET data with { next: { revalidate: 60 } }.

/services/new & /services/[slug]/editor – seller tools (guarded, no-store).

Orders

/orders – tabbed list: Buying, Selling, Completed, Disputes.

/orders/[id] – real-time room (timeline, files, requirements).

Subroutes: /deliver, /revision.

Policy: Only buyer & seller can access; admins via impersonation.

Messages

/messages – inbox, infinite list.

/messages/[threadId] – thread view; file uploads, typing, read receipts.

Account

/account/profile, /account/settings, /account/payouts

4) Admin routes

/admin – dashboard (stats, queues).

/admin/users/[id] – actions: suspend/verify.

/admin/disputes/[id] – side-by-side evidence, resolution actions.
Caching: no-store. Audit every mutation.

5) API routes (server only)
Checkout

POST /api/checkout
Body: { serviceId|quoteId, packageTier, addons[], currency }
Behavior: validate, compute totals (server), create Order awaiting_payment, create escrow/payment intent, return client secret.
Idempotency via Idempotency-Key header.

Orders

PATCH /api/orders/:id/status
Body: { action: "pay"|"start"|"deliver"|"request_revision"|"complete"|"cancel" }
Enforces the order state machine server-side.

Messaging

POST /api/messages – create thread/message. Pre-order messages redact emails/phones.

Webhooks

POST /api/webhooks/:provider – payments/uploads/email providers.
Verify signatures, update Order, Payout, etc.

Search (SSR helper)

GET /api/search → returns results+facets (used by /search RSC).

Disputes

POST /api/disputes – open dispute; freeze timers.

GET /api/disputes – admin list.

Uploads

POST /api/uploads – signed URLs, virus scanning.

Health

GET /api/health – status for uptime checks.

6) URL patterns & slugs

Service: /services/{kebab-title}-{shortid} (e.g., /services/landing-page-ux-a1b2)

Prevents collisions, stable even if title changes.

Order: /orders/{uuid}

Thread: /messages/{base58}

export function toServiceSlug(title: string, id: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${id.slice(0,4)}`;
}

7) SEO, sitemap, robots

Exclude: /orders/*, /messages/*, /account/*, /admin/*

Include: /, /categories, /pricing, /faq, /search (pre-rendered facets), /services/[slug]

Sitemap generation: route handler collects static + dynamic services.

// app/sitemap.ts (global)
import { MetadataRoute } from "next";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = new URL(process.env.NEXT_PUBLIC_BASE_URL!);
  const services = await listPublicServiceSlugs(); // top N nightly
  return [
    { url: new URL("/", base).toString(), changeFrequency: "daily", priority: 0.9 },
    ...services.map(s => ({ url: new URL(`/services/${s}`, base).toString(), changeFrequency: "weekly" })),
  ];
}


robots.txt

export function GET() {
  return new Response(
`User-agent: *
Disallow: /orders/
Disallow: /messages/
Disallow: /account/
Disallow: /admin/
Sitemap: ${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml
`, { headers: { "Content-Type": "text/plain" }});
}

8) Middleware & guards

middleware.ts

Protect (app) routes (except selected public pages).

Redirect unauthenticated users to /signin?next=/….

Rate-limit sensitive APIs (/api/messages, /api/checkout).

Add X-Request-Id for audit.

9) Error routes

app/error.tsx – fatal boundary (polite message + support link)

app/not-found.tsx – 404 with search field and popular categories

10) Revalidation & caching rules

Marketing: revalidate: 60–3600 depending on freshness.

Service detail: revalidate: 60 (content changes occasionally).

Search: RSC fetch with key from URL; SWR-like caching on server.

Private pages: cache: "no-store".

11) Analytics (route-level)

Emit pageview + key actions:

/search: search_started, filters_changed, result_clicked

/services/[slug]: service_viewed, package_switched, cta_clicked

/orders/[id]: delivery_submitted, revision_requested, order_completed

12) QA checklist

 Unauthed → /signin?next=… for all (app) routes

 Disallowed paths are absent from sitemap and blocked in robots

 Service slug change keeps old URL redirect (308)

 API transitions reject invalid state moves

 PII never appears in URLs or query strings