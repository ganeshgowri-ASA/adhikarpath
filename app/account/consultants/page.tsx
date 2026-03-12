import { PageWrapper } from "@/components/layout/PageWrapper";
import { ConsultantsClient } from "@/components/account/ConsultantsClient";

export const metadata = { title: "Manage Consultants" };

export default async function ConsultantsPage() {
  return (
    <PageWrapper title="Manage Consultants" subtitle="Register and manage external consultants">
      <ConsultantsClient />
    </PageWrapper>
  );
}
