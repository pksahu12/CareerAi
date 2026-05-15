# Operations Runbook

Version: 1.0 · 2026-05-14

---

## 1. Environment Variables

All secrets are stored as environment variables. Never commit `.env.local` to source control.

### Clerk (Authentication)

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys | Public — safe for browser |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys | Server-side only |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → Signing Secret | Used to verify `svix-signature` header |

**Webhook endpoint to configure in Clerk:**
- URL: `https://your-domain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

### Supabase (Database)

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Project Settings → Database → Transaction pooler | Used by Prisma at runtime (connection pooling) |
| `DIRECT_URL` | Project Settings → Database → Direct connection | Used by Prisma CLI for migrations |

### Stripe (Billing)

| Variable | Source | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys | Server-side only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys | Public — used in checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → Signing Secret | Used to verify webhook signature |
| `STRIPE_PRICE_STARTER` | Stripe Dashboard → Products → Starter price ID | $49/mo recurring |
| `STRIPE_PRICE_PROFESSIONAL` | Stripe Dashboard → Products → Professional price ID | $149/mo recurring |
| `STRIPE_PRICE_EXECUTIVE` | Stripe Dashboard → Products → Executive price ID | $349/mo recurring |

---

## 2. Local Development Setup

### Step-by-step

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local
# Fill in all values — see Section 1

# 3. Push schema to database (dev only — no migration files)
npm run db:push

# 4. Start development server
npm run dev
# App available at http://localhost:3000
```

### Useful development commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build (verify before deploy) |
| `npm run db:push` | Sync Prisma schema to DB (dev only) |
| `npm run db:studio` | Open Prisma Studio at localhost:5555 |
| `npm run db:generate` | Regenerate Prisma client after schema changes |

---

## 3. Local Webhook Testing

Stripe and Clerk webhooks require a public URL. Use the following setup for local development:

```bash
# Terminal 1 — run the app
npm run dev

# Terminal 2 — forward Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret printed by Stripe CLI → STRIPE_WEBHOOK_SECRET

# Terminal 3 — expose Clerk webhooks via ngrok
ngrok http 3000
# Copy the https ngrok URL → set in Clerk Dashboard → Webhooks
```

---

## 4. Deployment

### Frontend (Vercel)

1. Connect the GitHub repository to a Vercel project.
2. Add all environment variables from Section 1 to Vercel project settings.
3. Set the production domain.
4. Vercel auto-deploys on push to `main`.

**Post-deploy checklist:**
- Update Clerk webhook URL to production domain.
- Update Stripe webhook URL to production domain.
- Run a test checkout end-to-end to verify Stripe → DB flow.

### Workers (Railway)

Background worker processes (BullMQ) run separately from the Next.js frontend.

1. Create a Railway project linked to the same repository.
2. Configure the worker start command (e.g., `node dist/workers/index.js`).
3. Set the same environment variables as Vercel.
4. Railway auto-deploys on push to `main`.

---

## 5. Webhook Event Handling

### Stripe Webhooks (`/api/webhooks/stripe`)

All events are verified using `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`.

| Event | Action |
|---|---|
| `checkout.session.completed` | Create or update Subscription record in DB; set plan, status, and billing period |
| `customer.subscription.updated` | Sync plan changes, renewal dates, and trial end; reset `applicationsUsed` if plan changes |
| `customer.subscription.deleted` | Mark Subscription status as `CANCELED` |
| `invoice.payment_succeeded` | Reset `applicationsUsed` to 0 for the billing period |
| `invoice.payment_failed` | Mark Subscription status as `PAST_DUE` |

**Replay a failed webhook:**
Stripe Dashboard → Developers → Webhooks → select endpoint → find event → Resend.

### Clerk Webhooks (`/api/webhooks/clerk`)

All events are verified using the `svix` library with `CLERK_WEBHOOK_SECRET`.

| Event | Action |
|---|---|
| `user.created` | Create User + CandidateProfile records in DB |
| `user.updated` | Sync email, name, and imageUrl on User record |
| `user.deleted` | Soft-delete or hard-delete User and related records |

---

## 6. Database Operations

### Schema changes (development)

```bash
# Edit prisma/schema.prisma
# Then push changes to dev database
npm run db:push

# After pushing, regenerate the Prisma client
npm run db:generate
```

### Schema changes (production)

```bash
# Generate a migration file
npx prisma migrate dev --name describe_the_change

# Apply migration to production
npx prisma migrate deploy
```

### Inspect data

```bash
# Open Prisma Studio (visual DB browser)
npm run db:studio
# Available at localhost:5555
```

### Common queries (Prisma Studio or direct SQL)

```sql
-- Check subscription status for a user
SELECT u.email, s.plan, s.status, s."applicationsUsed", s."applicationsMax"
FROM "User" u
JOIN "Subscription" s ON s."userId" = u.id
WHERE u.email = 'user@example.com';

-- Check application pipeline for a user
SELECT j.title, j.company, a.status, a."submittedAt", a."matchScore"
FROM "Application" a
JOIN "Job" j ON j.id = a."jobId"
JOIN "User" u ON u.id = a."userId"
WHERE u.email = 'user@example.com'
ORDER BY a."submittedAt" DESC;
```

---

## 7. ATS Automation Health (Phase 3)

### Monitoring

Target: **≥ 90% successful ATS submission rate** across supported platforms.

Key metrics to track per ATS platform:

| Metric | Alert Threshold |
|---|---|
| Submission success rate | < 85% over 1-hour window |
| Time per submission | > 120 seconds (indicates timeout or CAPTCHA block) |
| Error rate by platform | > 10% errors on any single platform |

### Common failure modes

| Failure | Cause | Resolution |
|---|---|---|
| Form field not found | ATS platform updated its UI | Update the Playwright handler for that ATS platform |
| CAPTCHA block | Rate limit or fingerprint detected | Rotate session, randomize timing, trigger human-assisted fallback |
| Session expired | LinkedIn/ATS session cookie expired | Re-authenticate and resume queue |
| File upload failure | Resume format rejected by ATS | Convert to alternate format (DOCX → PDF or vice versa) |
| Network timeout | ATS slow to respond | Increase Playwright timeout; retry with backoff |

### Fallback procedure

If a platform shows > 10% error rate:
1. Pause automation queue for that ATS platform.
2. Flag affected applications as `QUEUED` (not `APPLIED`).
3. Investigate Playwright handler for UI changes.
4. Test fix on staging before re-enabling queue.
5. Notify affected users via in-app notification.

---

## 8. Incident Response

### Payment failure

**Symptom:** User's subscription moves to `PAST_DUE`.
**Response:**
1. Stripe automatically retries payment (Smart Retries config).
2. User receives Stripe dunning emails.
3. After exhausted retries, subscription moves to `CANCELED`.
4. Application automation pauses automatically (plan check before each job run).

**Manual override (if needed):** Stripe Dashboard → Customers → find user → update payment method or manually retry invoice.

### Webhook delivery failure

**Symptom:** Subscription created in Stripe but not reflected in DB.
**Response:**
1. Stripe Dashboard → Webhooks → check recent events for failed deliveries.
2. Resend the failed event.
3. Verify endpoint responds with 200 within 20 seconds.
4. If persistent: check Railway worker logs; verify `STRIPE_WEBHOOK_SECRET` is correct in production.

### Database connection failure

**Symptom:** API routes returning 500; Prisma connection errors in logs.
**Response:**
1. Check Supabase Dashboard → Project health.
2. Verify `DATABASE_URL` uses the transaction pooler URL (not direct connection) to avoid connection exhaustion.
3. If connection pool exhausted: restart Railway workers to release idle connections.

### ATS platform blocked

See Section 7 fallback procedure above.

---

## 9. Monitoring and Observability

### Product analytics

- **PostHog** — event tracking for all user actions: signup, onboarding steps, plan upgrades, application submissions, interview completions.
- **Mixpanel** — conversion funnel tracking: sign-up → onboarding → first application → paid subscription.

### Structured logging

All automation steps and webhook events must emit structured JSON logs:

```json
{
  "event": "application.submitted",
  "userId": "user_xxx",
  "jobId": "job_xxx",
  "atsType": "greenhouse",
  "durationMs": 4200,
  "success": true,
  "timestamp": "2026-05-14T10:30:00Z"
}
```

### Key dashboards to maintain

| Dashboard | Tool | Purpose |
|---|---|---|
| Application submission rate | PostHog | Track ATS success/fail rates per platform |
| Onboarding funnel | Mixpanel | Step completion rates (PROFILE → RESUME → PREFERENCES → COMPLETE) |
| Plan conversion | Mixpanel | Trial → paid conversion; plan upgrade rates |
| MRR & churn | Stripe Dashboard | Revenue health; cancellation reasons |
| Worker health | Railway logs | BullMQ job success/fail; queue depth |

---

## 10. Changelog

- 2026-05-14: Initial operations runbook created.
