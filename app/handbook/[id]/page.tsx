"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { CASE_STUDIES } from "@/lib/hive/seed-data";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import { CaseHeader } from "@/components/handbook/case/CaseHeader";
import { CaseBody } from "@/components/handbook/case/CaseBody";
import { ApplicabilityPanel } from "@/components/handbook/case/ApplicabilityPanel";
import { RelatedCases } from "@/components/handbook/case/RelatedCases";
import { recordCaseStudyView } from "@/components/handbook/shared/FeedbackSurvey";
import { ga4 } from "@/lib/analytics/ga4";

interface CasePageProps {
  params: Promise<{ id: string }>;
}

export default function CasePage({ params }: CasePageProps) {
  const { id } = use(params);
  const cs = CASE_STUDIES.find((c) => c.id === id);

  const { setChatContext, openChat, briefIds, addToBrief, removeFromBrief, theme } =
    useChatContext();

  useEffect(() => {
    if (id) {
      setChatContext(`case:${id}`);
      recordCaseStudyView();
      if (cs) ga4.caseStudyOpened(id, cs.sector, "card");
    }
  }, [id, setChatContext]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!id) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!cs) return notFound();

  const inBrief = briefIds.includes(cs.id);

  const handleAddToBrief = () => {
    if (inBrief) removeFromBrief(cs.id);
    else addToBrief(cs.id);
  };

  const handleAskAboutCase = () => {
    openChat(`case:${cs.id}`);
  };

  const T = theme;

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {/* Case header */}
      <CaseHeader
        cs={cs}
        inBrief={inBrief}
        onAddToBrief={handleAddToBrief}
        onAskAboutCase={handleAskAboutCase}
      />

      {/* Body */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "28px 24px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <CaseBody cs={cs} />
        </div>

        {/* Sidebar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "sticky",
            top: 80,
          }}
        >
          <ApplicabilityPanel cs={cs} />
          <RelatedCases
            currentId={cs.id}
            currentSector={cs.sector}
            currentHazards={cs.hazards.cause}
            allCases={CASE_STUDIES}
          />
        </div>
      </div>
    </div>
  );
}
