"use client"
import { useState, useEffect, useRef } from "react";
import { CASE_STUDIES } from "@/lib/hive/seed-data";

const T = {
  bg:"#f8f7f4", surface:"#ffffff", surfaceAlt:"#f3f1ec",
  border:"#e4e0d8", text:"#1a1814", textSec:"#5a5650", textMuted:"#9a948a",
  accent:"#1d70b8", accentLight:"#e8f1fb", accentMid:"#b3d4ef",
  green:"#006853", greenLight:"#e6f4f1", greenMid:"#a7d8d0",
  amber:"#b45309", amberLight:"#fef3c7",
  navBg:"rgba(248,247,244,0.97)",
};

const FONT = `
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#e4e0d8;border-radius:2px}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes slideUp{from{transform:translateY(6px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes dotBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
  @keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}
  .appear{animation:fadeUp 0.32s ease forwards}
  .msg{animation:slideUp 0.2s ease forwards}
  .sec-btn{background:none;border:none;cursor:pointer;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:500;text-align:left;width:100%;transition:all 0.15s;color:#5a5650}
  .sec-btn:hover{background:#f3f1ec}
  .sec-btn.active{background:#e8f1fb;color:#1d70b8;font-weight:700}
  .loading-bar{height:3px;border-radius:2px;background:linear-gradient(90deg,#e8f1fb 25%,#1d70b8 50%,#e8f1fb 75%);background-size:400px 100%;animation:shimmer 1.4s infinite}
`;

const CASES = [
  {id:"ID_40",title:"Sheffield Grey to Green",org:"Sheffield City Council",sector:"Highways",location:"Sheffield, UK",year:"2014–ongoing",cost:"£3.6m + £6.3m",transfer:"High",hazards:["Flooding – fluvial","Heavy rainfall"],hook:"87% discharge reduction · 561% biodiversity uplift"},
  {id:"ID_19",title:"Phoenix Cool Pavement",org:"City of Phoenix",sector:"Highways",location:"Phoenix, USA",year:"2021–ongoing",cost:"£2.33m pilot",transfer:"Medium",hazards:["High temperatures","Urban heat island"],hook:"100+ miles treated · 6°C surface reduction"},
  {id:"ID_32",title:"Heathrow Balancing Ponds",org:"Heathrow Airport Ltd",sector:"Aviation",location:"London, UK",year:"2016–2022",cost:"£2.1m (retaining walls)",transfer:"High",hazards:["Heavy rainfall","Drought"],hook:"Dual flood + drought resilience · Wildlife Trust award"},
];

const SECTIONS=[
  {id:"summary",label:"Executive Summary"},
  {id:"hazards",label:"Climate Drivers"},
  {id:"approaches",label:"Adaptation Approaches"},
  {id:"costs",label:"Cost Intelligence"},
  {id:"applicability",label:"UK Applicability"},
  {id:"insight",label:"Key Insight"},
  {id:"sources",label:"Source References"},
];

const CASE_ACCENTS: Record<string, { base: string; light: string; mid: string; text: string }> = {
  ID_40:{base:"#166534",light:"#dcfce7",mid:"#86efac",text:"#14532d"},
  ID_19:{base:"#9a3412",light:"#ffedd5",mid:"#fdba74",text:"#7c2d12"},
  ID_32:{base:"#1e40af",light:"#dbeafe",mid:"#93c5fd",text:"#1e3a8a"},
};

function normaliseCaseForBrief(cs: { id: string; title: string; organisation?: string; org?: string; sector?: string; location?: string; year?: string; cost?: string; transferability?: string; transfer?: string; hazards?: { cause?: string[]; effect?: string[] } | string[]; hook?: string }) {
  const cause = cs.hazards && !Array.isArray(cs.hazards) ? (cs.hazards.cause ?? []) : [];
  const effect = cs.hazards && !Array.isArray(cs.hazards) ? (cs.hazards.effect ?? []) : [];
  const hazardList = Array.isArray(cs.hazards) ? cs.hazards : [...cause, ...effect];
  return {
    id: cs.id,
    title: cs.title,
    org: (cs as { organisation?: string }).organisation ?? (cs as { org?: string }).org ?? "",
    sector: cs.sector ?? "",
    location: cs.location ?? "",
    year: cs.year ?? "",
    cost: cs.cost ?? "",
    transfer: (cs as { transferability?: string }).transferability ?? (cs as { transfer?: string }).transfer ?? "Medium",
    hazards: hazardList,
    hook: cs.hook ?? "",
  };
}

function searchCases(query: string, excludeIds: string[] = []) {
  const q = query.toLowerCase();
  return CASE_STUDIES
    .filter(cs => !excludeIds.includes(cs.id))
    .filter(cs => {
      const hazardList = [...(cs.hazards?.cause ?? []), ...(cs.hazards?.effect ?? [])];
      return (
        cs.title.toLowerCase().includes(q) ||
        (cs.sector?.toLowerCase().includes(q)) ||
        hazardList.some(h => h.toLowerCase().includes(q)) ||
        cs.hook?.toLowerCase().includes(q)
      );
    })
    .map(cs => normaliseCaseForBrief(cs))
    .slice(0, 6);
}

const REFRAMES: Record<string, string> = {
  rail: "Across these cases, drainage resilience integrated into planned track and station maintenance delivers measurably better outcomes than emergency reactive spend. Two of three cases are directly applicable to UK rail corridors.",
  dft: "Evidence from three international cases supports the case for embedding climate adaptation in asset management frameworks. Nature-based solutions consistently outperform single-hazard engineered responses on both cost and co-benefit delivery.",
  sme: "These cases show that climate adaptation doesn't always mean large capital investment. Two of three cases delivered within existing maintenance budgets — the key is timing adaptation with planned renewal, not treating it as a separate programme.",
};

const REGENERATED: Record<string, string> = {
  summary: "All three cases demonstrate that the highest-confidence adaptation outcomes occur when measures address multiple hazards simultaneously. Dual-function infrastructure — managing both flood and drought — consistently outperforms single-hazard solutions on long-term value.",
  insight: "The strongest signal across this evidence base is not the adaptation measure itself, but the delivery mechanism: embedding climate resilience within planned asset renewal cycles reduces both cost and disruption while generating co-benefits that exceed the original design intent.",
};

function detectIntent(message: string): "interrogate" | "search" | "reframe" | "generate" {
  const m = message.toLowerCase();
  if (m.includes("missing") || m.includes("gap") || m.includes("confidence") || m.includes("what else")) return "interrogate";
  if (m.includes("find") || m.includes("search") || m.includes("more cases") || m.includes("add")) return "search";
  if (m.includes("reframe") || m.includes("audience") || m.includes("rail") || m.includes("dft") || m.includes("sme") || m.includes("for a")) return "reframe";
  if (m.includes("generate") || m.includes("regenerate") || m.includes("write") || m.includes("update") || m.includes("redo")) return "generate";
  return "interrogate";
}

function detectAudience(message: string): string | null {
  const m = message.toLowerCase();
  if (m.includes("rail") || m.includes("network rail") || m.includes("gbr")) return "rail";
  if (m.includes("dft") || m.includes("department") || m.includes("policy")) return "dft";
  if (m.includes("sme") || m.includes("small") || m.includes("friendly") || m.includes("plain")) return "sme";
  return null;
}

// BRIEF-SPECIFIC AI TURNS
const BRIEF_AI_TURNS=[
  {text:"Looking across these 3 cases, the main gap I can see is climate hazard diversity — you have strong flooding and heat evidence but nothing on coastal erosion, sea level rise, or wind damage. If your brief is for a coastal or port context, I'd recommend adding ID_15 (Rotterdam Climate Dock) or ID_07 (Deutsche Bahn slope stability) to broaden the hazard range.",chips:["ID_15","ID_07"],gap:null,actions:[{label:"Add Rotterdam to brief",primary:true},{label:"Keep brief focused on flooding"}]},
  {text:"To reframe this for a rail audience, the key shift is from 'urban flood management' to 'drainage resilience on rail corridors'. Sheffield Grey to Green is directly applicable — it was built alongside a tram and rail network. I'd recommend leading with the drainage failure risk narrative rather than biodiversity co-benefits.",chips:["ID_40"],gap:null,actions:[{label:"Regenerate summary for rail",primary:true},{label:"Show me the original"}]},
  {text:"The confidence profile of this brief is: Executive Summary — High (3/3 cases support). Cost Intelligence — Partial (costs are indicative, not inflation-adjusted). UK Applicability — High for ID_40 and ID_32, Medium for ID_19. The Key Insight claim about co-benefits is High confidence — all three cases explicitly document unexpected biodiversity or community outcomes.",chips:["ID_40","ID_32","ID_19"],gap:"Phoenix data is USD 2021 — sterling equivalent is approximate.",actions:[{label:"Export with confidence ratings"},{label:"What would make this High throughout?",primary:true}]},
];


// ── TUTORIAL ANNOTATIONS ──────────────────────────────────────────────────────
// Shown when page loads without real cases (default/direct-navigation state).
// Each section has a short "what this is" note and a "why it matters" note.
const SECTION_ANNOTATIONS = {
  summary: {
    what: "The executive summary synthesises the strongest cross-case finding — the claim all your evidence agrees on.",
    why: "DfT reviewers read this first. It should hold up even if they read nothing else.",
    confidence: "Confidence badge shows how many of your cases directly support this claim."
  },
  hazards: {
    what: "Climate drivers are the physical hazards your cases respond to. Impacts are the downstream consequences they manage.",
    why: "Separating cause from effect helps you match your brief to a specific risk profile.",
    confidence: "Coverage gaps here signal which hazard types you may need more cases for."
  },
  approaches: {
    what: "Each row is an adaptation measure seen across your cases, with how often it appears and what pattern it suggests.",
    why: "Frequency tells you what's well-evidenced. Pattern notes tell you under what conditions it works.",
    confidence: "Measures appearing in 2+ cases are stronger claims than single-case observations."
  },
  costs: {
    what: "Cost intelligence aggregates the investment ranges and delivery models from across your cases.",
    why: "This section is often what gets challenged first. Be precise about currency year and what's included.",
    confidence: "Partial confidence is common here — costs are often reported differently across cases."
  },
  applicability: {
    what: "UK applicability scores each case on how transferable its approach is to a UK context.",
    why: "Helps you prioritise which cases to cite when writing for a UK policy or procurement audience.",
    confidence: "High = directly applicable. Medium = applicable with adaptation. Low = context too different."
  },
  insight: {
    what: "The key insight is the most generalisable finding across all your cases — the thing worth quoting.",
    why: "This is the 'so what' of your brief. A strong insight changes how someone thinks, not just what they know.",
    confidence: "Only mark as High if every case in your brief independently supports this claim."
  },
  sources: {
    what: "Source references link every case to its original record in the HIVE knowledge base.",
    why: "Always cite originals in formal documents. AI synthesis is a starting point, not a citation.",
    confidence: null
  },
};

function AnnotationNote({ section, visible }: { section: keyof typeof SECTION_ANNOTATIONS; visible: boolean }) {
  const ann = SECTION_ANNOTATIONS[section];
  if (!ann || !visible) return null;
  return (
    <div style={{
      margin:"10px 0 18px", padding:"14px 16px",
      background:"#f0f7ff", border:"1px solid #b3d4ef",
      borderLeft:"3px solid #1d70b8", borderRadius:"0 8px 8px 0",
      animation:"fadeUp 0.3s ease"
    }}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{width:18,height:18,borderRadius:4,background:"#1d70b8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
          <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:700,color:"#1d70b8",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>How this section works</div>
          <p style={{fontSize:12,color:"#1a1814",lineHeight:1.65,marginBottom:ann.confidence?6:0}}>{ann.what}</p>
          <p style={{fontSize:12,color:"#5a5650",lineHeight:1.65,marginBottom:ann.confidence?6:0}}>
            <strong style={{color:"#1a1814"}}>Why it matters: </strong>{ann.why}
          </p>
          {ann.confidence && (
            <p style={{fontSize:11,color:"#5a5650",lineHeight:1.55,padding:"6px 10px",background:"#fff",borderRadius:5,border:"1px solid #b3d4ef",marginTop:4}}>
              <strong style={{color:"#1d70b8"}}>Confidence: </strong>{ann.confidence}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SHARED CHIPS ──────────────────────────────────────────────────────────────
function SC({ id, activeCase, onClick }: { id: string; activeCase: string | null; onClick?: (id: string) => void }) {
  const a = CASE_ACCENTS[id] || { base: T.accent, light: T.accentLight, mid: T.accentMid, text: T.accent };
  const isActive=activeCase===id, isOther=activeCase&&activeCase!==id;
  return (
    <button onClick={()=>onClick?.(id)} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,cursor:"pointer",border:"none",background:isOther?T.surfaceAlt:isActive?a.base:a.light,color:isOther?T.textMuted:isActive?"#fff":a.text,transition:"all 0.2s",transform:isActive?"scale(1.05)":"scale(1)",opacity:isOther?0.4:1}}>
      {id} ↗
    </button>
  );
}

function Chip({ id }: { id: string }) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,background:T.accentLight,color:T.accent,border:`1px solid ${T.accentMid}`,cursor:"pointer",whiteSpace:"nowrap"}}>{id} ↗</span>;
}

function TypingDots(){
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"10px 14px"}}>
      {[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:T.textMuted,display:"inline-block",animation:`dotBounce 1.2s ease ${i*0.15}s infinite`}}/>)}
      <span style={{fontSize:11,color:T.textMuted,marginLeft:2}}>Thinking…</span>
    </div>
  );
}

function SLabel({children}: { children: React.ReactNode }){
  return <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,marginBottom:10}}>{children}</div>;
}

type BriefCase = { id: string; title: string; org: string; sector: string; location: string; year: string; cost: string; transfer: string; hazards: string[]; hook: string };

function SearchResultCard({ cs, onAdd, alreadyInBrief }: { cs: BriefCase; onAdd: (c: BriefCase) => void; alreadyInBrief: boolean }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", marginTop: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 3 }}>
        {cs.id} · {cs.sector}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>{cs.title}</div>
      <div style={{ fontSize: 11, color: T.textSec, marginBottom: 8 }}>{cs.hook}</div>
      <button
        onClick={() => onAdd(cs)}
        disabled={alreadyInBrief}
        style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 5, border: "none", cursor: alreadyInBrief ? "default" : "pointer", background: alreadyInBrief ? T.surfaceAlt : T.accent, color: alreadyInBrief ? T.textMuted : "#fff" }}>
        {alreadyInBrief ? "✓ Already in brief" : "+ Add to brief"}
      </button>
    </div>
  );
}

// ── BRIEF-CONTEXT CHAT PANEL ──────────────────────────────────────────────────
type ChatMsg = { role: string; text: string; chips?: string[]; gap?: string | null; actions?: { label: string; primary?: boolean }[]; searchResults?: BriefCase[] };

function BriefChatPanel({
  briefCases,
  onAddCase,
  onApplyOverride,
  onClearOverride,
  summaryOverride,
  onSetSummaryOverride,
  isTutorial,
}: {
  briefCases: BriefCase[];
  onAddCase: (c: BriefCase) => void;
  onApplyOverride: (section: string, content: string) => void;
  onClearOverride: (section: string) => void;
  summaryOverride: string | null;
  onSetSummaryOverride: (s: string | null) => void;
  isTutorial: boolean;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "ai", text: "I can help you explore and improve this brief. Try asking what's missing, request a reframe for a specific audience, or check the confidence level of any section." }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const STARTERS = ["What am I missing?", "Check confidence levels", "Reframe for rail", "Regenerate the summary"];

  const send = (text: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setThinking(true);
    const intent = detectIntent(q);
    setTimeout(() => {
      if (intent === "interrogate") {
        const sectors = [...new Set(briefCases.map(c => c.sector))];
        const hazards = [...new Set(briefCases.flatMap(c => c.hazards))];
        const lowTransfer = briefCases.filter(c => c.transfer !== "High");
        const gapText = [
          sectors.length < 2 && "Consider adding cases from other sectors.",
          hazards.length < 2 && "Your hazard coverage is narrow — add cases for other climate drivers.",
          lowTransfer.length > 0 && `${lowTransfer.length} case(s) have Medium/Low UK transferability.`,
        ].filter(Boolean).join(" ") || "Your brief has good coverage across sectors and hazards.";
        setMessages(m => [...m, {
          role: "ai",
          text: `Confidence profile: ${briefCases.length} cases, sectors: ${sectors.join(", ") || "—"}, hazards: ${hazards.slice(0, 4).join(", ") || "—"}. ${gapText}`,
          actions: [{ label: "Find cases for gaps", primary: true }],
        }]);
      } else if (intent === "search") {
        const results = searchCases(q, briefCases.map(c => c.id)).slice(0, 3);
        setMessages(m => [...m, {
          role: "ai",
          text: results.length ? `Found ${results.length} case(s) matching "${q.slice(0, 30)}…":` : `No additional cases found for "${q.slice(0, 30)}…".`,
          searchResults: results,
        }]);
      } else if (intent === "reframe") {
        const audience = detectAudience(q) || "rail";
        const reframeText = REFRAMES[audience] ?? REFRAMES.rail;
        setMessages(m => [...m, {
          role: "ai",
          text: `Here's how the summary reads for a ${audience} audience:\n\n${reframeText}`,
          actions: [
            { label: "Replace summary", primary: true },
            { label: "Keep original" },
          ],
        }]);
      } else if (intent === "generate") {
        const section: keyof typeof REGENERATED | null = q.toLowerCase().includes("insight") ? "insight" : q.toLowerCase().includes("summary") ? "summary" : null;
        if (section && REGENERATED[section]) {
          setMessages(m => [...m, {
            role: "ai",
            text: REGENERATED[section],
            actions: [
              { label: "Apply this version", primary: true },
              { label: "Keep original" },
            ],
          }]);
        } else {
          setMessages(m => [...m, {
            role: "ai",
            text: "Regenerating individual sections other than Summary and Insight isn't available in this demo — try asking HIVE to interrogate that section instead, or export the brief and edit manually.",
          }]);
        }
      } else {
        const r = BRIEF_AI_TURNS[Math.floor(Math.random() * BRIEF_AI_TURNS.length)];
        setMessages(m => [...m, { role: "ai", text: r.text, chips: r.chips, gap: r.gap ?? null, actions: r.actions }]);
      }
      setThinking(false);
    }, 1500);
  };

  const handleAction = (label: string, aiMsg: ChatMsg) => {
    if (label === "Replace summary") {
      const prevUser = messages.filter(m => m.role === "user").pop();
      const audience = (prevUser ? detectAudience(prevUser.text) : null) || "rail";
      onSetSummaryOverride(REFRAMES[audience] ?? null);
      setMessages(m => [...m, { role: "ai", text: "Summary replaced. You can revert with Keep original." }]);
    } else if (label === "Keep original") {
      onSetSummaryOverride(null);
      setMessages(m => [...m, { role: "ai", text: "Reverted to original summary." }]);
    } else if (label === "Apply this version") {
      const section = aiMsg.text === REGENERATED.insight ? "insight" : "summary";
      onApplyOverride(section, aiMsg.text);
      setMessages(m => [...m, { role: "ai", text: `Applied to ${section}.` }]);
    } else {
      send(label);
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
        {messages.map((msg, i) => (
          <div key={i} className="msg" style={{ marginBottom: 14 }}>
            {msg.role === "user" ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: T.accent, color: "#fff", padding: "10px 14px", borderRadius: "12px 12px 3px 12px", fontSize: 13, maxWidth: "85%", lineHeight: 1.5 }}>{msg.text}</div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>HIVE</span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>· Brief context</span>
                </div>
                <div style={{ background: T.surfaceAlt, padding: "12px 14px", borderRadius: "3px 12px 12px 12px", fontSize: 13, lineHeight: 1.7, color: T.text }}>
                  {msg.text.split(/\b(ID_\d+)\b/).map((part, j) => /^ID_\d+$/.test(part) ? <Chip key={j} id={part} /> : part)}
                  {msg.gap && <div style={{ marginTop: 8, padding: "7px 10px", background: T.amberLight, borderRadius: 5, fontSize: 11, color: T.textSec }}><span style={{ fontWeight: 700, color: T.amber }}>Note: </span>{msg.gap}</div>}
                </div>
                {msg.searchResults?.map(cs => (
                  <SearchResultCard key={cs.id} cs={cs} onAdd={onAddCase} alreadyInBrief={briefCases.some(b => b.id === cs.id)} />
                ))}
                {msg.actions && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {msg.actions.map((a, j) => (
                      <button key={j} onClick={() => (a.label === "Replace summary" || a.label === "Keep original" || a.label === "Apply this version") ? handleAction(a.label, msg) : send(a.label)} style={{ padding: "6px 11px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: a.primary ? T.accent : T.surfaceAlt, color: a.primary ? "#fff" : T.textSec }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {thinking && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, cursor: "pointer", padding: "5px 9px", borderRadius: 5, fontSize: 11, color: T.textSec }}>{s}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send("")}
          placeholder="Ask about this brief…"
          style={{ flex: 1, padding: "10px 13px", fontSize: 13, border: `1.5px solid ${T.border}`, borderRadius: 7, outline: "none", fontFamily: "'DM Sans', sans-serif", color: T.text }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = T.accent} onBlur={e => (e.target as HTMLInputElement).style.borderColor = T.border}
        />
        <button onClick={() => send("")} style={{ padding: "0 14px", background: T.accent, color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>→</button>
      </div>
    </div>
  );
}

// ── MAIN BRIEF PAGE ───────────────────────────────────────────────────────────
export default function HIVEBriefWithChat(){
  const [isTutorial, setIsTutorial] = useState(true);
  const [briefCases, setBriefCases] = useState<BriefCase[]>([]);
  const [summaryOverride, setSummaryOverride] = useState<string | null>(null);
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, string>>({});
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("summary");
  const [building, setBuilding] = useState(true);
  const [shown, setShown] = useState(0);
  const [annotationsOpen, setAnnotationsOpen] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [savedTheme, setSavedTheme] = useState("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tutorialParam = params.get("tutorial");
    const tutorial = tutorialParam !== "false";
    const stored = window.sessionStorage.getItem("hiveBriefCases");
    const ids: string[] = stored ? (() => { try { return JSON.parse(stored); } catch { return []; } })() : [];
    const theme = window.sessionStorage.getItem("hiveBriefTheme") || "light";
    setSavedTheme(theme);
    if (!tutorial && ids.length > 0) {
      const resolved = ids.map(id => CASE_STUDIES.find(c => c.id === id)).filter((cs): cs is (typeof CASE_STUDIES)[number] => cs != null);
      setBriefCases(resolved.map(cs => normaliseCaseForBrief(cs)));
      setIsTutorial(false);
    } else {
      setIsTutorial(tutorial);
      if (tutorial) setBriefCases([]);
    }
  }, []);

  useEffect(()=>{
    if(!building)return;
    const t=setInterval(()=>setShown(s=>{if(s>=6){setBuilding(false);clearInterval(t);return s;}return s+1;}),380);
    return()=>clearInterval(t);
  },[building]);

  const applyOverride = (section: string, content: string) => setSectionOverrides(p => ({ ...p, [section]: content }));
  const clearOverride = (section: string) => setSectionOverrides(p => { const n = { ...p }; delete n[section]; return n; });

  const displayCases: BriefCase[] = isTutorial ? CASES as BriefCase[] : briefCases;
  const isEmptyState = !isTutorial && briefCases.length === 0;

  const breadcrumbTitle = (() => {
    if (isTutorial) return "Urban Flooding & Heat Adaptation";
    if (displayCases.length === 0) return "Your brief";
    const firstSector = displayCases[0]?.sector ?? "";
    const firstHazard = displayCases[0]?.hazards?.[0] ?? "";
    if (firstSector && firstHazard) return `${firstSector} · ${firstHazard} · ${displayCases.length} cases`;
    if (firstSector || firstHazard) return `${firstSector || firstHazard} · ${displayCases.length} cases`;
    return `Your brief · ${displayCases.length} cases`;
  })();

  const toggleCase=(id: string)=>setActiveCase(p=>p===id?null:id);
  const scrollTo=(id: string)=>{setActiveSection(id);sectionRefs.current[id]?.scrollIntoView({behavior:"smooth",block:"start"});};
  const toggleAnnotation=(id: string)=>setAnnotationsOpen(p=>({...p,[id]:!p[id]}));
  const isAnnotationVisible=(id: string)=>isTutorial?(annotationsOpen[id]!==false):!!annotationsOpen[id];

  const clearBrief = () => { setBriefCases([]); setIsTutorial(false); };
  const restoreExampleBrief = () => { setBriefCases([...CASES] as BriefCase[]); setIsTutorial(true); };

  const [emptySearchQuery, setEmptySearchQuery] = useState("");
  const emptySearchResults = emptySearchQuery.trim() ? searchCases(emptySearchQuery, briefCases.map(c => c.id)) : [];

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans', sans-serif"}}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap"/>
      <style>{FONT}</style>
      <div style={{height:5,background:T.green}}/>

      {/* Nav */}
      <nav style={{position:"sticky",top:0,zIndex:40,background:T.navBg,borderBottom:`1px solid ${T.border}`,backdropFilter:"blur(12px)"}}>
        {building&&<div className="loading-bar"/>}
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"padding-right 0.25s",paddingRight:chatOpen?"calc(24px + 420px)":"24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <a href={`/handbook?theme=${savedTheme}`} style={{fontSize:12,color:T.textSec,textDecoration:"none",fontWeight:500,display:"flex",alignItems:"center",gap:4}}>← Handbook</a>
            <span style={{color:T.border}}>|</span>
            <div style={{width:24,height:24,borderRadius:5,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064"/></svg>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>HIVE</span>
            <span style={{color:T.border}}>›</span>
            <a href={`/handbook?theme=${savedTheme}`} style={{fontSize:13,color:T.textSec,textDecoration:"none",fontWeight:500}}>Brief</a>
            <span style={{color:T.border}}>›</span>
            <span style={{fontSize:13,fontWeight:600,color:T.text}}>{breadcrumbTitle}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {building?<span style={{fontSize:11,color:T.textMuted,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block",animation:"pulse 1s infinite"}}/> Synthesising…</span>:<span style={{fontSize:11,color:T.green,fontWeight:600}}>✓ Ready</span>}
            {!isTutorial && briefCases.length > 0 && (
              <button onClick={clearBrief} style={{background:"none",border:`1px solid ${T.border}`,cursor:"pointer",padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:600,color:T.textSec}}>Clear brief</button>
            )}
            <button style={{background:"none",border:`1px solid ${T.border}`,cursor:"pointer",padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:600,color:T.textSec}}>↓ PDF</button>
            {/* Chat toggle — key new element on brief page */}
            <button onClick={()=>setChatOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.15s",background:chatOpen?T.accent:T.surface,color:chatOpen?"#fff":T.accent,border:`1.5px solid ${T.accent}`}}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
              {chatOpen?"Close":"Ask about this brief"}
            </button>
          </div>
        </div>
      </nav>

      {/* Tutorial banner — only shown in default/tutorial mode */}
      {isTutorial&&(
        <div style={{background:"#1d70b8",color:"#fff",padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:20,height:20,borderRadius:4,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <span style={{fontSize:12,fontWeight:700}}>Example brief — </span>
              <span style={{fontSize:12,fontWeight:400,opacity:0.9}}>This shows what a completed HIVE brief looks like. Blue annotation panels explain each section. Add cases from the handbook to build your own.</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <a href="/handbook/cases" style={{fontSize:11,fontWeight:700,color:"#fff",padding:"5px 12px",borderRadius:5,border:"1px solid rgba(255,255,255,0.4)",textDecoration:"none",cursor:"pointer",whiteSpace:"nowrap"}}>← Browse case studies</a>
            <span style={{fontSize:11,opacity:0.7,cursor:"pointer",padding:"5px 8px"}} onClick={()=>{}}>✕ Dismiss</span>
          </div>
        </div>
      )}

      {/* Page layout — shifts left when chat opens */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px 80px",display:"grid",gridTemplateColumns:"190px 1fr 200px",gap:"0 32px",transition:"padding-right 0.25s",paddingRight:chatOpen?"calc(24px + 420px)":"24px"}}>

        {/* Left nav */}
        <div style={{position:"sticky",top:72,height:"fit-content"}}>
          <SLabel>Sections</SLabel>
          <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:20}}>
            {SECTIONS.map(s=>(
              <button key={s.id} className={`sec-btn ${activeSection===s.id?"active":""}`} onClick={()=>scrollTo(s.id)}>{s.label}</button>
            ))}
          </div>
          <div style={{padding:"12px",background:T.surfaceAlt,borderRadius:8,border:`1px solid ${T.border}`}}>
            <SLabel>Evidence filter</SLabel>
            <p style={{fontSize:11,color:T.textMuted,lineHeight:1.5}}>Click a case tile to highlight its evidence throughout this report.</p>
            {activeCase&&<button onClick={()=>setActiveCase(null)} style={{marginTop:8,background:"none",border:`1px solid ${T.border}`,cursor:"pointer",padding:"4px 10px",borderRadius:5,fontSize:11,color:T.textSec,width:"100%"}}>Clear highlight</button>}
          </div>
          {isTutorial&&(
            <div style={{marginTop:12,padding:"12px",background:"#f0f7ff",borderRadius:8,border:"1px solid #b3d4ef"}}>
              <SLabel>How to use this brief</SLabel>
              {[
                {icon:"🔵",text:"Click any case chip to highlight that case's evidence throughout the report"},
                {icon:"?",text:"Blue '? how this works' buttons explain each section"},
                {icon:"💬",text:"Use 'Ask about this brief' to interrogate, reframe, or extend"},
                {icon:"📋",text:"Add your own cases from the handbook to replace this example"},
              ].map((tip,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:7,fontSize:11,color:"#1a1814",lineHeight:1.5}}>
                  <span style={{flexShrink:0,marginTop:1}}>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div>
          {isEmptyState ? (
            <>
              <div style={{ paddingBottom: 28, marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, fontWeight: 400, color: T.text, marginBottom: 8 }}>Your brief is empty</h2>
                <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, maxWidth: 560, marginBottom: 20 }}>
                  Search for case studies to add, or restore the example brief to explore the format.
                </p>
                <div style={{ position: "relative", maxWidth: 400, marginBottom: 16 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 16 }}>🔍</span>
                  <input
                    value={emptySearchQuery}
                    onChange={e => setEmptySearchQuery(e.target.value)}
                    placeholder="Search cases..."
                    style={{ width: "100%", padding: "12px 14px 12px 40px", fontSize: 14, border: `1.5px solid ${T.border}`, borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", color: T.text }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                  <button onClick={restoreExampleBrief} style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: T.accent, color: "#fff" }}>Restore example brief</button>
                  <a href="/handbook/cases" style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none", border: `1px solid ${T.border}`, background: T.surface, color: T.textSec }}>← Browse all case studies</a>
                </div>
                {emptySearchResults.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <SLabel>Search results</SLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {emptySearchResults.map(cs => (
                        <SearchResultCard key={cs.id} cs={cs} onAdd={c => { setBriefCases(prev => [...prev, c]); setEmptySearchQuery(""); }} alreadyInBrief={false} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
          {/* Report header */}
          <div style={{paddingBottom:28,marginBottom:28,borderBottom:`2px solid ${T.text}`}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:T.textMuted,marginBottom:10}}>
              Cross-Case Intelligence Brief · HIVE · {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
            </div>
            <h1 style={{fontFamily:"'DM Serif Display', serif",fontSize:30,fontWeight:400,color:T.text,lineHeight:1.2,marginBottom:10}}>
              Urban Flooding & Heat Adaptation<br/><em>in UK Transport Infrastructure</em>
            </h1>
            {isTutorial?(
              <div style={{marginBottom:14}}>
                <p style={{fontSize:13,color:T.textSec,lineHeight:1.6,maxWidth:560,marginBottom:8}}>
                  <strong style={{color:T.text}}>Example brief</strong> — this is what a completed HIVE brief looks like, using 3 real case studies on urban flooding and heat adaptation. Explore it to understand the format, then add your own cases from the handbook.
                </p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <a href="/handbook" style={{fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:5,background:T.accent,color:"#fff",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}>
                    ← Start from the handbook
                  </a>
                  <span style={{fontSize:11,color:T.textMuted,padding:"5px 0",alignSelf:"center"}}>or explore this example below ↓</span>
                </div>
              </div>
            ):(
              <p style={{fontSize:13,color:T.textSec,lineHeight:1.6,maxWidth:560,marginBottom:14}}>
                AI-generated synthesis across {displayCases.length} curated case studies. Click any source chip to highlight that case. Use <strong>Ask about this brief</strong> to interrogate, reframe, or extend this report.
              </p>
            )}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {displayCases.map(c=><SC key={c.id} id={c.id} activeCase={activeCase} onClick={toggleCase}/>)}
            </div>
          </div>

          {/* Case tiles */}
          <div style={{marginBottom:32}}>
            <SLabel>Evidence base — click to highlight throughout</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {displayCases.map(c=>{
                const a=CASE_ACCENTS[c.id];
                const isActive=activeCase===c.id, isOther=activeCase&&activeCase!==c.id;
                return (
                  <div key={c.id} onClick={()=>toggleCase(c.id)} style={{background:isActive?a.light:isOther?T.surfaceAlt:T.surface,border:`1.5px solid ${isActive?a.mid:isOther?T.border:T.border}`,borderTop:`3px solid ${isActive?a.base:"transparent"}`,borderRadius:10,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s",opacity:isOther?0.45:1,transform:isActive?"translateY(-2px)":"none",boxShadow:isActive?`0 4px 14px ${a.light}`:"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.07em",color:isActive?a.base:T.textMuted}}>{c.id} · {c.sector}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:3,background:c.transfer==="High"?T.greenLight:T.amberLight,color:c.transfer==="High"?T.green:T.amber}}>{c.transfer} UK fit</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>{c.title}</div>
                    <div style={{fontSize:11,color:T.textSec,marginBottom:6}}>{c.location}</div>
                    <div style={{fontSize:11,fontWeight:600,color:isActive?a.base:T.green,lineHeight:1.4}}>{c.hook}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr style={{border:"none",borderTop:`1px solid ${T.border}`,marginBottom:28}}/>

          {/* Sections */}
          {shown>=1&&(
            <div ref={el => { sectionRefs.current["summary"] = el; }} className="appear" style={{padding:"28px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <h2 style={{fontSize:15,fontWeight:700,color:T.text}}>Executive Summary</h2>
                  {isTutorial&&<button onClick={()=>toggleAnnotation("summary")} style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,background:isAnnotationVisible("summary")?"#1d70b8":"#e8f1fb",color:isAnnotationVisible("summary")?"#fff":"#1d70b8",border:"none",cursor:"pointer"}}>? how this works</button>}
                </div>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:3,background:T.greenLight,color:T.green,border:`1px solid ${T.greenMid}`}}>HIGH · 3/3 cases</span>
              </div>
              <AnnotationNote section="summary" visible={isAnnotationVisible("summary")}/>
              <div style={{padding:"18px 20px",background:T.accentLight,borderRadius:8,borderLeft:`3px solid ${T.accent}`}}>
                <p style={{fontSize:14,lineHeight:1.8,color:T.text}}>
                  {(summaryOverride || sectionOverrides.summary) ? (summaryOverride || sectionOverrides.summary) : (
                    <>Across these {displayCases.length} case studies, <strong>nature-based and hybrid approaches consistently outperform purely engineered solutions</strong> for urban transport infrastructure facing flooding and heat stress.{" "}
                    {displayCases.map(c => <span key={c.id}><SC id={c.id} activeCase={activeCase} onClick={toggleCase}/> </span>)}
                    Two of three cases delivered within existing asset management budgets by integrating adaptation into planned maintenance cycles.</>
                  )}
                </p>
              </div>
            </div>
          )}

          {shown>=3&&(
            <div ref={el => { sectionRefs.current["approaches"] = el; }} className="appear" style={{padding:"28px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <h2 style={{fontSize:15,fontWeight:700,color:T.text}}>Adaptation Approaches</h2>
                {isTutorial&&<button onClick={()=>toggleAnnotation("approaches")} style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,background:isAnnotationVisible("approaches")?"#1d70b8":"#e8f1fb",color:isAnnotationVisible("approaches")?"#fff":"#1d70b8",border:"none",cursor:"pointer"}}>? how this works</button>}
              </div>
              <AnnotationNote section="approaches" visible={isAnnotationVisible("approaches")}/>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${T.text}`}}>
                    {["Measure","Cases","Frequency","Pattern note"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:T.textMuted}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {measure:"Nature-based solutions (SuDS / ponds)",cases:["ID_40","ID_32"],freq:"2 of 3",note:"Both UK cases; both earned biodiversity co-benefits not in original brief"},
                    {measure:"Surface material retrofit",cases:["ID_19"],freq:"1 of 3",note:"Overlay — no asset replacement. 8-year product life"},
                    {measure:"Integration into planned maintenance",cases:["ID_32","ID_19"],freq:"2 of 3",note:"Adaptation cost 'minimal' when embedded in BAU capital works"},
                  ].map((row,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${T.border}`,background:i%2?T.surfaceAlt:"transparent"}}>
                      <td style={{padding:"12px"}}><span style={{fontWeight:600,color:T.text}}>{row.measure}</span></td>
                      <td style={{padding:"12px"}}><div style={{display:"flex",gap:4}}>{row.cases.map(c=><SC key={c} id={c} activeCase={activeCase} onClick={toggleCase}/>)}</div></td>
                      <td style={{padding:"12px"}}><span style={{fontSize:11,fontWeight:700,color:T.accent}}>{row.freq}</span></td>
                      <td style={{padding:"12px"}}><span style={{fontSize:12,color:T.textSec,lineHeight:1.5}}>{row.note}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {shown>=5&&(
            <div ref={el => { sectionRefs.current["insight"] = el; }} className="appear" style={{padding:"28px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <h2 style={{fontSize:15,fontWeight:700,color:T.text}}>Key Insight</h2>
                  {isTutorial&&<button onClick={()=>toggleAnnotation("insight")} style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,background:isAnnotationVisible("insight")?"#1d70b8":"#e8f1fb",color:isAnnotationVisible("insight")?"#fff":"#1d70b8",border:"none",cursor:"pointer"}}>? how this works</button>}
                </div>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:3,background:T.greenLight,color:T.green,border:`1px solid ${T.greenMid}`}}>3/3 CASES</span>
              </div>
              <AnnotationNote section="insight" visible={isAnnotationVisible("insight")}/>
              <div style={{padding:"22px 24px",background:T.greenLight,borderRadius:10,border:`1px solid ${T.greenMid}`}}>
                <p style={{fontFamily:"'DM Serif Display', serif",fontSize:17,lineHeight:1.8,color:T.text,fontWeight:400,marginBottom:14}}>
                  "Proactive climate adaptation — integrated into planned maintenance — delivers better value than reactive repair. All three cases demonstrate co-benefits not in the original design objective, suggesting adaptation investments systematically undervalue their total return."
                </p>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {CASES.map(c=><SC key={c.id} id={c.id} activeCase={activeCase} onClick={toggleCase}/>)}
                  <span style={{fontSize:11,color:T.textMuted,marginLeft:4}}>Confidence: <strong style={{color:T.green}}>High</strong></span>
                </div>
              </div>
              {/* Prompt to use chat */}
              {!chatOpen&&(
                <div style={{marginTop:14,padding:"12px 16px",background:T.surfaceAlt,borderRadius:8,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:T.textSec}}>Want to reframe this insight for a specific audience or check what's missing?</span>
                  <button onClick={()=>setChatOpen(true)} style={{flexShrink:0,padding:"6px 12px",background:T.accent,color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",marginLeft:12}}>Ask HIVE →</button>
                </div>
              )}
            </div>
          )}

          {shown>=6&&(
            <div ref={el => { sectionRefs.current["sources"] = el; }} className="appear" style={{padding:"28px 0"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <h2 style={{fontSize:15,fontWeight:700,color:T.text}}>Source References</h2>
                {isTutorial&&<button onClick={()=>toggleAnnotation("sources")} style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,background:isAnnotationVisible("sources")?"#1d70b8":"#e8f1fb",color:isAnnotationVisible("sources")?"#fff":"#1d70b8",border:"none",cursor:"pointer"}}>? how this works</button>}
              </div>
              <AnnotationNote section="sources" visible={isAnnotationVisible("sources")}/>
              {displayCases.map((c,i)=>(
                <div key={c.id} style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"0 16px",padding:"12px 0",borderBottom:`1px solid ${T.border}`,alignItems:"start"}}>
                  <SC id={c.id} activeCase={activeCase} onClick={toggleCase}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>{c.title}</div>
                    <div style={{fontSize:12,color:T.textSec}}>{c.org} · {c.location} · {c.year}</div>
                    <a href="#" style={{fontSize:11,color:T.accent,textDecoration:"none"}}>View original ↗</a>
                  </div>
                </div>
              ))}
              <div style={{marginTop:14,padding:"12px 14px",background:T.surfaceAlt,borderRadius:8,border:`1px solid ${T.border}`}}>
                <p style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>AI-generated synthesis · HIVE · Connected Places Catapult · {new Date().toLocaleDateString("en-GB")} · Review original source records before citing in formal documents.</p>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {shown<6&&[1,2,3].map(i=>shown+i<=6&&(
            <div key={i} style={{padding:"28px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{height:14,width:"30%",borderRadius:4,background:T.surfaceAlt,marginBottom:14}}/>
              <div style={{height:10,width:"90%",borderRadius:3,background:T.surfaceAlt,marginBottom:6}}/>
              <div style={{height:10,width:"75%",borderRadius:3,background:T.surfaceAlt}}/>
            </div>
          ))}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{position:"sticky",top:72,height:"fit-content"}}>
          <div style={{background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,padding:"16px",marginBottom:12}}>
            <SLabel>Brief summary</SLabel>
            {[{label:"Cases",value:"3"},{label:"Sectors",value:"Highways, Aviation"},{label:"Hazards",value:"Flooding, Heat"},{label:"Transferability",value:"High / Medium"},{label:"Cost range",value:"£2–10m"}].map(row=>(
              <div key={row.label} style={{display:"flex",justifyContent:"space-between",fontSize:12,borderBottom:`1px solid ${T.border}`,paddingBottom:7,marginBottom:7}}>
                <span style={{color:T.textMuted}}>{row.label}</span>
                <span style={{fontWeight:600,color:T.text}}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,padding:"16px",marginBottom:12}}>
            <SLabel>Confidence key</SLabel>
            {[{level:"High",desc:"2+ chunks directly support",color:T.green,bg:T.greenLight},{level:"Partial",desc:"1 chunk or indirect",color:T.amber,bg:T.amberLight},{level:"Indicative",desc:"Reasoned inference",color:T.accent,bg:T.accentLight}].map(c=>(
              <div key={c.level} style={{padding:"7px 10px",background:c.bg,borderRadius:5,marginBottom:5}}>
                <div style={{fontSize:11,fontWeight:700,color:c.color,marginBottom:1}}>{c.level}</div>
                <div style={{fontSize:11,color:T.textSec}}>{c.desc}</div>
              </div>
            ))}
          </div>
          <div style={{background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,padding:"16px"}}>
            <SLabel>Next actions</SLabel>
            {[{label:"Add more cases",icon:"+"},{label:"Applicability Scan",icon:"📍",demo:true},{label:"Export PDF",icon:"↓"},{label:"Share link",icon:"🔗"}].map(a=>(
              <button key={a.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"8px 10px",borderRadius:6,background:T.surfaceAlt,border:`1px solid ${T.border}`,cursor:"pointer",fontSize:12,color:T.textSec,fontWeight:500,width:"100%",marginBottom:5}}>
                <span>{a.icon} {a.label}</span>
                {a.demo&&<span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:3,background:T.amberLight,color:T.amber}}>DEMO</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brief chat drawer */}
      {chatOpen&&(
        <div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:"#fff",boxShadow:"-4px 0 32px rgba(0,0,0,0.08)",zIndex:40,display:"flex",flexDirection:"column",animation:"slideRight 0.2s ease",borderLeft:`1px solid ${T.border}`}}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:20,height:20,borderRadius:4,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:T.text}}>Ask about this brief</span>
                <span style={{fontSize:10,fontWeight:700,background:T.amberLight,color:T.amber,padding:"2px 6px",borderRadius:3,border:`1px solid #fcd34d`}}>DEMO</span>
              </div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>Interrogate, reframe, or extend this report</div>
            </div>
            <button onClick={()=>setChatOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:20,lineHeight:1,padding:4}}>×</button>
          </div>
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <BriefChatPanel
              briefCases={displayCases}
              onAddCase={c => setBriefCases(prev => [...prev, c])}
              onApplyOverride={applyOverride}
              onClearOverride={clearOverride}
              summaryOverride={summaryOverride}
              onSetSummaryOverride={setSummaryOverride}
              isTutorial={isTutorial}
            />
          </div>
        </div>
      )}
    </div>
  );
}