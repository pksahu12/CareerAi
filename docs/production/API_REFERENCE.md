# API Reference

Version: 1.0 · 2026-05-14

All API routes are under `/api/`. All routes except webhooks require a valid Clerk session (enforced by `src/middleware.ts`). Webhook routes bypass auth but verify signatures independently.

---

## Authentication

All non-webhook routes use Clerk session cookies. Server components and API routes call `requireUser()` from `src/lib/auth.ts` to get the authenticated user. Unauthenticated requests are redirected to `/sign-in`.

```typescript
// src/lib/auth.ts
requireUser()                  // → { user, clerkUser } or redirect to /sign-in
requireOnboarded()             // → above + redirect to /onboarding if not done
requireActiveSubscription()    // → above + redirect to /settings/billing if no active plan
```

---

## Billing

### POST /api/billing/checkout

Creates a Stripe Checkout session for the requested plan and returns the redirect URL.

**Auth:** Required (Clerk session)

**Request body:**
```json
{
  "priceId": "price_xxx"
}
```

`priceId` must be one of: `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_EXECUTIVE`.

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Errors:**

| Status | Reason |
|---|---|
| `400` | Missing or invalid `priceId` |
| `401` | Not authenticated |
| `500` | Stripe API error |

**Behavior:**
1. Calls `requireUser()` to get the authenticated user.
2. Calls `getOrCreateStripeCustomer()` — looks up existing `stripeCustomerId` on the user's `Subscription` record, or creates a new Stripe customer.
3. Calls `createCheckoutSession()` — includes a 7-day trial, `metadata.userId`, `success_url`, and `cancel_url`.
4. Returns the checkout URL. The client redirects to it.

---

### POST /api/billing/portal

Opens the Stripe Billing Portal for the authenticated user to manage their subscription (update card, cancel, view invoices).

**Auth:** Required (Clerk session)

**Request body:** Empty

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

**Errors:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `404` | No Stripe customer found for this user |
| `500` | Stripe API error |

**Behavior:**
1. Calls `requireUser()`.
2. Looks up `stripeCustomerId` on `Subscription` record.
3. Calls `createBillingPortalSession()` with `return_url` pointing to `/settings/billing`.
4. Returns the portal URL. The client redirects to it.

---

## Onboarding

### POST /api/onboarding/step

Saves data for a single onboarding step and advances `onboardingStep` on the user's `CandidateProfile`.

**Auth:** Required (Clerk session)

**Request body:**

The shape varies by `step`.

**Step 1 — PROFILE:**
```json
{
  "step": "PROFILE",
  "data": {
    "targetRoles": ["Senior Software Engineer", "Staff Engineer"],
    "targetSalaryMin": 150000,
    "targetSalaryMax": 220000,
    "locations": ["San Francisco, CA", "Remote"],
    "remote": true
  }
}
```

**Step 2 — RESUME:**
```json
{
  "step": "RESUME",
  "data": {
    "resumeUrl": "https://s3.amazonaws.com/launchvector/resumes/user_xxx.pdf",
    "resumeText": "John Smith\nSenior Software Engineer..."
  }
}
```

**Step 3 — PREFERENCES:**
```json
{
  "step": "PREFERENCES",
  "data": {
    "industries": ["FinTech", "SaaS", "AI/ML"],
    "companySizes": ["startup", "mid-size"],
    "dealBreakers": ["no_remote", "no_equity"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "nextStep": "RESUME"
}
```

On final step (PREFERENCES), `nextStep` is `null` and `onboardingDone` is set to `true`:
```json
{
  "success": true,
  "nextStep": null,
  "onboardingDone": true
}
```

**Errors:**

| Status | Reason |
|---|---|
| `400` | Missing `step` or invalid `data` shape |
| `401` | Not authenticated |
| `409` | Step submitted out of sequence |
| `500` | DB write failed |

**Step transition map:**

| Current step | Submitted step | Advances to |
|---|---|---|
| `PROFILE` | `PROFILE` | `RESUME` |
| `RESUME` | `RESUME` | `PREFERENCES` |
| `PREFERENCES` | `PREFERENCES` | `COMPLETE` (sets `onboardingDone: true`) |

---

## Webhooks

Webhook routes are **not** protected by Clerk middleware (`middleware.ts` excludes them). Each verifies its own signature.

### POST /api/webhooks/stripe

Handles Stripe billing lifecycle events.

**Auth:** None (Clerk bypass) — signature verified via `stripe.webhooks.constructEvent`

**Required header:** `stripe-signature`

**Events handled:**

| Event | DB effect |
|---|---|
| `checkout.session.completed` | Upsert `Subscription` with plan, status, billing period, `applicationsMax` |
| `customer.subscription.updated` | Update plan, status, dates, `cancelAtPeriodEnd`, `applicationsMax` |
| `customer.subscription.deleted` | Set `status: CANCELED`, clear `cancelAtPeriodEnd` |
| `invoice.payment_succeeded` (cycle only) | Reset `applicationsUsed: 0` |
| `invoice.payment_failed` | Set `status: PAST_DUE` |

**Response:** `{ "received": true }` with status `200` on success.

**Error responses:**

| Status | Reason |
|---|---|
| `400` | Missing `stripe-signature` header |
| `400` | Signature verification failed |
| `500` | Error processing event |

**Important:** Always return `200` for unhandled event types (default case) so Stripe does not retry them. Only return non-200 for signature failure or processing errors.

---

### POST /api/webhooks/clerk

Handles Clerk user lifecycle events.

**Auth:** None (Clerk bypass) — signature verified via `svix` library + `CLERK_WEBHOOK_SECRET`

**Required headers:** `svix-id`, `svix-timestamp`, `svix-signature`

**Events handled:**

| Event | DB effect |
|---|---|
| `user.created` | Create `User` record + `CandidateProfile` (with `onboardingStep: PROFILE`, `onboardingDone: false`) |
| `user.updated` | Sync `email`, `firstName`, `lastName`, `imageUrl` on `User` |
| `user.deleted` | Cascade delete (or soft delete) `User` and related records |

**Response:** `{ "received": true }` with status `200` on success.

**Error responses:**

| Status | Reason |
|---|---|
| `400` | Missing svix headers |
| `400` | Signature verification failed |
| `500` | Error processing event |

---

## Phase 2 API surface (planned)

The following routes will be added in Phase 2. Document fully before building.

### POST /api/jobs/ingest (internal, cron-triggered)

Ingests job listings from configured sources (Indeed, Adzuna, Reed) and upserts into the `Job` table.

### GET /api/jobs/matches

Returns ranked job matches for the authenticated candidate based on their `CandidateProfile.preferencesData` and resume embedding.

**Planned response:**
```json
{
  "jobs": [
    {
      "id": "job_xxx",
      "title": "Senior Software Engineer",
      "company": "Stripe",
      "location": "Remote",
      "salaryMin": 180000,
      "salaryMax": 240000,
      "matchScore": 87,
      "atsType": "greenhouse",
      "postedAt": "2026-05-10T00:00:00Z"
    }
  ],
  "total": 24,
  "nextCursor": "cursor_xxx"
}
```

### POST /api/jobs/:jobId/approve

Candidate approves a matched job for automation. Creates an `Application` record with `status: QUEUED` and enqueues the ATS submission job.

### POST /api/jobs/:jobId/reject

Candidate rejects a matched job. Marks it as dismissed; it will not appear in their feed again.

---

## Phase 3 API surface (planned)

The following routes will be added in Phase 3. Document fully before building.

### GET /api/applications

Returns the candidate's full application pipeline with status, dates, match scores, and outcome tracking.

### GET /api/applications/:id

Returns details for a single application including resume version used, cover letter, ATS confirmation text, and screenshot URL.

### POST /api/applications/:id/withdraw

Withdraws an application. Sets `status: WITHDRAWN`.

### GET /api/resume/versions

Returns all tailored resume versions for the authenticated candidate.

### POST /api/outreach/:applicationId/send

Triggers the hiring manager outreach agent for a specific application.

---

## Error format

All API routes return errors in this shape:

```json
{
  "error": "Human-readable error message"
}
```

Validation errors may include a `details` field:

```json
{
  "error": "Validation failed",
  "details": {
    "field": "targetSalaryMin",
    "message": "Must be a positive integer"
  }
}
```

---

## Changelog

- 2026-05-14: Initial API reference created. Phase 1 routes fully documented. Phase 2 and Phase 3 planned surfaces documented as stubs.
