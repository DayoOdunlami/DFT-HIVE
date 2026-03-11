"use client";

import type { ReactNode } from "react";
import { ConfidenceBadge } from "./ConfidenceBadge";

type ConfidenceLevel = "high" | "partial" | "indicative";

interface BriefSectionProps {
  id: string;
  title: string;
  confidence?: ConfidenceLevel;
  confidenceDetail?: string;
  visible: boolean;
  children: ReactNode;
  sectionRef?: (el: HTMLElement | null) => void;
}

function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      className="hive-skeleton"
      style={{ height: 10, width, borderRadius: 4, marginBottom: 8 }}
    />
  );
}

export function BriefSection({
  id,
  title,
  confidence,
  confidenceDetail,
  visible,
  children,
  sectionRef,
}: BriefSectionProps) {
  if (!visible) {
    return (
      <div
        style={{
          padding: "28px 0",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <SkeletonLine width="35%" />
        <SkeletonLine width="90%" />
        <SkeletonLine width="75%" />
        <SkeletonLine width="82%" />
      </div>
    );
  }

  return (
    <div
      id={id}
      ref={sectionRef}
      style={{
        padding: "28px 0",
        borderBottom: "1px solid #e5e7eb",
        animation: "hive-fade-up 0.32s ease forwards",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0b0c0c", margin: 0 }}>
          {title}
        </h2>
        {confidence && (
          <ConfidenceBadge level={confidence} detail={confidenceDetail} />
        )}
      </div>
      {children}
    </div>
  );
}
