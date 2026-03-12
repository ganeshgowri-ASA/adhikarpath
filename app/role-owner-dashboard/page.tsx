import { PageWrapper } from "@/components/layout/PageWrapper";
import { RoleOwnerDashboardClient } from "@/components/auth/RoleOwnerDashboardClient";

export const metadata = { title: "Role Owner Dashboard" };

export default async function RoleOwnerDashboardPage() {
  return (
    <PageWrapper
      title="Role Owner Dashboard"
      subtitle="Manage role approval requests"
    >
      <RoleOwnerDashboardClient />
    </PageWrapper>
  );
}
