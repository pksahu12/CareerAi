import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";

// ─── Shared ───────────────────────────────────────────────────────────────────

export type HelpSection =
  | "getting-started"
  | "billing"
  | "automation"
  | "account"
  | "troubleshooting";

// ─── Author ───────────────────────────────────────────────────────────────────

export interface TypeAuthorFields {
  name: EntryFieldTypes.Symbol;
  bio?: EntryFieldTypes.Text;
  avatar?: EntryFieldTypes.AssetLink;
}

export type TypeAuthorSkeleton = EntrySkeletonType<TypeAuthorFields, "author">;
export type TypeAuthor<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeAuthorSkeleton, Modifiers, Locales>;

// ─── Landing Page ─────────────────────────────────────────────────────────────

export interface TypeHeroFields {
  headline: EntryFieldTypes.Symbol;
  subheadline: EntryFieldTypes.Text;
  ctaText: EntryFieldTypes.Symbol;
  ctaUrl: EntryFieldTypes.Symbol;
  backgroundImage?: EntryFieldTypes.AssetLink;
}
export type TypeHeroSkeleton = EntrySkeletonType<TypeHeroFields, "hero">;

export interface TypeFeatureFields {
  title: EntryFieldTypes.Symbol;
  description: EntryFieldTypes.Text;
  icon?: EntryFieldTypes.Symbol;
}
export type TypeFeatureSkeleton = EntrySkeletonType<
  TypeFeatureFields,
  "feature"
>;

export interface TypeTestimonialFields {
  quote: EntryFieldTypes.Text;
  authorName: EntryFieldTypes.Symbol;
  authorTitle: EntryFieldTypes.Symbol;
  authorImage?: EntryFieldTypes.AssetLink;
}
export type TypeTestimonialSkeleton = EntrySkeletonType<
  TypeTestimonialFields,
  "testimonial"
>;

export interface TypeLandingPageFields {
  title: EntryFieldTypes.Symbol;
  hero: EntryFieldTypes.EntryLink<TypeHeroSkeleton>;
  features: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeFeatureSkeleton>
  >;
  testimonials?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeTestimonialSkeleton>
  >;
}

export type TypeLandingPageSkeleton = EntrySkeletonType<
  TypeLandingPageFields,
  "landingPage"
>;
export type TypeLandingPage<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeLandingPageSkeleton, Modifiers, Locales>;

// ─── Blog Post ────────────────────────────────────────────────────────────────

export interface TypeBlogPostFields {
  title: EntryFieldTypes.Symbol;
  slug: EntryFieldTypes.Symbol;
  author: EntryFieldTypes.EntryLink<TypeAuthorSkeleton>;
  body: EntryFieldTypes.RichText;
  excerpt: EntryFieldTypes.Text;
  coverImage?: EntryFieldTypes.AssetLink;
  tags: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
  publishedAt: EntryFieldTypes.Date;
}

export type TypeBlogPostSkeleton = EntrySkeletonType<
  TypeBlogPostFields,
  "blogPost"
>;
export type TypeBlogPost<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeBlogPostSkeleton, Modifiers, Locales>;

// ─── Help Article ─────────────────────────────────────────────────────────────

export interface TypeHelpArticleFields {
  title: EntryFieldTypes.Symbol;
  slug: EntryFieldTypes.Symbol;
  section: EntryFieldTypes.Symbol; // enum enforced in Contentful dashboard
  body: EntryFieldTypes.RichText;
  relatedArticles?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeHelpArticleSkeleton>
  >;
}

// Forward reference — TypeScript allows this for recursive types
export type TypeHelpArticleSkeleton = EntrySkeletonType<
  TypeHelpArticleFields,
  "helpArticle"
>;
export type TypeHelpArticle<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeHelpArticleSkeleton, Modifiers, Locales>;
