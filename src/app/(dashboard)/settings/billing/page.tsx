import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";
import { PlanCard } from "@/components/billing/PlanCard";
import { formatDate } from "@/lib/utils";

export default async function BillingPage() {
  const { user } = await requireUser();

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: {
      plan: true,
      status: true,
      applicationsUsed: true,
      applicationsMax: true,
      currentPeriodEnd: true,
      trialEnd: true,
      cancelAtPeriodEnd: true,
      stripeCustomerId: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your subscription and usage.
      </p>

      {subscription && (
        <div className="mt-6 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="font-semibold capitalize">
                {subscription.plan.toLowerCase()} —{" "}
                <span
                  className={
                    subscription.status === "ACTIVE" ||
                    subscription.status === "TRIALING"
                      ? "text-green-600"
                      : "text-destructive"
                  }
                >
                  {subscription.status.toLowerCase()}
                </span>
              </p>
            </div>
            {subscription.stripeCustomerId && (
              <ManageBillingButton />
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Applications used this period</span>
              <span>
                {subscription.applicationsUsed} / {subscription.applicationsMax}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    (subscription.applicationsUsed /
                      subscription.applicationsMax) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {subscription.currentPeriodEnd && (
            <p className="mt-3 text-xs text-muted-foreground">
              {subscription.cancelAtPeriodEnd
                ? `Cancels on ${formatDate(subscription.currentPeriodEnd)}`
                : `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
            </p>
          )}
          {subscription.trialEnd &&
            subscription.status === "TRIALING" && (
              <p className="mt-1 text-xs text-amber-600">
                Trial ends {formatDate(subscription.trialEnd)}
              </p>
            )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-6">Change plan</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {(["STARTER", "PROFESSIONAL", "EXECUTIVE"] as const).map((plan) => (
            <PlanCard
              key={plan}
              name={PLANS[plan].name}
              description={PLANS[plan].description}
              price={PLANS[plan].price}
              priceId={PLANS[plan].priceId}
              features={PLANS[plan].features}
              currentPlan={subscription?.plan ?? "STARTER"}
              thisPlan={plan}
              subscriptionStatus={subscription?.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ManageBillingButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { redirect } = await import("next/navigation");
        const { requireUser: getUser } = await import("@/lib/auth");
        const { prisma: db } = await import("@/lib/prisma");
        const { createBillingPortalSession } = await import("@/lib/stripe");

        const { user } = await getUser();
        const sub = await db.subscription.findUnique({
          where: { userId: user.id },
          select: { stripeCustomerId: true },
        });
        if (!sub?.stripeCustomerId) return;
        const url = await createBillingPortalSession({
          stripeCustomerId: sub.stripeCustomerId,
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
        });
        redirect(url);
      }}
    >
      <button
        type="submit"
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
      >
        Manage billing
      </button>
    </form>
  );
}
