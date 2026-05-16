import Link from "next/link";
import Image from "next/image";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/contentful";
import { PreviewBanner } from "@/components/cms/PreviewBanner";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Career advice, AI job search tips, and product updates from the LaunchVector team.",
};

export default async function BlogPage() {
  const { isEnabled: preview } = draftMode();
  const posts = await getAllBlogPosts(preview);

  return (
    <>
      <PreviewBanner />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Career advice, AI job search tips, and product updates.
        </p>

        {posts.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            No posts published yet. Check back soon.
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {posts.map((post) => {
              const { title, slug, excerpt, coverImage, publishedAt, tags } =
                post.fields;
              const imageUrl =
                coverImage && "fields" in coverImage && coverImage.fields.file
                  ? `https:${(coverImage.fields.file as { url: string }).url}?w=800&fm=webp`
                  : null;

              return (
                <Link
                  key={slug as string}
                  href={`/blog/${slug as string}`}
                  className="group rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
                >
                  {imageUrl && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={imageUrl}
                        alt={title as string}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(tags as string[])?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {title as string}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {excerpt as string}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {publishedAt ? formatDate(publishedAt as string) : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
