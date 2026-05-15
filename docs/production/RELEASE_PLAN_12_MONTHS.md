# 12-Month Release Plan

Version: 1.0 · 2026-05-14

---

## Overview

The 12-month plan follows six sequential phases. Each phase builds on the previous one — auth and billing enable job discovery, which enables the apply engine, which enables coaching and intelligence features. Do not advance to the next phase until the current phase's exit criteria are met.

| Phase | Timeframe | Theme | Exit Criteria |
|---|---|---|---|
| **0 — Foundation** | Weeks 1–4 | Infrastructure, legal, 5 ATS integrations | ATS coverage ≥ 5 platforms; submission success rate > 90% |
| **1 — Private Beta** | Weeks 5–8 | 50 beta users; daily feedback iteration | NPS > 40; 80% of users submit first application within 24h |
| **2 — Public Launch** | Weeks 9–12 | ProductHunt, PR, Stripe billing live | 100 paying subscribers; £14.9K MRR |
| **3 — Growth** | Months 4–6 | Outreach agent, 20 ATS platforms, referral program | 500 subscribers; £74.5K MRR; 10 documented placements |
| **4 — Seed Raise** | Month 6 | Fundraising | £1.5–2.5M seed closed; £100K+ MRR; 50+ placements |
| **5 — Scale** | Months 7–10 | Interview Intelligence, ML model, B2B, Executive tier | 2,000 subscribers; 2 enterprise deals; LTV:CAC > 4x |
| **6 — Expansion** | Months 11–12 | Series A prep; international scoping | £500K MRR; outcome model accuracy > 70%; NPS > 55 |

---

## Phase 0: Foundation (Weeks 1–4)

### Goals
Stand up all infrastructure, legal entity, and the first 5 ATS integrations. No users yet — this is build time.

### Engineering Deliverables

| Deliverable | Notes |
|---|---|
| Legal entity formed | Incorporation, bank account, IP assignment |
| Domain acquired and DNS configured | launchvector.ai (primary) |
| Supabase project created; Prisma schema pushed | 5-table schema: User, CandidateProfile, Subscription, Job, Application |
| Clerk auth configured | OAuth, magic links, webhook endpoint live |
| Stripe configured | 3 products created ($49/$149/$349); webhook endpoint live |
| 5 ATS integrations built and tested | Greenhouse, Lever, Workday (basic), Ashby, Rippling |
| Resume parser | PDF/DOCX → structured profile via Claude API |
| Landing page | Value proposition, pricing table, waitlist signup |
| CI/CD pipeline | Vercel (frontend) + Railway (workers) auto-deploy from `main` |
| 10 job-seeker interviews conducted | Validate pain points, willingness to pay, and onboarding flow |

### KPIs
- ATS submission success rate: > 90% in internal testing
- All 5 ATS handlers passing automated regression tests

---

## Phase 1: Private Beta (Weeks 5–8)

### Goals
Onboard 50 beta users from personal networks and layoff communities. Iterate daily on feedback.

### Engineering Deliverables

| Deliverable | Notes |
|---|---|
| Onboarding wizard (3-step) | PROFILE → RESUME → PREFERENCES flow; completeness validation |
| Job matching (rule-based) | Indeed/Adzuna API job feeds; keyword-based matching against candidate profile |
| Application dashboard | List view: applied jobs, status, date, company, ATS platform |
| Stripe billing (single tier) | Professional plan at $149/month; 7-day trial; webhook-driven subscription sync |
| Clerk webhook handler | user.created → User + CandidateProfile records in DB |
| Stripe webhook handler | 5 events: checkout, subscription updated/deleted, invoice paid/failed |
| Application automation (5 ATS platforms) | BullMQ job queue; Playwright execution workers on Railway |
| Resume tailoring | Claude API: per-application resume tailoring to JD keywords |
| Cover letter generation | Claude API: 3-paragraph cover letter per application |

### Growth Activities
- Invite 50 users from personal network and layoff community channels
- Daily 30-minute feedback calls with beta users
- Track every bug, confusion, and drop-off point

### KPIs
- 50 beta users onboarded
- NPS > 40
- 80% of users submit first application batch within 24 hours of completing onboarding
- < 3 critical bugs per week by end of beta

---

## Phase 2: Public Launch (Weeks 9–12)

### Goals
Go public. Drive first 100 paying subscribers. Establish brand presence.

### Engineering Deliverables

| Deliverable | Notes |
|---|---|
| Multi-tier pricing live | Starter ($49), Professional ($149), Executive ($349) — all in Stripe |
| Plan-based application limits | Subscription.applicationsMax enforced; graceful upgrade prompts |
| Referral tracking (basic) | Referral code system; track signups attributed to referrals |
| Application status notifications | Email alerts on interview invites, application views |
| Candidate dashboard (improved) | Status badges, response rate metrics, application history |
| SEO landing pages | Service comparison pages targeting reverse recruiting keywords |

### Growth Activities
- ProductHunt launch (coordinate with beta users for upvotes and comments)
- Founder LinkedIn posts: "We submitted 10,000 applications — here's what we learned"
- 3 PR pitches to TechCrunch, Business Insider, Fast Company
- Reddit/Blind community seeding with authentic job search data stories
- 30-day free trial offer to recently laid-off members in target communities

### KPIs
- 100 paying subscribers (£14.9K MRR)
- CAC < $200
- Monthly churn < 20%
- ProductHunt: top 5 Product of the Day

---

## Phase 3: Growth (Months 4–6)

### Goals
Expand ATS coverage, add hiring manager outreach, launch referral program, and win first career coach partners.

### Engineering Deliverables

| Deliverable | Notes |
|---|---|
| Hiring manager outreach agent | LinkedIn + email; company enrichment via news + profile data; A/B message testing |
| Expand to 20 ATS platforms | Add iCIMS, Taleo, Jobvite, LinkedIn Easy Apply, SmartRecruiters, and others |
| Referral program | $50 credit for referrer + 1 free month for referee; triggered at job placement moment |
| Follow-up automation | 7-day and 14-day follow-up sequences for non-responsive applications |
| Career coach API (beta) | White-label dashboard; client management; bulk application operations |
| A/B testing for resume versions | Track which resume variants generate more responses per role type |
| Salary intelligence (basic) | Market benchmark data by role, level, and location |

### Hiring
- **Growth/Content Lead** (Month 4): SEO content strategy, LinkedIn presence, community partnerships, data stories

### Growth Activities
- Hire Growth Lead to own content and community channels
- Activate referral program for existing satisfied users
- Target 5 career coach partner accounts (free 60-day API access)
- Pitch first enterprise outplacement pilot to 10 CHROs

### KPIs
- 500 paying subscribers (£74.5K MRR)
- CAC < $150
- 10 documented interview placements from application engine
- 5 career coach partner accounts active
- ≥ 1 enterprise pilot conversation advanced

---

## Phase 4: Seed Raise (Month 6)

### Goals
Close £1.5–2.5M seed round at a £10M pre-money cap to fund Phase 5 scale.

### Fundraising Narrative

The story: LaunchVector is the first software company in the reverse recruiting category. The human-dependent model of all incumbents fundamentally caps growth; LaunchVector's AI-native model scales without proportional headcount. We have proven:
- Product works: > 90% ATS submission rate; > 5% interview conversion
- Demand is real: 500+ paying subscribers at $149/month; < $150 CAC; NPS > 40
- Outcome validation: 50+ documented job placements in first 6 months
- B2B signal: first outplacement pilot in progress

### Target Investors
- Career-tech and Future of Work focused VCs
- Operators with HR-tech backgrounds (angel round supplementary)
- Accelerators: YC, EF, Antler — apply to relevant cohorts before seed if timeline allows

### KPIs (seed raise exit criteria)
- £100K+ MRR ($120K+ USD equivalent)
- 50+ documented job placements
- 30+ ATS platform integrations
- LTV:CAC > 3x demonstrated

---

## Phase 5: Scale (Months 7–10)

### Goals
Deploy seed capital to scale product, team, and revenue. Build the defensible intelligence layer.

### Engineering Deliverables

| Deliverable | Notes |
|---|---|
| Interview Intelligence module | AI voice mock interviews (WebRTC); company research briefs; STAR framework coaching; scoring reports |
| ML outcome model V1 | Train job-matching ranker + resume optimizer on first 10K+ application records; Pinecone vectors + custom ranker |
| Hidden job market alerts | Signal detection: LinkedIn job changes, funding announcements, Glassdoor spikes |
| Executive tier features | Network warm intros (alumni + mutual connections), AI negotiation coach, weekly human strategy call |
| Admin dashboard | MRR metrics, user management, application worker health, ATS success rate dashboards |
| Network graph (V1) | Track which connections led to warm intros and interview conversions |

### Hiring (Post-Seed)
- **Full-Stack Engineer** (Month 2 post-seed): Dashboard features, onboarding improvements, job matching UI
- **AI/ML Engineer** (Month 3 post-seed): LLM prompt engineering, outcome model, embeddings
- **Career Domain Expert** (Month 5 post-seed): Validates AI outputs, improves prompt quality, provides human coaching layer for Executive tier

### Growth Activities
- Launch Interview Intelligence with dedicated marketing campaign
- Sign 2 enterprise outplacement deals (target: $200K ARR)
- Scale career coach API to 100 accounts
- Activate paid acquisition channels (Google Ads, LinkedIn Ads) at $10K/month test budget

### KPIs
- 2,000 paying subscribers (£298K MRR)
- 2 enterprise deals signed ($200K ARR)
- LTV:CAC > 4x
- 100 career coach API accounts
- ML outcome model trained on 10K+ records

---

## Phase 6: Expansion (Months 11–12)

### Goals
Reach Series A-ready metrics. Scope international expansion. Establish market leadership narrative.

### Engineering Deliverables

| Deliverable | Notes |
|---|---|
| Outcome prediction model (V2) | Target > 70% accuracy on interview invite prediction within 14 days |
| International job sources | UK (Reed, Totaljobs), Canada (Workopolis), Australia (Seek) job feed integrations |
| Mobile-responsive dashboard | Full mobile experience for candidates monitoring pipeline on the go |
| B2B portal | CHRO/HR dashboard for managing employee outplacement licenses |
| Advanced analytics for candidates | Cohort analysis: which application strategies perform best for their profile |

### Series A Preparation
- **Target metrics for Series A:** £500K MRR, outcome model > 70% accuracy, NPS > 55, enterprise ARR > £500K
- **Target raise:** £8–15M Series A at £50–80M pre-money valuation
- **Story:** Data moat + enterprise traction + international expansion = category-defining company

### KPIs
- £500K MRR (£6M ARR run rate)
- Outcome model prediction accuracy > 70%
- NPS > 55
- 100+ career coach accounts
- International expansion plan drafted (UK + Canada + Australia)

---

## Hiring Sequence

| # | Role | When | Profile |
|---|---|---|---|
| 1 | Co-founder / CTO | Day 0 | Ex-FAANG; Playwright/browser automation experience; backend architecture |
| 2 | Co-founder / CEO/GTM | Day 0 | Career-tech or HR-tech background; operator mindset; sales + fundraising |
| 3 | Full-Stack Engineer | Month 2 (post-seed) | Next.js + Node.js; startup experience preferred |
| 4 | AI/ML Engineer | Month 3 (post-seed) | LLM fine-tuning; Python + ML fundamentals; embeddings and ranking models |
| 5 | Growth / Content Lead | Month 4 (pre-seed) | B2C SaaS growth; data-driven content creator; SEO |
| 6 | Career Domain Expert | Month 5 (post-seed) | Ex-recruiter or career coach; validates AI outputs; provides Executive tier coaching |

---

## Engineering Principles

- **Ship the thinnest version that delivers the core magic.** The MVP is: candidate uploads resume, sets preferences, comes back 24 hours later to find 20 tailored applications submitted. Everything else is V2.
- **ATS handlers are maintenance, not features.** Budget 20% of engineering time for handler upkeep. Each ATS platform UI change can break submissions overnight.
- **Queue everything.** All automation runs through BullMQ — never synchronously in a request. This keeps the UI fast and automation retryable.
- **Measure outcomes, not outputs.** Track interview invite rate and placement rate — not just application volume.
- **Each phase enables the next.** Do not build Phase 3 features while Phase 2 is unstable.

---

## Changelog

- 2026-05-14: Initial 12-month release plan created.
