"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

interface PlanCardProps {
  name: string;
  description: string;
  price: number;
  priceId: string | undefined;
  features: string[];
  currentPlan: Plan;
  thisPlan: Plan;
  subscriptionStatus?: string;
}

export function PlanCard({
  name,
  description,
  price,
  priceId,
  features,
  currentPlan,
  thisPlan,
  subscriptionStatus,
}: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const isCurrent = currentPlan === thisPlan;
  const isActive =
    isCurrent &&
    (subscriptionStatus === "ACTIVE" || subscriptionStatus === "TRIALING");

  async function handleUpgrade() {
    if (!priceId || isCurrent) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border p-6",
        isActive ? "border-primary shadow-md" : "border-border"
      )}
    >
      {isActive && (
        <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
          Current plan
        </span>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      <ul className="mt-6 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={handleUpgrade}
        disabled={isCurrent || loading || !priceId}
        className={cn(
          "mt-6 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors",
          isCurrent
            ? "bg-secondary text-secondary-foreground cursor-default"
            : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        )}
      >
        {loading ? "Loading..." : isCurrent ? "Current plan" : `Upgrade to ${name}`}
      </button>
    </div>
  );
}
