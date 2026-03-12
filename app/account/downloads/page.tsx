// /home/user/adhikarpath/app/account/downloads/page.tsx
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DownloadsClient } from "@/components/account/DownloadsClient";

export const metadata = { title: "Download Resources" };

export default async function DownloadsPage() {
  return (
    <PageWrapper
      title="Download Resources"
      subtitle="Download guides, policy documents and tools"
    >
      <DownloadsClient />
    </PageWrapper>
  );
}
