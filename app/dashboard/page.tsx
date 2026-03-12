import { requireAuth, getInitials } from "@/lib/session";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireAuth();
  const user = session.user!;
  const userName = user.name || "User";

  return (
    <AppShell
      userName={userName}
      userInitials={getInitials(userName)}
      userPosition={(user as { position?: string }).position}
      userRole={(user as { role?: string }).role}
    >
      <DashboardClient userId={user.id as string} userName={userName} />
    </AppShell>
  );
}
