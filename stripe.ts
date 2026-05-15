import Stripe from "stripe";
import { Plan } from "@prisma/client";

// Stripe client singleton
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

// ─── Plan definitions ────────────────────────────────────────────────────────

export const PLANS: Record<
  Plan,
  {
    name: string;
    description: string;
    price: number; // monthly in USD
    priceId: string | undefined;
    applicationsPerWeek: number;
    features: string[];
  }
> = {
  STARTER: {
    name: "Starter",
    description: "Get started with AI job search",
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER,
    applicationsPerWeek: 20,
    features: [
      "20 applications / week",
      "AI resume tailoring",
      "Job match feed",
      "Application dashboard",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    description: "Full AI job search team",
    price: 149,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL,
    applicationsPerWeek: 100,
    features: [
      "100 applications / week",
      "Everything in Starter",
      "Hiring manager outreach agent",
      "AI interview prep + mock interviews",
      "Salary intelligence",
      "A/B resume testing",
    ],
  },
  EXECUTIVE: {
    name: "Executive",
    description: "For senior professionals $150K+",
    price: 349,
    priceId: process.env.STRIPE_PRICE_EXECUTIVE,
    applicationsPerWeek: 200,
    features: [
      "200 applications / week",
      "Everything in Professional",
      "Network warm intro finder",
      "Hidden job market alerts",
      "AI negotiation coach",
      "Weekly human strategy call",
    ],
  },
};

// Max applications per week by plan
export const PLAN_LIMITS: Record<Plan, number> = {
  STARTER: 20,
  PROFESSIONAL: 100,
  EXECUTIVE: 200,
};

// ─── Helper: create or retrieve Stripe customer ──────────────────────────────

export async function getOrCreateStripeCustomer({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name?: string;
}): Promise<string> {
  const { prisma } = await import("@/lib/prisma");

  // Check if subscription already has a customer ID
  const existing = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (existing?.stripeCustomerId) {
    return existing.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  return customer.id;
}

// ─── Helper: create billing portal session ───────────────────────────────────

export async function createBillingPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url;
}

// ─── Helper: create checkout session ─────────────────────────────────────────

export async function createCheckoutSession({
  stripeCustomerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
}: {
  stripeCustomerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
      trial_period_days: 7, // 7-day free trial on all plans
    },
    allow_promotion_codes: true,
  });

  if (!session.url) throw new Error("Stripe checkout session URL is null");
  return session.url;
}

// ─── Map Stripe subscription status to our enum ──────────────────────────────

export function mapStripeStatus(
  status: Stripe.Subscription.Status
): import("@prisma/client").SubscriptionStatus {
  const map: Record<Stripe.Subscription.Status, import("@prisma/client").SubscriptionStatus> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    trialing: "TRIALING",
    incomplete: "INCOMPLETE",
    incomplete_expired: "CANCELED",
    unpaid: "PAST_DUE",
    paused: "CANCELED",
  };
  return map[status] ?? "INCOMPLETE";
}

// ─── Map Stripe price ID to plan ─────────────────────────────────────────────

export function getPlanFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "STARTER";
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return "PROFESSIONAL";
  if (priceId === process.env.STRIPE_PRICE_EXECUTIVE) return "EXECUTIVE";
  return "PROFESSIONAL"; // default
}
