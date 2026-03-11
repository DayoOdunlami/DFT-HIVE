"use client";

import { useState } from "react";
import type { MarqueeEntry } from "@/lib/hive/seed-data";

const SECTOR_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Rail:       { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Aviation:   { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  Maritime:   { bg: "#f0fdfa", color: "#0f766e", border: "#99f6e4" },
  Highways:   { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  Energy:     { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
  Multiple:   { bg: "#f9fafb", color: "#4b5563", border: "#e5e7eb" },
};

interface MarqueeCardProps {
  entry: MarqueeEntry;
  onClick: (entry: MarqueeEntry) => void;
  highlighted: boolean;
  dimmed: boolean;
}

export function MarqueeCard({ entry, onClick, highlighted, dimmed }: MarqueeCardProps) {
  const [hovered, setHovered] = useState(false);
  const sector = SECTOR_STYLE[entry.sector] ?? SECTOR_STYLE.Multiple;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${entry.title} — ${entry.sector}`}
      onClick={() => onClick(entry)}
      onKeyDown={(e) => e.key === "Enter" && onClick(entry)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 280,
        cursor: "pointer",
        borderRadius: 16,
        border: `1px solid ${highlighted ? "#1d70b8" : hovered ? "#9ca3af" : "#e5e7eb"}`,
        background: highlighted ? "#e8f1fb" : "#fff",
        padding: "14px 16px",
        opacity: dimmed ? 0.25 : 1,
        boxShadow: highlighted
          ? "0 2px 12px rgba(0,0,0,0.10)"
          : hovered
          ? "0 8px 24px rgba(0,0,0,0.10)"
          : "none",
        transform: highlighted
          ? "translateY(-2px)"
          : hovered
          ? "translateY(-3px) scale(1.02)"
          : "none",
        transition: "all 0.2s ease",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.35,
            color: "#0b0c0c",
            margin: 0,
            flex: 1,
            minWidth: 0,
          }}
        >
          {entry.title}
        </h4>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 20,
            background: sector.bg,
            color: sector.color,
            border: `1px solid ${sector.border}`,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {entry.sector}
        </span>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "#6b7280",
          marginBottom: 6,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {entry.measure}
      </p>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: highlighted ? "#1d70b8" : "#1d70b8",
        }}
      >
        {entry.hook}
      </p>
    </div>
  );
}
