import { PageWrapper } from "@/components/layout/PageWrapper";
import { RequestAuthClient } from "@/components/auth/RequestAuthClient";

export const metadata = { title: "Request Authorization" };

export default async function RequestAuthPage() {
  return (
    <PageWrapper
      title="Request Authorization"
      subtitle="Request roles and system access"
    >
      <RequestAuthClient />
    </PageWrapper>
  );
}
