import { PageWrapper } from "@/components/layout/PageWrapper";
import { ManagerDashboardClient } from "@/components/auth/ManagerDashboardClient";

export const metadata = { title: "Manager Dashboard" };

export default async function ManagerDashboardPage() {
  return (
    <PageWrapper
      title="Manager Dashboard"
      subtitle="Review and approve access requests from your team"
    >
      <ManagerDashboardClient />
    </PageWrapper>
  );
}
