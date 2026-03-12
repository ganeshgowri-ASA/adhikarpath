// /home/user/adhikarpath/app/account/unlock/page.tsx
import { PageWrapper } from "@/components/layout/PageWrapper";
import { UnlockAccountClient } from "@/components/account/UnlockAccountClient";

export const metadata = { title: "Unlock Account" };

export default async function UnlockAccountPage() {
  return (
    <PageWrapper title="Unlock Account" subtitle="Unlock your account on enterprise systems">
      <UnlockAccountClient />
    </PageWrapper>
  );
}
