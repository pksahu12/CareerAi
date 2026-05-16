"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/onboarding/StepIndicator";

type Step = "PROFILE" | "RESUME" | "PREFERENCES";

// ── Step 1: Profile ───────────────────────────────────────────────────────────

function ProfileStep({
  onNext,
}: {
  onNext: (data: Record<string, unknown>) => void;
}) {
  const [targetRoles, setTargetRoles] = useState("");
  const [salaryMin, setSalaryMin] = useState("80000");
  const [salaryMax, setSalaryMax] = useState("150000");
  const [locations, setLocations] = useState("");
  const [remote, setRemote] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      targetRoles: targetRoles.split(",").map((r) => r.trim()).filter(Boolean),
      targetSalaryMin: Number(salaryMin),
      targetSalaryMax: Number(salaryMax),
      locations: locations.split(",").map((l) => l.trim()).filter(Boolean),
      remote,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">
          Target roles (comma-separated)
        </label>
        <input
          type="text"
          value={targetRoles}
          onChange={(e) => setTargetRoles(e.target.value)}
          placeholder="Software Engineer, Product Manager"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min salary ($)</label>
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max salary ($)</label>
          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Preferred locations (comma-separated, leave empty for anywhere)
        </label>
        <input
          type="text"
          value={locations}
          onChange={(e) => setLocations(e.target.value)}
          placeholder="New York, San Francisco"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="remote"
          checked={remote}
          onChange={(e) => setRemote(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        <label htmlFor="remote" className="text-sm font-medium">
          Open to remote work
        </label>
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue
      </button>
    </form>
  );
}

// ── Step 2: Resume ────────────────────────────────────────────────────────────

function ResumeStep({
  onNext,
}: {
  onNext: (data: Record<string, unknown>) => void;
}) {
  const [resumeText, setResumeText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      resumeUrl: "",
      resumeText,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">
          Paste your resume text
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          File upload (PDF/DOCX) will be available soon. For now, paste your
          resume content below so the AI can start matching jobs.
        </p>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={12}
          placeholder="Paste your resume here..."
          className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue
      </button>
    </form>
  );
}

// ── Step 3: Preferences ───────────────────────────────────────────────────────

function PreferencesStep({
  onNext,
  loading,
}: {
  onNext: (data: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [industries, setIndustries] = useState("");
  const [companySizes, setCompanySizes] = useState<string[]>([]);
  const [dealBreakers, setDealBreakers] = useState("");

  const sizeOptions = ["Startup (1–50)", "Mid-size (51–500)", "Enterprise (500+)"];

  function toggleSize(size: string) {
    setCompanySizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      industries: industries.split(",").map((i) => i.trim()).filter(Boolean),
      companySizes,
      dealBreakers: dealBreakers.split(",").map((d) => d.trim()).filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">
          Industries of interest (comma-separated)
        </label>
        <input
          type="text"
          value={industries}
          onChange={(e) => setIndustries(e.target.value)}
          placeholder="SaaS, Fintech, Healthcare"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Preferred company size</label>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                companySizes.includes(size)
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-accent"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Deal breakers (comma-separated)
        </label>
        <input
          type="text"
          value={dealBreakers}
          onChange={(e) => setDealBreakers(e.target.value)}
          placeholder="No equity, Mandatory overtime"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Complete setup"}
      </button>
    </form>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("PROFILE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitStep(data: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: currentStep, data }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Something went wrong");
      }

      if (currentStep === "PROFILE") setCurrentStep("RESUME");
      else if (currentStep === "RESUME") setCurrentStep("PREFERENCES");
      else router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const STEP_TITLES: Record<Step, string> = {
    PROFILE: "Tell us about your job search",
    RESUME: "Upload your resume",
    PREFERENCES: "Set your preferences",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-lg px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold">Set up your account</h1>
          <p className="mt-1 text-muted-foreground">
            Just a few questions to get your AI job search team started.
          </p>
        </div>

        <StepIndicator currentStep={currentStep} />

        <div className="mt-10 rounded-xl border bg-card p-8">
          <h2 className="text-lg font-semibold mb-6">
            {STEP_TITLES[currentStep]}
          </h2>

          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {currentStep === "PROFILE" && (
            <ProfileStep onNext={submitStep} />
          )}
          {currentStep === "RESUME" && (
            <ResumeStep onNext={submitStep} />
          )}
          {currentStep === "PREFERENCES" && (
            <PreferencesStep onNext={submitStep} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}
