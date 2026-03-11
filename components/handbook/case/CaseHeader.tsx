"use client";

import Link from "next/link";
import type { CaseStudy } from "@/lib/hive/seed-data";

interface CaseHeaderProps {
  cs: CaseStudy;
  inBrief: boolean;
  onAddToBrief: () => void;
  onAskAboutCase: () => void;
}

const SECTOR_STYLE: Record<string, { color: string }> = {
  Rail:                 { color: "#1d4ed8" },
  Aviation:             { color: "#0369a1" },
  Maritime:             { color: "#0f766e" },
  Highways:             { color: "#b45309" },
  "Critical Infrastructure": { color: "#7e22ce" },
  Energy:               { color: "#7e22ce" },
  Multiple:             { color: "#374151" },
};

export function CaseHeader({ cs, inBrief, onAddToBrief, onAskAboutCase }: CaseHeaderProps) {
  const accentColor = SECTOR_STYLE[cs.sector]?.color ?? "#1d70b8";

  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "24px 24px 20px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <Link
            href="/handbook"
            style={{
              fontSize: 12,
              color: "#6b7280",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg
              width="12"
              height="12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Case studies
          </Link>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>›</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{cs.id}</span>
        </div>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: accentColor,
            }}
          >
            {cs.sector}
          </span>
          <span style={{ color: "#d1d5db", fontSize: 11 }}>·</span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{cs.location}</span>
          <span style={{ color: "#d1d5db", fontSize: 11 }}>·</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{cs.year}</span>
          <span style={{ color: "#d1d5db", fontSize: 11 }}>·</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {cs.organisation}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: "#0b0c0c",
            fontFamily: "var(--hive-font-display)",
            margin: "0 0 6px",
            lineHeight: 1.2,
          }}
        >
          {cs.title}
        </h1>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: accentColor,
            margin: "0 0 16px",
          }}
        >
          {cs.hook}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onAddToBrief}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 8,
              border: `1.5px solid ${inBrief ? "#1d70b8" : "#d1d5db"}`,
              background: inBrief ? "#1d70b8" : "#fff",
              color: inBrief ? "#fff" : "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {inBrief ? "✓ In brief" : "+ Add to Brief"}
          </button>
          <button
            onClick={onAskAboutCase}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#1d70b8",
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Ask about this case
          </button>
        </div>
      </div>
    </div>
  );
}
