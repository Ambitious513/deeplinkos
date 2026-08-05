import type { ReactNode } from "react";
import { PublicAuthShell } from "@/components/auth/public-auth-shell";
import "./public.css";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicAuthShell>{children}</PublicAuthShell>;
}
