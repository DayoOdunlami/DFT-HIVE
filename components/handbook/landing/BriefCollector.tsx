"use client";

import Link from "next/link";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import type { CaseStudy } from "@/lib/hive/seed-data";

interface BriefCollectorProps {
  cases: CaseStudy[];
}

export function BriefCollector({ cases }: BriefCollectorProps) {
  const { briefIds, removeFromBrief, clearBrief } = useChatContext();

  const briefCases = cases.filter((cs) => briefIds.includes(cs.id));

  if (briefCases.length === 0) return null;

  const ids = briefCases.map((cs) => cs.id).join(",");

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
        background: "#0b0c0c",
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        animation: "hive-fade-up 0.3s ease forwards",
        maxWidth: "calc(100vw - 48px)",
        flexWrap: "wrap",
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: "#1d70b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="10"
            height="10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#fff"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
          {briefCases.length} case{briefCases.length !== 1 ? "s" : ""} in
          brief
        </span>
      </div>

      {/* Case chips */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {briefCases.map((cs) => (
          <span
            key={cs.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)",
              maxWidth: 160,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {cs.id}
            </span>
            <button
              onClick={() => removeFromBrief(cs.id)}
              aria-label={`Remove ${cs.title} from brief`}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          href={`/handbook/brief?from=collector&ids=${encodeURIComponent(ids)}`}
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "6px 14px",
            borderRadius: 7,
            background: "#006853",
            color: "#fff",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Build brief →
        </Link>
        <button
          onClick={clearBrief}
          aria-label="Clear brief"
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            textUnderlineOffset: 2,
            fontFamily: "inherit",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
