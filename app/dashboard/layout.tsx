"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard stage="dashboard">
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
