# LaunchVector

AI-Native Career Intelligence Platform — Phase 1: Auth + Billing

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | Clerk |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Billing | Stripe Subscriptions |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Setup (15 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

#### Clerk (auth)
1. Create a project at https://dashboard.clerk.com
2. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. In Clerk Dashboard → Webhooks → Add endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`

#### Supabase (database)
1. Create a project at https://supabase.com
2. Go to Project Settings → Database → Connection string
3. Copy **Transaction pooler** URL → `DATABASE_URL`
4. Copy **Direct connection** URL → `DIRECT_URL`

#### Stripe (billing)
1. Create an account at https://stripe.com
2. Copy API keys → `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Create 3 products in Stripe Dashboard → Products:
   - **LaunchVector Starter** · $49/mo recurring → copy Price ID → `STRIPE_PRICE_STARTER`
   - **LaunchVector Professional** · $149/mo recurring → `STRIPE_PRICE_PROFESSIONAL`
   - **LaunchVector Executive** · $349/mo recurring → `STRIPE_PRICE_EXECUTIVE`
4. In Stripe Dashboard → Webhooks → Add endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy **Signing Secret** → `STRIPE_WEBHOOK_SECRET`

### 3. Set up the database

```bash
# Push schema to Supabase (no migration files — good for dev)
npm run db:push

# Optional: open Prisma Studio to inspect the DB
npm run db:studio
```

### 4. Run locally

```bash
npm run dev
```

Visit http://localhost:3000

---

## Local webhook testing

Stripe and Clerk webhooks require a public URL. Use the Stripe CLI + ngrok:

```bash
# Terminal 1 — run app
npm run dev

# Terminal 2 — forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3 — ngrok for Clerk webhooks
ngrok http 3000
# Use the ngrok URL in Clerk webhook settings
```

---

## Project structure

```
src/
├── app/
│   ├── (auth)/                  # Sign-in, sign-up pages (Clerk)
│   ├── (dashboard)/             # Protected app routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── onboarding/          # New user onboarding wizard
│   │   └── settings/billing/    # Plan management
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/           # Clerk user lifecycle events
│   │   │   └── stripe/          # Stripe billing events
│   │   ├── billing/
│   │   │   ├── checkout/        # Create Stripe checkout session
│   │   │   └── portal/          # Open Stripe billing portal
│   │   └── onboarding/step/     # Save onboarding step data
│   ├── layout.tsx               # Root layout (ClerkProvider)
│   └── page.tsx                 # Landing page
├── components/
│   ├── auth/                    # Auth-related UI
│   ├── billing/                 # Plan cards, checkout buttons
│   ├── dashboard/               # Sidebar, layout pieces
│   └── onboarding/              # Multi-step wizard
├── lib/
│   ├── auth.ts                  # requireUser(), getCurrentUser()
│   ├── prisma.ts                # Prisma singleton
│   ├── stripe.ts                # Stripe client + helpers
│   └── utils.ts                 # cn(), formatDate(), etc.
├── types/index.ts               # Shared TypeScript types
└── middleware.ts                # Clerk auth middleware
prisma/
└── schema.prisma                # Database schema
```

---

## User flow

```
/ (landing)
  → /sign-up  (Clerk)
    → Clerk webhook fires → user created in DB
  → /onboarding
    → Step 1: Target roles + salary + locations
    → Step 2: Upload resume
    → Step 3: Industry preferences
  → /dashboard
    → /settings/billing → choose plan → Stripe checkout
    → Stripe webhook fires → subscription created in DB
    → Agent activates (Phase 3)
```

---

## Next phases

| Phase | What's built |
|---|---|
| **Phase 2** | Job discovery — Indeed/Adzuna API ingestion, semantic matching with Pinecone |
| **Phase 3** | Apply engine — Claude resume tailoring, Playwright ATS automation, application tracking |
| **Phase 4** | Admin dashboard — MRR metrics, user management, worker health |
