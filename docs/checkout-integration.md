# Checkout & Stripe Integration

## Implementation Summary

### POST /api/checkout

Creates an order and Stripe PaymentIntent.

**Request Body:**
```json
{
  "serviceId": "uuid",
  "packageTier": "basic" | "standard" | "premium",
  "addons": [{"id": "string", "amount": 100}], // optional
  "requirements": {}, // optional
  "currency": "USD" | "EUR" | "GBP" | "ZAR"
}
```

**Response:**
```json
{
  "orderId": "uuid",
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 75000,
  "currency": "USD"
}
```

**Features:**
- ✅ Server-side validation of service and package
- ✅ Server-side total calculation (package + addons)
- ✅ Prevents self-purchase
- ✅ Idempotency support via `Idempotency-Key` header
- ✅ Creates Order in `awaiting_payment` status
- ✅ Creates Stripe PaymentIntent with metadata
- ✅ Returns client secret for frontend confirmation

**Security:**
- Requires authentication
- Validates all inputs server-side
- Verifies service is active
- Checks buyer ≠ seller

### POST /api/webhooks/stripe

Handles Stripe webhook events.

**Features:**
- ✅ Verifies webhook signature
- ✅ Handles `payment_intent.succeeded` event
- ✅ Updates Order status to `in_escrow`
- ✅ Sets `paidAt` timestamp
- ✅ Stores `escrowId` (PaymentIntent ID)
- ✅ Validates payment amount matches order
- ✅ Idempotent (handles duplicate webhooks)

**Webhook Events Handled:**
- `payment_intent.succeeded` → Order → `in_escrow`

## Environment Variables

Add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"  # For frontend
```

## Setup Instructions

1. **Install Stripe package:**
   ```bash
   npm install stripe
   ```

2. **Get Stripe keys:**
   - Go to Stripe Dashboard → Developers → API keys
   - Copy Secret key and Publishable key
   - Create webhook endpoint in Stripe Dashboard
   - Copy webhook signing secret

3. **Configure webhook endpoint:**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`
   - Copy the webhook signing secret

4. **Test locally with Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Frontend Integration

Example client-side checkout:

```typescript
const response = await fetch("/api/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": "unique-key-here", // Optional
  },
  body: JSON.stringify({
    serviceId: "xxx",
    packageTier: "standard",
    addons: [{ id: "extra", amount: 5000 }],
    currency: "USD",
  }),
});

const { clientSecret, orderId } = await response.json();

// Use Stripe.js to confirm payment
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
await stripe.confirmPayment({
  clientSecret,
  // ... payment method
});
```

## Order Flow

1. **Client** → POST `/api/checkout` → Receives `clientSecret`
2. **Client** → Confirm payment with Stripe.js
3. **Stripe** → Webhook → POST `/api/webhooks/stripe`
4. **Server** → Updates Order → `awaiting_payment` → `in_escrow`

## Error Handling

- `401` - Unauthorized (not authenticated)
- `400` - Invalid request (validation errors)
- `404` - Service/Package not found
- `500` - Server error

All errors include descriptive messages.

