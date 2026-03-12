"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Synthesis } from "@/lib/hive/search";
import type { CaseStudy } from "@/lib/hive/seed-data";
import { useChatContext } from "@/components/handbook/shared/ChatContext";

interface SynthesisPanelProps {
  synthesis: Synthesis;
  results: CaseStudy[];
}

function HazardChip({ hazard }: { hazard: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    "Heavy rainfall":    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    "High temperatures": { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    "Storms":            { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
    "Sea level rise":    { bg: "#f0fdfa", color: "#0f766e", border: "#99f6e4" },
    "Drought":           { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  };
  const s = colors[hazard] ?? { bg: "#f9fafb", color: "#374151", border: "#e5e7eb" };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {hazard}
    </span>
  );
}

export function SynthesisPanel({ synthesis, results }: SynthesisPanelProps) {
  const router = useRouter();
  const { theme: T } = useChatContext();
  const caseIds = results.map((r) => r.id).join(",");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleGenerateBrief = () => {
    router.push(
      `/handbook/brief?from=analysis&ids=${encodeURIComponent(caseIds)}`
    );
  };

  const handleAiSummary = async () => {
    if (aiSummary) {
      setAiSummary(null);
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/handbook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              text: `Provide a single concise paragraph (3-4 sentences) summarising the cross-case patterns across these ${results.length} case studies. Focus on the strongest finding and any notable gaps. Cite every case ID.`,
            },
          ],
          context: {
            mode: "explore",
            result_set: results.map((r) => ({
              id: r.id,
              title: r.title,
              sector: r.sector,
            })),
          },
        }),
      });
      const data = await res.json();
      setAiSummary(data.message ?? data.text ?? "Unable to generate summary.");
    } catch {
      setAiSummary("Unable to generate AI summary at this time.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${T.badgeBorder}`,
        background: `linear-gradient(135deg, ${T.accentBg} 0%, ${T.surfaceAlt} 100%)`,
        padding: 20,
        marginBottom: 20,
        animation: "hive-fade-up 0.3s ease forwards",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: T.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="12"
              height="12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#fff"
              strokeWidth={2}
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
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: T.accent,
            }}
          >
            Cross-case analysis
          </span>
          <span style={{ fontSize: 11, color: T.textSecondary }}>
            {synthesis.count} case {synthesis.count === 1 ? "study" : "studies"}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            color: T.textMuted,
            fontStyle: "italic",
          }}
        >
          Indicative — review sources directly
        </span>
      </div>

      {/* Insight sentence */}
      <p
        style={{
          fontSize: 13,
          color: T.textPrimary,
          lineHeight: 1.65,
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        {synthesis.insightSentence}
      </p>

      {/* Grids */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {synthesis.allCause.length > 0 && (
          <div>
            <span
              style={{
                fontSize: 10,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Climate drivers
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {synthesis.allCause.map((h) => (
                <HazardChip key={h} hazard={h} />
              ))}
            </div>
          </div>
        )}
        {synthesis.commonMeasures.length > 0 && (
          <div>
            <span
              style={{
                fontSize: 10,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Common measures
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {synthesis.commonMeasures.slice(0, 3).map((m) => (
                <span
                  key={m}
                  style={{
                    fontSize: 11,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    color: T.textSecondary,
                    padding: "2px 7px",
                    borderRadius: 4,
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Summary */}
      <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={handleAiSummary}
          disabled={aiLoading}
          style={{
            alignSelf: "flex-start",
            fontSize: 11,
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: 6,
            background: aiSummary ? T.surfaceAlt : "rgba(255,255,255,0.7)",
            color: T.accent,
            border: `1px solid ${T.badgeBorder}`,
            cursor: aiLoading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {aiLoading ? "Generating..." : aiSummary ? "Hide AI summary" : "AI summary"}
        </button>
        {aiSummary && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(255,255,255,0.85)",
              borderRadius: 8,
              border: `1px solid ${T.badgeBorder}`,
              fontSize: 12,
              color: T.textPrimary,
              lineHeight: 1.65,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 6,
                fontSize: 10,
                fontWeight: 700,
                color: T.accent,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-generated
              <button
                onClick={() => { setAiSummary(null); handleAiSummary(); }}
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: T.textMuted,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Refresh
              </button>
            </div>
            {aiSummary}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
        >
          {synthesis.sectors.map((s) => (
            <span
              key={s}
              style={{
                fontSize: 11,
                background: "rgba(255,255,255,0.8)",
                border: `1px solid ${T.badgeBorder}`,
                color: T.accentText,
                padding: "3px 10px",
                borderRadius: 20,
                fontWeight: 500,
              }}
            >
              {s}
            </span>
          ))}
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {synthesis.highTransferCount} of {synthesis.count} with high UK
            transferability
          </span>
        </div>

        <button
          onClick={handleGenerateBrief}
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "8px 16px",
            borderRadius: 8,
            background: T.accent,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            fontFamily: "inherit",
            transition: "background 0.15s",
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Generate brief from these {synthesis.count} cases
        </button>
      </div>
    </div>
  );
}
