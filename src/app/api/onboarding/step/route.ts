import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OnboardingStepData } from "@/types";

const STEP_ORDER = ["PROFILE", "RESUME", "PREFERENCES"] as const;

function nextStep(
  current: string
): "PROFILE" | "RESUME" | "PREFERENCES" | "COMPLETE" {
  const idx = STEP_ORDER.indexOf(current as (typeof STEP_ORDER)[number]);
  if (idx === -1 || idx === STEP_ORDER.length - 1) return "COMPLETE";
  return STEP_ORDER[idx + 1];
}

export async function POST(req: Request) {
  const { user } = await requireUser();

  let body: OnboardingStepData;
  try {
    body = (await req.json()) as OnboardingStepData;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingStep: true, onboardingDone: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Reject out-of-order submissions
  if (profile.onboardingDone || profile.onboardingStep !== body.step) {
    return NextResponse.json(
      { error: "Invalid onboarding step" },
      { status: 409 }
    );
  }

  const next = nextStep(body.step);
  const isDone = next === "COMPLETE";

  let updateData: Parameters<typeof prisma.candidateProfile.update>[0]["data"] =
    {
      onboardingStep: next,
      onboardingDone: isDone,
    };

  if (body.step === "PROFILE") {
    const existing = await prisma.candidateProfile.findUnique({
      where: { userId: user.id },
      select: { preferencesData: true },
    });
    const existingPrefs =
      (existing?.preferencesData as Record<string, unknown>) ?? {};
    updateData.preferencesData = { ...existingPrefs, ...body.data };
  } else if (body.step === "RESUME") {
    updateData.resumeUrl = body.data.resumeUrl;
    updateData.resumeText = body.data.resumeText;
  } else if (body.step === "PREFERENCES") {
    const existing = await prisma.candidateProfile.findUnique({
      where: { userId: user.id },
      select: { preferencesData: true },
    });
    const existingPrefs =
      (existing?.preferencesData as Record<string, unknown>) ?? {};
    updateData.preferencesData = { ...existingPrefs, ...body.data };
  }

  const updated = await prisma.candidateProfile.update({
    where: { userId: user.id },
    data: updateData,
  });

  return NextResponse.json({ profile: updated });
}
