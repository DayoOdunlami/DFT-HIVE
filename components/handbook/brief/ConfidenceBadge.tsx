"use client";

type ConfidenceLevel = "high" | "partial" | "indicative";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  detail?: string;
}

const CONFIG: Record<ConfidenceLevel, { label: string; color: string; bg: string; border: string }> = {
  high:        { label: "High",        color: "#065f46", bg: "#d1fae5", border: "#a7f3d0" },
  partial:     { label: "Partial",     color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  indicative:  { label: "Indicative",  color: "#1d4ed8", bg: "#e8f1fb", border: "#b3d4ef" },
};

export function ConfidenceBadge({ level, detail }: ConfidenceBadgeProps) {
  const c = CONFIG[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 3,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
      title={detail}
    >
      {c.label}
      {detail && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· {detail}</span>}
    </span>
  );
}
