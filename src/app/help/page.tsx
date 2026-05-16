import Link from "next/link";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { getAllHelpArticles } from "@/lib/contentful";
import { PreviewBanner } from "@/components/cms/PreviewBanner";
import type { HelpSection } from "@/types/contentful";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Help Center",
  description: "Guides, FAQs, and documentation for LaunchVector.",
};

const SECTION_LABELS: Record<HelpSection, string> = {
  "getting-started": "Getting Started",
  billing: "Billing & Plans",
  automation: "Job Automation",
  account: "Account Settings",
  troubleshooting: "Troubleshooting",
};

export default async function HelpPage() {
  const { isEnabled: preview } = draftMode();
  const articles = await getAllHelpArticles(preview);

  const bySection = articles.reduce<
    Partial<Record<HelpSection, typeof articles>>
  >((acc, article) => {
    const section = article.fields.section as HelpSection;
    acc[section] = acc[section] ?? [];
    acc[section]!.push(article);
    return acc;
  }, {});

  const sections = Object.keys(bySection) as HelpSection[];

  return (
    <>
      <PreviewBanner />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="mt-2 text-muted-foreground">
          Find answers to common questions and learn how to get the most out of
          LaunchVector.
        </p>

        {articles.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            No articles published yet. Check back soon.
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <div key={section}>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">
                  {SECTION_LABELS[section] ?? section}
                </h2>
                <ul className="space-y-2">
                  {bySection[section]!.map((article) => (
                    <li key={article.sys.id}>
                      <Link
                        href={`/help/${article.fields.slug as string}`}
                        className="text-primary hover:underline"
                      >
                        {article.fields.title as string}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
