import { PageWrapper } from "@/components/layout/PageWrapper";
import { NewAccountClient } from "@/components/account/NewAccountClient";

export const metadata = { title: "New Account Request" };

export default async function NewAccountPage() {
  return (
    <PageWrapper title="New Account Request" subtitle="Request a new system account for a user">
      <NewAccountClient />
    </PageWrapper>
  );
}
