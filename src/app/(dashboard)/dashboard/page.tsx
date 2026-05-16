import { requireOnboarded } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { user } = await requireOnboarded();

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: {
      plan: true,
      status: true,
      applicationsUsed: true,
      applicationsMax: true,
      currentPeriodEnd: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Welcome back, {user.firstName ?? user.email}.
      </p>

      {subscription && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="mt-1 text-2xl font-semibold capitalize">
              {subscription.plan.toLowerCase()}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Applications used</p>
            <p className="mt-1 text-2xl font-semibold">
              {subscription.applicationsUsed}{" "}
              <span className="text-base font-normal text-muted-foreground">
                / {subscription.applicationsMax}
              </span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-secondary">
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
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-1 text-2xl font-semibold capitalize">
              {subscription.status.toLowerCase()}
            </p>
          </div>
        </div>
      )}

      <div className="mt-12 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">Job pipeline coming in Phase 2</p>
        <p className="mt-2 text-sm">
          Job ingestion, resume matching, and automated applications will appear here.
        </p>
      </div>
    </div>
  );
}
