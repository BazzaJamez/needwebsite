Domain Model — Marketplace

Source of truth for business concepts, relationships, and rules. Drives DB schema, APIs, and tests.

0) Goals

Clear, minimal set of entities

Explicit state machines (orders, disputes, payouts)

Validation rules at boundaries

Permissions and auditability from day one

1) Core Entities
User

id, role: "buyer" | "seller" | "admin"

email, name, avatarUrl

profile (bio, headline, location, languages)

reputation (ratingAvg, ratingCount, badges[])

payoutAccount (connected? lastPayoutAt)

Flags: isVerified, isSuspended

Service

id, sellerId

title, slug, description, category, tags[]

gallery[] (images/video), coverImage

basePrice

packages (see Package)

isActive, createdAt, updatedAt

Package

id, serviceId

tier: "basic" | "standard" | "premium"

price, deliveryDays, revisions, features[], addons[]

Quote (optional but helpful)

Ad-hoc scoped price for a buyer request

id, serviceId, sellerId, buyerId

lineItems[] { label, amount } → total

expiresAt, status: "sent" | "accepted" | "declined" | "expired"

Order

id, buyerId, sellerId, serviceId, packageTier

status (state machine below)

requirements (structured Q&A), attachments[]

milestones[] { label, dueAt, amount, status } (optional)

escrowId, amount, currency

Timestamps: paidAt, deliveredAt, completedAt, cancelledAt

Delivery

id, orderId

message, files[], deliveredAt

status: "submitted" | "accepted" | "revision_requested"

Review

id, orderId, authorId, targetUserId

rating (1–5), body, createdAt, isEdited

MessageThread & Message

Thread: id, participants[], orderId?, lastMessageAt

Message: id, threadId, senderId, body, attachments[], redacted?, createdAt, readBy[]

Dispute

id, orderId, openedById (buyer|seller)

reason, notes, status, resolution { type, amount?, notes }

assignedAdminId?, events[]

Payout

id, sellerId, amount, currency, status, providerRef, createdAt

2) Key Relationships

User (seller) 1—N Service

Service 1—N Package

User (buyer) 1—N Order; User (seller) 1—N Order

Order 1—N Delivery, Order 1—1 Review (per side) (buyer→seller primary)

Thread 1—N Message; Thread may reference Order (post-purchase)

Order 1—0..1 Dispute

User (seller) 1—N Payout

3) State Machines
Order.status
draft -> awaiting_payment -> in_escrow -> in_progress
in_progress -> delivered -> completed
in_progress -> cancelled
delivered -> revision_requested -> in_progress
(any) -> disputed -> (resolved_refund | resolved_partial | resolved_upheld)


Rules

Only server transitions allowed.

Enter in_escrow only after payment captured and escrow created.

completed only after buyer accepts or auto-completes (e.g., N days after delivery).

On cancelled, funds → original source unless custom policy.

Dispute.status
open -> needs_info -> reviewing -> resolved_{refund|partial|upheld}


Opening a dispute freezes order timers.

Resolution records actor, notes, amount.

Payout.status
pending -> processing -> paid | failed

4) Invariants (must always be true)

Order.buyerId !== Order.sellerId

Monetary values are integers in minor units (e.g., cents).

A MessageThread with an orderId only includes that order’s buyerId and sellerId.

Reviews require Order.status = completed; exactly one buyer→seller review per order.

5) Permissions (simplified)

Buyer: create orders, message seller, request revisions, open disputes, review after completion.

Seller: create services, accept quotes, deliver, message buyer, request payout.

Admin: moderate content, resolve disputes, suspend accounts, issue refunds.

Pre-order DMs: emails/phones auto-redacted; allowed post-order.

6) Validation (Zod at boundaries)
import { z } from "zod";

export const Money = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.enum(["USD","EUR","GBP","ZAR"]),
});

export const OrderCreate = z.object({
  buyerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  packageTier: z.enum(["basic","standard","premium"]),
  addons: z.array(z.object({ id: z.string(), amount: z.number().int().nonnegative()})).optional(),
  requirements: z.record(z.string(), z.any()).optional(),
});

7) Events (analytics & audit)

search_started, service_viewed, quote_sent, checkout_started,
order_created, order_status_changed, delivery_submitted,
revision_requested, order_completed, review_submitted,
payout_requested, payout_paid, dispute_opened, dispute_resolved.

All events include: actorId, ip, userAgent, ts.

8) API Surface (RSC-friendly)

POST /api/checkout/orders → create order from package/quote (server action)

POST /api/orders/:id/deliver → submit delivery

POST /api/orders/:id/revisions → request revision

POST /api/orders/:id/complete

POST /api/disputes / PATCH /api/disputes/:id

POST /api/messages/:threadId
All mutate via server actions or route handlers; client never computes totals.

9) Suggested Prisma Schema (excerpt)
model User {
  id            String   @id @default(uuid())
  role          UserRole
  email         String   @unique
  name          String?
  avatarUrl     String?
  reputation    Reputation?
  isVerified    Boolean  @default(false)
  isSuspended   Boolean  @default(false)
  createdAt     DateTime @default(now())
  services      Service[]
  ordersAsBuyer Order[]  @relation("OrdersAsBuyer")
  ordersAsSeller Order[] @relation("OrdersAsSeller")
  payouts       Payout[]
}

enum UserRole { buyer seller admin }

model Service {
  id          String   @id @default(uuid())
  sellerId    String
  seller      User     @relation(fields: [sellerId], references: [id])
  title       String
  slug        String   @unique
  description String
  category    String
  tags        String[]
  coverImage  String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  packages    Package[]
}

model Package {
  id           String   @id @default(uuid())
  serviceId    String
  service      Service  @relation(fields: [serviceId], references: [id])
  tier         PackageTier
  priceMinor   Int
  deliveryDays Int
  revisions    Int
  features     String[]
}

enum PackageTier { basic standard premium }

model Order {
  id           String   @id @default(uuid())
  buyerId      String
  buyer        User     @relation("OrdersAsBuyer", fields: [buyerId], references: [id])
  sellerId     String
  seller       User     @relation("OrdersAsSeller", fields: [sellerId], references: [id])
  serviceId    String
  service      Service  @relation(fields: [serviceId], references: [id])
  packageTier  PackageTier
  status       OrderStatus @default(awaiting_payment)
  amountMinor  Int
  currency     String
  escrowId     String?
  paidAt       DateTime?
  deliveredAt  DateTime?
  completedAt  DateTime?
  cancelledAt  DateTime?
  createdAt    DateTime @default(now())
  deliveries   Delivery[]
  review       Review?
  dispute      Dispute?
  @@index([buyerId, status])
  @@index([sellerId, status])
}

enum OrderStatus { draft awaiting_payment in_escrow in_progress delivered revision_requested completed cancelled disputed resolved_refund resolved_partial resolved_upheld }

model Delivery {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  message   String?
  files     Json?
  status    DeliveryStatus @default(submitted)
  createdAt DateTime @default(now())
}

enum DeliveryStatus { submitted accepted revision_requested }

model Review {
  id           String   @id @default(uuid())
  orderId      String   @unique
  authorId     String
  targetUserId String
  rating       Int
  body         String?
  createdAt    DateTime @default(now())
}

model MessageThread {
  id            String   @id @default(uuid())
  orderId       String?
  participants  String[] // user ids
  lastMessageAt DateTime?
  messages      Message[]
  @@index([orderId])
}

model Message {
  id        String   @id @default(uuid())
  threadId  String
  thread    MessageThread @relation(fields: [threadId], references: [id])
  senderId  String
  body      String?
  attachments Json?
  redacted  Boolean @default(false)
  createdAt DateTime @default(now())
  readBy    String[] // user ids
}

model Dispute {
  id          String   @id @default(uuid())
  orderId     String   @unique
  order       Order    @relation(fields: [orderId], references: [id])
  openedById  String
  reason      String
  status      DisputeStatus @default(open)
  resolution  Json?
  assignedAdminId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum DisputeStatus { open needs_info reviewing resolved_refund resolved_partial resolved_upheld }

model Payout {
  id         String   @id @default(uuid())
  sellerId   String
  seller     User     @relation(fields: [sellerId], references: [id])
  amountMinor Int
  currency   String
  status     PayoutStatus @default(pending)
  providerRef String?
  createdAt  DateTime @default(now())
}

enum PayoutStatus { pending processing paid failed }

model Reputation {
  userId      String  @id
  ratingAvg   Float   @default(0)
  ratingCount Int     @default(0)
  badges      String[]
  user        User    @relation(fields: [userId], references: [id])
}

10) Indexing & Performance

Search: put Service(title, tags, category) into your search index (e.g., Postgres trigram or external search).

Heavy lists (services, messages) use cursor-based pagination.

Denormalize counters you read often (ratingCount, orderCount) with triggers or background jobs.

11) Test Checklist (must-have)

 Order lifecycle happy path: create → pay → in_escrow → deliver → complete

 Revision loop: deliver → revision → re-deliver → complete

 Dispute open → resolve (refund/partial/upheld) updates balances correctly

 Review allowed only after completion

 Messaging redaction pre-order; allowed post-order