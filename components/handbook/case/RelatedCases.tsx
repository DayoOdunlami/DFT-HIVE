"use client";

import Link from "next/link";
import type { CaseStudy } from "@/lib/hive/seed-data";

interface RelatedCasesProps {
  currentId: string;
  currentSector: string;
  currentHazards: string[];
  allCases: CaseStudy[];
}

function scoreRelated(cs: CaseStudy, sector: string, hazards: string[]): number {
  let score = 0;
  if (cs.sector === sector) score += 3;
  const allH = [...cs.hazards.cause, ...cs.hazards.effect];
  hazards.forEach((h) => {
    if (allH.some((ch) => ch.toLowerCase().includes(h.toLowerCase()))) score += 2;
  });
  return score;
}

export function RelatedCases({
  currentId,
  currentSector,
  currentHazards,
  allCases,
}: RelatedCasesProps) {
  const related = allCases
    .filter((cs) => cs.id !== currentId)
    .map((cs) => ({
      ...cs,
      score: scoreRelated(cs, currentSector, currentHazards),
    }))
    .filter((cs) => cs.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div>
      <h3
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#0b0c0c",
          marginBottom: 12,
        }}
      >
        Related case studies
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {related.map((cs) => (
          <Link
            key={cs.id}
            href={`/handbook/${cs.id}`}
            style={{
              display: "block",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#1d70b8";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 3,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0b0c0c" }}>
                {cs.title}
              </span>
              <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0 }}>
                {cs.id}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, color: "#1d70b8", fontWeight: 600 }}>
                {cs.sector}
              </span>
              <span style={{ fontSize: 10, color: "#d1d5db" }}>·</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>
                {cs.location}
              </span>
              <span style={{ fontSize: 10, color: "#d1d5db" }}>·</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: cs.transferability === "High" ? "#065f46" : "#92400e",
                }}
              >
                {cs.transferability} transferability
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
