"use client";

import Link from "next/link";
import { CASE_STUDIES } from "@/lib/hive/seed-data";
import type { OptionRow as OptionRowType } from "@/lib/handbook/options-data";

const SECTOR_CHIP: Record<string, { background: string; color: string; borderColor: string }> = {
  Roads:    { background: "#fffbeb", color: "#92400e", borderColor: "#fde68a" },
  Rail:     { background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" },
  Aviation: { background: "#f5f3ff", color: "#6d28d9", borderColor: "#ddd6fe" },
  Maritime: { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" },
};

interface OptionRowProps {
  row: OptionRowType;
  isExpanded: boolean;
  onToggle: () => void;
}

function CobenefitChip({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 20,
        background: "#f0fdf4",
        border: "1px solid #86efac",
        color: "#14532d",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function OptionRow({ row, isExpanded, onToggle }: OptionRowProps) {
  const sectorChip = SECTOR_CHIP[row.transport_subsector] ?? { background: "var(--surface-alt)", color: "var(--text-secondary)", borderColor: "var(--border)" };
  const cobenefits = row.identified_cobenefits
    ? row.identified_cobenefits
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean)
    : [];

  // Find case studies that might relate to this option
  const relatedCases = CASE_STUDIES.filter((cs) => {
    const sectorMatch = cs.sector.toLowerCase().includes(row.transport_subsector.toLowerCase().slice(0, 4));
    const hazardMatch = cs.hazards.cause.some((h) =>
      row.climate_hazard_cause.toLowerCase().includes(h.toLowerCase().slice(0, 4))
    );
    return sectorMatch && hazardMatch;
  }).slice(0, 2);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${isExpanded ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 4,
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "14px 16px",
          textAlign: "left",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          display: "grid",
          gridTemplateColumns: "110px 140px 1fr 24px",
          gap: 12,
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 20,
            display: "inline-block",
            whiteSpace: "nowrap",
            ...sectorChip,
            border: `1px solid ${sectorChip.borderColor}`,
          }}
        >
          {row.transport_subsector}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.transport_assets}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.4,
              marginBottom: 2,
            }}
          >
            {row.adaptation_measure}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.climate_hazard_cause} → {row.climate_hazard_effect}
          </div>
        </div>
        <span
          style={{
            fontSize: 16,
            color: "var(--text-muted)",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
            display: "block",
            lineHeight: 1,
          }}
        >
          ›
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div
          style={{
            padding: "0 16px 16px",
            borderTop: "1px solid var(--surface-alt)",
            animation: "hive-fade-up 0.2s ease forwards",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              paddingTop: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Climate risk to assets
              </p>
              <p
                style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}
              >
                {row.climate_risk_to_assets}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Adaptation measure
              </p>
              <p
                style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}
              >
                {row.adaptation_measure_description}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Response &amp; Recovery
              </p>
              <p
                style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}
              >
                {row.response_and_recovery_measures}
              </p>
            </div>
            {cobenefits.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Co-benefits
                </p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {cobenefits.map((b) => (
                    <CobenefitChip key={b} label={b} />
                  ))}
                </div>
              </div>
            )}

            {row.prompts_assumptions_comments && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 6 }}>
                  KEY QUESTIONS TO CONSIDER
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  {row.prompts_assumptions_comments}
                </p>
              </div>
            )}

            {row.relevant_case_studies && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 6 }}>
                  RELATED CASE STUDIES
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {row.relevant_case_studies.split("\n").filter(Boolean).map((cs) => (
                    <span
                      key={cs}
                      style={{
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 9999,
                        background: "var(--surface-alt)",
                        border: "1px solid var(--border)",
                        color: "var(--accent-text)",
                      }}
                    >
                      {cs.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fallback: related case studies from seed when row.relevant_case_studies not set */}
          {!row.relevant_case_studies && relatedCases.length > 0 && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                background: "var(--accent-bg)",
                borderRadius: 6,
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--accent)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Related case studies
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {relatedCases.map((cs) => (
                  <Link
                    key={cs.id}
                    href={`/handbook/${cs.id}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "var(--surface)",
                      color: "var(--accent)",
                      border: "1px solid var(--border)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cs.id} ↗
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
