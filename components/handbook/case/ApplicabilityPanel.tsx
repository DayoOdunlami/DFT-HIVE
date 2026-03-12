"use client";

import { useState } from "react";
import type { CaseStudy } from "@/lib/hive/seed-data";

interface ApplicabilityPanelProps {
  cs: CaseStudy;
}

const SECTORS = ["Rail", "Aviation", "Maritime", "Highways"] as const;

export function ApplicabilityPanel({ cs }: ApplicabilityPanelProps) {
  const isHigh = cs.transferability === "High";
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [considerations, setConsiderations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSectorClick = async (sector: string) => {
    if (selectedSector === sector) {
      setSelectedSector(null);
      setConsiderations([]);
      return;
    }
    setSelectedSector(sector);
    setConsiderations([]);
    setLoading(true);
    try {
      const articleText = [
        cs.summary,
        cs.insight,
        cs.transferabilityNote,
        ...(cs.sections ? Object.values(cs.sections) : []),
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/handbook/applicability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_id: cs.id,
          article_text: articleText,
          target_sector: sector,
        }),
      });
      const data = await res.json();
      setConsiderations(data.considerations ?? []);
    } catch {
      setConsiderations([
        "Unable to generate applicability analysis. Please try again.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: `1px solid ${isHigh ? "#b3d4ef" : "#fde68a"}`,
        borderRadius: 12,
        padding: "16px 18px",
        background: isHigh ? "#f0f9ff" : "#fffbeb",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 20,
            background: isHigh ? "#d1fae5" : "#fef3c7",
            color: isHigh ? "#065f46" : "#92400e",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: isHigh ? "#10b981" : "#f59e0b",
              display: "inline-block",
            }}
          />
          {cs.transferability} UK transferability
        </span>
      </div>

      <p
        style={{
          fontSize: 13,
          color: "#374151",
          lineHeight: 1.65,
          marginBottom: 12,
        }}
      >
        {cs.transferabilityNote}
      </p>

      {cs.ukApplicability.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Applicable to
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cs.ukApplicability.map((a) => (
              <span
                key={a}
                style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "#fff",
                  border: `1px solid ${isHigh ? "#b3d4ef" : "#fde68a"}`,
                  color: isHigh ? "#0369a1" : "#92400e",
                  fontWeight: 500,
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {cs.ukRegion && cs.ukRegion !== "—" && (
        <p
          style={{
            fontSize: 11,
            color: "#9ca3af",
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg
            width="11"
            height="11"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          {cs.ukRegion}
        </p>
      )}

      {/* AI-powered sector applicability */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${isHigh ? "#b3d4ef" : "#fde68a"}`,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "#6b7280",
            marginBottom: 8,
          }}
        >
          How does this apply to...
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {SECTORS.filter((s) => s !== cs.sector).map((sector) => (
            <button
              key={sector}
              onClick={() => handleSectorClick(sector)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
                background:
                  selectedSector === sector ? "#1d70b8" : "#fff",
                color:
                  selectedSector === sector ? "#fff" : "#374151",
                boxShadow:
                  selectedSector === sector
                    ? "none"
                    : "0 1px 2px rgba(0,0,0,0.06)",
              }}
            >
              {sector}
            </button>
          ))}
        </div>

        {loading && (
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#1d70b8",
                display: "inline-block",
                animation: "pulse 1s infinite",
              }}
            />
            Analysing applicability...
          </div>
        )}

        {considerations.length > 0 && !loading && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#1d70b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <svg
                width="10"
                height="10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#1d70b8"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AI-generated · {selectedSector}
            </div>
            <ol
              style={{
                margin: 0,
                paddingLeft: 16,
                fontSize: 12,
                color: "#374151",
                lineHeight: 1.65,
              }}
            >
              {considerations.map((c, i) => (
                <li key={i} style={{ marginBottom: i < considerations.length - 1 ? 6 : 0 }}>
                  {c}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
