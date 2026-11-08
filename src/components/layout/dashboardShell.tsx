import { SignOutButton } from "@/components/auth/signOutForm";
import { requireOrgSession } from "@/features/auth/session";

export async function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userName, organizationName } = await requireOrgSession();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r p-4">
        <p className="font-semibold">Invoice Audit</p>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <span className="text-sm font-medium">{organizationName}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userName}</span>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}