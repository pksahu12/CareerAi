# CLAUDE.md — LaunchVector Developer Guide

LaunchVector is an AI-native career intelligence platform. This file is the entry point for working in this repo with Claude Code.

## What's built (current state)

**Phase 1 — Auth + Billing** is the active phase. The scaffold covers:

- Clerk authentication (OAuth, magic links, session management)
- Stripe subscriptions (3-tier: Starter $49 / Professional $149 / Executive $349)
- PostgreSQL schema via Supabase + Prisma ORM (5 tables)
- Webhook handlers for both Clerk and Stripe
- 3-step onboarding wizard (PROFILE → RESUME → PREFERENCES → COMPLETE)
- Protected dashboard routes
- Billing portal and checkout API routes

Phase 2 (job ingestion, Pinecone matching) and Phase 3 (Playwright ATS automation, Claude resume tailoring) are **not yet built**.

## Project structure

```
src/
├── app/
│   ├── (auth)/                   # Sign-in, sign-up (Clerk)
│   ├── (dashboard)/              # Protected app routes
│   │   ├── dashboard/            # Main pipeline dashboard
│   │   ├── onboarding/           # 3-step wizard
│   │   └── settings/billing/     # Plan management
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/            # user.created/updated/deleted
│   │   │   └── stripe/           # checkout, subscription, invoice events
│   │   ├── billing/
│   │   │   ├── checkout/         # POST — create Stripe checkout session
│   │   │   └── portal/           # POST — open Stripe billing portal
│   │   └── onboarding/step/      # POST — save onboarding step data
│   ├── layout.tsx                # Root layout (ClerkProvider)
│   └── page.tsx                  # Landing page
├── components/
│   ├── auth/
│   ├── billing/
│   ├── dashboard/
│   └── onboarding/
├── lib/
│   ├── auth.ts                   # requireUser(), requireOnboarded(), requireActiveSubscription()
│   ├── prisma.ts                 # Prisma singleton
│   ├── stripe.ts                 # Stripe client, PLANS, PLAN_LIMITS, helpers
│   └── utils.ts                  # cn(), formatDate()
├── types/index.ts
└── middleware.ts                 # Clerk route protection
prisma/
└── schema.prisma                 # Single source of truth for DB schema
docs/
└── production/                   # Full production documentation set (see below)
```

## Database schema summary

Five tables. See [prisma/schema.prisma](prisma/schema.prisma) for full detail.

| Table | Purpose |
|---|---|
| `User` | Clerk identity mirror — synced via webhook |
| `CandidateProfile` | Resume data, onboarding state, job preferences (flexible JSON) |
| `Subscription` | Stripe billing state, plan, usage counter |
| `Job` | Job listings (populated in Phase 2) |
| `Application` | One record per candidate per submission (populated in Phase 3) |

Key design choices:
- `CandidateProfile.preferencesData` is `Json` — avoids migrations as preference fields evolve
- `Application.outcomeData` is `Json` — feeds the ML outcome learning loop in Phase 3+
- Soft deletes only — never hard-delete Application records
- All automation runs through BullMQ queues — never synchronously in an API request

## Auth helpers

Three guard functions in [src/lib/auth.ts](src/lib/auth.ts) — drop these into server components:

```typescript
requireUser()                  // must be signed in
requireOnboarded()             // must have completed onboarding
requireActiveSubscription()    // must have ACTIVE or TRIALING subscription
```

All three throw redirects to the appropriate page if the check fails.

## Stripe / billing

[src/lib/stripe.ts](src/lib/stripe.ts) exports:

- `stripe` — singleton Stripe client
- `PLANS` — plan metadata (name, price, priceId, features, applicationsPerWeek)
- `PLAN_LIMITS` — `{ STARTER: 20, PROFESSIONAL: 100, EXECUTIVE: 200 }`
- `getOrCreateStripeCustomer()` — upsert Stripe customer; always call before checkout
- `createCheckoutSession()` — returns checkout URL; includes 7-day trial
- `createBillingPortalSession()` — returns portal URL
- `mapStripeStatus()` — maps Stripe status strings to `SubscriptionStatus` enum
- `getPlanFromPriceId()` — maps Stripe price ID to `Plan` enum

## Webhook events handled

### Stripe (`/api/webhooks/stripe`)
Verify with `stripe.webhooks.constructEvent` + `STRIPE_WEBHOOK_SECRET`.

| Event | Effect |
|---|---|
| `checkout.session.completed` | Upsert `Subscription` record with plan, status, billing period |
| `customer.subscription.updated` | Sync plan changes, renewal dates, trial end, cancel flag |
| `customer.subscription.deleted` | Set status → `CANCELED` |
| `invoice.payment_succeeded` | Reset `applicationsUsed` to 0 (billing cycle reset) |
| `invoice.payment_failed` | Set status → `PAST_DUE` |

### Clerk (`/api/webhooks/clerk`)
Verify with `svix` library + `CLERK_WEBHOOK_SECRET`.

| Event | Effect |
|---|---|
| `user.created` | Create `User` + `CandidateProfile` records |
| `user.updated` | Sync email, name, imageUrl on `User` |
| `user.deleted` | Soft-delete user and cascade |

## Environment variables

See [docs/production/OPERATIONS_RUNBOOK.md](docs/production/OPERATIONS_RUNBOOK.md) for full variable list and sources.

Required groups:
- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- **Supabase**: `DATABASE_URL` (transaction pooler), `DIRECT_URL` (direct connection)
- **Stripe**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_EXECUTIVE`

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill all values
npm run db:push                     # sync schema to Supabase (dev only)
npm run dev                         # http://localhost:3000
```

Webhook testing:
```bash
# Terminal 2 — Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3 — Clerk (requires public URL)
ngrok http 3000
```

## npm scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to DB (dev) |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:studio` | Prisma Studio at localhost:5555 |

## Key constraints and non-obvious decisions

- **`DATABASE_URL` must be the transaction pooler URL** — the direct connection URL exhausts connection limits under load. `DIRECT_URL` is only for Prisma CLI migrations.
- **Never use `db:push` in production** — use `npx prisma migrate deploy` instead.
- **`applicationsUsed` resets on `invoice.payment_succeeded` with `billing_reason: subscription_cycle`** — not on `customer.subscription.updated`. Don't reset it elsewhere.
- **Plan limits are enforced at the worker level before each job queue run** — not at API request time. Check `applicationsUsed < applicationsMax` before dispatching automation jobs.
- **Onboarding gate is `onboardingDone: true` on `CandidateProfile`** — set this only when all three steps are complete and validated.
- **`PLAN_LIMITS.PROFESSIONAL = 100`** — this is per month (reset on billing cycle), not per week. The UI displays "100 applications/week" as marketing copy, but the DB enforces a monthly counter.
- **Stripe trial is 7 days** — hardcoded in `createCheckoutSession`. The `status` will be `TRIALING` during this period; treat it the same as `ACTIVE` for feature access.

## Phase 2 build targets (next phase)

When starting Phase 2, these are the deliverables:

1. Job ingestion pipeline — Indeed/Adzuna/Reed API ingestion via BullMQ cron job
2. Resume parser — PDF/DOCX → structured JSON via Claude API
3. Pinecone integration — embed candidate profiles and job descriptions for semantic matching
4. Rule-based job matching — keyword match against `CandidateProfile.preferencesData`
5. Job feed UI — candidate-facing job review and approval flow
6. Basic application dashboard — list view with status, date, company, ATS type

Do not start Phase 2 until Phase 1 exit criteria are met: Stripe checkout end-to-end tested, Clerk webhooks syncing users correctly, onboarding wizard complete.

## Production documentation

All docs live in [docs/production/](docs/production/):

| Doc | Contents |
|---|---|
| [PRD.md](docs/production/PRD.md) | Product requirements, user stories, functional requirements |
| [TECH_ARCHITECTURE.md](docs/production/TECH_ARCHITECTURE.md) | System design, DB schema, AI workflows, infrastructure |
| [OPERATIONS_RUNBOOK.md](docs/production/OPERATIONS_RUNBOOK.md) | Env vars, deployment, webhook ops, incident response |
| [GTM_PLAN.md](docs/production/GTM_PLAN.md) | Positioning, pricing, channels, growth loops |
| [OKRS_AND_METRICS.md](docs/production/OKRS_AND_METRICS.md) | OKRs by phase, unit economics, financial projections |
| [RISK_AND_COMPLIANCE.md](docs/production/RISK_AND_COMPLIANCE.md) | Risk register, GDPR/CCPA, employment law, security |
| [RELEASE_PLAN_12_MONTHS.md](docs/production/RELEASE_PLAN_12_MONTHS.md) | Phase-by-phase milestones, KPIs, hiring sequence |
| [API_REFERENCE.md](docs/production/API_REFERENCE.md) | All API routes, request/response shapes, auth requirements |
