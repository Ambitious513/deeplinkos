import { DashboardShell } from "@/components/dashboard-shell";
import { CreateLinkProvider } from "@/components/dashboard/create-link-modal";
import { displayName, requireOnboarded } from "@/lib/auth/session";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const state = await requireOnboarded("/dashboard");
  const workspaceName = state.profile?.workspace_name || displayName(state.profile, state.user?.email);

  return (
    <CreateLinkProvider>
      <DashboardShell workspaceName={workspaceName} userEmail={state.user?.email ?? null}>
        {children}
      </DashboardShell>
    </CreateLinkProvider>
  );
}
