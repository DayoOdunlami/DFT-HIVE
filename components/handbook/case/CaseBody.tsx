"use client";

import type { CaseStudy } from "@/lib/hive/seed-data";

interface CaseBodyProps {
  cs: CaseStudy;
}

const CAUSE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  "Heavy rainfall":    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "High temperatures": { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "Storms":            { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
  "Sea level rise":    { bg: "#f0fdfa", color: "#0f766e", border: "#99f6e4" },
  "Drought":           { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  "Freeze-thaw":       { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
};

function HazardBadge({ hazard, type }: { hazard: string; type: "cause" | "effect" }) {
  const s = CAUSE_STYLE[hazard];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 4,
        background: s?.bg ?? "#f9fafb",
        color: s?.color ?? "#374151",
        border: `1px solid ${s?.border ?? "#e5e7eb"}`,
      }}
    >
      {type === "effect" && <span style={{ opacity: 0.4 }}>→</span>}
      {hazard}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#6b7280",
        marginBottom: 10,
      }}
    >
      {children}
    </h3>
  );
}

export function CaseBody({ cs }: CaseBodyProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Key insight */}
      <div
        style={{
          background: "#e8f1fb",
          border: "1px solid #b3d4ef",
          borderRadius: 12,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#1d70b8",
            }}
          >
            Key insight
          </span>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#0b0c0c",
            lineHeight: 1.65,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {cs.insight}
        </p>
      </div>

      {/* Summary */}
      <div
        style={{
          background: "#f9fafb",
          borderRadius: 12,
          padding: "16px 18px",
        }}
      >
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
          {cs.summary}
        </p>
      </div>

      {/* Hazards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <SectionLabel>Climate drivers</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cs.hazards.cause.map((h) => (
              <HazardBadge key={h} hazard={h} type="cause" />
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Impacts</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cs.hazards.effect.map((h) => (
              <HazardBadge key={h} hazard={h} type="effect" />
            ))}
          </div>
        </div>
      </div>

      {/* Measures */}
      <div>
        <SectionLabel>Adaptation measures</SectionLabel>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {cs.measures.map((m) => (
            <li
              key={m}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 14,
                color: "#374151",
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#1d70b8",
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
              {m}
            </li>
          ))}
        </ul>
      </div>

      {/* Assets */}
      {cs.assets.length > 0 && (
        <div>
          <SectionLabel>Assets affected</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cs.assets.map((a) => (
              <span
                key={a}
                style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 4,
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Investment + timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #f3f4f6",
          }}
        >
          <SectionLabel>Investment</SectionLabel>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0b0c0c", margin: "0 0 3px" }}>
            {cs.cost}
          </p>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
            Band: {cs.costBand}
          </p>
        </div>
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #f3f4f6",
          }}
        >
          <SectionLabel>Delivery period</SectionLabel>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0b0c0c", margin: 0 }}>
            {cs.year}
          </p>
        </div>
      </div>

      {/* Reference */}
      <p style={{ fontSize: 11, color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
        Ref: {cs.id} · {cs.organisation} · Curated &amp; verified by HIVE
      </p>
    </div>
  );
}
