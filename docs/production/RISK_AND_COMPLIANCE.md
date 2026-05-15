# Risk and Compliance Register

Version: 1.0 · 2026-05-14

---

## 1. Risk Register

### 1.1 Technical Risks

| Risk | Description | Severity | Likelihood | Owner | Mitigation |
|---|---|---|---|---|---|
| **ATS Platform Blocking** | Workday, Greenhouse, and other ATS platforms detect and block automated submissions, invalidating applications | HIGH | HIGH | Engineering | Multiple submission methods (API where available, fingerprint randomization, session rotation); human-assisted fallback for blocked platforms; monitor submission success rate daily; maintain per-platform health checks |
| **LinkedIn API Restrictions** | LinkedIn restricts automated outreach; accounts flagged or permanently banned | HIGH | HIGH | Engineering | Strict daily send limits (≤ 50 messages/day per account); randomized timing and delays; warm-up sequences for new accounts; email as primary channel fallback when LinkedIn restricted |
| **AI Quality Degradation** | Mass AI-generated applications and messages become recognizable and systematically ignored by recruiters; response rates decline | MEDIUM | MEDIUM | Product | Prioritize quality over quantity (100 tailored > 500 generic); continuous A/B testing of message formats; add human-touch personalization signals; monitor response rate trends weekly |
| **LLM Provider Outage** | Claude API or OpenAI API goes down; automation pipeline halts | MEDIUM | LOW | Engineering | Dual-provider architecture (Claude primary, GPT-4o fallback); graceful degradation to queue; automatic failover with alerting |
| **Data Loss / Corruption** | Database corruption or accidental deletion of candidate profile or application data | HIGH | LOW | Engineering | Supabase automated daily backups; point-in-time recovery enabled; no hard deletes in application code (soft delete only) |
| **Resume Data Privacy Breach** | Candidate resume data or personal details leaked via security vulnerability | HIGH | LOW | Engineering | Encrypted at rest (Supabase); TLS in transit; S3 bucket policies restricted to service role; no PII logged in application logs; Clerk handles all auth tokens |

### 1.2 Operational Risks

| Risk | Description | Severity | Likelihood | Owner | Mitigation |
|---|---|---|---|---|---|
| **Low User Activation** | Users sign up but do not complete onboarding; first application never submitted; high early drop-off | MEDIUM | MEDIUM | Product | Frictionless onboarding (< 15 minutes end-to-end); first application batch visible within 24 hours of signup; progress indicator in onboarding wizard; email re-engagement for incomplete onboarding |
| **Monetization Too Slow** | Trial-to-paid conversion below target; MRR insufficient to reach break-even by Month 8 | MEDIUM | MEDIUM | Growth | Hard freemium limits (application cap on free tier); 7-day trial with compelling value delivery in first 24 hours; B2B enterprise revenue diversifies income from Month 6+ |
| **ATS Handler Maintenance Burden** | Each ATS platform requires a custom Playwright handler; platforms change their UI frequently, breaking submissions | HIGH | HIGH | Engineering | Automated regression tests per ATS handler running nightly; failure alerts trigger immediate triage; allocate 20% of engineering time to handler maintenance; prioritize API-first submission where available |
| **Recruiter Backlash** | Industry pushback against AI-submitted applications; companies implement anti-AI screening policies | MEDIUM | LOW | Legal/Product | Position as candidate-empowerment tool (transparent to candidates, optional to employers); maintain human-in-loop controls; candidates can review and approve all submissions |
| **Key Person Dependency** | CTO or CEO departure during early phase creates critical gap | HIGH | LOW | Founders | Documented architecture and runbooks (this folder); shared code ownership; hire second engineer by Month 3 |

### 1.3 Market and Competitive Risks

| Risk | Description | Severity | Likelihood | Owner | Mitigation |
|---|---|---|---|---|---|
| **Incumbent Response** | LinkedIn or Indeed launches a competing AI job application product | MEDIUM | MEDIUM | Strategy | Move fast on brand and data moat; differentiate on coaching intelligence, not just apply automation; B2B moat harder for incumbents to replicate quickly |
| **Market Saturation** | LoopCV, JobCopilot, and new AI entrants compete on price for commodity auto-apply | LOW–MEDIUM | MEDIUM | Strategy | Win on outcomes intelligence and personalization depth, not commodity volume; proprietary ML outcome model creates compounding advantage incumbents cannot easily replicate |
| **Economic Downturn Reduces Hiring** | Job market contracts; fewer open roles; lower urgency for job search tools | MEDIUM | LOW | Strategy | Counter-cyclical demand: job search surges during downturns; reposition messaging toward career protection and urgency |
| **ISA / Success-Fee Competitor** | A well-funded competitor offers "free until placed" income share model | LOW | LOW | Strategy | Transparency and no-obligation model is a feature for candidates who distrust ISA terms; emphasize low upfront cost vs. ISA hidden total cost |

### 1.4 Regulatory and Legal Risks

| Risk | Description | Severity | Likelihood | Owner | Mitigation |
|---|---|---|---|---|---|
| **AI-Assisted Hiring Regulation** | New rules around AI-assisted applications or automated hiring screening emerge | LOW | LOW | Legal | Monitor regulatory developments (EU AI Act, US state laws); maintain human-in-loop controls; position as candidate-side tool (not employer-facing) |
| **Terms of Service Violations** | Violating LinkedIn, Indeed, or ATS platform ToS with automated interactions | HIGH | MEDIUM | Legal/Engineering | Review each platform's ToS before building automation; use API integrations where available; ensure explicit candidate consent before any automated action on their behalf |
| **GDPR / CCPA Compliance** | Processing EU or California resident personal data without proper consent or safeguards | HIGH | LOW | Legal | Privacy policy covering data collection, processing, and retention; candidate consent captured at onboarding; right to deletion implemented; Supabase hosted in compliant regions |

---

## 2. Compliance Areas

### 2.1 Data Privacy

| Requirement | Implementation |
|---|---|
| Candidate consent | Explicit consent captured at signup and onboarding; scope of automation clearly explained |
| Data minimization | Only collect data required for job matching and application; no surplus data retention |
| Right to deletion | Candidate can request full data deletion; soft-delete implemented in schema |
| Data portability | Candidates can export their profile, application history, and results |
| GDPR (EU) | Data processing agreement available; EU data hosted in EU region via Supabase; privacy policy covers all GDPR obligations |
| CCPA (California) | Privacy policy includes California-specific disclosures; opt-out mechanism for data sale (not applicable — we do not sell data) |

### 2.2 Payment and Financial

| Requirement | Implementation |
|---|---|
| PCI compliance | Stripe handles all card data — LaunchVector has zero PCI scope |
| Refund policy | Clearly stated at checkout; 7-day trial prevents disputes from uninformed purchases |
| Subscription transparency | Plan limits, billing dates, and auto-renewal terms displayed at checkout and in billing portal |

### 2.3 Security

| Requirement | Implementation |
|---|---|
| Webhook authenticity | All Stripe and Clerk webhooks verified via signed secrets |
| API authentication | Clerk middleware enforces authentication on all protected routes |
| Secret management | All secrets stored in environment variables; never committed to source control |
| Encrypted storage | Supabase encrypts data at rest; TLS enforced for all data in transit |
| Audit trail | Full action log per application execution (timestamp, ATS platform, result, screenshot) |

### 2.4 Employment Law

| Requirement | Notes |
|---|---|
| Misrepresentation risk | Applications submitted on behalf of candidates must accurately represent the candidate; no fabrication of experience or credentials |
| Candidate authorization | Explicit consent required before submitting any application on behalf of a candidate |
| Terms of engagement | Terms of service clearly state that LaunchVector acts as agent of the candidate, not as an employer or recruiter |

---

## 3. Risk Review Cadence

| Frequency | Activity |
|---|---|
| **Weekly** | Review ATS submission success rate; check for new platform blocks or ToS changes |
| **Monthly** | Review open risks; update likelihood and severity ratings; assign new mitigations |
| **Quarterly** | Full risk register review with founders; add new risks identified from product learnings; remove closed risks |
| **Ad hoc** | Any HIGH severity risk event triggers immediate review and action within 24 hours |

---

## 4. Risk Owners

| Role | Risk Ownership |
|---|---|
| CTO / Engineering Lead | Technical risks, ATS automation, security, data integrity |
| CEO / Founder | Market, competitive, and strategic risks |
| Legal Counsel (when hired) | Regulatory, ToS compliance, employment law, data privacy |
| Head of Growth (Month 4+) | Activation, monetization, and channel risks |

---

## 5. Changelog

- 2026-05-14: Initial risk and compliance register created.
