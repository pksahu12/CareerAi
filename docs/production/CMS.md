Explore CareerAI project structure

Read [](file:///c%3A/DEV/CareerAI)

Searched for files matching `**/package.json`, no matches

Searched for files matching `**/src/** -type d`, no matches

Read [](file:///c%3A/DEV/CareerAI/.claude)

Read [](file:///c%3A/DEV/CareerAI/README.md#1-1), lines 1 to 100

Read [](file:///c%3A/DEV/CareerAI/CLAUDE.md#1-1), lines 1 to 50

Read [](file:///c%3A/DEV/CareerAI/prisma)

Searched for files matching `**/*.ts -o **/*.tsx`, no matches

Searched for files matching `**/*.json`, 1 match

Read [](file:///c%3A/DEV/CareerAI/route.ts#1-1), lines 1 to 50

Read [](file:///c%3A/DEV/CareerAI/stripe.ts#1-1), lines 1 to 50

Read [](file:///c%3A/DEV/CareerAI/schema.prisma#1-1), lines 1 to 50

Read [](file:///c%3A/DEV/CareerAI/planning)

Searched for regex `src/|app/|components/|pages/`, 18 results

Read [](file:///c%3A/DEV/CareerAI/step0.md)

Read [](file:///c%3A/DEV/CareerAI/step1.md)

Searched for text `export const` (`**/*.ts`), 3 results

Searched for files matching `**/docs/production/**`, 9 matches

Read [](file:///c%3A/DEV/CareerAI/docs/production/TECH_ARCHITECTURE.md#1-1), lines 1 to 150

Read [](file:///c%3A/DEV/CareerAI/docs/production/API_REFERENCE.md#1-1), lines 1 to 100

Read [](file:///c%3A/DEV/CareerAI/README.md)

Searched for text `.env`, 18 results

Created memory file [](file:///c%3A/Users/Dell/AppData/Roaming/Code/User/workspaceStorage/d608ad281838a7138f1e59d2c075ef9c/GitHub.copilot-chat/memory-tool/memories/ZmNiOWNiY2EtMDNjZC00OGRhLWExYjEtNDllMzEwOTZiYThj/CareerAI_Exploration_Summary.md)

Analyzing your answers...

Now I have enough context to create a comprehensive plan. Let me design this. 

Created memory file [](file:///c%3A/Users/Dell/AppData/Roaming/Code/User/workspaceStorage/d608ad281838a7138f1e59d2c075ef9c/GitHub.copilot-chat/memory-tool/memories/ZmNiOWNiY2EtMDNjZC00OGRhLWExYjEtNDllMzEwOTZiYThj/plan.md)

## Plan: Contentful Headless CMS Integration

**TL;DR** — Wire Contentful as the content layer for all public-facing and in-app copy. Marketing pages (landing, blog, help) render statically with ISR. In-app content (onboarding copy, dashboard messages) renders server-side. Rich text renders via `@contentful/rich-text-react-renderer` with custom embedded-entry components.

---

### Phase 1 — Setup & Config

1. Install three packages: `contentful`, `@contentful/rich-text-react-renderer`, `@contentful/rich-text-types`
2. Add four env vars to `.env.local`:
   - `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` (delivery/published)
   - `CONTENTFUL_PREVIEW_ACCESS_TOKEN`, `CONTENTFUL_PREVIEW_SECRET` (draft mode)
3. Create `src/lib/contentful.ts` — two singleton clients (delivery + preview), plus typed fetch helpers (e.g. `getBlogPost(slug)`, `getOnboardingStep(key)`)

### Phase 2 — Content Models (Contentful Dashboard)

Define these six content types before writing any code:

| Content Type | Key Fields |
|---|---|
| `landingPage` | hero (nested), features[], pricing[], testimonials[] |
| `blogPost` | title, slug, author ref, body (RichText), excerpt, coverImage, tags, publishedAt |
| `helpArticle` | title, slug, section (enum), body (RichText), relatedArticles[] |
| `onboardingStep` | stepKey (`PROFILE \| RESUME \| PREFERENCES`), title, description, helpText, tooltips[] |
| `inAppMessage` | messageKey (string), title, body (RichText), ctaText, ctaUrl, variant |

### Phase 3 — TypeScript Types

4. Create `src/types/contentful.ts` — define `TypedEntry<T>` interfaces for each content model using the contentful SDK's generic `Entry<T>` pattern and `Document` from `@contentful/rich-text-types`

### Phase 4 — Marketing Pages (SSG + ISR)

5. `src/app/page.tsx` — fetch `landingPage` entry at build time, `revalidate: 3600`
6. `src/app/blog/page.tsx` — list all `blogPost` entries, ISR
7. `src/app/blog/[slug]/page.tsx` — `generateStaticParams` from all slugs, ISR per post
8. `src/app/help/page.tsx` — fetch all `helpArticle` entries grouped by section
9. `src/app/help/[slug]/page.tsx` — individual article with sidebar nav

*Steps 5–9 can run in parallel*

### Phase 5 — Rich Text Renderer

10. Create `src/components/cms/RichTextRenderer.tsx` with custom `Options` for:
    - Embedded entries: `CodeBlock`, `CTACard`, `Callout`, `ImageWithCaption` components
    - Embedded assets: responsive `<Image>` (Next.js) with alt text
    - Hyperlinks: external links open in new tab with `rel="noopener noreferrer"`

### Phase 6 — In-App CMS Content (SSR)

11. `src/components/cms/InAppMessage.tsx` — async Server Component, fetches by `messageKey` at request time
12. Inject into onboarding layout — fetch `onboardingStep` by `stepKey` (`PROFILE`, `RESUME`, `PREFERENCES`) in each step's Server Component; pass copy as props down to existing form components
13. Dashboard banner slot — render `inAppMessage` entries (announcements, upgrade prompts)

*Steps 11–13 can run in parallel*

### Phase 7 — Draft Preview Mode

14. `src/app/api/preview/route.ts` — validate `?secret=` query param against `CONTENTFUL_PREVIEW_SECRET`, call `draftMode().enable()`, redirect to the target path
15. `src/app/api/preview/disable/route.ts` — call `draftMode().disable()`
16. In `src/lib/contentful.ts` — check `draftMode().isEnabled` and swap to preview client
17. Add a `PreviewBanner` component shown when draft mode is active

### Phase 8 — Revalidation Webhook

18. `src/app/api/webhooks/contentful/route.ts` — verify a shared secret header, map `sys.contentType.sys.id` to the correct `revalidatePath()` or `revalidateTag()` calls (e.g. blog post publish → revalidate `/blog` and `/blog/[slug]`)
19. Add `src/middleware.ts` exclusion for `/api/preview` so Clerk doesn't block unauthenticated preview requests

---

**Relevant Files**
- `src/lib/contentful.ts` — new, delivery + preview singletons + typed helpers
- `src/types/contentful.ts` — new, all content model interfaces
- `src/components/cms/RichTextRenderer.tsx` — new, rich text + embedded renderers
- `src/components/cms/InAppMessage.tsx` — new, SSR message component
- `src/app/api/webhooks/contentful/route.ts` — new, revalidation endpoint (parallel to existing route.ts Stripe webhook pattern)
- `src/middleware.ts` — modify to allow `/api/preview` through Clerk

**Verification**
1. `contentful.getEntries({ content_type: 'blogPost' })` returns typed results in a test script
2. Landing page renders without hardcoded copy; changing Contentful entry + ISR revalidation updates the page
3. Navigate to `/api/preview?secret=<secret>&slug=/blog/test-post` — page switches to draft content; `/api/preview/disable` clears it
4. Publish a Contentful entry → webhook fires → `revalidatePath` called → stale cache cleared within seconds
5. Onboarding step 1 renders Contentful `PROFILE` stepKey copy instead of hardcoded strings

**Decisions**
- No codegen tool (`contentful-typescript-codegen`) — manual interfaces keep the dependency footprint small
- ISR `revalidate: 3600` (1 hour) for blog/help; landing page could go lower (e.g. `300`) if copy changes frequently
- In-app content is SSR (not cached) so editors can push urgent messages (e.g. outages) without a redeploy
- Blog/Help are new routes — not blocked by Phase 1 completion; can be built in parallel with auth work
- Contentful webhook shares the `/api/webhooks/` pattern already established for Stripe and Clerk

**Further Considerations**
1. **Locale/i18n** — Contentful has first-class locale support. If you plan to localize in the future, add `locale` to content models now rather than retrofitting. Not in scope here but worth enabling in Contentful settings.
2. **Image optimization** — Contentful's Image API supports `?w=`, `?fm=webp` query params. Use these in the asset renderer instead of raw URLs to avoid large payloads.
3. **Search** — For the help center, consider Contentful's built-in full-text search (`query` param on `getEntries`) or Algolia sync via Contentful webhooks. Deferred for now.