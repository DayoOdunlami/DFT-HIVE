"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useChatContext } from "./ChatContext";
import { HandbookNav } from "./HandbookNav";
import { ChatPanel } from "./ChatPanel";
import { OnboardingTooltips } from "./OnboardingTooltips";
import { FeedbackSurvey } from "./FeedbackSurvey";

export function HandbookLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { chatOpen, chatContext, closeChat } = useChatContext();

  const isBriefPage = pathname === "/handbook/brief" || pathname?.startsWith("/handbook/brief/");

  if (isBriefPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <HandbookNav />

      {/* Main content shifts left when chat drawer opens */}
      <main
        id="handbook-main"
        style={{
          transition: "padding-right 0.25s cubic-bezier(0.4,0,0.2,1)",
          paddingRight: chatOpen ? "420px" : 0,
        }}
      >
        {children}
      </main>

      <ChatPanel
        context={chatContext}
        open={chatOpen}
        onClose={closeChat}
      />

      {/* Onboarding tooltips — first-visit walkthrough */}
      <OnboardingTooltips />

      {/* Feedback survey — appears after 3+ case study views */}
      <FeedbackSurvey />
    </div>
  );
}
