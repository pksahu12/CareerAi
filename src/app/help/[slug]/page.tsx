import Link from "next/link";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { getAllHelpArticles, getHelpArticle } from "@/lib/contentful";
import { RichTextRenderer } from "@/components/cms/RichTextRenderer";
import { PreviewBanner } from "@/components/cms/PreviewBanner";
import type { Document } from "@contentful/rich-text-types";
import type { HelpSection } from "@/types/contentful";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getAllHelpArticles();
  return articles.map((a) => ({ slug: a.fields.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getHelpArticle(params.slug);
  if (!article) return {};
  return {
    title: article.fields.title as string,
    description: `Help article: ${article.fields.title as string}`,
  };
}

export default async function HelpArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const { isEnabled: preview } = draftMode();
  const [article, allArticles] = await Promise.all([
    getHelpArticle(params.slug, preview),
    getAllHelpArticles(preview),
  ]);

  if (!article) notFound();

  const currentSection = article.fields.section as HelpSection;
  const sectionArticles = allArticles.filter(
    (a) => a.fields.section === currentSection && a.sys.id !== article.sys.id
  );

  return (
    <>
      <PreviewBanner />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-8">
          <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">
            ← Help Center
          </Link>
        </div>

        <div className="flex gap-12">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">
              {article.fields.title as string}
            </h1>
            <div className="mt-8">
              <RichTextRenderer
                document={article.fields.body as Document}
                className="prose prose-neutral max-w-none"
              />
            </div>
          </article>

          {/* Sidebar — related articles in same section */}
          {sectionArticles.length > 0 && (
            <aside className="w-56 shrink-0">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                In this section
              </h2>
              <ul className="space-y-2">
                {sectionArticles.map((a) => (
                  <li key={a.sys.id}>
                    <Link
                      href={`/help/${a.fields.slug as string}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {a.fields.title as string}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
