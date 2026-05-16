import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type {
  User,
  CandidateProfile,
  Subscription,
} from "@prisma/client";

// ─── requireUser ──────────────────────────────────────────────────────────────
// Must be signed in. Redirects to /sign-in if not.

export async function requireUser(): Promise<{
  user: User;
  clerkUserId: string;
}> {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // User exists in Clerk but not yet synced via webhook — wait for sync
    redirect("/sign-in");
  }

  return { user, clerkUserId: userId };
}

// ─── requireOnboarded ────────────────────────────────────────────────────────
// Must have completed onboarding. Redirects to /onboarding if not.

export async function requireOnboarded(): Promise<{
  user: User;
  profile: CandidateProfile;
  clerkUserId: string;
}> {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true },
  });

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.profile || !user.profile.onboardingDone) {
    redirect("/onboarding");
  }

  return { user, profile: user.profile, clerkUserId: userId };
}

// ─── requireActiveSubscription ───────────────────────────────────────────────
// Must have ACTIVE or TRIALING subscription. Redirects to /settings/billing if not.

export async function requireActiveSubscription(): Promise<{
  user: User;
  profile: CandidateProfile;
  subscription: Subscription;
  clerkUserId: string;
}> {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true, subscription: true },
  });

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.profile || !user.profile.onboardingDone) {
    redirect("/onboarding");
  }

  if (
    !user.subscription ||
    !["ACTIVE", "TRIALING"].includes(user.subscription.status)
  ) {
    redirect("/settings/billing");
  }

  return {
    user,
    profile: user.profile,
    subscription: user.subscription,
    clerkUserId: userId,
  };
}
