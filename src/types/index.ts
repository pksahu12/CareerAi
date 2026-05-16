// Re-export Prisma enums so components don't need to import from @prisma/client
export type {
  Plan,
  SubscriptionStatus,
  OnboardingStep,
  ApplicationStatus,
} from "@prisma/client";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserWithProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  profile: CandidateProfileData | null;
}

// ─── Candidate Profile ────────────────────────────────────────────────────────

export interface PreferencesData {
  targetRoles: string[];
  targetSalaryMin: number;
  targetSalaryMax: number;
  locations: string[];
  remote: boolean;
  industries: string[];
  companySizes: string[];
  dealBreakers: string[];
}

export interface CandidateProfileData {
  id: string;
  userId: string;
  onboardingStep: import("@prisma/client").OnboardingStep;
  onboardingDone: boolean;
  resumeUrl: string | null;
  resumeText: string | null;
  preferencesData: PreferencesData | null;
  profileScore: number | null;
}

// ─── Onboarding step payloads ─────────────────────────────────────────────────

export interface ProfileStepData {
  targetRoles: string[];
  targetSalaryMin: number;
  targetSalaryMax: number;
  locations: string[];
  remote: boolean;
}

export interface ResumeStepData {
  resumeUrl: string;
  resumeText: string;
}

export interface PreferencesStepData {
  industries: string[];
  companySizes: string[];
  dealBreakers: string[];
}

export type OnboardingStepData =
  | { step: "PROFILE"; data: ProfileStepData }
  | { step: "RESUME"; data: ResumeStepData }
  | { step: "PREFERENCES"; data: PreferencesStepData };

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface SubscriptionData {
  id: string;
  userId: string;
  stripeCustomerId: string;
  plan: import("@prisma/client").Plan;
  status: import("@prisma/client").SubscriptionStatus;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  applicationsUsed: number;
  applicationsMax: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  applicationsUsed: number;
  applicationsMax: number;
  plan: import("@prisma/client").Plan;
  status: import("@prisma/client").SubscriptionStatus;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface BillingCheckoutResponse {
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}
