import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { getAllBlogPosts, getBlogPost } from "@/lib/contentful";
import { RichTextRenderer } from "@/components/cms/RichTextRenderer";
import { PreviewBanner } from "@/components/cms/PreviewBanner";
import { formatDate } from "@/lib/utils";
import type { Document } from "@contentful/rich-text-types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.fields.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return {};

  const { title, excerpt, coverImage } = post.fields;
  const imageUrl =
    coverImage && "fields" in coverImage && coverImage.fields.file
      ? `https:${(coverImage.fields.file as { url: string }).url}`
      : undefined;

  return {
    title: title as string,
    description: excerpt as string,
    openGraph: {
      title: title as string,
      description: excerpt as string,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { isEnabled: preview } = draftMode();
  const post = await getBlogPost(params.slug, preview);

  if (!post) notFound();

  const { title, body, coverImage, publishedAt, author, tags } = post.fields;

  const imageUrl =
    coverImage && "fields" in coverImage && coverImage.fields.file
      ? `https:${(coverImage.fields.file as { url: string }).url}?w=1200&fm=webp`
      : null;

  const authorName =
    author && "fields" in author
      ? (author.fields.name as string)
      : undefined;

  return (
    <>
      <PreviewBanner />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to blog
          </Link>
        </div>

        {imageUrl && (
          <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl sm:h-80">
            <Image
              src={imageUrl}
              alt={title as string}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-4">
          {(tags as string[])?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{title as string}</h1>

        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          {authorName && <span>{authorName}</span>}
          {authorName && publishedAt && <span>·</span>}
          {publishedAt && <span>{formatDate(publishedAt as string)}</span>}
        </div>

        <div className="mt-10">
          <RichTextRenderer
            document={body as Document}
            className="prose prose-neutral max-w-none"
          />
        </div>
      </div>
    </>
  );
}
