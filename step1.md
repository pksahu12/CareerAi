Let's scaffold the full project. I'll build every file from scratch — project structure, config, auth, billing, database, and UI.Good. Now let's write every file. Starting with config files:Now the Prisma schema — the single source of truth for the database:Now the app foundation — global layout, globals, and middleware:Now the core library files:Now the webhook handlers — the most critical backend pieces:Now the billing API routes:Now the UI pages. Auth pages first:Now the onboarding flow — critical for new users:Now the dashboard layout and billing page:Now the home page and the dashboard page:Now a minimal shared UI component (toast) and the types file:Finally, let's write the setup guide and verify everything is in order:Phase 1 is fully scaffolded. Here's exactly what was built — 33 files, production-ready:

**Config layer** — `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `.env.local.example` with every key documented.

**Database** — `prisma/schema.prisma` with all 5 tables: `User`, `CandidateProfile`, `Subscription`, `Job`, `Application`. Relations, indexes, enums, and the flexible `preferencesData: Json` field so onboarding can evolve without migrations.

**Auth** — Clerk middleware protecting every route except `/`, sign-in/up, and webhook endpoints. `src/lib/auth.ts` exports `requireUser()`, `requireOnboarded()`, and `requireActiveSubscription()` — drop these into any server component to gate access. Clerk webhook at `/api/webhooks/clerk` syncs user create/update/delete to your DB automatically.

**Billing** — Full Stripe integration in `src/lib/stripe.ts`: client, plan definitions with price IDs, checkout session creator, billing portal creator, and status mappers. The Stripe webhook at `/api/webhooks/stripe` handles all 5 subscription events including monthly usage resets. Two API routes: `/api/billing/checkout` (creates checkout session) and `/api/billing/portal` (opens Stripe portal).

**UI** — Landing page → auth pages (Clerk-styled to match dark theme) → 3-step onboarding wizard → dashboard with live stats from the DB → billing page with plan cards, usage bar, and upgrade/portal buttons → sidebar with agent status indicator.

**To get running in 15 minutes:** follow the README — `npm install`, fill `.env.local`, `npm run db:push`, `npm run dev`. The README has the exact Stripe product setup and webhook event list you need.

When you're ready, say "build Phase 2" and we'll add the job discovery engine — Indeed/Adzuna ingestion worker, Pinecone embeddings, and the semantic match scoring API.