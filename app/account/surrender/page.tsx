// /home/user/adhikarpath/app/account/surrender/page.tsx
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SurrenderAccountClient } from "@/components/account/SurrenderAccountClient";

export const metadata = { title: "Surrender Account" };

export default async function SurrenderAccountPage() {
  return (
    <PageWrapper title="Surrender Account" subtitle="Surrender your access to enterprise systems">
      <SurrenderAccountClient />
    </PageWrapper>
  );
}
