# Metrics and OKRs

Version: 1.0 · 2026-05-14

---

## 1. North Star Metric

**Candidates placed into jobs per month.**

Every other metric is either an input (driving more placements) or a signal (validating the system is working). High placement rate validates product-market fit, drives referral loop activation, and compresses CAC over time.

---

## 2. Company OKRs by Phase

### Phase 1 — Foundation & Private Beta (Months 1–4)

| Objective | Key Results |
|---|---|
| **Prove the core automation works** | ATS submission success rate ≥ 90% across 5 supported platforms |
| | First application submitted within 24 hours for ≥ 80% of beta users |
| **Validate willingness to pay** | 100 paying subscribers by end of Week 12 (Public Launch) |
| | Trial-to-paid conversion ≥ 10% from first 1,000 trial signups |
| **Build a feedback-driven product** | NPS ≥ 40 from private beta cohort (50 users) |
| | Onboarding completion rate ≥ 70% |

### Phase 2 — Growth & Seed Raise (Months 4–6)

| Objective | Key Results |
|---|---|
| **Scale to £100K+ MRR** | 500 paying subscribers ($74.5K MRR) by Month 6 |
| | Blended CAC < $150 across all acquisition channels |
| **Validate interview conversion** | Document ≥ 10 confirmed interview placements from beta cohort |
| | Interview conversion rate from AI applications > 5% baseline (DIY average: 3–5%) |
| **Prove B2B opportunity** | ≥ 1 enterprise outplacement pilot signed (any size) |
| | ≥ 5 career coach partner accounts live |
| **Qualify for seed round** | £100K+ MRR achieved; 50+ documented job placements |

### Phase 3 — Scale (Months 7–10)

| Objective | Key Results |
|---|---|
| **Reach £298K MRR** | 2,000 paying subscribers by Month 10 |
| | 2 enterprise B2B deals signed ($200K ARR) |
| **Build defensible data moat** | ML outcome model V1 trained on 10,000+ application records |
| | Outcome model prediction accuracy > 60% (interview invite within 14 days) |
| **Launch full product suite** | Interview Intelligence module live with ≥ 500 active users |
| | Executive tier live with ≥ 50 subscribers |
| | LTV:CAC ratio > 4x across all channels |

### Phase 4 — Expansion & Series A (Months 11–12)

| Objective | Key Results |
|---|---|
| **Reach £500K MRR (£6M ARR run rate)** | 3,500+ paying subscribers by Month 12 |
| | Enterprise ARR ≥ £500K |
| **Prove Series A story** | Outcome model accuracy > 70% |
| | NPS > 55 |
| | 100+ career coach accounts live |
| **Prepare international expansion** | UK and Canada market scoping complete; launch plan drafted |

---

## 3. Unit Economics

| Metric | Year 1 Target | Year 3 Target |
|---|---|---|
| **ARPU** (avg monthly revenue per user) | $149 (blended) | $185 (upsell mix improves) |
| **CAC** (customer acquisition cost) | $120–$180 (content/community heavy) | $80–$120 (referral flywheel) |
| **Payback period** | ~1 month (avg job search = 2–4 months) | < 1 month |
| **Gross margin** | 72–78% (API + compute + minimal human ops) | 80–85% (scale efficiencies) |
| **Monthly churn** | 12–18% (natural: job found = success) | 8–12% (B2B + retention features) |
| **LTV** (avg 3-month subscription) | $447 | $555 (longer subs + upsells) |
| **LTV:CAC ratio** | 2.5–3.7x | 4.6–6.9x |
| **Enterprise ARPU** (annual) | $100K per company | $250K+ (expanded seats) |

**Note on churn:** High natural churn (candidates who land jobs) is a positive signal — it validates the product is working. Mitigate revenue impact through: (a) referral programs triggered at job placement, (b) multi-year B2B contracts, (c) career maintenance subscriptions for periodic future searches.

---

## 4. Financial Projections (MRR Ramp)

| Month | MRR (£) | Notes |
|---|---|---|
| M1 | £0 | Private beta — no billing |
| M2 | £0 | Private beta continues |
| M3 | £1,000 | Public launch — first 10–20 paying users |
| M4 | £3,000 | Community traction building |
| M5 | £6,000 | SEO + PR kicking in |
| M6 | £10,000 | 500 subscribers; seed raise milestone |
| M7 | £15,000 | Post-seed marketing spend |
| M8 | £20,000 | Break-even month |
| M9 | £25,000 | Outreach agent + coach partners live |
| M10 | £35,000 | Enterprise B2B deals contributing |
| M11 | £48,000 | Interview Intelligence driving upsell |
| M12 | £65,000 | Heading toward Series A narrative |

**Year 1 ARR Target:** £780,000
**Break-even:** Month 8
**Seed Budget:** £500K–£750K

Seed budget allocation:
- Engineering: 45%
- AI / Infrastructure: 20%
- Marketing: 20%
- Operations: 10%
- Legal / Admin: 5%

---

## 5. Product Metrics

### Activation

| Metric | Target |
|---|---|
| Time to first application submitted | < 24 hours from signup |
| Onboarding completion rate | > 70% (all steps: PROFILE → RESUME → PREFERENCES → COMPLETE) |
| Time to complete onboarding | < 15 minutes |
| First match quality (user-approved rate) | > 60% of first-batch jobs approved without edit |

### Retention

| Metric | Target |
|---|---|
| 4-week retention (early cohorts) | > 35% |
| Average subscription length | 2–4 months (natural churn = job found) |
| Users who resubscribe after finding job | Track as early signal of brand loyalty |

### Application quality

| Metric | Target |
|---|---|
| ATS submission success rate | ≥ 90% across supported platforms |
| Application → employer view rate | Establish baseline in first 90 days |
| Application → interview conversion | > 5% (target: 2x DIY baseline of 3–5%) |
| Hiring manager outreach reply rate | > 8% (LinkedIn industry average: 3–5%) |

### Interview and placement

| Metric | Target |
|---|---|
| Interview-to-offer rate (where tracked) | Establish benchmark in Phase 3 |
| Documented placements (first 6 months) | ≥ 50 confirmed job placements |
| Time-to-placement vs. DIY baseline | Target: 30–40% faster |

---

## 6. Lean Validation Checkpoints

Five critical assumptions must be validated before committing full engineering investment:

### Assumption 1 — Willingness to pay $149/month

**Test:** Run a landing page with Stripe checkout before building the product.
**Pass criteria:** 10+ conversions from 100 landing page visitors (10% conversion rate) within 2 weeks.

### Assumption 2 — AI applications generate interviews

**Test:** Track interview invite rate for first 50 beta users.
**Pass criteria:** > 15% of quality applications receive responses. Benchmark: industry average 5–8%.

### Assumption 3 — Hiring manager outreach improves conversion

**Test:** A/B test — outreach + application vs. application alone on same job types.
**Pass criteria:** 2x conversion rate improvement in outreach cohort.

### Assumption 4 — Enterprises will pay for outplacement

**Test:** 20 CHRO/VP People interviews asking: "Would you pay $2K per employee to guarantee placement within 60 days?"
**Pass criteria:** 30%+ say yes with stated budget authority.

### Assumption 5 — Coaches want white-label API

**Test:** Offer 10 coaches free API access for 60 days. Track adoption and client results.
**Pass criteria:** ≥ 6 of 10 coaches actively using it; ≥ 3 willing to pay $199/seat/month.

---

## 7. Tracking and Reporting Cadence

| Cadence | Review |
|---|---|
| Daily | ATS submission success rate, queue depth, new signups |
| Weekly | MRR, new subscribers, churn, activation rate, NPS score (rolling) |
| Monthly | Full unit economics review, OKR progress, channel CAC breakdown |
| Quarterly | OKR retrospective and reset, risk register review, investor update |

---

## 8. Changelog

- 2026-05-14: Initial OKRs and metrics document created.
