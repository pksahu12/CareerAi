# Product Requirements Document (PRD)

## 1. Product Overview

LaunchVector is an AI-native career intelligence platform that automates high-friction job search workflows and improves interview outcomes for professionals in the $75K-$150K salary band.

Primary value proposition:

- Replace expensive reverse recruiting services with a lower-cost subscription product.
- Automate repetitive work: job discovery, resume tailoring, ATS submissions, follow-up tracking.
- Improve interview conversion with personalized outreach and interview preparation.

## 2. Problem Statement

Target users face:

- High cost of human reverse recruiting ($2K-$10K+)
- Manual, repetitive application work consuming 10-20 hours/week
- Low transparency into what actions are taken and what is working
- Weak feedback loops between applications, outreach, and interview outcomes

## 3. Goals and Non-Goals

### Goals (Phase 1-2)

- Deliver visible value within first 24 hours of signup.
- Submit high-quality, personalized applications at scale.
- Provide transparent pipeline visibility for all candidate actions.
- Achieve strong conversion from onboarding to first paid plan.

### Non-Goals (first 90 days)

- Full 50+ ATS platform support.
- Fully autonomous negotiation agent.
- International expansion outside initial target markets.

## 4. Target Users

### Primary Segment

- Mid-career professionals in tech, finance, consulting
- Active job search, constrained by time and process complexity
- Willing to pay for measurable outcomes over manual effort

### Secondary Segment

- Companies purchasing outplacement access for laid-off employees

### Tertiary Segment

- Career coaches who need white-label scale tools

## 5. Product Scope

### Core Capabilities

1. Candidate onboarding and profile setup
2. Job matching and ranking
3. Resume and cover letter tailoring per job description
4. ATS application submission automation
5. Pipeline tracking and application status visibility
6. Interview prep support (post-MVP expansion)

### MVP Scope (Days 1-90)

- Resume parsing from PDF/DOCX
- Candidate preference intake
- Rule-based job matching from available job feeds
- ATS automation for a small set of major platforms
- Basic dashboard with submission status
- Stripe subscription billing with a single paid tier

## 6. User Stories

1. As a candidate, I can upload my resume and preferences in under 10 minutes.
2. As a candidate, I can review and approve matched jobs before automation starts.
3. As a candidate, I can see every submitted application with timestamp and status.
4. As a candidate, I can track whether my resume and message versions are improving response rates.
5. As an operator, I can monitor automation success and intervene if specific ATS flows fail.

## 7. Functional Requirements

### FR-1 Onboarding

- Collect role preferences, salary floor, location mode, industry filters, and seniority.
- Parse resume into structured profile fields.
- Validate completeness before activation.

### FR-2 Job Matching

- Ingest jobs from configured feeds and normalize schema.
- Generate match score with explainability factors.
- Allow user review and rejection before auto-apply begins.

### FR-3 Application Automation

- Tailor resume and cover letter for each selected role.
- Execute ATS form filling and submission flows.
- Record evidence (timestamp, target role, platform, result state).

### FR-4 Pipeline Dashboard

- Display total applications, responses, interviews, and conversion rates.
- Show status progression from submitted to response to interview.
- Provide per-job history and notes.

### FR-5 Billing and Access Control

- Stripe subscription lifecycle handling.
- Plan-based limits for applications per week.
- Graceful handling for payment failure and plan cancellation.

## 8. Non-Functional Requirements

- Reliability: >= 90% successful submission rate on supported ATS platforms
- Performance: First dashboard load < 2 seconds p95 on broadband
- Security: Role-based API protection, signed webhooks, encrypted secrets
- Observability: Structured logs for all automation steps and webhook events
- Auditability: Full action log per application execution

## 9. Success Metrics

- Time-to-first-value: first application batch within 24 hours
- Activation rate: onboarding completion > 70%
- Weekly retention (4-week window): > 35% in early cohorts
- Interview conversion benchmark: above DIY baseline in target segment
- Paid conversion from trial/onboarding: target to be established by first 100 users

## 10. Dependencies

- Job source APIs and data licensing
- LLM providers for content generation and fallback
- ATS automation framework and platform handlers
- Stripe + auth + webhook infrastructure

## 11. Open Questions

1. Which ATS platforms are mandatory for GA beyond MVP?
2. What quality threshold triggers automatic fallback to human review?
3. What is the default balance between volume and personalization per user?
4. What SLAs are guaranteed by plan at launch?

## 12. Changelog

- 2026-05-14: Initial production PRD created from strategy document.
