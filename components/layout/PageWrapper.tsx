import { AppShell } from "./AppShell";
import { requireAuth, getInitials } from "@/lib/session";

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export async function PageWrapper({ children, title, subtitle }: PageWrapperProps) {
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
      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </div>
    </AppShell>
  );
}
