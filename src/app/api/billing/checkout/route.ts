import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  PLANS,
} from "@/lib/stripe";

const VALID_PRICE_IDS = [
  process.env.STRIPE_PRICE_STARTER,
  process.env.STRIPE_PRICE_PROFESSIONAL,
  process.env.STRIPE_PRICE_EXECUTIVE,
].filter(Boolean) as string[];

export async function POST(req: Request) {
  const { user } = await requireUser();

  let priceId: string;
  try {
    const body = (await req.json()) as { priceId?: string };
    priceId = body.priceId ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!priceId || !VALID_PRICE_IDS.includes(priceId)) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  const stripeCustomerId = await getOrCreateStripeCustomer({
    userId: user.id,
    email: user.email,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
  });

  const url = await createCheckoutSession({
    stripeCustomerId,
    priceId,
    userId: user.id,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return NextResponse.json({ url });
}
