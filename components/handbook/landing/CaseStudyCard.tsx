"use client";

import { useState } from "react";
import Link from "next/link";
import type { CaseStudy } from "@/lib/hive/seed-data";
import { useChatContext } from "@/components/handbook/shared/ChatContext";

interface HazardBadgeProps {
  hazard: string;
  type: "cause" | "effect";
}

const CAUSE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  "Heavy rainfall":   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "High temperatures":{ bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "Storms":           { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
  "Sea level rise":   { bg: "#f0fdfa", color: "#0f766e", border: "#99f6e4" },
  "Drought":          { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  "Freeze-thaw":      { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
};

function HazardBadge({ hazard, type }: HazardBadgeProps) {
  const style = CAUSE_STYLE[hazard];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: `1px solid ${style?.border ?? "#e5e7eb"}`,
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 7px",
        background: style?.bg ?? "#f9fafb",
        color: style?.color ?? "#374151",
        gap: 3,
      }}
    >
      {type === "effect" && (
        <span style={{ opacity: 0.4 }}>→</span>
      )}
      {hazard}
    </span>
  );
}

function TransferabilityBadge({ level }: { level: string }) {
  const isHigh = level === "High";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
        background: isHigh ? "#d1fae5" : "#fef3c7",
        color: isHigh ? "#065f46" : "#92400e",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isHigh ? "#10b981" : "#f59e0b",
          display: "inline-block",
        }}
      />
      {level} UK transferability
    </span>
  );
}

interface CaseStudyCardProps {
  cs: CaseStudy;
  matchReasons?: string[];
  inBrief: boolean;
  onAddToBrief: (cs: CaseStudy) => void;
  index?: number;
}

export function CaseStudyCard({
  cs,
  matchReasons,
  inBrief,
  onAddToBrief,
  index = 0,
}: CaseStudyCardProps) {
  const [hovered, setHovered] = useState(false);
  const { theme: T } = useChatContext();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        border: `1px solid ${hovered ? T.accent : T.border}`,
        background: T.surface,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.10)" : "none",
        transition: "all 0.2s ease",
        animation: `hive-fade-up 0.3s ease forwards`,
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        opacity: 0,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: T.accent,
            }}
          >
            {cs.sector}
          </span>
          <span style={{ color: T.border, fontSize: 10 }}>·</span>
          <span style={{ fontSize: 11, color: T.textSecondary }}>{cs.location}</span>
          <span style={{ color: T.border, fontSize: 10 }}>·</span>
          <span style={{ fontSize: 11, color: T.textMuted }}>{cs.year}</span>
        </div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.35,
            color: T.textPrimary,
            margin: 0,
          }}
        >
          {cs.title}
        </h3>
      </div>

      {/* Hook — accent color, matches prototype's card hook */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: T.accent,
          marginBottom: 8,
          marginTop: 2,
        }}
      >
        {cs.hook}
      </p>

      {/* Summary */}
      <p
        className="hive-clamp-2"
        style={{
          fontSize: 13,
          color: T.textSecondary,
          lineHeight: 1.6,
          marginBottom: 12,
          flex: 1,
        }}
      >
        {cs.summary}
      </p>

      {/* Match reasons */}
      {matchReasons && matchReasons.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 11, color: T.textMuted }}>Matched on:</span>
          {matchReasons.map((r) => (
            <span
              key={r}
              style={{
                fontSize: 11,
                background: T.accentBg,
                color: T.accentText,
                border: `1px solid ${T.badgeBorder}`,
                padding: "1px 6px",
                borderRadius: 4,
                fontWeight: 500,
              }}
            >
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Hazard badges */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}
      >
        {cs.hazards.cause.slice(0, 2).map((h) => (
          <HazardBadge key={h} hazard={h} type="cause" />
        ))}
        {cs.hazards.effect.slice(0, 2).map((h) => (
          <HazardBadge key={h} hazard={h} type="effect" />
        ))}
      </div>

      {/* UK Applicability box — uses theme accent bg */}
      <div
        style={{
          background: T.accentBg,
          border: `1px solid ${T.badgeBorder}`,
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke={T.accent}
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <span
            style={{ fontSize: 10, fontWeight: 700, color: T.accentText, textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            UK applicability
          </span>
        </div>
        <p style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5, margin: 0 }}>
          {cs.transferabilityNote}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 10,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TransferabilityBadge level={cs.transferability} />
          <span style={{ fontSize: 11, color: T.textMuted }}>{cs.costBand}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToBrief(cs);
            }}
            aria-label={inBrief ? `Remove ${cs.title} from brief` : `Add ${cs.title} to brief`}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              border: `1px solid ${inBrief ? T.accent : T.border}`,
              background: inBrief ? T.accent : "transparent",
              color: inBrief ? "#fff" : T.textMuted,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            {inBrief ? "✓ In brief" : "+ Add to brief"}
          </button>
          <Link
            href={`/handbook/${cs.id}`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Full case study: ${cs.title}`}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.accent,
              display: "flex",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
            }}
          >
            Full case
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
