// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CASE_STUDIES as SEED_CASE_STUDIES } from "@/lib/hive/seed-data";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import { THEMES } from "@/lib/hive/themes";

const TRIB_MEASURES: Array<{
  trib_article_id: string;
  project_title: string;
  measures: Array<{ name: string; description: string }>;
}> = require("@/data/trib-measures.json");

const TOTAL_MEASURE_COUNT = TRIB_MEASURES.reduce((s, a) => s + a.measures.length, 0);

const SECTOR_COLOR = {
  Rail:     { background:"#eff6ff", color:"#1d4ed8", borderColor:"#bfdbfe" },
  Aviation: { background:"#f0f9ff", color:"#0369a1", borderColor:"#bae6fd" },
  Maritime: { background:"#f0fdfa", color:"#0f766e", borderColor:"#99f6e4" },
  Highways: { background:"#fffbeb", color:"#b45309", borderColor:"#fde68a" },
  Energy:   { background:"#faf5ff", color:"#7e22ce", borderColor:"#e9d5ff" },
  Multiple: { background:"#f5f5f4", color:"#57534e", borderColor:"#d6d3d1" },
};

// ── CASE STUDIES — from seed-data, normalised for library ────────────────────
function normaliseCaseForLibrary(cs) {
  return {
    ...cs,
    organisation: cs.organisation ?? cs.org ?? "",
    transferability: cs.transferability ?? cs.transfer ?? "Medium",
    hazards:
      typeof cs.hazards === "object" && !Array.isArray(cs.hazards)
        ? cs.hazards
        : { cause: cs.hazards ?? [], effect: [] },
  };
}
const CASE_STUDIES_NORMALISED = SEED_CASE_STUDIES.map(normaliseCaseForLibrary);

// ── SEARCH + FILTER LOGIC ────────────────────────────────────────────────────
const SECTORS = [...new Set(CASE_STUDIES_NORMALISED.map((cs) => cs.sector))].sort();
const HAZARDS = [...new Set(CASE_STUDIES_NORMALISED.flatMap((cs) => cs.hazards.cause || []))].slice(0, 12);
const TRANSFERABILITY = ["High", "Medium", "Low"];
const COST_BANDS = ["Under £1m", "£1m–£10m", "£10m–£100m", "£100m+"];
const SORT_OPTIONS = [
  { id: "relevance", label: "Best match" },
  { id: "transferability", label: "UK fit" },
  { id: "alpha", label: "A–Z" },
];

function scoreCase(cs, query) {
  if (!query.trim()) return 1;
  const q = query.toLowerCase();
  let score = 0;
  const allH = [...cs.hazards.cause, ...cs.hazards.effect];
  if (cs.title.toLowerCase().includes(q)) score += 10;
  if (cs.summary?.toLowerCase().includes(q)) score += 5;
  if (cs.insight?.toLowerCase().includes(q)) score += 4;
  cs.tags?.forEach(t => { if (t.includes(q)) score += 3; });
  allH.forEach(h => { if (h.toLowerCase().includes(q)) score += 4; });
  cs.measures?.forEach(m => { if (m.toLowerCase().includes(q)) score += 2; });
  return score;
}

function filterAndSort(cases, { query, sectors, hazards, transferability, costBands, sort }) {
  let r = [...cases];
  if (sectors.length) r = r.filter(cs => sectors.includes(cs.sector));
  if (hazards.length) r = r.filter(cs => {
    const all = [...cs.hazards.cause, ...cs.hazards.effect];
    return hazards.some(h => all.some(ch => ch.toLowerCase().includes(h.toLowerCase())));
  });
  if (transferability.length) r = r.filter(cs => transferability.includes(cs.transferability));
  if (costBands.length) r = r.filter(cs => costBands.includes(cs.costBand));
  if (query.trim()) {
    r = r.map(cs => ({ ...cs, _score: scoreCase(cs, query) }))
         .filter(cs => cs._score > 0)
         .sort((a, b) => b._score - a._score);
  } else if (sort === "transferability") {
    const order = { High: 0, Medium: 1, Low: 2 };
    r.sort((a, b) => (order[a.transferability] ?? 3) - (order[b.transferability] ?? 3));
  } else if (sort === "alpha") {
    r.sort((a, b) => a.title.localeCompare(b.title));
  }
  return r;
}

// ── SHARED ATOMS ─────────────────────────────────────────────────────────────
const TransferabilityBadge = ({ level }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:9999, background:level==="High"?"#d1fae5":level==="Medium"?"#fef3c7":"#fee2e2", color:level==="High"?"#065f46":level==="Medium"?"#92400e":"#991b1b" }}>
    <span style={{ width:6, height:6, borderRadius:"50%", background:level==="High"?"#10b981":level==="Medium"?"#f59e0b":"#ef4444", display:"inline-block" }}/>
    {level} UK fit
  </span>
);

const HazardBadge = ({ hazard, type }) => {
  const causeColors = {
    "Heavy rainfall":    { background:"#eff6ff", color:"#1d4ed8", borderColor:"#bfdbfe" },
    "High temperatures": { background:"#fff7ed", color:"#c2410c", borderColor:"#fed7aa" },
    "Flooding – fluvial":{ background:"#eff6ff", color:"#1d4ed8", borderColor:"#bfdbfe" },
    "Flooding – surface water":{ background:"#eff6ff", color:"#1d4ed8", borderColor:"#bfdbfe" },
    "Sea level rise":    { background:"#f0fdfa", color:"#0f766e", borderColor:"#99f6e4" },
    "Drought":           { background:"#fffbeb", color:"#b45309", borderColor:"#fde68a" },
    "Storms":            { background:"#faf5ff", color:"#7e22ce", borderColor:"#e9d5ff" },
    "Landslide":         { background:"#fef2f2", color:"#b91c1c", borderColor:"#fecaca" },
    "Extreme heat":      { background:"#fff7ed", color:"#c2410c", borderColor:"#fed7aa" },
  };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", border:"1px solid", borderRadius:4, fontSize:11, fontWeight:600, padding:"2px 7px",
      ...(type==="cause" ? (causeColors[hazard] || { background:"#f9fafb", color:"#4b5563", borderColor:"#d1d5db" }) : { background:"#f5f5f4", color:"#57534e", borderColor:"#d6d3d1" }) }}>
      {type==="effect" && <span style={{ marginRight:3, opacity:0.4 }}>→</span>}
      {hazard}
    </span>
  );
};

// ── CASE STUDY CARD ──────────────────────────────────────────────────────────
// Richer than the handbook card: shows more on the card face, optimised for gallery browsing
const CaseCard = ({ cs, onClick, onAddToBrief, inBrief, highlighted }) => {
  const sc = SECTOR_COLOR[cs.sector] || SECTOR_COLOR.Multiple;
  return (
    <div
      onClick={() => onClick(cs)}
      className="hive-card"
      style={{
        borderRadius:16, border:"1px solid", cursor:"pointer",
        padding:20, display:"flex", flexDirection:"column", gap:0,
        fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
        outline: highlighted ? "2px solid var(--accent)" : "none",
        outlineOffset: highlighted ? 2 : 0,
      }}>
      {/* Sector stripe + meta */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"2px 8px", borderRadius:4, border:"1px solid", ...sc }}>{cs.sector}</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10, color:"var(--text-muted)" }}>{cs.location}</span>
          <span style={{ fontSize:10, color:"var(--text-muted)" }}>·</span>
          <span style={{ fontSize:10, color:"var(--text-muted)" }}>{cs.year}</span>
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontSize:15, fontWeight:600, lineHeight:1.35, margin:"0 0 6px", color:"var(--text-primary)" }}>{cs.title}</h3>

      {/* Hook — the standout stat line */}
      <p style={{ fontSize:11, fontWeight:700, color:"var(--accent)", margin:"0 0 10px", lineHeight:1.4 }}>{cs.hook}</p>

      {/* Summary — 2 line clamp */}
      <p className="line-clamp-2" style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.65, margin:"0 0 12px", flex:1 }}>{cs.summary}</p>

      {/* Hazard badges */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
        {cs.hazards.cause.slice(0,2).map(h => <HazardBadge key={h} hazard={h} type="cause"/>)}
        {cs.hazards.effect.slice(0,1).map(h => <HazardBadge key={h} hazard={h} type="effect"/>)}
      </div>

      {/* UK applicability note */}
      <div style={{ background:"var(--accent-bg)", border:"1px solid var(--accent)", borderRadius:10, padding:"8px 12px", marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:700, color:"var(--accent)", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.08em" }}>UK applicability</div>
        <p className="line-clamp-2" style={{ fontSize:11, color:"var(--text-secondary)", lineHeight:1.55, margin:0 }}>{cs.transferabilityNote}</p>
      </div>

      {/* Footer: badge + cost + actions */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <TransferabilityBadge level={cs.transferability}/>
          {cs.costBand && <span style={{ fontSize:10, color:"var(--text-muted)", fontWeight:500 }}>{cs.costBand}</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <button
            onClick={e => { e.stopPropagation(); onAddToBrief(cs); }}
            style={{ fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:9999, border:"1.5px solid", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
              background: inBrief ? "var(--accent)" : "transparent",
              color: inBrief ? "#fff" : "var(--text-secondary)",
              borderColor: inBrief ? "var(--accent)" : "var(--border)",
            }}>
            {inBrief ? "✓ In brief" : "+ Brief"}
          </button>
          <span style={{ fontSize:11, fontWeight:600, color:"var(--accent)" }}>
            View →
          </span>
        </div>
      </div>
    </div>
  );
};

// ── MEASURE CARD ─────────────────────────────────────────────────────────────
// Lighter card for measure view: measure name + description + parent project link
const MeasureCard = ({ measureName, measureDescription, cs, onClick, onAddToBrief, inBrief, highlighted }) => {
  const sc = SECTOR_COLOR[cs.sector] || SECTOR_COLOR.Multiple;
  return (
    <div
      onClick={() => onClick(cs)}
      className="hive-card"
      style={{
        borderRadius:16, border:"1px solid", cursor:"pointer",
        padding:20, display:"flex", flexDirection:"column", gap:0,
        fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
        outline: highlighted ? "2px solid var(--accent)" : "none",
        outlineOffset: highlighted ? 2 : 0,
      }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"2px 8px", borderRadius:4, border:"1px solid", ...sc }}>{cs.sector}</span>
        <span style={{ fontSize:10, fontWeight:500, color:"var(--text-muted)", background:"var(--surface-alt)", padding:"2px 8px", borderRadius:4 }}>Measure</span>
      </div>

      <h3 style={{ fontSize:15, fontWeight:600, lineHeight:1.35, margin:"0 0 6px", color:"var(--text-primary)" }}>{measureName}</h3>

      <p style={{ fontSize:12, color:"var(--text-muted)", margin:"0 0 8px", fontWeight:500 }}>
        Part of: {cs.title}
      </p>

      {measureDescription && (
        <p className="line-clamp-2" style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.65, margin:"0 0 12px", flex:1 }}>{measureDescription}</p>
      )}

      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
        {cs.hazards.cause.slice(0,2).map(h => <HazardBadge key={h} hazard={h} type="cause"/>)}
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid var(--border)" }}>
        <TransferabilityBadge level={cs.transferability}/>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <button
            onClick={e => { e.stopPropagation(); onAddToBrief(cs); }}
            style={{ fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:9999, border:"1.5px solid", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
              background: inBrief ? "var(--accent)" : "transparent",
              color: inBrief ? "#fff" : "var(--text-secondary)",
              borderColor: inBrief ? "var(--accent)" : "var(--border)",
            }}>
            {inBrief ? "✓ In brief" : "+ Brief"}
          </button>
          <span style={{ fontSize:11, fontWeight:600, color:"var(--accent)" }}>
            View case →
          </span>
        </div>
      </div>
    </div>
  );
};

// ── CASE STUDY DETAIL MODAL ──────────────────────────────────────────────────
// Same component as handbook, consistent behaviour
const CaseDetail = ({ cs, onClose, onAddToBrief, inBrief }) => (
  <div
    style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(8px)" }}
    onClick={onClose}>
    <div
      className="hive-modal"
      style={{ borderRadius:24, boxShadow:"0 20px 60px rgba(0,0,0,0.3)", maxWidth:672, width:"100%", maxHeight:"90vh", overflowY:"auto", fontFamily:"'DM Sans',sans-serif" }}
      onClick={e => e.stopPropagation()}>
      {/* Sticky header */}
      <div className="hive-modal" style={{ position:"sticky", top:0, borderBottom:"1px solid var(--border)", padding:"16px 24px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", borderRadius:"24px 24px 0 0" }}>
        <div style={{ flex:1, paddingRight:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--accent)" }}>{cs.sector}</span>
            <span style={{ color:"var(--text-muted)" }}>·</span>
            <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{cs.location}</span>
            <span style={{ color:"var(--text-muted)" }}>·</span>
            <span style={{ fontSize:11, color:"var(--text-muted)" }}>{cs.year}</span>
          </div>
          <h2 style={{ fontSize:20, fontWeight:400, lineHeight:1.3, color:"var(--text-primary)", fontFamily:"'DM Serif Display',serif", margin:0 }}>{cs.title}</h2>
          <p style={{ fontSize:13, fontWeight:600, color:"var(--accent)", marginTop:4 }}>{cs.hook}</p>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", background:"var(--surface-alt)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:4 }}>
          <svg style={{ width:14, height:14, color:"var(--text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding:24, display:"flex", flexDirection:"column", gap:16 }}>
        {/* Key insight */}
        <div style={{ background:"var(--accent-bg)", border:"1px solid var(--accent)", borderRadius:16, padding:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <svg style={{ width:16, height:16, color:"var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--accent-text)" }}>Key insight</span>
          </div>
          <p style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", lineHeight:1.6, margin:0 }}>{cs.insight}</p>
        </div>

        {/* Summary */}
        <div style={{ background:"var(--surface-alt)", borderRadius:16, padding:16 }}>
          <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.65, margin:0 }}>{cs.summary}</p>
        </div>

        {/* Hazards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div>
            <h4 style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:8 }}>Climate drivers</h4>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{cs.hazards.cause.map(h => <HazardBadge key={h} hazard={h} type="cause"/>)}</div>
          </div>
          <div>
            <h4 style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:8 }}>Impacts</h4>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{cs.hazards.effect.map(h => <HazardBadge key={h} hazard={h} type="effect"/>)}</div>
          </div>
        </div>

        {/* Measures */}
        <div>
          <h4 style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:8 }}>Adaptation measures</h4>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:6 }}>
            {cs.measures.map(m => (
              <li key={m} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"var(--text-secondary)" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", flexShrink:0, marginTop:5, display:"inline-block" }}/>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Cost + period */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:"var(--surface-alt)", borderRadius:12, padding:12, border:"1px solid var(--border)" }}>
            <h4 style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:4 }}>Investment</h4>
            <p style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", margin:0 }}>{cs.cost}</p>
            <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>Band: {cs.costBand}</p>
          </div>
          <div style={{ background:"var(--surface-alt)", borderRadius:12, padding:12, border:"1px solid var(--border)" }}>
            <h4 style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:4 }}>Delivery period</h4>
            <p style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", margin:0 }}>{cs.year}</p>
          </div>
        </div>

        {/* UK applicability */}
        <div style={{ border:"1px solid var(--border)", borderRadius:12, padding:16, background:"var(--accent-bg)" }}>
          <div style={{ marginBottom:8 }}><TransferabilityBadge level={cs.transferability}/></div>
          <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.65, marginBottom:12 }}>{cs.transferabilityNote}</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {cs.ukApplicability.map(a => (
              <span key={a} style={{ fontSize:11, fontWeight:600, background:"var(--surface)", border:"1px solid var(--border)", color:"var(--accent-text)", borderRadius:9999, padding:"2px 10px" }}>{a}</span>
            ))}
          </div>
        </div>

        <p style={{ fontSize:11, color:"var(--text-muted)", paddingTop:4, borderTop:"1px solid var(--border)" }}>
          Ref: {cs.id} · {cs.organisation} · Curated &amp; verified by HIVE
        </p>

        {/* Add to brief CTA */}
        <button
          onClick={() => { onAddToBrief(cs); onClose(); }}
          style={{ width:"100%", padding:"12px 0", borderRadius:16, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
            background: inBrief ? "var(--surface-alt)" : "var(--accent)",
            color: inBrief ? "var(--text-muted)" : "#fff",
          }}>
          {inBrief ? "✓ Already in your AI brief" : "＋ Add to AI brief"}
        </button>
      </div>
    </div>
  </div>
);

// ── CHAT: uses shared ChatPanel via layout (no local panel needed) ──


// ── BRIEF TRAY ───────────────────────────────────────────────────────────────
function BriefTray({ brief, onRemove, onGenerate }) {
  const [open, setOpen] = useState(false);
  if (brief.length === 0) return null;
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:45, background:"var(--surface)", borderTop:"2px solid var(--accent)", boxShadow:"0 -4px 24px rgba(0,0,0,0.12)", fontFamily:"'DM Sans',sans-serif", transition:"height 0.25s" }}>
      <div style={{ maxWidth:1152, margin:"0 auto", padding:"0 24px" }}>
        {/* Collapsed bar */}
        <div style={{ height:52, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }} onClick={() => setOpen(o => !o)}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:22, height:22, borderRadius:5, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>AI Brief</span>
            <span style={{ fontSize:12, fontWeight:700, background:"var(--accent)", color:"#fff", borderRadius:9999, padding:"1px 9px", minWidth:22, textAlign:"center" }}>{brief.length}</span>
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>{brief.length === 1 ? "case study selected" : "case studies selected"}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={e => { e.stopPropagation(); onGenerate(); }} style={{ padding:"8px 18px", background:"var(--accent)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Generate brief →
            </button>
            <span style={{ fontSize:18, color:"var(--text-muted)", lineHeight:1, transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>⌃</span>
          </div>
        </div>

        {/* Expanded cases */}
        {open && (
          <div style={{ paddingBottom:16, display:"flex", gap:8, flexWrap:"wrap", borderTop:"1px solid var(--border)" }}>
            {brief.map(cs => (
              <div key={cs.id} style={{ display:"flex", alignItems:"center", gap:6, background:"var(--surface-alt)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 10px", fontSize:12 }}>
                <span style={{ fontWeight:600, color:"var(--text-primary)" }}>{cs.title}</span>
                <span style={{ fontSize:10, color:"var(--text-muted)" }}>· {cs.sector}</span>
                <button onClick={() => onRemove(cs)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:14, lineHeight:1, padding:"0 2px", marginLeft:2 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FILTER PILL ───────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize:11, fontWeight:600, padding:"5px 13px", borderRadius:9999, border:"1.5px solid", cursor:"pointer",
      fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", whiteSpace:"nowrap",
      background: active ? "var(--accent)" : "var(--surface)",
      color: active ? "#fff" : "var(--text-secondary)",
      borderColor: active ? "var(--accent)" : "var(--border)",
    }}>
      {active && <span style={{ marginRight:3, opacity:0.8 }}>✓</span>}
      {label}
    </button>
  );
}

// ── SUGGEST SOURCE DRAWER ────────────────────────────────────────────────────
function SuggestSourceDrawer({ open, onClose }) {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      new URL(url);
    } catch {
      setStatus("error");
      setErrorMsg("Please enter a valid URL (e.g. https://example.com/report).");
      return;
    }
    try {
      const res = await fetch("/api/hive/suggest-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, user_note: note || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed.");
      }
      setStatus("success");
      setUrl("");
      setNote("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleClose = () => { setStatus("idle"); setErrorMsg(""); onClose(); };

  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:60, display:"flex", justifyContent:"flex-end", background:"rgba(0,0,0,0.35)", backdropFilter:"blur(4px)" }} onClick={handleClose}>
      <div
        style={{ width:420, maxWidth:"90vw", height:"100%", background:"var(--surface)", borderLeft:"1px solid var(--border)", boxShadow:"-8px 0 32px rgba(0,0,0,0.15)", animation:"slideRight 0.25s ease", display:"flex", flexDirection:"column", fontFamily:"'DM Sans',sans-serif" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>Suggest a source</h2>
          <button onClick={handleClose} style={{ width:28, height:28, borderRadius:"50%", background:"var(--surface-alt)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg style={{ width:12, height:12, color:"var(--text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex:1, padding:24, overflowY:"auto" }}>
          {status === "success" ? (
            <div style={{ textAlign:"center", padding:"40px 16px" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:"#d1fae5", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg style={{ width:24, height:24, color:"#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
              <p style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", margin:"0 0 8px" }}>Thanks!</p>
              <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>We'll review this source and add it if suitable.</p>
              <button onClick={handleClose} style={{ marginTop:20, padding:"8px 20px", fontSize:12, fontWeight:600, borderRadius:8, border:"1px solid var(--border)", background:"var(--surface-alt)", color:"var(--text-primary)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <p style={{ fontSize:13, color:"var(--text-secondary)", margin:0, lineHeight:1.6 }}>
                Know a report, case study, or dataset we should consider? Drop the link below and we'll review it.
              </p>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-muted)", marginBottom:6 }}>URL *</label>
                <input
                  type="url" required value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/report.pdf"
                  style={{ width:"100%", padding:"10px 12px", fontSize:13, border:"1.5px solid var(--input-border)", borderRadius:9, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"var(--text-primary)", background:"var(--input-bg)" }}
                  onFocus={e => e.target.style.borderColor="var(--accent)"} onBlur={e => e.target.style.borderColor="var(--input-border)"}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-muted)", marginBottom:6 }}>Your note</label>
                <textarea
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Why do you think this is relevant?"
                  rows={3}
                  style={{ width:"100%", padding:"10px 12px", fontSize:13, border:"1.5px solid var(--input-border)", borderRadius:9, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"var(--text-primary)", background:"var(--input-bg)", resize:"vertical" }}
                  onFocus={e => e.target.style.borderColor="var(--accent)"} onBlur={e => e.target.style.borderColor="var(--input-border)"}
                />
              </div>

              {status === "error" && errorMsg && (
                <div style={{ padding:"10px 14px", borderRadius:8, background:"#fef2f2", border:"1px solid #fecaca", fontSize:12, color:"#b91c1c", lineHeight:1.5 }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{ padding:"10px 0", fontSize:13, fontWeight:700, borderRadius:10, border:"none", cursor: status === "loading" ? "wait" : "pointer", fontFamily:"'DM Sans',sans-serif", background:"var(--accent)", color:"#fff", opacity: status === "loading" ? 0.7 : 1, transition:"opacity 0.15s" }}>
                {status === "loading" ? "Submitting…" : "Submit suggestion"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE (uses useSearchParams — must be inside Suspense) ─────────────────
function CasesPageContent() {
  const { themeKey, setThemeKey } = useChatContext();
  const T = THEMES[themeKey] ?? THEMES.light;

  // Filters
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [sectors, setSectors] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [transferability, setTransferability] = useState([]);
  const [costBands, setCostBands] = useState([]);
  const [sort, setSort] = useState("relevance");

  // Initialise filters from URL (e.g. from handbook "Browse all X cases →")
  useEffect(() => {
    const q = searchParams.get("q");
    const sector = searchParams.get("sector");
    const hazard = searchParams.get("hazard");
    const region = searchParams.get("region");
    const cost = searchParams.get("cost");
    if (q) setQuery(q);
    if (sector) setSectors(sector.split(",").map((s) => s.trim()).filter(Boolean));
    if (hazard) setHazards(hazard.split(",").map((h) => h.trim()).filter(Boolean));
    if (region) setTransferability([]); // region not in filter bar; leave transferability empty
    if (cost) setCostBands(cost.split(",").map((c) => c.trim()).filter(Boolean));
  }, [searchParams]);

  // View mode toggle: case studies (default) vs individual measures
  const [viewMode, setViewMode] = useState<'cases' | 'measures'>('cases');

  // UI state
  const [highlighted, setHighlighted] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [brief, setBrief] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const toggle = (setter, val) => setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  const toggleBrief = (cs) => setBrief(prev => prev.some(x => x.id === cs.id) ? prev.filter(x => x.id !== cs.id) : [...prev, cs]);
  const hasFilters = query.trim() || sectors.length || hazards.length || transferability.length || costBands.length;

  const results = filterAndSort(CASE_STUDIES_NORMALISED, { query, sectors, hazards, transferability, costBands, sort });

  // In measure mode, expand each article into one card per measure
  const displayItems = useMemo(() => {
    if (viewMode === 'cases') {
      return results.map(a => ({
        type: 'case' as const,
        key: a.id,
        article: a,
        measureName: null as string | null,
        measureDescription: null as string | null,
      }));
    }
    return results.flatMap(a => {
      const measuresData = TRIB_MEASURES.find(m => m.trib_article_id === a.id);
      if (!measuresData?.measures?.length) {
        const fallbackName = Array.isArray(a.measures) && a.measures.length > 0
          ? a.measures.join(", ")
          : a.title;
        return [{ type: 'measure' as const, key: `${a.id}_0`, article: a, measureName: fallbackName, measureDescription: a.summary }];
      }
      return measuresData.measures.map((m, mi) => ({
        type: 'measure' as const,
        key: `${a.id}_${mi}`,
        article: a,
        measureName: m.name,
        measureDescription: m.description,
      }));
    });
  }, [results, viewMode]);

  const clearAll = () => { setQuery(""); setSectors([]); setHazards([]); setTransferability([]); setCostBands([]); setSort("relevance"); };

  const handleGenerate = () => {
    sessionStorage?.setItem('hiveBriefCases', JSON.stringify(brief.map(c => c.id)));
    sessionStorage?.setItem('hiveBriefTheme', themeKey);
    window.location.href = '/handbook/brief?tutorial=false';
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap"/>
      <style>{`
        * { box-sizing: border-box; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        @keyframes slideRight { from { transform:translateX(100%); } to { transform:translateX(0); } }
        .card-enter { animation: fadeUp 0.3s ease forwards; }

        .hive-root {
          --bg: ${T.bg};
          --surface: ${T.surface};
          --surface-alt: ${T.surfaceAlt};
          --border: ${T.border};
          --border-strong: ${T.borderStrong};
          --text-primary: ${T.textPrimary};
          --text-secondary: ${T.textSecondary};
          --text-muted: ${T.textMuted};
          --accent: ${T.accent};
          --accent-bg: ${T.accentBg};
          --accent-text: ${T.accentText};
          --nav-bg: ${T.navBg};
          --input-bg: ${T.inputBg};
          --input-border: ${T.inputBorder};
          --section-bg: ${T.sectionBg};
        }
        .hive-card {
          background: var(--surface) !important;
          border-color: var(--border) !important;
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
        }
        .hive-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .hive-modal { background: var(--surface) !important; color: var(--text-primary) !important; }
      `}</style>

      <div className="hive-root" style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"'DM Sans',sans-serif", paddingBottom: brief.length > 0 ? 70 : 0 }}>
        {/* Main content — layout provides single HandbookNav (HIVE → /handbook, Case Studies → /handbook/cases) */}
        <div style={{ maxWidth:1152, margin:"0 auto", padding:"28px 24px 40px",
          transition:"padding-right 0.25s" }}>

          {/* Page header */}
          <div style={{ marginBottom:24, display:"flex", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div style={{ flex:1 }}>
              <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, fontWeight:400, color:"var(--text-primary)", margin:"0 0 8px", lineHeight:1.2 }}>
                {viewMode === 'cases' ? 'Case Study Library' : 'Adaptation Measures'}
              </h1>
              <p style={{ fontSize:14, color:"var(--text-secondary)", margin:0 }}>
                {viewMode === 'cases'
                  ? `${CASE_STUDIES_NORMALISED.length} curated, verified case studies on climate adaptation in transport infrastructure. Filter by sector, hazard, or UK transferability — then build an AI brief from your selection.`
                  : `${TOTAL_MEASURE_COUNT} individual adaptation measures across ${CASE_STUDIES_NORMALISED.length} case studies. Each measure links to its full case study.`
                }
              </p>
            </div>
            <span style={{ fontSize:12, fontWeight:600, background:"var(--accent-bg)", color:"var(--accent-text)", padding:"4px 10px", borderRadius:6, border:"1px solid var(--border)" }}>
              {displayItems.length}{viewMode === 'cases' ? ` of ${CASE_STUDIES_NORMALISED.length}` : ` measures`}
            </span>
          </div>

          {/* View mode toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:16, borderRadius:9, padding:2, border:"1px solid var(--border)", background:"var(--surface-alt)", width:"fit-content" }}>
            <button
              onClick={() => setViewMode('cases')}
              style={{ fontSize:12, fontWeight:600, padding:"7px 16px", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
                background: viewMode === 'cases' ? "var(--accent)" : "transparent",
                color: viewMode === 'cases' ? "#fff" : "var(--text-secondary)",
              }}>
              Case Studies ({results.length})
            </button>
            <button
              onClick={() => setViewMode('measures')}
              style={{ fontSize:12, fontWeight:600, padding:"7px 16px", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
                background: viewMode === 'measures' ? "var(--accent)" : "transparent",
                color: viewMode === 'measures' ? "#fff" : "var(--text-secondary)",
              }}>
              Measures ({viewMode === 'measures' ? displayItems.length : TOTAL_MEASURE_COUNT})
            </button>
          </div>

          {/* FILTER BAR */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px", marginBottom:24 }}>
            {/* Search row */}
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <div style={{ flex:1, position:"relative" }}>
                <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:16, height:16, color:"var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search by hazard, measure, location, or keyword…"
                  style={{ width:"100%", padding:"10px 12px 10px 38px", fontSize:13, border:"1.5px solid var(--input-border)", borderRadius:9, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"var(--text-primary)", background:"var(--input-bg)" }}
                  onFocus={e => e.target.style.borderColor="var(--accent)"} onBlur={e => e.target.style.borderColor="var(--input-border)"}
                />
              </div>
              {hasFilters && (
                <button onClick={clearAll} style={{ padding:"0 14px", fontSize:12, fontWeight:600, color:"var(--text-secondary)", background:"none", border:"1px solid var(--border)", borderRadius:9, cursor:"pointer" }}>
                  Clear all
                </button>
              )}
              {/* Sort */}
              <div style={{ display:"flex", alignItems:"center", gap:4, borderRadius:9, padding:2, border:"1px solid var(--border)", background:"var(--surface-alt)" }}>
                {SORT_OPTIONS.map(o => (
                  <button key={o.id} onClick={() => setSort(o.id)}
                    style={{ fontSize:11, fontWeight:600, padding:"6px 10px", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap",
                      background: sort === o.id ? "var(--accent)" : "transparent",
                      color: sort === o.id ? "#fff" : "var(--text-secondary)",
                    }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector pills */}
            <div style={{ marginBottom:10 }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginRight:10 }}>Sector</span>
              <div style={{ display:"inline-flex", gap:6, flexWrap:"wrap" }}>
                {SECTORS.map(s => <FilterPill key={s} label={s} active={sectors.includes(s)} onClick={() => toggle(setSectors, s)}/>)}
              </div>
            </div>

            {/* Hazard pills */}
            <div style={{ marginBottom:10 }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginRight:10 }}>Hazard</span>
              <div style={{ display:"inline-flex", gap:6, flexWrap:"wrap" }}>
                {HAZARDS.map(h => <FilterPill key={h} label={h} active={hazards.includes(h)} onClick={() => toggle(setHazards, h)}/>)}
              </div>
            </div>

            {/* Transferability + cost in one row */}
            <div style={{ display:"flex", gap:24, flexWrap:"wrap", alignItems:"center" }}>
              <div>
                <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginRight:10 }}>UK fit</span>
                <div style={{ display:"inline-flex", gap:6 }}>
                  {TRANSFERABILITY.map(t => <FilterPill key={t} label={t} active={transferability.includes(t)} onClick={() => toggle(setTransferability, t)}/>)}
                </div>
              </div>
              <div>
                <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginRight:10 }}>Cost</span>
                <div style={{ display:"inline-flex", gap:6, flexWrap:"wrap" }}>
                  {COST_BANDS.map(c => <FilterPill key={c} label={c} active={costBands.includes(c)} onClick={() => toggle(setCostBands, c)}/>)}
                </div>
              </div>
              <div style={{ marginLeft:"auto" }}>
                <button onClick={() => setSuggestOpen(true)} style={{ fontSize:11, fontWeight:600, padding:"5px 13px", borderRadius:9999, border:"1.5px dashed var(--border)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", background:"transparent", color:"var(--text-muted)", transition:"all 0.15s", whiteSpace:"nowrap" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-muted)"; }}>
                  + Suggest a source
                </button>
              </div>
            </div>
          </div>

          {/* Result count + empty state */}
          {hasFilters && (
            <div style={{ marginBottom:16, fontSize:13, color:"var(--text-secondary)" }}>
              {results.length === 0
                ? <span>No cases match your filters. <button onClick={clearAll} style={{ background:"none", border:"none", color:"var(--accent)", cursor:"pointer", fontWeight:600, fontSize:13 }}>Clear filters</button></span>
                : viewMode === 'cases'
                  ? <span><strong style={{ color:"var(--text-primary)" }}>{results.length}</strong> case {results.length === 1 ? "study" : "studies"} match your filters</span>
                  : <span><strong style={{ color:"var(--text-primary)" }}>{displayItems.length}</strong> {displayItems.length === 1 ? "measure" : "measures"} across <strong>{results.length}</strong> case {results.length === 1 ? "study" : "studies"}</span>
              }
            </div>
          )}

          {/* CARD GRID */}
          {displayItems.length > 0 ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:16 }}>
              {displayItems.map((item, i) => (
                <div key={item.key} className="card-enter" style={{ animationDelay:`${Math.min(i, 20) * 40}ms` }}>
                  {item.type === 'case' ? (
                    <CaseCard
                      cs={item.article}
                      onClick={setSelectedCase}
                      onAddToBrief={toggleBrief}
                      inBrief={brief.some(b => b.id === item.article.id)}
                      highlighted={highlighted.includes(item.article.id)}
                    />
                  ) : (
                    <MeasureCard
                      measureName={item.measureName}
                      measureDescription={item.measureDescription}
                      cs={item.article}
                      onClick={setSelectedCase}
                      onAddToBrief={toggleBrief}
                      inBrief={brief.some(b => b.id === item.article.id)}
                      highlighted={highlighted.includes(item.article.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : !hasFilters ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-muted)" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📂</div>
              <p style={{ fontSize:14 }}>No case studies loaded yet.</p>
            </div>
          ) : null}

          {/* Attribution */}
          <div style={{ marginTop:40, paddingTop:20, borderTop:"1px solid var(--border)", fontSize:11, color:"var(--text-muted)" }}>
            HIVE · Transport Climate Adaptation Intelligence · Connected Places Catapult · Case studies curated and verified by the HIVE editorial team.
          </div>
        </div>

        {/* Chat handled by shared ChatPanel in HandbookLayoutClient */}

        {/* CASE DETAIL MODAL */}
        {selectedCase && (
          <CaseDetail
            cs={selectedCase}
            onClose={() => setSelectedCase(null)}
            onAddToBrief={toggleBrief}
            inBrief={brief.some(b => b.id === selectedCase.id)}
          />
        )}

        {/* BRIEF TRAY */}
        <BriefTray brief={brief} onRemove={toggleBrief} onGenerate={handleGenerate}/>

        {/* SUGGEST SOURCE DRAWER */}
        <SuggestSourceDrawer open={suggestOpen} onClose={() => setSuggestOpen(false)}/>
      </div>
    </>
  );
}

// Wrap in Suspense so useSearchParams() is allowed during static generation (Next.js 15)
function CasesPageFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", color: "#6b7280" }}>
      Loading…
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense fallback={<CasesPageFallback />}>
      <CasesPageContent />
    </Suspense>
  );
}