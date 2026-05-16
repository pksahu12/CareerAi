import { createClient } from "contentful";
import type {
  TypeLandingPageSkeleton,
  TypeBlogPostSkeleton,
  TypeHelpArticleSkeleton,
  TypeLandingPage,
  TypeBlogPost,
  TypeHelpArticle,
} from "@/types/contentful";

// ─── Client singletons ────────────────────────────────────────────────────────

function createDeliveryClient() {
  if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN)
    return null;
  return createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  });
}

function createPreviewClient() {
  if (
    !process.env.CONTENTFUL_SPACE_ID ||
    !process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
  )
    return null;
  return createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    host: "preview.contentful.com",
  });
}

const deliveryClient = createDeliveryClient();
const previewClient = createPreviewClient();

function getClient(preview = false) {
  return preview ? previewClient : deliveryClient;
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export async function getLandingPage(
  preview = false
): Promise<TypeLandingPage<"WITHOUT_UNRESOLVABLE_LINKS"> | null> {
  const client = getClient(preview);
  if (!client) return null;
  try {
    const entries = await client.getEntries<TypeLandingPageSkeleton>({
      content_type: "landingPage",
      limit: 1,
      include: 3,
    });
    return (
      (entries.items[0] as TypeLandingPage<"WITHOUT_UNRESOLVABLE_LINKS">) ??
      null
    );
  } catch (error) {
    console.error("[Contentful] getLandingPage error:", error);
    return null;
  }
}

// ─── Blog posts ───────────────────────────────────────────────────────────────

export async function getAllBlogPosts(
  preview = false
): Promise<TypeBlogPost<"WITHOUT_UNRESOLVABLE_LINKS">[]> {
  const client = getClient(preview);
  if (!client) return [];
  try {
    const entries = await client.getEntries<TypeBlogPostSkeleton>({
      content_type: "blogPost",
      order: ["-fields.publishedAt"],
      include: 2,
    });
    return entries.items as TypeBlogPost<"WITHOUT_UNRESOLVABLE_LINKS">[];
  } catch (error) {
    console.error("[Contentful] getAllBlogPosts error:", error);
    return [];
  }
}

export async function getBlogPost(
  slug: string,
  preview = false
): Promise<TypeBlogPost<"WITHOUT_UNRESOLVABLE_LINKS"> | null> {
  const client = getClient(preview);
  if (!client) return null;
  try {
    const entries = await client.getEntries<TypeBlogPostSkeleton>({
      content_type: "blogPost",
      "fields.slug": slug,
      limit: 1,
      include: 3,
    });
    return (
      (entries.items[0] as TypeBlogPost<"WITHOUT_UNRESOLVABLE_LINKS">) ?? null
    );
  } catch (error) {
    console.error("[Contentful] getBlogPost error:", error);
    return null;
  }
}

// ─── Help articles ────────────────────────────────────────────────────────────

export async function getAllHelpArticles(
  preview = false
): Promise<TypeHelpArticle<"WITHOUT_UNRESOLVABLE_LINKS">[]> {
  const client = getClient(preview);
  if (!client) return [];
  try {
    const entries = await client.getEntries<TypeHelpArticleSkeleton>({
      content_type: "helpArticle",
      order: ["fields.section", "fields.title"],
      include: 2,
    });
    return entries.items as TypeHelpArticle<"WITHOUT_UNRESOLVABLE_LINKS">[];
  } catch (error) {
    console.error("[Contentful] getAllHelpArticles error:", error);
    return [];
  }
}

export async function getHelpArticle(
  slug: string,
  preview = false
): Promise<TypeHelpArticle<"WITHOUT_UNRESOLVABLE_LINKS"> | null> {
  const client = getClient(preview);
  if (!client) return null;
  try {
    const entries = await client.getEntries<TypeHelpArticleSkeleton>({
      content_type: "helpArticle",
      "fields.slug": slug,
      limit: 1,
      include: 3,
    });
    return (
      (entries.items[0] as TypeHelpArticle<"WITHOUT_UNRESOLVABLE_LINKS">) ??
      null
    );
  } catch (error) {
    console.error("[Contentful] getHelpArticle error:", error);
    return null;
  }
}
