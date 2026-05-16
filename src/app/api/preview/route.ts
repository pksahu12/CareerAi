import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const secret = searchParams.get("secret");
  const path = searchParams.get("path") ?? "/";

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  if (!path.startsWith("/")) {
    return new Response("Invalid path", { status: 400 });
  }

  draftMode().enable();
  redirect(path);
}
