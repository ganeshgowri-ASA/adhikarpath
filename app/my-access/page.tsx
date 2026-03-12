import { PageWrapper } from "@/components/layout/PageWrapper";
import { MyAccessClient } from "@/components/auth/MyAccessClient";

export const metadata = { title: "My Access" };

export default async function MyAccessPage() {
  return (
    <PageWrapper
      title="My Access"
      subtitle="View your current system access and roles"
    >
      <MyAccessClient />
    </PageWrapper>
  );
}
