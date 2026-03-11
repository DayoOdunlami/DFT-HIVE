"use client";

import Link from "next/link";

const CASE_ACCENTS: Record<string, { base: string; light: string; text: string }> = {
  ID_40:     { base: "#166534", light: "#dcfce7", text: "#14532d" },
  ID_19:     { base: "#9a3412", light: "#ffedd5", text: "#7c2d12" },
  ID_32:     { base: "#1e40af", light: "#dbeafe", text: "#1e3a8a" },
  ID_06:     { base: "#065f46", light: "#d1fae5", text: "#064e3b" },
  ID_01:     { base: "#0e7490", light: "#cffafe", text: "#0c4a6e" },
  ID_11:     { base: "#6b21a8", light: "#f3e8ff", text: "#581c87" },
  ID_UKPN_01:{ base: "#92400e", light: "#fef3c7", text: "#78350f" },
};

const DEFAULT_ACCENT = { base: "#1d70b8", light: "#e8f1fb", text: "#1d3461" };

interface SourceChipProps {
  id: string;
  activeCase?: string | null;
  onClick?: (id: string) => void;
  linkable?: boolean;
}

export function SourceChip({ id, activeCase, onClick, linkable = false }: SourceChipProps) {
  const a = CASE_ACCENTS[id] ?? DEFAULT_ACCENT;
  const isActive = activeCase === id;
  const isOther = !!activeCase && activeCase !== id;

  const style = {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 3,
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 4,
    cursor: "pointer",
    border: "none" as const,
    background: isOther ? "#f3f4f6" : isActive ? a.base : a.light,
    color: isOther ? "#9ca3af" : isActive ? "#fff" : a.text,
    transition: "all 0.2s",
    transform: isActive ? "scale(1.05)" : "scale(1)",
    opacity: isOther ? 0.4 : 1,
    whiteSpace: "nowrap" as const,
    textDecoration: "none" as const,
  };

  if (linkable) {
    return (
      <Link href={`/handbook/${id}`} style={style}>
        {id} ↗
      </Link>
    );
  }

  return (
    <button onClick={() => onClick?.(id)} style={style}>
      {id} ↗
    </button>
  );
}
