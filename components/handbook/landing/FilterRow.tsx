"use client";

interface FilterPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  isAi?: boolean;
}

function FilterPill({ label, selected, onClick, isAi }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      style={{
        fontSize: 12,
        padding: "5px 12px",
        borderRadius: 20,
        whiteSpace: "nowrap",
        transition: "all 0.15s",
        fontWeight: 500,
        border: `1px solid ${selected ? (isAi ? "#059669" : "#1d70b8") : "#d1d5db"}`,
        background: selected ? (isAi ? "#059669" : "#1d70b8") : "#fff",
        color: selected ? "#fff" : "#374151",
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {selected && <span style={{ opacity: 0.8, fontSize: 10 }}>✓</span>}
      {isAi && !selected && (
        <span style={{ fontSize: 9, opacity: 0.7 }}>AI</span>
      )}
      {label}
      {isAi && selected && (
        <span
          style={{
            fontSize: 10,
            marginLeft: 2,
            opacity: 0.8,
            cursor: "pointer",
          }}
          aria-label={`Remove AI-detected filter: ${label}`}
        >
          ×
        </span>
      )}
    </button>
  );
}

interface FilterRowProps {
  selectedHazards: string[];
  selectedSectors: string[];
  aiHazards: string[];
  aiSectors: string[];
  onToggleHazard: (h: string) => void;
  onToggleSector: (s: string) => void;
  onRemoveAiHazard: (h: string) => void;
  onRemoveAiSector: (s: string) => void;
  onClearAll: () => void;
  totalActiveFilters: number;
  resultCount: number;
}

const HAZARD_OPTIONS = [
  "Heavy rainfall",
  "High temperatures",
  "Storms",
  "Sea level rise",
  "Drought",
  "Freeze-thaw",
];

const SECTOR_OPTIONS = ["Rail", "Aviation", "Maritime", "Highways"];

export function FilterRow({
  selectedHazards,
  selectedSectors,
  aiHazards,
  aiSectors,
  onToggleHazard,
  onToggleSector,
  onRemoveAiHazard,
  onRemoveAiSector,
  onClearAll,
  totalActiveFilters,
  resultCount,
}: FilterRowProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "12px 0",
      }}
    >
      {/* Hazard filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#6b7280",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          Hazard
        </span>
        {HAZARD_OPTIONS.map((h) => (
          <FilterPill
            key={h}
            label={h}
            selected={selectedHazards.includes(h)}
            onClick={() => onToggleHazard(h)}
          />
        ))}
        {/* AI-detected hazards not already manually selected */}
        {aiHazards
          .filter((h) => !selectedHazards.includes(h))
          .map((h) => (
            <FilterPill
              key={`ai-${h}`}
              label={h}
              selected
              onClick={() => onRemoveAiHazard(h)}
              isAi
            />
          ))}
      </div>

      {/* Sector filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#6b7280",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          Sector
        </span>
        {SECTOR_OPTIONS.map((s) => (
          <FilterPill
            key={s}
            label={s}
            selected={selectedSectors.includes(s)}
            onClick={() => onToggleSector(s)}
          />
        ))}
        {aiSectors
          .filter((s) => !selectedSectors.includes(s))
          .map((s) => (
            <FilterPill
              key={`ai-${s}`}
              label={s}
              selected
              onClick={() => onRemoveAiSector(s)}
              isAi
            />
          ))}
      </div>

      {/* Active filter summary */}
      {totalActiveFilters > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "6px 0",
          }}
        >
          <span
            style={{ fontSize: 12, color: "#6b7280" }}
            aria-live="polite"
          >
            <strong style={{ color: "#0b0c0c" }}>{resultCount}</strong> case{" "}
            {resultCount === 1 ? "study" : "studies"} match
            {resultCount === 1 ? "es" : ""} your filters
          </span>
          <button
            onClick={onClearAll}
            style={{
              fontSize: 12,
              color: "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: 2,
              fontFamily: "inherit",
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
