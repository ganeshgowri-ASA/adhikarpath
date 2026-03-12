import { PageWrapper } from "@/components/layout/PageWrapper";
import { ReinstateClient } from "@/components/auth/ReinstateClient";

export const metadata = { title: "Reinstate Access" };

export default async function ReinstatePage() {
  return (
    <PageWrapper
      title="Reinstate Access"
      subtitle="Reinstate surrendered or expired access within 60 days"
    >
      <ReinstateClient />
    </PageWrapper>
  );
}
