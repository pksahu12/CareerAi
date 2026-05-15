# Technical Architecture Specification

Version: 1.0 · 2026-05-14

---

## 1. System Overview

LaunchVector is built as a multi-agent AI system. Each core workflow is an autonomous agent that executes end-to-end job search tasks on behalf of the candidate. The architecture follows a three-layer model:

| Layer | Role | Components |
|---|---|---|
| **Intelligence Layer** (Brain) | Decision-making, matching, learning | Candidate profile model, job-candidate matching engine, outcome prediction model, market intelligence signals |
| **Execution Layer** (Hands) | Task automation, external interactions | Browser automation agent, LinkedIn outreach agent, email drafting agent, application tracker |
| **Experience Layer** (Face) | Candidate-facing interface | Dashboard, AI interview simulator, resume editor, pipeline view, voice coaching interface |

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR for SEO, fast DX, App Router for nested layouts and server components |
| **Language** | TypeScript | Type-safe end-to-end; tRPC for API contracts |
| **Auth** | Clerk | Handles OAuth, magic links, session management, and user lifecycle webhooks |
| **Database** | PostgreSQL via Supabase + Prisma ORM | Managed Postgres with connection pooling; Prisma for type-safe queries |
| **Cache / Queue** | Redis (Upstash) + BullMQ | Job queue for automation workers; session and rate-limit caching |
| **Billing** | Stripe Subscriptions | Handles 3-tier plans, trials, usage tracking, dunning, and portal |
| **AI / LLM** | Claude API (primary) + OpenAI GPT-4o (fallback) | Claude excels at structured output generation; dual-provider prevents vendor lock-in |
| **Browser Automation** | Playwright + custom ATS handler registry | Reliable headless automation; per-platform handlers for Greenhouse, Lever, Workday, Ashby, Rippling |
| **Job Scheduling** | BullMQ + Trigger.dev | Durable background job processing with visibility and retries |
| **Semantic Search** | Pinecone vector DB + OpenAI Ada embeddings | Semantic job-candidate matching from day 1; proprietary ranker trained from Month 6 |
| **Email / Outreach** | Resend (transactional) + Instantly.ai API (cold outreach) | High deliverability; Instantly provides warm-up infrastructure |
| **Payments** | Stripe Billing | Subscriptions, invoicing, dunning, billing portal |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development with accessible component primitives |
| **Analytics** | PostHog (product) + Mixpanel (funnel) | PostHog self-hostable for privacy; Mixpanel for conversion funnels |
| **Infrastructure** | Vercel (frontend) + Railway (workers) + AWS S3 (documents) | Zero-ops deployment; Railway for long-running worker processes |

---

## 3. Database Schema

### 3.1 Entity Relationship Summary

```
User ──< CandidateProfile (1:1)
User ──< Subscription (1:1)
User ──< Application (1:N)
Job ──< Application (1:N)
```

### 3.2 Tables

#### User
Clerk identity mirror. Created on `user.created` webhook.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Internal PK |
| clerkId | String | Unique — Clerk user ID |
| email | String | Unique |
| firstName, lastName | String? | From Clerk profile |
| imageUrl | String? | Avatar URL |
| createdAt, updatedAt | DateTime | Auto-managed |

#### CandidateProfile
One-to-one with User. Stores resume data and job preferences.

| Column | Type | Notes |
|---|---|---|
| resumeUrl | String? | S3 URL for uploaded PDF/DOCX |
| resumeText | String? | Extracted plain text for LLM input |
| resumeJsonData | Json? | Structured parse: skills, experience, education |
| preferencesData | Json? | Target roles, salary floor, locations, industries, seniority |
| onboardingStep | OnboardingStep | PROFILE → RESUME → PREFERENCES → COMPLETE |
| onboardingDone | Boolean | Gates automation activation |
| profileScore | Int? | AI-assessed positioning score (0–100) |
| embeddingUpdatedAt | DateTime? | Last time profile embedding was recomputed |

#### Subscription
One-to-one with User. Stripe billing state.

| Column | Type | Notes |
|---|---|---|
| stripeCustomerId | String | Unique |
| stripeSubscriptionId | String? | Unique — set after checkout |
| stripePriceId | String? | Active price ID |
| plan | Plan | STARTER / PROFESSIONAL / EXECUTIVE |
| status | SubscriptionStatus | ACTIVE / CANCELED / PAST_DUE / TRIALING / INCOMPLETE |
| applicationsUsed | Int | Resets monthly on `invoice.payment_succeeded` |
| applicationsMax | Int | 20 (Starter) / 100 (Professional) / 200 (Executive) |
| currentPeriodStart/End | DateTime? | Billing window |
| trialEnd | DateTime? | Trial expiry |
| cancelAtPeriodEnd | Boolean | Scheduled cancellation flag |

#### Job
Job listings ingested from external sources (Phase 2+).

| Column | Type | Notes |
|---|---|---|
| title, company | String | Job metadata |
| location | String? | Human-readable location |
| remote | Boolean | Remote flag |
| salaryMin, salaryMax | Int? | Annual salary range |
| atsUrl | String | Direct ATS application URL |
| atsType | String? | greenhouse / lever / workday / ashby / rippling |
| description | String? | Full JD text |
| source | String | indeed / adzuna / linkedin / reed |
| embedding | Bytes? | pgvector embedding for semantic matching |
| tags | String[] | AI-extracted skill tags |
| isActive | Boolean | Live listing flag |
| postedAt, expiresAt | DateTime? | Listing window |

#### Application
One application record per candidate per job submission.

| Column | Type | Notes |
|---|---|---|
| status | ApplicationStatus | QUEUED → APPLIED → VIEWED → INTERVIEW → OFFER / REJECTED / WITHDRAWN |
| resumeVersion | String? | Which resume variant was submitted |
| resumeUsed | String? | Actual tailored resume text sent |
| coverLetter | String? | Generated cover letter |
| submittedAt | DateTime? | ATS submission timestamp |
| confirmationText | String? | ATS confirmation message |
| screenshotUrl | String? | S3 URL of submission evidence screenshot |
| outreachSent | Boolean | Whether hiring manager outreach was sent |
| matchScore | Int? | Job-candidate match score at time of application (0–100) |
| viewedByEmployer | Boolean | Employer viewed signal |
| interviewAt, offerReceivedAt, rejectedAt | DateTime? | Outcome timestamps |

### 3.3 Enums

| Enum | Values |
|---|---|
| Plan | STARTER, PROFESSIONAL, EXECUTIVE |
| SubscriptionStatus | ACTIVE, CANCELED, PAST_DUE, TRIALING, INCOMPLETE |
| OnboardingStep | PROFILE, RESUME, PREFERENCES, COMPLETE |
| ApplicationStatus | QUEUED, APPLIED, VIEWED, INTERVIEW, OFFER, REJECTED, WITHDRAWN |

---

## 4. Core AI Workflows

### Workflow 1: Autonomous Apply Engine

```
Resume upload
  → Parse to structured profile (Claude API)
  → Semantic match against live job feed (Pinecone)
  → For each matched job:
      a. Tailor resume section-by-section to JD keywords (Claude API)
      b. Generate cover letter (Claude API)
      c. Execute ATS form completion (Playwright handler)
      d. Record submission with timestamp + screenshot (S3)
  → Update Application record + dashboard in real time
```

**ATS platforms (MVP):** Greenhouse, Lever, Workday (basic), Ashby, Rippling
**ATS platforms (Phase 3 target):** 20+ platforms including iCIMS, Taleo, Jobvite, LinkedIn Easy Apply

### Workflow 2: Hiring Manager Outreach Agent (Phase 3)

```
Per submitted application:
  → Identify hiring manager/team lead on LinkedIn
  → Enrich: company news, manager's recent posts, shared connections
  → Generate hyper-personalized InMail or email (Claude API)
  → A/B test message variants
  → Track open rates + reply rates
  → Feed response data back to personalization model
```

### Workflow 3: Interview Intelligence Module (Phase 3+)

```
Interview invite received
  → Auto-generate company research brief
      (culture, news, likely questions from Glassdoor/Reddit/Blind)
  → Schedule AI voice mock interview (WebRTC + voice AI)
  → Real-time analysis: answer quality, STAR adherence, pacing, filler words
  → Scoring report + improvement recommendations
  → Adaptive follow-up sessions targeting weaknesses
```

### Workflow 4: Outcome Learning Loop (Phase 3+, ML from Month 6)

```
Every application creates a data record:
  {candidate_profile, job_description, resume_version, cover_letter,
   ats_platform, application_date, response_received, days_to_response,
   interview_invited, offer_made}

Trains:
  a. Job-matching ranker — which jobs to prioritise for this profile
  b. Resume optimizer — which keyword patterns correlate with interviews
  c. Outreach scorer — which message structures generate replies
```

---

## 5. Application Directory Structure

```
src/
├── app/
│   ├── (auth)/                   # Sign-in, sign-up (Clerk)
│   ├── (dashboard)/              # Protected routes
│   │   ├── dashboard/            # Main pipeline dashboard
│   │   ├── onboarding/           # 3-step setup wizard
│   │   └── settings/billing/     # Plan management + upgrade
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/            # user.created/updated/deleted
│   │   │   └── stripe/           # subscription + invoice events
│   │   ├── billing/
│   │   │   ├── checkout/         # Create Stripe checkout session
│   │   │   └── portal/           # Open Stripe billing portal
│   │   └── onboarding/step/      # Save onboarding step data
│   ├── layout.tsx                # Root layout (ClerkProvider)
│   └── page.tsx                  # Landing page
├── components/
│   ├── auth/
│   ├── billing/
│   ├── dashboard/
│   └── onboarding/
├── lib/
│   ├── auth.ts                   # requireUser(), getCurrentUser()
│   ├── prisma.ts                 # Prisma singleton
│   ├── stripe.ts                 # Stripe client, PLANS, helpers
│   └── utils.ts                  # cn(), formatDate()
├── types/index.ts
└── middleware.ts                 # Clerk auth routing
prisma/
└── schema.prisma
```

---

## 6. Infrastructure

| Service | Provider | Usage |
|---|---|---|
| Frontend hosting | Vercel | Next.js app, edge functions, CDN |
| Worker processes | Railway | BullMQ workers for automation, long-running agents |
| Database | Supabase | Managed PostgreSQL + pgvector extension |
| Document storage | AWS S3 | Resume uploads, application screenshots |
| Cache + queues | Upstash (Redis) | BullMQ job queue, rate limiting, session cache |
| Vector search | Pinecone | Semantic job-candidate embeddings |
| Monitoring | PostHog + Mixpanel | Product analytics, funnel tracking |

---

## 7. Security

| Concern | Implementation |
|---|---|
| Authentication | Clerk — OAuth, magic links, session tokens |
| Webhook verification | Signed secrets: `CLERK_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET` |
| API authorization | Clerk middleware guards all `/dashboard/*` and `/api/*` routes |
| Secrets management | Environment variables — never committed; stored in Vercel + Railway env |
| Data encryption | TLS in transit; Supabase encrypts at rest |
| PCI compliance | Stripe handles all card data — zero PCI scope for LaunchVector |
| ATS automation integrity | Per-application screenshots stored as audit evidence |

---

## 8. Scalability Design

| Bottleneck | Solution |
|---|---|
| Application volume | BullMQ workers horizontally scalable on Railway |
| Job ingestion (14M+ listings) | Paginated API ingestion jobs on cron schedule |
| Semantic matching | Pinecone managed index — scales to 100M+ vectors |
| LLM throughput | Claude API + OpenAI fallback; async queue prevents UI blocking |
| ATS automation rate limits | Per-platform rate limiting in ATS handler registry |
| Database | Supabase connection pooler (pgBouncer) + read replicas for dashboard queries |

---

## 9. Phase-by-Phase Architecture Evolution

| Phase | Key Additions |
|---|---|
| **Phase 1 (M1–4)** | Auth (Clerk), billing (Stripe), onboarding wizard, Prisma schema, webhook handlers |
| **Phase 2 (M5–9)** | Job ingestion pipeline (Indeed/Adzuna/Reed), Pinecone semantic matching, resume parser, preference model, job feed UI |
| **Phase 3 (M10–18)** | Playwright ATS automation engine, Claude resume/cover letter tailoring, outreach agent, application tracking dashboard |
| **Phase 4 (M10+)** | Admin dashboard (MRR metrics, user management), ML outcome model, Interview Intelligence module (WebRTC voice AI), salary intelligence |

---

## 10. Changelog

- 2026-05-14: Initial technical architecture specification created.
