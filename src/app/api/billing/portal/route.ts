import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createBillingPortalSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { user } = await requireUser();

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 404 }
    );
  }

  const url = await createBillingPortalSession({
    stripeCustomerId: subscription.stripeCustomerId,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return NextResponse.json({ url });
}
