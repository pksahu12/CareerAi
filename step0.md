Good. All four features, from scratch, production-quality. Here's the plan before we touch a single line of code.

The build order matters a lot. You can't have job matching without users, and you can't have the apply engine without jobs to apply to. So the sequence is: auth + billing → job discovery → apply engine → admin dashboard. Each layer enables the next.

Here's the full system architecture and phased build plan:That's the full build plan. Eight weeks, four phases, each one unblocking the next.

A few things worth flagging before we start coding:

The single most important early decision is your auth provider. The plan above uses Clerk because it handles session management, magic links, OAuth, and the Stripe customer sync out of the box — which saves about a week of work vs rolling your own with NextAuth. If you already have a preference, say so now before we scaffold.

The apply engine (Phase 3) is where most startups underestimate scope. The Claude resume-tailoring piece is maybe 2 days of work. The Playwright ATS handlers are weeks. Each ATS platform — Greenhouse, Lever, Workday, iCIMS — has its own field names, CAPTCHA patterns, file upload flows, and rate limiting. Plan to ship with just 3 platforms initially and expand.

The database schema above is intentionally minimal. The `resume_json` and `prefs_json` fields on `candidate_profiles` give you schema flexibility during the early iterations without needing migrations every time you add a preference field.

Ready to build? Hit "Start Phase 1" above or tell me which phase you want to go deeper on first — I'll generate the full code, folder structure, and config for it.