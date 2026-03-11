import { ReactNode } from "react";
import { ChatProvider } from "@/components/handbook/shared/ChatContext";
import { HandbookLayoutClient } from "@/components/handbook/shared/HandbookLayoutClient";
import { GA4Script } from "@/components/handbook/shared/GA4Script";

export const metadata = {
  title: "HIVE — Climate Adaptation Intelligence",
  description:
    "Curated case studies and adaptation intelligence for UK transport professionals",
};

export default function HandbookLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GA4Script />
      <ChatProvider>
        <HandbookLayoutClient>{children}</HandbookLayoutClient>
      </ChatProvider>
    </>
  );
}
