// /home/user/adhikarpath/app/account/password-reset/page.tsx
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PasswordResetClient } from "@/components/account/PasswordResetClient";

export const metadata = { title: "Password Reset" };

export default async function PasswordResetPage() {
  return (
    <PageWrapper title="Password Reset" subtitle="Reset your password for enterprise systems">
      <PasswordResetClient />
    </PageWrapper>
  );
}
