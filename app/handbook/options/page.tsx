// @ts-nocheck
"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import { HeatmapPanel } from "@/components/handbook/shared/HeatmapPanel";
import { OptionRow } from "@/components/handbook/options/OptionRow";
import { OPTIONS_DATA, SECTOR_MAP, HAZARD_MAP } from "@/lib/handbook/options-data";
import { HEATMAP_SECTORS, HEATMAP_HAZARDS } from "@/lib/handbook/heatmap-data";
import type { OptionRow as OptionRowType } from "@/lib/handbook/options-data";

function OptionsLibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { themeKey, setThemeKey, theme: T, setChatContext } = useChatContext();

  const [options, setOptions] = useState<OptionRowType[]>([]);
  const [loading, setLoading] = useState(true);

  const [sector, setSector] = useState(searchParams.get("sector") ?? "");
  const [hazard, setHazard] = useState(searchParams.get("hazard") ?? "");
  const [asset, setAsset] = useState("");
  const [expanded, setExpanded] = useState<number | string | null>(null);

  useEffect(() => {
    setChatContext("options");
  }, [setChatContext]);

  useEffect(() => {
    const themeFromUrl = searchParams.get("theme");
    if (themeFromUrl === "light" || themeFromUrl === "dark" || themeFromUrl === "dft") {
      setThemeKey(themeFromUrl);
    }
  }, [searchParams, setThemeKey]);

  useEffect(() => {
    async function load() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(url, key, { db: { schema: "hive" } });
          const { data, error } = await supabase
            .from("options")
            .select("*")
            .order("transport_subsector");
          if (!error && data) setOptions(data as OptionRowType[]);
          else setOptions(OPTIONS_DATA);
        } else {
          setOptions(OPTIONS_DATA);
        }
      } catch {
        setOptions(OPTIONS_DATA);
      }
      setLoading(false);
    }
    load();
  }, []);

  const MATRIX = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    HEATMAP_SECTORS.forEach((s) => {
      result[s] = {};
      HEATMAP_HAZARDS.forEach((h) => {
        result[s][h.id] = options.filter(
          (row) =>
            row.transport_subsector?.toLowerCase() === s.toLowerCase() &&
            row.climate_hazard_cause?.toLowerCase().includes(h.label.toLowerCase())
        ).length;
      });
    });
    return result;
  }, [options]);

  const uniqueAssets = useMemo(
    () => [...new Set(options.map((r) => r.transport_assets).filter(Boolean))].sort() as string[],
    [options]
  );

  const filtered = useMemo(() => {
    return options.filter((row) => {
      if (sector && row.transport_subsector?.toLowerCase() !== (SECTOR_MAP[sector] ?? sector).toLowerCase()) return false;
      if (hazard && !row.climate_hazard_cause?.toLowerCase().includes((HAZARD_MAP[hazard] ?? hazard).toLowerCase())) return false;
      if (asset && row.transport_assets !== asset) return false;
      return true;
    });
  }, [options, sector, hazard, asset]);

  const updateFilters = useCallback(
    (newSector: string, newHazard: string, newAsset?: string) => {
      setSector(newSector);
      setHazard(newHazard);
      if (newAsset !== undefined) setAsset(newAsset);
      setExpanded(null);
      const params = new URLSearchParams();
      if (themeKey) params.set("theme", themeKey);
      if (newSector) params.set("sector", newSector);
      if (newHazard) params.set("hazard", newHazard);
      const query = params.toString();
      router.push(`/handbook/options${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, themeKey]
  );

  const activeSectors = sector ? [SECTOR_MAP[sector] ?? sector] : [];
  const activeHazards = hazard ? [HAZARD_MAP[hazard] ?? hazard] : [];

  const handleHeatmapClick = (sectorLabel: string, hazardId: string) => {
    const sectorId =
      Object.entries(SECTOR_MAP).find(([, v]) => v.toLowerCase() === sectorLabel.toLowerCase())?.[0] ?? sectorLabel.toLowerCase();
    updateFilters(sectorId === sector ? "" : sectorId, hazardId === hazard ? "" : hazardId);
  };

  const clearFilters = () => {
    setAsset("");
    updateFilters("", "");
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap"
      />
      <style>{`
        .hive-root {
          --bg: ${T.bg}; --surface: ${T.surface}; --surface-alt: ${T.surfaceAlt};
          --border: ${T.border}; --border-strong: ${T.borderStrong};
          --text-primary: ${T.textPrimary}; --text-secondary: ${T.textSecondary}; --text-muted: ${T.textMuted};
          --accent: ${T.accent}; --accent-bg: ${T.accentBg}; --accent-text: ${T.accentText};
          --nav-bg: ${T.navBg}; --input-bg: ${T.inputBg}; --input-border: ${T.inputBorder};
        }
      `}</style>
      <div className="hive-root" style={{ background: T.bg, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {/* Page title + count — single nav is in layout (HandbookNav) */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: T.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
                Adaptation Options Library
              </h1>
              <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0" }}>
                Structured guidance on climate adaptation measures by transport sector and hazard
              </p>
            </div>
            <span style={{ fontSize: 13, color: T.textSecondary }}>
              <span style={{ fontWeight: 700, color: T.textPrimary }}>{filtered.length}</span> of {options.length} option{options.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
          {/* Filter row */}
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 4,
              padding: "16px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, flexShrink: 0 }}>
              Filter by:
            </span>
            <select
              value={sector}
              onChange={(e) => updateFilters(e.target.value, hazard)}
              aria-label="Transport sector"
              style={{
                fontSize: 13,
                padding: "6px 10px",
                border: `1px solid ${sector ? T.accent : T.inputBorder}`,
                borderRadius: 3,
                background: sector ? T.accentBg : T.inputBg,
                color: sector ? T.accent : T.textPrimary,
                cursor: "pointer",
                fontFamily: "inherit",
                minWidth: 160,
              }}
            >
              <option value="">Transport sector: All</option>
              {Object.entries(SECTOR_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={hazard}
              onChange={(e) => updateFilters(sector, e.target.value)}
              aria-label="Climate hazard"
              style={{
                fontSize: 13,
                padding: "6px 10px",
                border: `1px solid ${hazard ? T.accent : T.inputBorder}`,
                borderRadius: 3,
                background: hazard ? T.accentBg : T.inputBg,
                color: hazard ? T.accent : T.textPrimary,
                cursor: "pointer",
                fontFamily: "inherit",
                minWidth: 160,
              }}
            >
              <option value="">Climate hazard: All</option>
              {Object.entries(HAZARD_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              aria-label="Transport assets"
              style={{
                fontSize: 13,
                padding: "6px 10px",
                border: `1px solid ${asset ? T.accent : T.inputBorder}`,
                borderRadius: 3,
                background: asset ? T.accentBg : T.inputBg,
                color: asset ? T.accent : T.textPrimary,
                cursor: "pointer",
                fontFamily: "inherit",
                minWidth: 180,
              }}
            >
              <option value="">Transport assets: All</option>
              {uniqueAssets.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            {(sector || hazard || asset) && (
              <button
                onClick={clearFilters}
                style={{
                  fontSize: 12,
                  color: T.textMuted,
                  background: "none",
                  border: `1px solid ${T.border}`,
                  borderRadius: 3,
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <HeatmapPanel
            activeSectors={activeSectors}
            activeHazards={activeHazards}
            variant="filter"
            onCellClick={handleHeatmapClick}
            matrix={MATRIX}
          />

          {loading ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Loading options…
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 4,
                padding: "32px 20px",
                textAlign: "center",
                color: T.textMuted,
                fontSize: 14,
              }}
            >
              No options match the current filters. Try broadening your selection.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="list" aria-label="Adaptation options">
              {filtered.map((row) => (
                <div key={String(row.id)} role="listitem">
                  <OptionRow
                    row={row}
                    isExpanded={expanded === row.id}
                    onToggle={() => setExpanded((p) => (p === row.id ? null : row.id))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function OptionsLibraryPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, color: "#6b7280", fontSize: 14, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          Loading options…
        </div>
      }
    >
      <OptionsLibraryContent />
    </Suspense>
  );
}
