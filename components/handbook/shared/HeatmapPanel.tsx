"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HEATMAP_SECTORS,
  HEATMAP_HAZARDS,
  HEATMAP_MATRIX,
  getCellColors,
  matchHazardIds,
  matchSectors,
} from "@/lib/handbook/heatmap-data";

export interface HeatmapPanelProps {
  /** Sector strings from active filters — highlights matching row headers */
  activeSectors?: string[];
  /** Hazard strings from active filters — highlights matching column headers */
  activeHazards?: string[];
  /**
   * "landing" — shows position toggle + "Browse all options" link.
   * "filter"  — shows "Currently filtering" header text, no position toggle.
   */
  variant?: "landing" | "filter";
  /** Current position for the landing-page position toggle */
  position?: "above" | "below";
  /** Called when user clicks the above/below toggle (landing variant only) */
  onTogglePosition?: (position: "above" | "below") => void;
  /** Caller decides behaviour: navigate to /options OR update local filter state */
  onCellClick: (sector: string, hazard: string) => void;
  /** Optional matrix of counts; when provided, used instead of HEATMAP_MATRIX (e.g. from Supabase options). */
  matrix?: Record<string, Record<string, number>>;
}

const LEGEND_SWATCHES = ["#f0fdf4", "#d1fae5", "#bbf7d0", "#6ee7b7"];

export function HeatmapPanel({
  activeSectors = [],
  activeHazards = [],
  variant = "landing",
  position = "above",
  onTogglePosition,
  onCellClick,
  matrix: matrixProp,
}: HeatmapPanelProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const matrix = matrixProp ?? HEATMAP_MATRIX;

  const matchedSectors = matchSectors(activeSectors);
  const matchedHazardIds = matchHazardIds(activeHazards);
  const hasActiveContext =
    matchedSectors.length > 0 || matchedHazardIds.length > 0;

  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            aria-hidden="true"
            style={{
              width: 4,
              height: 16,
              borderRadius: 2,
              background: "var(--accent)",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
            Adaptation options coverage
          </span>
          <span
            style={{ fontSize: 11, color: "var(--text-muted)", display: "none" }}
            className="sm:inline"
          >
            {variant === "landing"
              ? "— click any cell to explore options for that combination"
              : "— click a cell to apply as filter"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {variant === "landing" && onTogglePosition && (
            <div
              role="group"
              aria-label="Heatmap position"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderRadius: 8,
                padding: 2,
                border: "1px solid var(--border)",
                background: "var(--surface-alt)",
              }}
            >
              {(["above", "below"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => onTogglePosition(pos)}
                  aria-pressed={position === pos}
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    background: position === pos ? "var(--accent)" : "transparent",
                    color: position === pos ? "#fff" : "var(--text-muted)",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          )}

          {variant === "landing" && (
            <Link
              href="/handbook/options"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                whiteSpace: "nowrap",
              }}
            >
              Browse all options →
            </Link>
          )}

          {variant === "filter" && hasActiveContext && (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                background: "var(--accent-bg)",
                border: "1px solid var(--border)",
                padding: "2px 8px",
                borderRadius: 10,
              }}
            >
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "12px 16px", overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: "3px",
            width: "100%",
            minWidth: 460,
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 80 }} />
              {HEATMAP_HAZARDS.map((h) => {
                const isActive = matchedHazardIds.includes(h.id);
                return (
                  <th
                    key={h.id}
                    scope="col"
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: isActive ? "#1d70b8" : "#6b7280",
                      whiteSpace: "nowrap",
                      paddingLeft: 2,
                      paddingRight: 2,
                      textAlign: "center",
                      paddingBottom: 6,
                    }}
                  >
                    {h.label}
                    {isActive && (
                      <div
                        aria-hidden="true"
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "#1d70b8",
                          margin: "2px auto 0",
                        }}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HEATMAP_SECTORS.map((sector) => {
              const sectorMatch = matchedSectors.includes(sector);
              return (
                <tr key={sector}>
                  <th
                    scope="row"
                    style={{
                      paddingRight: 12,
                      paddingTop: 2,
                      paddingBottom: 2,
                      fontSize: 12,
                      fontWeight: sectorMatch ? 700 : 600,
                      color: sectorMatch ? "#1d70b8" : "#374151",
                      whiteSpace: "nowrap",
                      textAlign: "left",
                    }}
                  >
                    {sector}
                  </th>
                  {HEATMAP_HAZARDS.map((h) => {
                    const count = matrix[sector]?.[h.id] ?? 0;
                    const hazardMatch = matchedHazardIds.includes(h.id);
                    const cellKey = `${sector}-${h.id}`;
                    const isHovered = hoveredCell === cellKey;
                    const colors = getCellColors(count, sectorMatch, hazardMatch);

                    return (
                      <td
                        key={h.id}
                        style={{ textAlign: "center", padding: 2 }}
                      >
                        {count > 0 ? (
                          <button
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => onCellClick(sector, h.id)}
                            title={`${count} option${count !== 1 ? "s" : ""} — ${sector} × ${h.label}`}
                            aria-label={`${count} adaptation options for ${sector} and ${h.label}`}
                            style={{
                              width: "100%",
                              minWidth: 38,
                              padding: "5px 4px",
                              background: isHovered ? "var(--accent)" : colors.bg,
                              color: isHovered ? "#fff" : colors.text,
                              border: `1px solid ${isHovered ? "var(--accent-text)" : colors.border}`,
                              borderRadius: 4,
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.1s",
                              fontFamily: "inherit",
                            }}
                          >
                            {count}
                          </button>
                        ) : (
                          <div
                            aria-label={`No options for ${sector} and ${h.label}`}
                            style={{
                              minWidth: 38,
                              padding: "5px 4px",
                              background: colors.bg,
                              borderRadius: 4,
                              fontSize: 11,
                              color: colors.text,
                              textAlign: "center",
                            }}
                          >
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: "#9ca3af",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Fewer
          </span>
          {LEGEND_SWATCHES.map((c, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                width: 14,
                height: 8,
                background: c,
                borderRadius: 2,
                border: "1px solid #d1d5db",
              }}
            />
          ))}
          <span
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            More
          </span>
          {hasActiveContext && (
            <span
              style={{
                marginLeft: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 9,
                color: "var(--text-muted)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 14,
                  height: 8,
                  background: "var(--accent)",
                  borderRadius: 2,
                }}
              />
              matches your current search
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
