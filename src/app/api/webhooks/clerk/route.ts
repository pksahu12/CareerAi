import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

interface ClerkUserPayload {
  id: string;
  email_addresses: { email_address: string; id: string }[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  deleted: boolean | null;
}

interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserPayload;
}

export async function POST(req: Request) {
  const body = await req.text();

  const svixId = headers().get("svix-id");
  const svixTimestamp = headers().get("svix-timestamp");
  const svixSignature = headers().get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("[Clerk Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "user.created": {
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id
        )?.email_address;

        if (!primaryEmail) {
          console.error("[Clerk Webhook] No primary email for user:", data.id);
          break;
        }

        await prisma.user.create({
          data: {
            clerkId: data.id,
            email: primaryEmail,
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            profile: {
              create: {
                onboardingStep: "PROFILE",
                onboardingDone: false,
              },
            },
          },
        });

        console.log(`[Clerk Webhook] User created: ${data.id}`);
        break;
      }

      case "user.updated": {
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id
        )?.email_address;

        await prisma.user.update({
          where: { clerkId: data.id },
          data: {
            email: primaryEmail ?? undefined,
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
        });

        console.log(`[Clerk Webhook] User updated: ${data.id}`);
        break;
      }

      case "user.deleted": {
        // Cascade delete is handled by Prisma schema (onDelete: Cascade)
        await prisma.user.delete({
          where: { clerkId: data.id },
        });

        console.log(`[Clerk Webhook] User deleted: ${data.id}`);
        break;
      }

      default:
        console.log(`[Clerk Webhook] Unhandled event: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Clerk Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
