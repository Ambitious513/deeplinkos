import { AppShell } from "@/components/dashboard/app-shell";
import { getDashboardUser } from "@/lib/dashboard-user";
import type { ReactNode } from "react";
import "./dashboard-theme.css";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getDashboardUser();

  return <AppShell user={user}>{children}</AppShell>;
}
