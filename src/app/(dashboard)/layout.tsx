import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}