import Link from "next/link";
import { draftMode } from "next/headers";
import { getLandingPage } from "@/lib/contentful";
import { PreviewBanner } from "@/components/cms/PreviewBanner";
import { PLANS } from "@/lib/stripe";

export const revalidate = 300;

export default async function LandingPage() {
  const { isEnabled: preview } = draftMode();
  const page = await getLandingPage(preview);

  return (
    <>
      <PreviewBanner />
      <div className="flex min-h-screen flex-col">
        {/* Nav */}
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold">
              LaunchVector
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                Blog
              </Link>
              <Link href="/help" className="text-muted-foreground hover:text-foreground">
                Help
              </Link>
              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get started
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="mx-auto max-w-4xl px-6 py-24 text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              {page?.fields.hero &&
              "headline" in page.fields.hero.fields
                ? (page.fields.hero.fields as { headline: string }).headline
                : "Your AI-powered job search team"}
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              {page?.fields.hero &&
              "subheadline" in page.fields.hero.fields
                ? (page.fields.hero.fields as { subheadline: string }).subheadline
                : "LaunchVector automates job search, tailors your resume for every role, and submits applications 24/7 — so you can focus on interviews."}
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
              >
                Start free trial
              </Link>
              <Link
                href="/blog"
                className="rounded-md border px-6 py-3 text-base font-medium hover:bg-accent"
              >
                Learn more
              </Link>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-20">
            <div className="mx-auto max-w-5xl px-6">
              <h2 className="text-center text-3xl font-bold">
                Simple, transparent pricing
              </h2>
              <div className="mt-12 grid gap-6 sm:grid-cols-3">
                {(["STARTER", "PROFESSIONAL", "EXECUTIVE"] as const).map(
                  (plan) => (
                    <div key={plan} className="rounded-xl border bg-card p-6">
                      <h3 className="font-semibold">{PLANS[plan].name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {PLANS[plan].description}
                      </p>
                      <p className="mt-4 text-3xl font-bold">
                        ${PLANS[plan].price}
                        <span className="text-base font-normal text-muted-foreground">
                          /mo
                        </span>
                      </p>
                      <ul className="mt-4 space-y-2">
                        {PLANS[plan].features.map((f) => (
                          <li key={f} className="text-sm text-muted-foreground">
                            • {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/sign-up"
                        className="mt-6 block rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Start 7-day trial
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LaunchVector. All rights reserved.
        </footer>
      </div>
    </>
  );
}
