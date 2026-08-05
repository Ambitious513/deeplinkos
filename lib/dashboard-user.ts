import { getAuthState, displayName } from "@/lib/auth/session";
import { PLANS, type PlanId } from "@/lib/polar";

export type DashboardUser = {
  name: string;
  email: string;
  role: string;
  workspace: string;
  initials: string;
  /** Human-readable plan name e.g. "Creator", "Scale", "Lifetime" */
  plan: string;
  /** Raw plan ID from profiles.plan e.g. "creator_trial", "scale" */
  planId: PlanId;
};

function initialsFor(name: string, email: string) {
  const source = name || email;
  const parts = source
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  return (parts[0]?.[0] || "D").toUpperCase() + (parts[1]?.[0] || "L").toUpperCase();
}

/** Converts a raw plan ID to a display-friendly name */
function planDisplayName(planId: PlanId): string {
  return PLANS[planId]?.name ?? "Creator";
}

export async function getDashboardUser(): Promise<DashboardUser> {
  const state = await getAuthState();
  const email = state.user?.email || state.profile?.email || "";
  const name = displayName(state.profile, email);
  const workspace = state.profile?.workspace_name || "My Workspace";

  const planId = (state.profile?.plan ?? "creator_trial") as PlanId;

  return {
    name,
    email,
    workspace,
    initials: initialsFor(name, email),
    role: state.user ? "Workspace owner" : "Member",
    planId,
    plan: planDisplayName(planId),
  };
}
