import { PageWrapper } from "@/components/layout/PageWrapper";
import { HelpClient } from "@/components/help/HelpClient";

export const metadata = { title: "Help Center" };

export default async function HelpPage() {
  return (
    <PageWrapper title="Help Center" subtitle="Documentation, guides and support resources">
      <HelpClient />
    </PageWrapper>
  );
}
