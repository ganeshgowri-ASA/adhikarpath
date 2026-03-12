import { PageWrapper } from "@/components/layout/PageWrapper";
import { AccessReviewClient } from "@/components/auth/AccessReviewClient";

export const metadata = { title: "User Access Review" };

export default async function AccessReviewPage() {
  return (
    <PageWrapper
      title="User Access Review"
      subtitle="Review and certify team member access"
    >
      <AccessReviewClient />
    </PageWrapper>
  );
}
