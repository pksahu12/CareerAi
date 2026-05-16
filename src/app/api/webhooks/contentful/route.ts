import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-contentful-webhook-secret");
  if (secret !== process.env.CONTENTFUL_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Invalid webhook secret" },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const contentTypeId = (
    (body?.sys as Record<string, unknown>)
      ?.contentType as Record<string, unknown>
  )?.sys as Record<string, unknown>;

  const typeId = contentTypeId?.id as string | undefined;

  const fields = body?.fields as
    | Record<string, Record<string, string>>
    | undefined;
  const slug = fields?.slug?.["en-US"];

  switch (typeId) {
    case "landingPage":
      revalidatePath("/");
      console.log("[Contentful Webhook] Revalidated /");
      break;

    case "blogPost":
      revalidatePath("/blog");
      if (slug) revalidatePath(`/blog/${slug}`);
      console.log(
        `[Contentful Webhook] Revalidated /blog${slug ? ` and /blog/${slug}` : ""}`
      );
      break;

    case "helpArticle":
      revalidatePath("/help");
      if (slug) revalidatePath(`/help/${slug}`);
      console.log(
        `[Contentful Webhook] Revalidated /help${slug ? ` and /help/${slug}` : ""}`
      );
      break;

    default:
      console.log(`[Contentful Webhook] Unhandled content type: ${typeId}`);
  }

  return NextResponse.json({ revalidated: true, contentTypeId: typeId });
}
