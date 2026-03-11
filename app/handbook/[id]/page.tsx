// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { NavPill } from "@/components/NavPill";

// ── SHARED DATA ────────────────────────────────────────────────────────────────

const CS = [
  { id:"cs1", title:"Phoenix Cool Pavement Programme", sector:"Highways", hook:"100+ miles treated · 6°C surface reduction · $4.8m annual", hazards:{ cause:["High temperatures"], effect:["Road surface overheating"] }, summary:"Reflective CoolSeal coating applied to 100+ miles of residential roads to combat extreme urban heat island effect. Reduces surface temperatures by 6°C.", transferability:"Medium", transferabilityNote:"Directly applicable to UK cities. London hotspots 4.5°C warmer at night than surrounding areas.", costBand:"£1m–£10m", location:"Phoenix, USA", year:"2021–ongoing", insight:"Cool pavement extends road longevity by reducing thermal degradation — delivering avoided maintenance costs beyond the cooling benefit.", tags:["highways","roads","heat","heatwave","pavement","surface temperature"] },
  { id:"cs2", title:"Sheffield Grey to Green", sector:"Highways", hook:"60% grey to green · discharge cut 80% · 561% biodiversity uplift", hazards:{ cause:["Heavy rainfall","Flooding"], effect:["Water damage","Infrastructure disruption"] }, summary:"1.5km urban green corridor replacing a former ring road with SuDS following the 2007 floods that caused £30m damage and closed Sheffield station.", transferability:"High", transferabilityNote:"The largest retrofit grey-to-green project in the UK. Applicable to rail corridors following river valleys and urban tram networks.", costBand:"£1m–£10m per phase", location:"Sheffield, UK", year:"2014–ongoing", insight:"SuDS reduced discharge from a 1-in-100-year event by 87% — from 69.6 to 9.2 litres/sec.", tags:["highways","rail","tram","flooding","SuDS","nature-based","drainage","rainfall"] },
  { id:"cs3", title:"Croydon Grid Flood Defence", sector:"Rail", hook:"69,000 customers protected · 1-in-1,000-year standard · £800k", hazards:{ cause:["Flooding – fluvial"], effect:["Power disruption","Loss of electricity to transport"] }, summary:"Permanent flood barriers at Croydon Grid substation protecting electricity supply to 69,000 homes including South London transport infrastructure.", transferability:"High", transferabilityNote:"Part of a programme protecting 119 substations. Directly relevant to rail electrification supply infrastructure across South East England.", costBand:"Under £1m (site)", location:"Croydon, London, UK", year:"2022–2023", insight:"Site-specific hardening at £800k — part of a £14m programme since 2010. Demonstrates high network resilience ROI.", tags:["energy","flooding","infrastructure","substation","flood barriers","rail electrification"] },
  { id:"cs4", title:"Heathrow Airport Balancing Ponds", sector:"Aviation", hook:"Year-round flow control · £2.1m bundled into wider programme", hazards:{ cause:["Heavy rainfall","Drought"], effect:["Flooding – fluvial","Surface water flooding"] }, summary:"Balancing ponds manage both drought and heavy rainfall, controlling water entering drainage and reducing flood risk to airport access routes.", transferability:"High", transferabilityNote:"Tilting weir systems directly applicable to other airports, ports, and urban transport infrastructure facing surface water flooding.", costBand:"£1m–£10m", location:"London, UK", year:"2016–2022", insight:"Integrating adaptation into planned development kept costs minimal — bundled with wider infrastructure rather than standalone spend.", tags:["aviation","flooding","drought","nature-based","drainage","water management"] },
  { id:"cs5", title:"Austrian Federal Railways Climate Adaptation", sector:"Rail", hook:"212km barriers · 3,370ha protected forest · sensors across Alpine network", hazards:{ cause:["Heavy rainfall","Storms","Freeze-thaw"], effect:["Landslides","Rockfalls","Flooding"] }, summary:"Comprehensive physical and predictive adaptations across the Alpine rail network combining slope stabilisation, barriers and geotechnical monitoring.", transferability:"High", transferabilityNote:"Rockfall barriers and slope stabilisation directly applicable to UK upland rail: Peak District, Scottish Highlands, and Welsh valley lines.", costBand:"Large programme", location:"Austria", year:"2005–present", insight:"Site-specific assessment was more effective than blanket solutions. Early warning systems reduced reactive maintenance costs significantly.", tags:["rail","landslide","flooding","sensors","monitoring","slope","rockfall","precipitation"] },
  { id:"cs6", title:"Port of Calais Extension and Sea Defence", sector:"Maritime", hook:"3.3km seawall · 100-year design life · €863m total", hazards:{ cause:["Sea level rise","Storms"], effect:["Storm surge","Coastal flooding","Erosion"] }, summary:"Doubled port capacity while building a 3.3km seawall designed for 100-year service life, explicitly accounting for sea level rise projections.", transferability:"High", transferabilityNote:"Directly applicable to UK ports facing sea level rise. Humber Ports specifically identified as having medium sea level rise risk.", costBand:"£100m+", location:"Calais, France", year:"2021", insight:"Treating climate resilience as a core design requirement from the outset allowed the seawall to be cost-effectively integrated into a wider upgrade.", tags:["maritime","ports","sea level rise","storm surge","coastal","flooding","seawall"] },
  { id:"cs7", title:"Deutsche Bahn Climate Adaptation Measures", sector:"Rail", hook:"25% storm damage reduction · 20% fewer heat disruptions · IoT across national network", hazards:{ cause:["High temperatures","Storms"], effect:["Vegetation dieback","Storm damage","Track overheating"] }, summary:"Phased adaptation combining air-conditioned rolling stock, AI-assisted vegetation management via satellite data, and IoT sensor networks.", transferability:"High", transferabilityNote:"Vegetation management and rolling stock AC directly applicable to UK rail. Highest priority in South and East England.", costBand:"Large programme", location:"Germany", year:"2007–2024", insight:"Vegetation management delivered 25% reduction in storm damage 2018–2020 — one of the highest ROI findings in the HIVE database.", tags:["rail","heat","vegetation","sensors","rolling stock","storms","heatwave"] },
];

const MQ = [
  {id:'m1',title:'Dawlish Sea Wall',sector:'Rail',measure:'Sea wall',hook:'8m height · recurve design'},
  {id:'m2',title:'Sheffield Grey to Green',sector:'Highways',measure:'SuDS',hook:'60% grey→green · 1.5km'},
  {id:'m3',title:'ÖBB Rockfall Barriers',sector:'Rail',measure:'Physical barriers',hook:'212km barriers installed'},
  {id:'m4',title:'Heathrow Balancing Ponds',sector:'Aviation',measure:'Water management',hook:'Year-round flow control · £2.1m'},
  {id:'m5',title:'Copenhagen Metro Waterproofing',sector:'Rail',measure:'Flood protection',hook:'Waterproof walls to 2.3m'},
  {id:'m6',title:'Phoenix Cool Pavements',sector:'Highways',measure:'Cool pavement',hook:'100+ miles · 6°C reduction'},
  {id:'m7',title:'Port of Calais Sea Defence',sector:'Maritime',measure:'Sea defence',hook:'3.3km seawall · 100ha basin'},
  {id:'m8',title:'Berlin Green Tram Tracks',sector:'Rail',measure:'Green tramways',hook:'22,000m+ green track'},
  {id:'m9',title:'Gatwick Clays Lake Scheme',sector:'Aviation',measure:'Flood storage',hook:'400,000 m³ capacity'},
  {id:'m10',title:'Panama Canal Conservation',sector:'Maritime',measure:'Water optimisation',hook:'Strategic conservation'},
  {id:'m11',title:'Leeds Flood Alleviation',sector:'Highways',measure:'Natural Flood Management',hook:'500,000 trees planted'},
  {id:'m12',title:'MTA Flood Protection',sector:'Rail',measure:'Flood barriers',hook:'3,000+ barriers installed'},
  {id:'m13',title:'ÖBB Early Warning Systems',sector:'Rail',measure:'Geotechnical sensors',hook:'Real-time monitoring network'},
  {id:'m14',title:'Hammersmith Bridge Cooling',sector:'Highways',measure:'Bridge deck cooling',hook:'Water spray system'},
  {id:'m15',title:'TfL Rainwater Harvesting',sector:'Rail',measure:'Rainwater harvesting',hook:'23,000 m³ recycled annually'},
  {id:'m16',title:'Network Rail CWR Tracks',sector:'Rail',measure:'Thermally resilient tracks',hook:'Continuous Welded Rail'},
  {id:'m17',title:'LA Metro Wetlands Park',sector:'Rail',measure:'Relocating infrastructure',hook:'46-acre wetlands park'},
  {id:'m18',title:'Albert Canal – Archimedes Screws',sector:'Maritime',measure:'Archimedes screws',hook:'Largest screws in the world'},
  {id:'m19',title:'Deutsche Bahn – ICE 4 Trains',sector:'Rail',measure:'Air-conditioned trains',hook:'AC rated to 45°C'},
  {id:'m20',title:'Infrabel Tension Release Devices',sector:'Rail',measure:'Tension release devices',hook:'Prevents buckling + fracturing'},
];

const SECTORS = ["Rail","Aviation","Maritime","Highways"];
const HAZARDS = ["Heavy rainfall","High temperatures","Storms","Sea level rise","Drought","Freeze-thaw"];
const SC = { Rail:["#EBF4FF","#1A4A8A"], Aviation:["#F3EEF9","#5B3FA0"], Maritime:["#E6F5EE","#156840"], Highways:["#FDF0E5","#9A4812"] };

const score = (cs, q) => {
  if (!q.trim()) return 1;
  const ql = q.toLowerCase(); let s = 0;
  if (cs.title.toLowerCase().includes(ql)) s += 10;
  if (cs.summary.toLowerCase().includes(ql)) s += 6;
  cs.tags.forEach(t => { if (t.includes(ql) || ql.includes(t)) s += 3; });
  [...cs.hazards.cause, ...cs.hazards.effect].forEach(h => { if (h.toLowerCase().includes(ql)) s += 5; });
  q.split(" ").filter(w=>w.length>3).forEach(w => cs.tags.forEach(t => { if(t.includes(w)) s+=2; }));
  return s;
};

const search = (q, sH, sS) => {
  let r = [...CS];
  if (sH.length) r = r.filter(cs => { const ah=[...cs.hazards.cause,...cs.hazards.effect]; return sH.some(h=>ah.some(ch=>ch.toLowerCase().includes(h.toLowerCase()))); });
  if (sS.length) r = r.filter(cs => sS.some(s=>cs.sector.toLowerCase()===s.toLowerCase()));
  if (q.trim()) r = r.map(cs=>({...cs,_s:score(cs,q)})).filter(cs=>cs._s>0).sort((a,b)=>b._s-a._s);
  return r;
};

const detect = q => {
  const ql=q.toLowerCase(); const dH=[],dS=[];
  if(ql.includes("flood")||ql.includes("water")||ql.includes("rain")||ql.includes("drainage")) dH.push("Heavy rainfall");
  if(ql.includes("heat")||ql.includes("hot")||ql.includes("temperature")) dH.push("High temperatures");
  if(ql.includes("storm")||ql.includes("wind")) dH.push("Storms");
  if(ql.includes("sea level")||ql.includes("coastal")||ql.includes("surge")) dH.push("Sea level rise");
  if(ql.includes("rail")||ql.includes("train")||ql.includes("track")) dS.push("Rail");
  if(ql.includes("aviation")||ql.includes("airport")) dS.push("Aviation");
  if(ql.includes("port")||ql.includes("maritime")) dS.push("Maritime");
  if(ql.includes("road")||ql.includes("highway")) dS.push("Highways");
  return { dH:[...new Set(dH)], dS:[...new Set(dS)] };
};

const synthesis = (results) => {
  if (!results.length) return null;
  const sectors = [...new Set(results.map(r=>r.sector))];
  const highT = results.filter(r=>r.transferability==="High");
  const allM = results.flatMap(r=>r.tags);
  const types = [];
  if(allM.some(t=>t.includes("sensor")||t.includes("monitoring"))) types.push("predictive monitoring");
  if(allM.some(t=>t.includes("barrier")||t.includes("wall")||t.includes("slope"))) types.push("physical protection");
  if(allM.some(t=>t.includes("nature")||t.includes("vegetation")||t.includes("SuDS"))) types.push("nature-based approaches");
  const insight = results.length===1 ? results[0].insight
    : types.length>=2 ? `A consistent pattern: ${types.slice(0,2).join(" and ")} are deployed together. ${highT.length} of ${results.length} cases have explicitly identified UK applicability.`
    : `${highT.length} of ${results.length} cases have high UK transferability. Proactive adaptation integrated into planned maintenance consistently delivers lower cost than reactive repair.`;
  return { count:results.length, sectors, highT:highT.length, insight };
};

// ── DIRECTION A: SIGNAL ─────────────────────────────────────────────────────────

const A = {
  bg:"#07101C", panel:"#0C1828", raised:"#11223A", border:"#1A3050",
  cream:"#EDE8DE", gold:"#C5A24A",
  goldFade:"rgba(197,162,74,0.13)", goldBorder:"rgba(197,162,74,0.32)",
  body:"#A8BFCF", meta:"#637D96", hazardText:"#8FB4CC",
};
const SECTOR_BORDER = { Rail:"#5BADD4", Aviation:"#9B7FE0", Maritime:"#4BB885", Highways:"#E8934A" };

function SignalCard({ cs }) {
  const [h,setH]=useState(false);
  const borderCol = SECTOR_BORDER[cs.sector] || A.gold;
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:h?A.raised:A.panel, border:`1px solid ${h?A.gold:A.border}`,
               borderLeft:`3px solid ${borderCol}`,
               padding:"22px 24px 18px", cursor:"pointer", transition:"all 0.18s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:borderCol, display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:borderCol, display:"inline-block", flexShrink:0 }}/>
          {cs.sector}
        </span>
        <span style={{ fontSize:11, color:A.meta }}>{cs.year?.split("–")[0]}</span>
      </div>
      <h3 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:14, lineHeight:1.45, fontWeight:700, marginBottom:8, color:A.cream }}>{cs.title}</h3>
      <p style={{ fontSize:12, color:A.gold, fontWeight:600, marginBottom:10 }}>{cs.hook}</p>
      <p style={{ fontSize:13, color:A.body, lineHeight:1.7, marginBottom:12, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{cs.summary}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
        {cs.hazards.cause.slice(0,2).map(haz=>(
          <span key={haz} style={{ fontSize:11, color:A.hazardText, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:3, height:3, borderRadius:"50%", background:A.hazardText, display:"inline-block" }}/>
            {haz}
          </span>
        ))}
      </div>
      <div style={{ background:A.goldFade, borderLeft:`2px solid ${A.goldBorder}`, padding:"7px 11px", marginBottom:14 }}>
        <span style={{ fontSize:10, color:A.gold, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>UK applicability · </span>
        <span style={{ fontSize:11, color:A.body }}>{cs.transferabilityNote?.slice(0,80)}…</span>
      </div>
      <div style={{ paddingTop:12, borderTop:`1px solid ${A.border}`, display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, fontWeight:700, color:cs.transferability==="High"?"#4ade80":"#fbbf24", textTransform:"uppercase", letterSpacing:"0.08em" }}>● {cs.transferability} transferability</span>
        <span style={{ fontSize:11, color:A.gold, cursor:"pointer", fontWeight:600 }}>Read case →</span>
      </div>
    </div>
  );
}

function DirectionA() {
  const [q,setQ]=useState(""); const [selS,setSelS]=useState([]); const [aiH,setAiH]=useState([]); const [aiS,setAiS]=useState([]);
  const [results,setResults]=useState(CS); const [syn,setSyn]=useState(null);
  const allH=aiH, allS=[...new Set([...selS,...aiS])];
  const hasF=q||selS.length||aiH.length||aiS.length;
  useEffect(()=>{ const t=setTimeout(()=>{ if(q.trim()){ const {dH,dS}=detect(q);setAiH(dH);setAiS(dS); }else{setAiH([]);setAiS([]);} },350); return()=>clearTimeout(t); },[q]);
  useEffect(()=>{ const r=search(q,allH,allS); setResults(r); setSyn(hasF&&r.length?synthesis(r):null); },[q,selS,aiH,aiS]);
  const tog=(set,v)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const clear=()=>{ setQ("");setSelS([]);setAiH([]);setAiS([]); };
  return (
    <div style={{ background:A.bg, color:A.cream, minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <nav style={{ borderBottom:`1px solid ${A.border}`, padding:"16px 52px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:40, background:"rgba(7,16,28,0.97)", backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <span style={{ fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700, letterSpacing:"-0.01em" }}>HIVE</span>
          <div style={{ width:1, height:16, background:A.border }}/>
          <span style={{ fontSize:10, color:A.body, letterSpacing:"0.16em", textTransform:"uppercase" }}>Climate Adaptation Intelligence</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:28, fontSize:12, color:A.body }}>
          <NavPill variant="dark" />
          {["Handbook","Roadmap","About"].map(l=><span key={l} style={{ cursor:"pointer" }}>{l}</span>)}
          <span style={{ cursor:"pointer", color:A.gold, fontWeight:600 }}>DfT Partner</span>
        </div>
      </nav>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"72px 52px 52px", display:"grid", gridTemplateColumns:"56fr 44fr", gap:80, alignItems:"start" }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:A.gold, marginBottom:20, fontWeight:600 }}>Vol. III — Transport Resilience Evidence Base</div>
          <h1 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:50, lineHeight:1.1, fontWeight:700, letterSpacing:"-0.025em", marginBottom:20 }}>
            Adapting transport<br/><em style={{ color:A.gold, fontWeight:400 }}>to a changing climate</em>
          </h1>
          <p style={{ fontSize:15, lineHeight:1.8, color:A.body, maxWidth:420, marginBottom:36 }}>A curated intelligence resource for transport practitioners, researchers and policymakers navigating the evidence on climate adaptation.</p>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:A.meta, marginBottom:10 }}>Search the knowledge base</div>
            <div style={{ display:"flex" }}>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. flood resilience, rail heatwave, coastal storm surge..."
                style={{ flex:1, background:A.panel, border:`1px solid ${q?A.gold:A.border}`, borderRight:"none", padding:"13px 16px", color:A.cream, fontSize:14, outline:"none", fontFamily:"'DM Sans',sans-serif", borderRadius:"3px 0 0 3px", transition:"border-color 0.2s" }}/>
              <button style={{ background:A.gold, color:A.bg, border:"none", padding:"0 24px", cursor:"pointer", fontSize:12, fontWeight:700, borderRadius:"0 3px 3px 0", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em" }}>Search</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
            {["Flood","Sea level rise","Heatwave","Rockfall","SuDS","Vegetation"].map(qt=>(
              <button key={qt} onClick={()=>setQ(qt)} style={{ background:"none", border:`1px solid ${A.border}`, color:A.body, borderRadius:2, padding:"4px 12px", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=A.gold;e.currentTarget.style.color=A.gold;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=A.border;e.currentTarget.style.color=A.body;}}>{qt}</button>
            ))}
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:A.meta, marginBottom:10 }}>Filter by sector</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {SECTORS.map(s=>{ const sel=selS.includes(s); return <button key={s} onClick={()=>tog(setSelS,s)} style={{ background:sel?A.goldFade:"none", border:`1px solid ${sel?A.gold:A.border}`, color:sel?A.gold:A.body, borderRadius:3, padding:"5px 12px", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{s}</button>; })}
              {selS.length>0&&<button onClick={()=>setSelS([])} style={{ background:"none",border:"none",color:A.meta,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>× Clear</button>}
            </div>
          </div>
          {(aiH.length>0||aiS.length>0)&&(
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, color:A.gold, letterSpacing:"0.1em", textTransform:"uppercase" }}>Detected:</span>
              {[...aiH,...aiS].map(t=>(
                <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:6, background:A.goldFade, border:`1px solid ${A.goldBorder}`, borderRadius:2, padding:"3px 10px", fontSize:11, color:A.gold }}>
                  {t}<button onClick={()=>{setAiH(p=>p.filter(x=>x!==t));setAiS(p=>p.filter(x=>x!==t));}} style={{ background:"none",border:"none",cursor:"pointer",color:A.gold,padding:0,lineHeight:1,fontSize:14 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ paddingTop:56 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:A.border, marginBottom:1 }}>
            {[["109","Case Studies","fully indexed"],["4","Transport Modes","rail · aviation · maritime · highways"],[CS.filter(c=>c.transferability==="High").length.toString(),"High UK Transferability","directly applicable cases"],["12","Climate Hazards","cause & effect categories"]].map(([v,l,s])=>(
              <div key={l} style={{ background:A.panel, padding:"22px 24px" }}>
                <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:34, fontWeight:700, color:A.cream, marginBottom:4 }}>{v}</div>
                <div style={{ fontSize:10, color:A.body, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:11, color:A.meta }}>{s}</div>
              </div>
            ))}
          </div>
          {syn&&(
            <div style={{ background:A.goldFade, borderLeft:`3px solid ${A.gold}`, padding:"18px 22px", marginTop:1, animation:"fadeIn 0.3s ease" }}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", color:A.gold, marginBottom:8, fontWeight:700 }}>Cross-case analysis · {syn.count} {syn.count===1?"study":"studies"}</div>
              <p style={{ fontSize:13, color:A.cream, lineHeight:1.7, marginBottom:12 }}>{syn.insight}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                {syn.sectors.map(s=><span key={s} style={{ background:A.panel, border:`1px solid ${A.border}`, color:A.body, borderRadius:2, padding:"3px 10px", fontSize:11 }}>{s}</span>)}
                <span style={{ fontSize:11, color:A.meta, alignSelf:"center" }}>{syn.highT} of {syn.count} high UK transferability</span>
              </div>
              <button style={{ background:"none", border:`1px solid ${A.gold}`, color:A.gold, padding:"8px 18px", fontSize:11, fontWeight:700, cursor:"pointer", borderRadius:3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em" }}>Generate structured brief →</button>
            </div>
          )}
          {!hasF&&<div style={{ padding:"16px 0", borderTop:`1px solid ${A.border}`, marginTop:1 }}>
            <p style={{ fontSize:11, color:A.body, lineHeight:1.7 }}>Describe your infrastructure challenge above to surface relevant case studies, cross-case patterns, and structured evidence for decision-making.</p>
          </div>}
        </div>
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 52px 32px", borderTop:`1px solid ${A.border}` }}>
        <div style={{ display:"flex", alignItems:"center", paddingTop:20, marginBottom:24 }}>
          <span style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:A.meta, marginRight:24 }}>{hasF?`${results.length} results`:`${CS.length} case studies`}</span>
          {hasF&&<button onClick={clear} style={{ background:"none",border:"none",color:A.body,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline" }}>Clear all filters</button>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:A.border }}>
          {(hasF?results:CS).map(cs=><SignalCard key={cs.id} cs={cs}/>)}
        </div>
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 52px 120px", borderTop:`1px solid ${A.border}` }}>
        <div style={{ display:"flex", gap:48 }}>
          {[["109","Total case studies indexed"],["7","Fully loaded in prototype"],["4","Transport modes covered"],["12","Climate hazard categories"]].map(([v,l])=>(
            <div key={l}><div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:26, fontWeight:700, color:A.cream }}>{v}</div><div style={{ fontSize:11, color:A.meta, marginTop:2 }}>{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DIRECTION B: PROTOTYPE v4 ──────────────────────────────────────────────────
// Source: hive-prototype-v4-updated.jsx — full implementation with
// 50-item marquee, 7 rich case studies, theme switcher (Light/Dark/DfT),
// 2D/3D marquee view, AI brief collector, cross-case synthesis panel,
// UK geography + cost-band filters, and match-reason highlighting.

const B_MARQUEE_CASES = [
  { id:'01',title:'Port of Calais Extension',sector:'Maritime',measure:'Port extension',hazards:['Sea level rise','Storm surge'],hook:'+65ha reclaimed · €863m (2021)',caseStudyId:'ID_01' },
  { id:'02',title:'Port of Calais Sea Defence',sector:'Maritime',measure:'Sea defence',hazards:['Sea level rise','Storm surge'],hook:'3.3km seawall · 100ha basin',caseStudyId:'ID_01' },
  { id:'03',title:'Prince Edward Island',sector:'Highways',measure:'Intertidal reefs',hazards:['Coastal erosion','Storm surge'],hook:'2,400 tonnes sandstone reefs' },
  { id:'04',title:'Copenhagen Metro – Waterproofing',sector:'Rail',measure:'Waterproof tunnel designs',hazards:['Flooding','Sea waves'],hook:'Waterproof walls up to 2.3m' },
  { id:'05',title:'Copenhagen Metro – Drainage',sector:'Rail',measure:'Improved drainage',hazards:['Flooding','Heavy rainfall'],hook:'Drains + pumping systems' },
  { id:'06',title:'Panama Canal Water Saving',sector:'Maritime',measure:'Water optimisation',hazards:['Drought'],hook:'Strategic water conservation' },
  { id:'07',title:'Albert Canal – Archimedes Screws',sector:'Maritime',measure:'Archimedes screws',hazards:['Drought','Water shortage'],hook:'Largest screws in the world' },
  { id:'08',title:'Albert Canal – Hydroelectric',sector:'Maritime',measure:'Hydroelectric power',hazards:['High water levels'],hook:'Dual pump + power generation' },
  { id:'09',title:'ÖBB – Slope Stabilisation',sector:'Rail',measure:'Slope stabilisation',hazards:['Landslide','Rockfall'],hook:'3,370 hectares protected forest',caseStudyId:'ID_06' },
  { id:'10',title:'ÖBB – Rockfall Barriers',sector:'Rail',measure:'Rockfall barriers',hazards:['Rockfall','Avalanche'],hook:'212km barriers installed',caseStudyId:'ID_06' },
  { id:'11',title:'ÖBB – Flood Defences',sector:'Rail',measure:'Flood defences',hazards:['Flooding','Extreme precipitation'],hook:'Retention basins + drainage',caseStudyId:'ID_06' },
  { id:'12',title:'ÖBB – Early Warning Systems',sector:'Rail',measure:'Early warning systems',hazards:['Multiple hazards'],hook:'Geotechnical sensors + forecasting',caseStudyId:'ID_06' },
  { id:'13',title:'MTA Saint George – Flood Protection',sector:'Rail',measure:'Flood protection devices',hazards:['Flooding','Storm surge'],hook:'3,000+ flood barriers installed' },
  { id:'14',title:'MTA – Elevated Equipment',sector:'Rail',measure:'Elevating equipment',hazards:['Flooding','Hurricane'],hook:'Signal room elevated 12 feet' },
  { id:'15',title:'CIPA Port – Wharf Height',sector:'Maritime',measure:'Wharf height increase',hazards:['Sea level rise','Storm surge'],hook:'+0.5m with 0.5m flexibility' },
  { id:'16',title:'CIPA Port – Rock Armour',sector:'Maritime',measure:'Rock armour',hazards:['Storm surge','Erosion'],hook:'92m breakwater extension' },
  { id:'17',title:'Infrabel – Tension Release Devices',sector:'Rail',measure:'Tension release devices',hazards:['Extreme heat','Extreme cold'],hook:'Prevents buckling + fracturing' },
  { id:'18',title:'Infrabel – Storm Basins',sector:'Rail',measure:'Storm basins',hazards:['Flooding'],hook:'Flood-prone area mitigation' },
  { id:'19',title:'Deutsche Bahn – ICE 4 Trains',sector:'Rail',measure:'Air-conditioned trains',hazards:['Extreme heat'],hook:'AC rated to 45°C',caseStudyId:'ID_11' },
  { id:'20',title:'Deutsche Bahn – Vegetation Mgmt',sector:'Rail',measure:'Vegetation management',hazards:['Storms','Falling trees'],hook:'26,000+ trees planted',caseStudyId:'ID_11' },
  { id:'21',title:'Deutsche Bahn – Sensors',sector:'Rail',measure:'Environmental sensors',hazards:['Multiple hazards'],hook:'IoT monitoring for prevention',caseStudyId:'ID_11' },
  { id:'22',title:'Leeds Flood Alleviation – NFM',sector:'Highways',measure:'Natural Flood Management',hazards:['Flooding'],hook:'500,000 trees planted' },
  { id:'23',title:'Leeds Flood Alleviation – Engineering',sector:'Highways',measure:'Traditional engineering',hazards:['Flooding'],hook:'1.8M m³ flood storage' },
  { id:'24',title:'TfL Marylebone – SuDS',sector:'Highways',measure:'Sustainable Drainage',hazards:['Flooding','Heavy rainfall'],hook:'3,500m² rainwater collection' },
  { id:'25',title:'Adelaide Airport Irrigation',sector:'Aviation',measure:'Irrigation',hazards:['Extreme heat'],hook:'200 hectares irrigated land' },
  { id:'26',title:'Gatwick – Clays Lake Scheme',sector:'Aviation',measure:'Flood storage reservoirs',hazards:['Flooding'],hook:'400,000 m³ capacity' },
  { id:'27',title:'Network Rail Conwy Valley',sector:'Rail',measure:'Earthworks',hazards:['Flooding','Washout'],hook:'16,000 tonnes rock armour' },
  { id:'28',title:'Phoenix Cool Pavements',sector:'Highways',measure:'Cool pavement technology',hazards:['Extreme heat'],hook:'100+ miles treated',caseStudyId:'ID_19' },
  { id:'29',title:'South Australia – Fire Suppression',sector:'Highways',measure:'Ventilation systems',hazards:['Wildfire','Smoke'],hook:'23 new exhaust fans' },
  { id:'30',title:'Qatar – Pumping Station',sector:'Aviation',measure:'Pumping station',hazards:['Flooding','Storm'],hook:'10km undersea outfall tunnel' },
  { id:'31',title:'Hammersmith Bridge Cooling',sector:'Highways',measure:'Bridge deck cooling',hazards:['Extreme heat'],hook:'Water spray cooling system' },
  { id:'32',title:'Heathrow Balancing Pond',sector:'Aviation',measure:'Water management',hazards:['Flooding','Drought'],hook:'Year-round flow control · £2.1m',caseStudyId:'ID_32' },
  { id:'33',title:'Heathrow Climate-Resilient Grass',sector:'Aviation',measure:'Climate-resilient grass',hazards:['Drought','Extreme heat'],hook:'Deeper root systems' },
  { id:'34',title:'Santa Barbara Debris Basin',sector:'Highways',measure:'Debris basin',hazards:['Heavy rainfall','Debris flow'],hook:'6-acre capture basin' },
  { id:'35',title:'Croydon Grid Flood Defence',sector:'Energy',measure:'Flood barriers + equipment sealing',hazards:['High winds','Flooding'],hook:'69,000 customers protected · £800k',caseStudyId:'ID_UKPN_01' },
  { id:'36',title:'Queensland Foamed Bitumen',sector:'Highways',measure:'Foamed bitumen',hazards:['Flooding'],hook:'Water-resistant pavement' },
  { id:'37',title:'Network Rail – CWR Tracks',sector:'Rail',measure:'Thermally resilient tracks',hazards:['Extreme heat'],hook:'Continuous Welded Rail' },
  { id:'38',title:'Network Rail – Auto Monitoring',sector:'Rail',measure:'Automated track monitoring',hazards:['Extreme heat'],hook:'Real-time temperature sensors' },
  { id:'39',title:'Network Rail – Water Cooling',sector:'Rail',measure:'Water cooling',hazards:['Extreme heat'],hook:'White paint + water · 5–10°C reduction' },
  { id:'40',title:'Network Rail – OLE Auto-tension',sector:'Rail',measure:'Auto-tension overhead wires',hazards:['Extreme heat'],hook:'Spring tensioners to 38°C' },
  { id:'41',title:'LA Metro – Hardening Infrastructure',sector:'Rail',measure:'Hardening infrastructure',hazards:['Flooding','Wildfire'],hook:'Raised rail + wetlands' },
  { id:'42',title:'LA Metro – Operational Adjustments',sector:'Rail',measure:'Adjusting operations',hazards:['Flooding','Wildfire'],hook:'Blue water detours' },
  { id:'43',title:'LA Metro – Wetlands Park',sector:'Rail',measure:'Relocating infrastructure',hazards:['Flooding','Stormwater'],hook:'46-acre wetlands park' },
  { id:'44',title:'Sheffield Grey to Green',sector:'Highways',measure:'SuDS',hazards:['Heavy rainfall','Flooding'],hook:'60% grey to green · 1.5km',caseStudyId:'ID_40' },
  { id:'45',title:'Network Rail Dawlish Sea Wall',sector:'Rail',measure:'Sea wall',hazards:['Waves','Storm surge'],hook:'8m height with recurve design' },
  { id:'46',title:'TfL Rainwater Harvesting',sector:'Rail',measure:'Rainwater harvesting',hazards:['Water runoff'],hook:'23,000 m³ recycled annually' },
  { id:'47',title:'Thames Tidal Barrier',sector:'Multiple',measure:'Tidal barriers',hazards:['Flooding','Storm surge'],hook:'520m · protects 1.5M people' },
  { id:'48',title:'Berlin BVG Green Tram Tracks',sector:'Rail',measure:'Green tramways',hazards:['Extreme heat','Heavy rainfall'],hook:'22,000+ metres green track' },
  { id:'49',title:'Thames Water – SuDS',sector:'Highways',measure:'SuDS',hazards:['Flooding','Urban creep'],hook:'Geocellular + rain gardens' },
  { id:'50',title:'Panama Canal – Fresh Water Surcharge',sector:'Maritime',measure:'Fresh water surcharge',hazards:['Drought'],hook:'Variable fee for water preservation' },
];

const B_PLACEHOLDER_CASES = {
  Rail:{ id:'PH_RAIL',title:'Rail case study being curated',sector:'Rail',hook:'Full case study coming soon',placeholder:true,hazards:{cause:[],effect:[]},summary:'This case study is currently being curated and verified by the HIVE editorial team.',transferability:'—',transferabilityNote:'—',ukApplicability:[],insight:'—',measures:[],location:'—',year:'—',cost:'—',costBand:'—' },
  Aviation:{ id:'PH_AVIATION',title:'Aviation case study being curated',sector:'Aviation',hook:'Full case study coming soon',placeholder:true,hazards:{cause:[],effect:[]},summary:'This case study is currently being curated and verified by the HIVE editorial team.',transferability:'—',transferabilityNote:'—',ukApplicability:[],insight:'—',measures:[],location:'—',year:'—',cost:'—',costBand:'—' },
  Maritime:{ id:'PH_MARITIME',title:'Maritime & ports case study being curated',sector:'Maritime',hook:'Full case study coming soon',placeholder:true,hazards:{cause:[],effect:[]},summary:'This case study is currently being curated and verified by the HIVE editorial team.',transferability:'—',transferabilityNote:'—',ukApplicability:[],insight:'—',measures:[],location:'—',year:'—',cost:'—',costBand:'—' },
  Highways:{ id:'PH_HIGHWAYS',title:'Highways case study being curated',sector:'Highways',hook:'Full case study coming soon',placeholder:true,hazards:{cause:[],effect:[]},summary:'This case study is currently being curated and verified by the HIVE editorial team.',transferability:'—',transferabilityNote:'—',ukApplicability:[],insight:'—',measures:[],location:'—',year:'—',cost:'—',costBand:'—' },
};

const B_CASE_STUDIES = [
  { id:"ID_19",title:"Phoenix Cool Pavement Programme",organisation:"City of Phoenix Street Transportation Department",sector:"Highways",hook:"100+ miles treated · 6°C surface temp reduction · $4.8m annual",hazards:{cause:["High temperatures","Urban Heat Island effect"],effect:["Road surface overheating","Increased energy demand"]},assets:["Road pavement"],measures:["CoolSeal reflective coating","Pavement maintenance programme","University monitoring partnership"],location:"Phoenix, USA",ukRegion:"Applicable to UK urban areas",year:"2021–ongoing",cost:"USD $4.8m annual (£3.73m); initial pilot £2.33m",costBand:"£1m–£10m",summary:"Reflective CoolSeal coating applied to 100+ miles of residential roads to combat extreme urban heat island effect. The product increases road reflectivity by 30% and reduces surface temperatures by 6°C, integrated into existing pavement maintenance budgets.",transferability:"Medium",transferabilityNote:"Directly applicable to UK cities experiencing urban heat island intensification. London hotspots already 4.5°C warmer at night than rural surroundings.",ukApplicability:["London urban roads","Major UK city centres","Transport for London managed streets","Local authority highway maintenance programmes"],insight:"Cool pavement also extends road longevity by reducing thermal degradation — delivering avoided maintenance costs beyond the cooling benefit.",tags:["highways","roads","heat","urban heat island","heatwave","pavement","reflective coating","surface temperature","city"] },
  { id:"ID_40",title:"Sheffield Grey to Green",organisation:"Sheffield City Council",sector:"Highways",hook:"60% grey to green · discharge cut 80% · 75,000 plants · 561% biodiversity uplift",hazards:{cause:["Flooding – fluvial","Flooding – surface water","Heavy rainfall"],effect:["Water damage","Infrastructure disruption"]},assets:["Road pavement","Foot and cycle paths","Rail track","Trams","Bridges","Signals and signalling","Buildings and stations"],measures:["Sustainable Drainage Systems (SuDS)","Rain gardens","Vegetated swales","Nature-based solutions","Green street corridor"],location:"Sheffield, UK",ukRegion:"Yorkshire & Humber",year:"2014–ongoing",cost:"Phase 1 £3.6m; Phase 2 £6.3m; Phase 3 ongoing",costBand:"£1m–£10m per phase",summary:"1.5km urban green corridor replacing a former ring road dual carriageway with Sustainable Drainage Systems following the 2007 floods that caused £30m damage, killed 2 people, closed Sheffield station, cancelled tram services and damaged 28 roads.",transferability:"High",transferabilityNote:"UK case directly applicable nationwide. The largest retrofit grey-to-green project in the UK. Explicitly applicable to rail corridors following river valleys.",ukApplicability:["UK city centre transport corridors","Rail lines following river valleys","Urban tram networks","Local authority highway flood management"],insight:"SuDS reduced river discharge from a 1-in-100-year event by 87% — from 69.6 to 9.2 litres/sec. Inspired an £80m SuDS project in Mansfield.",tags:["highways","roads","rail","tram","flooding","surface water","SuDS","nature-based","urban drainage","heavy rainfall","green infrastructure"] },
  { id:"ID_UKPN_01",title:"Croydon Grid Flood Defence",organisation:"UK Power Networks",sector:"Critical Infrastructure",hook:"69,000 customers protected · 1-in-1,000-year flood standard · £800k",hazards:{cause:["Flooding – fluvial"],effect:["Power disruption","Loss of electricity supply to transport networks"]},assets:["Electrical substation","Transformers","Electrical buildings"],measures:["Permanent flood barriers","Equipment sealing","Equipment elevation above flood level","Flood walls around transformers"],location:"Croydon, London, UK",ukRegion:"London & South East",year:"c.2022–2023",cost:"£800,000 (this site); £14m total programme since 2010",costBand:"Under £1m (site); £10m–£100m (programme)",summary:"Permanent flood barriers installed at Croydon Grid substation to withstand a 1-in-1,000-year flood of the River Wandle, protecting electricity supply to 69,000 homes and businesses including transport infrastructure in South London.",transferability:"High",transferabilityNote:"Part of UK Power Networks' programme that has now protected 119 substations from river, tidal and surface water flooding.",ukApplicability:["UK electrical substations in flood-risk zones","Rail electrification supply infrastructure","Urban transport power supply","South East England energy grid"],insight:"Site-specific incremental hardening at modest cost delivers significant network resilience.",tags:["energy","flooding","fluvial","critical infrastructure","substation","power supply","resilience","flood barriers","south london","rail electrification"] },
  { id:"ID_32",title:"Heathrow Airport Balancing Ponds",organisation:"Heathrow Airport Ltd",sector:"Aviation",hook:"Year-round flow control · £2.1m bundled into wider programme",hazards:{cause:["Heavy rainfall","Drought"],effect:["Flooding – fluvial","Flooding – surface water"]},assets:["Access routes","Airport services"],measures:["Balancing ponds","Tilting weirs","Nature-based solution","MBBR wastewater treatment"],location:"London, UK",ukRegion:"London & South East",year:"2016–2022",cost:"£2.1m (sheet piling component)",costBand:"£1m–£10m",summary:"Constructed balancing ponds to manage both drought and heavy rainfall events, controlling water volume entering drainage systems and reducing flood risk to airport access routes.",transferability:"High",transferabilityNote:"Tilting weir systems and Nature-based Solutions directly applicable to other airports, ports, and urban transport infrastructure facing surface water flooding.",ukApplicability:["Other UK airports","Urban transport hubs","Coastal infrastructure"],insight:"Integrating climate adaptation into planned development activities kept costs minimal — bundled with a wider infrastructure programme rather than treated as standalone.",tags:["aviation","flooding","drought","nature-based","urban drainage","water management","heavy rainfall","surface water"] },
  { id:"ID_06",title:"Austrian Federal Railways Climate Adaptation",organisation:"Austrian Federal Railways (ÖBB)",sector:"Rail",hook:"212km barriers · 3,370ha protected forest · sensors across Alpine network",hazards:{cause:["Heavy rainfall","Storms","Freeze-thaw cycles"],effect:["Landslides","Rockfalls","Flooding – fluvial"]},assets:["Track","Bridges","Earthworks","Signalling","Level crossings"],measures:["Slope stabilisation","Rockfall barriers","Flood retention basins","Early warning systems","Real-time geotechnical monitoring"],location:"Alpine regions, Austria",ukRegion:"Applicable UK-wide",year:"2005–present",cost:"€3bn+ annual infrastructure budget",costBand:"Large programme",summary:"Comprehensive physical and predictive technology adaptations across the Alpine rail network, combining slope stabilisation, protective barriers and geotechnical sensor monitoring.",transferability:"High",transferabilityNote:"Rockfall barriers, drainage management and slope stabilisation directly applicable to UK upland rail. Particularly relevant to the Peak District, Scottish Highlands, and Welsh valley lines.",ukApplicability:["UK upland rail","Scottish Highlands lines","Welsh Valley lines","Peak District infrastructure"],insight:"Site-specific assessment — combining damage history, local conditions, and vulnerability analysis — was more effective than blanket solutions.",tags:["rail","landslide","flooding","sensors","monitoring","earthworks","slope","embankment","precipitation","rockfall"] },
  { id:"ID_01",title:"Port of Calais Extension and Sea Defence",organisation:"Société des Ports du Détroit",sector:"Maritime",hook:"3.3km seawall · 100-year design life · €863m total",hazards:{cause:["Sea level rise","Storms and high winds"],effect:["Storm surge","Coastal flooding","Coastal erosion"]},assets:["Port structures","Terminal","Retaining walls"],measures:["3.3km sea wall","Land reclamation","Reinforced retaining walls","100-year design life specification"],location:"Calais, France",ukRegion:"Applicable to UK coastal",year:"2021",cost:"€863m total project",costBand:"£100m+",summary:"Doubled port capacity while building a 3.3km seawall designed for 100-year service life, explicitly accounting for sea level rise and climate change projections in all structural specifications.",transferability:"High",transferabilityNote:"Directly applicable to UK ports facing sea level rise risk. Humber Ports specifically identified as having medium sea level rise risk.",ukApplicability:["Humber Ports","Port of Dover","Thames Estuary infrastructure","East coast ports"],insight:"Treating climate resilience as a core design requirement from the outset — not as an add-on — allowed the seawall to be cost-effectively integrated into a wider port upgrade.",tags:["maritime","ports","sea level rise","storm surge","coastal","flooding","seawall","infrastructure"] },
  { id:"ID_11",title:"Deutsche Bahn Climate Adaptation Measures",organisation:"Deutsche Bahn",sector:"Rail",hook:"25% storm damage reduction · 20% fewer heat disruptions · IoT across national network",hazards:{cause:["High temperatures","Storms and high winds"],effect:["Vegetation dieback","Storm damage","Track overheating"]},assets:["Tracks","Trains","Overhead lines","Lineside vegetation"],measures:["Air-conditioned rolling stock (ICE 4)","AI-assisted vegetation mapping","IoT temperature sensors","DB Climate Forest programme"],location:"Germany",ukRegion:"Applicable UK-wide",year:"2007–2024",cost:"€6bn (ICE 4 fleet); €625m (vegetation programme)",costBand:"Large programme",summary:"Phased adaptation combining air-conditioned rolling stock, AI-assisted vegetation management via satellite data, and IoT sensor networks to address escalating heat and storm risks.",transferability:"High",transferabilityNote:"Vegetation management and rolling stock air-conditioning directly applicable to UK rail. Highest priority in South and East England.",ukApplicability:["Network Rail Southern region","East Midlands Railway","UK rolling stock procurement","Lineside vegetation management"],insight:"Vegetation management delivered 25% reduction in storm damage between 2018 and 2020 — one of the highest ROI findings in the HIVE database.",tags:["rail","heat","temperature","vegetation","sensors","rolling stock","storms","heatwave","overheating"] },
];

const B_HAZARDS_CAUSE = ["Heavy rainfall","High temperatures","Storms","Sea level rise","Drought","Freeze-thaw"];
const B_UK_REGIONS = ["London & South East","East of England","East Midlands","North West","Scotland","Wales","Coastal UK","UK-wide"];
const B_COST_BANDS = ["Under £1m","£1m–£10m","£10m–£100m","£100m+","Large programme"];

const B_THEMES = {
  light:{ key:'light',label:'Light',bg:'#F7F5F0',surface:'#ffffff',surfaceAlt:'#fafaf9',border:'#e7e5e4',borderStrong:'#a8a29e',textPrimary:'#1c1917',textSecondary:'#78716c',textMuted:'#a8a29e',accent:'#047857',accentBg:'#d1fae5',accentText:'#065f46',navBg:'rgba(255,255,255,0.92)',gradFade:'#F7F5F0',badgeBg:'#ecfdf5',badgeText:'#065f46',badgeBorder:'#a7f3d0',inputBg:'#ffffff',inputBorder:'#d6d3d1',sectionBg:'#f5f5f4' },
  dark:{ key:'dark',label:'Dark',bg:'#0d1117',surface:'#161b27',surfaceAlt:'#1e2535',border:'#2d3446',borderStrong:'#4a5568',textPrimary:'#e2e8f0',textSecondary:'#94a3b8',textMuted:'#64748b',accent:'#34d399',accentBg:'#064e3b',accentText:'#34d399',navBg:'rgba(13,17,23,0.96)',gradFade:'#0d1117',badgeBg:'#064e3b',badgeText:'#34d399',badgeBorder:'#065f46',inputBg:'#1e2535',inputBorder:'#2d3446',sectionBg:'#161b27' },
  dft:{ key:'dft',label:'DfT',bg:'#f3f2f1',surface:'#ffffff',surfaceAlt:'#f8f8f8',border:'#b1b4b6',borderStrong:'#505a5f',textPrimary:'#0b0c0c',textSecondary:'#505a5f',textMuted:'#6f777b',accent:'#1d70b8',accentBg:'#e8f1fb',accentText:'#003a70',navBg:'rgba(255,255,255,0.97)',gradFade:'#f3f2f1',badgeBg:'#e8f1fb',badgeText:'#003a70',badgeBorder:'#99c4e8',inputBg:'#ffffff',inputBorder:'#0b0c0c',sectionBg:'#f8f8f8',dftGreen:'#006853' },
};

const B_SECTOR_COLOR = {
  Rail:"bg-blue-50 text-blue-700 border-blue-200",
  Aviation:"bg-sky-50 text-sky-700 border-sky-200",
  Maritime:"bg-teal-50 text-teal-700 border-teal-200",
  Highways:"bg-amber-50 text-amber-700 border-amber-200",
  Energy:"bg-purple-50 text-purple-700 border-purple-200",
  Multiple:"bg-stone-50 text-stone-600 border-stone-200",
};

const B_detectIntent = (query) => {
  const q = query.toLowerCase();
  const detectedHazards = [], detectedSectors = [];
  if (q.includes("flood")||q.includes("water")||q.includes("rain")||q.includes("drainage")) detectedHazards.push("Heavy rainfall");
  if (q.includes("heat")||q.includes("hot")||q.includes("temperature")||q.includes("heatwave")) detectedHazards.push("High temperatures");
  if (q.includes("storm")||q.includes("wind")) detectedHazards.push("Storms");
  if (q.includes("sea level")||q.includes("coastal")||q.includes("surge")) detectedHazards.push("Sea level rise");
  if (q.includes("landslide")||q.includes("slope")||q.includes("embankment")||q.includes("rockfall")) detectedHazards.push("Heavy rainfall");
  if (q.includes("drought")||q.includes("dry")) detectedHazards.push("Drought");
  if (q.includes("rail")||q.includes("train")||q.includes("track")||q.includes("railway")) detectedSectors.push("Rail");
  if (q.includes("aviation")||q.includes("airport")||q.includes("heathrow")) detectedSectors.push("Aviation");
  if (q.includes("port")||q.includes("maritime")||q.includes("harbour")) detectedSectors.push("Maritime");
  if (q.includes("road")||q.includes("highway")||q.includes("motorway")) detectedSectors.push("Highways");
  return { detectedHazards:[...new Set(detectedHazards)], detectedSectors:[...new Set(detectedSectors)] };
};

const B_getMatchReasons = (cs, query, selectedHazards, selectedSectors) => {
  const reasons = [];
  const q = (query || "").toLowerCase();
  const allHazards = [...(cs.hazards?.cause || []), ...(cs.hazards?.effect || [])];
  if (q) {
    const words = q.split(" ").filter(w => w.length > 3);
    words.forEach(word => {
      (cs.tags || []).forEach(t => { if (t.includes(word)) reasons.push(t); });
      allHazards.forEach(h => { if (h.toLowerCase().includes(word)) reasons.push(h); });
      (cs.measures || []).forEach(m => { if (m.toLowerCase().includes(word)) reasons.push(m); });
    });
  }
  (selectedHazards || []).forEach(h => { if (allHazards.some(ch => ch.toLowerCase().includes(h.toLowerCase()))) reasons.push(h); });
  (selectedSectors || []).forEach(s => { if ((cs.sector || "").toLowerCase() === s.toLowerCase()) reasons.push(cs.sector); });
  return [...new Set(reasons)].slice(0, 4);
};

const B_scoreResult = (cs, query) => {
  if (!query.trim()) return 1;
  const q = query.toLowerCase();
  let sc = 0;
  const allHazards = [...(cs.hazards?.cause || []), ...(cs.hazards?.effect || [])];
  if (cs.title?.toLowerCase().includes(q)) sc += 10;
  if (cs.summary?.toLowerCase().includes(q)) sc += 6;
  if (cs.insight?.toLowerCase().includes(q)) sc += 4;
  (cs.tags || []).forEach(t => { if (t.includes(q) || q.includes(t)) sc += 3; });
  allHazards.forEach(h => { if (h.toLowerCase().includes(q) || q.includes(h.toLowerCase())) sc += 5; });
  (cs.measures || []).forEach(m => { if (m.toLowerCase().includes(q)) sc += 3; });
  (cs.ukApplicability || []).forEach(a => { if (a.toLowerCase().includes(q)) sc += 4; });
  const words = q.split(" ").filter(w => w.length > 3);
  words.forEach(word => {
    (cs.tags || []).forEach(t => { if (t.includes(word)) sc += 2; });
    if (cs.summary?.toLowerCase().includes(word)) sc += 1;
    allHazards.forEach(h => { if (h.toLowerCase().includes(word)) sc += 3; });
  });
  return sc;
};

const B_searchCaseStudies = (query, selectedHazards, selectedSectors, selectedRegions, selectedCosts) => {
  let results = [...B_CASE_STUDIES];
  if (selectedHazards.length > 0) results = results.filter(cs => { const allH = [...cs.hazards.cause, ...cs.hazards.effect]; return selectedHazards.some(h => allH.some(ch => ch.toLowerCase().includes(h.toLowerCase()))); });
  if (selectedSectors.length > 0) results = results.filter(cs => selectedSectors.some(s => cs.sector.toLowerCase() === s.toLowerCase()));
  if (selectedRegions.length > 0) results = results.filter(cs => selectedRegions.some(r => (cs.ukRegion || "").includes(r) || (cs.ukApplicability || []).some(a => a.toLowerCase().includes(r.toLowerCase()))));
  if (selectedCosts.length > 0) results = results.filter(cs => selectedCosts.includes(cs.costBand));
  if (query.trim()) results = results.map(cs => ({ ...cs, _score: B_scoreResult(cs, query) })).filter(cs => cs._score > 0).sort((a, b) => b._score - a._score);
  return results;
};

const B_generateSynthesis = (results, query) => {
  if (!results.length) return null;
  const allMeasures = results.flatMap(r => r.measures);
  const sectors = [...new Set(results.map(r => r.sector))];
  const highTransfer = results.filter(r => r.transferability === "High");
  const commonMeasureTypes = [];
  if (allMeasures.some(m => m.toLowerCase().includes("monitor") || m.toLowerCase().includes("sensor") || m.toLowerCase().includes("warning"))) commonMeasureTypes.push("predictive monitoring");
  if (allMeasures.some(m => m.toLowerCase().includes("barrier") || m.toLowerCase().includes("wall") || m.toLowerCase().includes("stabilisation"))) commonMeasureTypes.push("physical protection");
  if (allMeasures.some(m => m.toLowerCase().includes("nature") || m.toLowerCase().includes("vegetation") || m.toLowerCase().includes("forest"))) commonMeasureTypes.push("nature-based approaches");
  let insightSentence = results.length === 1
    ? `This case has high transferability to UK contexts. ${results[0].insight}`
    : commonMeasureTypes.length >= 2
      ? `A consistent pattern across these cases: ${commonMeasureTypes.slice(0, 2).join(" and ")} are deployed together rather than in isolation. ${highTransfer.length} of ${results.length} cases have explicitly identified UK applicability.`
      : `${highTransfer.length} of ${results.length} matching cases have high transferability to UK transport contexts. The strongest cross-cutting lesson is that proactive adaptation — integrating resilience into planned maintenance cycles — consistently delivers lower cost than reactive repair.`;
  return { count: results.length, sectors, allCause: [...new Set(results.flatMap(r => r.hazards.cause))].slice(0, 3), commonMeasures: [...new Set(allMeasures)].slice(0, 4), commonMeasureTypes, highTransferCount: highTransfer.length, insightSentence };
};

const B_TransferabilityBadge = ({ level }) => (
  <span style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,background:level==="High"?"#d1fae5":"#fef3c7",color:level==="High"?"#065f46":"#92400e" }}>
    <span style={{ width:6,height:6,borderRadius:"50%",background:level==="High"?"#059669":"#d97706",display:"inline-block" }}/>
    {level} UK transferability
  </span>
);

const B_HazardBadge = ({ hazard, type }) => {
  const causeColors = { "Heavy rainfall":["#eff6ff","#1d4ed8","#bfdbfe"], "High temperatures":["#fff7ed","#c2410c","#fed7aa"], "Storms":["#faf5ff","#7e22ce","#e9d5ff"], "Sea level rise":["#f0fdfa","#0f766e","#99f6e4"], "Drought":["#fffbeb","#b45309","#fde68a"], "Freeze-thaw":["#f0f9ff","#0369a1","#bae6fd"] };
  const [bg, col, border] = type === "cause" ? (causeColors[hazard] || ["#f9fafb","#374151","#e5e7eb"]) : ["#f9fafb","#374151","#e5e7eb"];
  return (
    <span style={{ display:"inline-flex",alignItems:"center",border:`1px solid ${border}`,borderRadius:4,fontSize:11,fontWeight:500,padding:"2px 8px",background:bg,color:col }}>
      {type==="effect"&&<span style={{ marginRight:4,opacity:0.4 }}>→</span>}
      {hazard}
    </span>
  );
};

const B_FilterPill = ({ label, selected, onClick, color }) => (
  <button onClick={onClick}
    style={{ fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:20,cursor:"pointer",transition:"all 0.15s",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",
      background: selected ? (color==='emerald'?'var(--b-accent)':color==='indigo'?'#4338ca':'var(--b-text-primary)') : 'var(--b-surface)',
      color: selected ? '#fff' : 'var(--b-text-secondary)',
      border: `1px solid ${selected ? (color==='emerald'?'var(--b-accent)':color==='indigo'?'#4338ca':'var(--b-text-primary)') : 'var(--b-border)'}` }}>
    {selected && <span style={{ marginRight:4,opacity:0.7 }}>✓</span>}
    {label}
  </button>
);

const B_MarqueeCard = ({ c, onClick, dimmed, highlighted }) => {
  const [hovered, setHovered] = useState(false);
  const secBg = { Rail:"#EBF4FF",Aviation:"#F3EEF9",Maritime:"#E6F5EE",Highways:"#FDF0E5",Energy:"#F5F0FD",Multiple:"#F5F5F4" };
  const secCol = { Rail:"#1A4A8A",Aviation:"#5B3FA0",Maritime:"#156840",Highways:"#9A4812",Energy:"#6B3FA0",Multiple:"#78716c" };
  return (
    <div onClick={() => onClick(c)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ flexShrink:0,width:280,cursor:"pointer",borderRadius:16,border:`1px solid ${highlighted?'var(--b-accent)':'var(--b-border)'}`,background:highlighted?'var(--b-accent-bg)':'var(--b-surface)',padding:"14px 16px",opacity:dimmed?0.25:1,transition:"all 0.25s",transform:hovered&&!highlighted?"translateY(-3px) scale(1.03)":highlighted?"translateY(-2px)":"none",boxShadow:hovered?"0 8px 24px rgba(0,0,0,0.12)":highlighted?"0 2px 12px rgba(0,0,0,0.10)":"none",fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8 }}>
        <h4 style={{ fontSize:13,fontWeight:600,lineHeight:1.35,color:'var(--b-text-primary)',flex:1 }}>{c.title}</h4>
        <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:`1px solid ${(secCol[c.sector]||"#78716c")}44`,background:secBg[c.sector]||"#f5f5f4",color:secCol[c.sector]||"#78716c",whiteSpace:"nowrap",flexShrink:0 }}>{c.sector}</span>
      </div>
      <p style={{ fontSize:11,color:'var(--b-text-muted)',marginBottom:6,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{c.measure}</p>
      <p style={{ fontSize:11,fontWeight:600,color:'var(--b-accent)' }}>{c.hook}</p>
    </div>
  );
};

const B_Marquee2D = ({ cases, onCardClick, matchingSectors, matchingHazards, hasFilters, gradFade }) => {
  const half = Math.ceil(cases.length / 2);
  const rowA = cases.slice(0, half), rowB = cases.slice(half);
  const isHighlighted = c => { if (!hasFilters) return false; const sm = matchingSectors.length===0||matchingSectors.includes(c.sector); const hm = matchingHazards.length===0||c.hazards.some(h=>matchingHazards.some(mh=>h.toLowerCase().includes(mh.toLowerCase()))); return sm&&hm; };
  const isDimmed = c => hasFilters && !isHighlighted(c);
  return (
    <div style={{ position:"relative",paddingTop:6,paddingBottom:6 }}>
      {[rowA,rowB].map((row,ri)=>(
        <div key={ri} style={{ overflow:"hidden",paddingTop:8,paddingBottom:8 }}
          onMouseEnter={e=>{const el=e.currentTarget.querySelector('[data-btrack]');if(el)el.style.animationPlayState='paused';}}
          onMouseLeave={e=>{const el=e.currentTarget.querySelector('[data-btrack]');if(el)el.style.animationPlayState='running';}}>
          <div data-btrack style={{ display:"flex",gap:12,width:"max-content",animation:`scrollX ${ri===0?130:155}s linear infinite ${ri===1?"reverse":""}` }}>
            {[...row,...row].map((c,i)=><B_MarqueeCard key={`b${ri}-${i}`} c={c} onClick={onCardClick} dimmed={isDimmed(c)} highlighted={isHighlighted(c)}/>)}
          </div>
        </div>
      ))}
      <div style={{ pointerEvents:"none",position:"absolute",top:0,bottom:0,left:0,width:60,background:`linear-gradient(90deg,${gradFade} 0%,transparent 100%)` }}/>
      <div style={{ pointerEvents:"none",position:"absolute",top:0,bottom:0,right:0,width:60,background:`linear-gradient(270deg,${gradFade} 0%,transparent 100%)` }}/>
    </div>
  );
};

const B_Marquee3D = ({ cases, onCardClick, matchingSectors, matchingHazards, hasFilters, gradFade }) => {
  const cols = [[],[],[],[],[],[]];
  cases.forEach((c,i)=>cols[i%6].push(c));
  const isHighlighted = c => { if (!hasFilters) return false; const sm = matchingSectors.length===0||matchingSectors.includes(c.sector); const hm = matchingHazards.length===0||c.hazards.some(h=>matchingHazards.some(mh=>h.toLowerCase().includes(mh.toLowerCase()))); return sm&&hm; };
  const isDimmed = c => hasFilters && !isHighlighted(c);
  return (
    <div style={{ position:"relative",overflow:"hidden",height:500 }}>
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",perspective:900 }}>
        <div style={{ display:"flex",gap:16,transform:"translateX(-60px) translateZ(-100px) rotateX(14deg) rotateY(-6deg) rotateZ(8deg)" }}>
          {cols.map((colCases,ci)=>(
            <div key={ci} style={{ overflow:"hidden",flexShrink:0,width:224,height:440 }}
              onMouseEnter={e=>{const el=e.currentTarget.querySelector('[data-bcol]');if(el)el.style.animationPlayState='paused';}}
              onMouseLeave={e=>{const el=e.currentTarget.querySelector('[data-bcol]');if(el)el.style.animationPlayState='running';}}>
              <div data-bcol style={{ display:"flex",flexDirection:"column",gap:12,padding:8,animation:`scrollY ${ci%2===0?30:38}s linear infinite ${ci%2===1?"reverse":""}` }}>
                {[...colCases,...colCases].map((c,i)=><B_MarqueeCard key={`bc${ci}-${i}`} c={c} onClick={onCardClick} dimmed={isDimmed(c)} highlighted={isHighlighted(c)}/>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ pointerEvents:"none",position:"absolute",top:0,left:0,right:0,height:96,background:`linear-gradient(180deg,${gradFade} 0%,transparent 100%)` }}/>
      <div style={{ pointerEvents:"none",position:"absolute",bottom:0,left:0,right:0,height:96,background:`linear-gradient(0deg,${gradFade} 0%,transparent 100%)` }}/>
    </div>
  );
};

const B_CaseStudyCard = ({ cs, onClick, matchReasons, onAddToBrief, inBrief }) => (
  <div onClick={() => onClick(cs)} style={{ background:'var(--b-surface)',border:`1px solid var(--b-border)`,borderRadius:16,padding:"20px 20px 16px",display:"flex",flexDirection:"column",cursor:"pointer",transition:"border-color 0.2s,box-shadow 0.2s",fontFamily:"'DM Sans',sans-serif" }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--b-accent)';e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)";}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b-border)';e.currentTarget.style.boxShadow="none";}}>
    <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:4 }}>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap" }}>
          <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:'var(--b-accent)' }}>{cs.sector}</span>
          <span style={{ color:'var(--b-text-muted)' }}>·</span>
          <span style={{ fontSize:11,color:'var(--b-text-secondary)' }}>{cs.location}</span>
          <span style={{ color:'var(--b-text-muted)' }}>·</span>
          <span style={{ fontSize:11,color:'var(--b-text-muted)' }}>{cs.year}</span>
        </div>
        <h3 style={{ fontSize:15,fontWeight:600,lineHeight:1.4,color:'var(--b-text-primary)' }}>{cs.title}</h3>
      </div>
    </div>
    <p style={{ fontSize:12,fontWeight:600,color:'var(--b-accent)',marginBottom:8 }}>{cs.hook}</p>
    <p style={{ fontSize:13,color:'var(--b-text-secondary)',lineHeight:1.65,marginBottom:10,flex:1,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{cs.summary}</p>
    {matchReasons&&matchReasons.length>0&&(
      <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:8 }}>
        <span style={{ fontSize:11,color:'var(--b-text-muted)' }}>Matched on:</span>
        {matchReasons.map(r=><span key={r} style={{ fontSize:11,border:`1px solid var(--b-accent)`,borderRadius:4,padding:"1px 7px",color:'var(--b-accent)',fontWeight:600,background:'var(--b-accent-bg)' }}>{r}</span>)}
      </div>
    )}
    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:10 }}>
      {cs.hazards.cause.slice(0,2).map(h=><B_HazardBadge key={h} hazard={h} type="cause"/>)}
      {cs.hazards.effect.slice(0,1).map(h=><B_HazardBadge key={h} hazard={h} type="effect"/>)}
    </div>
    <div style={{ background:'var(--b-accent-bg)',border:`1px solid var(--b-accent)`,borderRadius:10,padding:"8px 12px",marginBottom:10,opacity:0.9 }}>
      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color:'var(--b-accent)',flexShrink:0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
        <span style={{ fontSize:10,fontWeight:700,color:'var(--b-accent)',textTransform:"uppercase",letterSpacing:"0.08em" }}>UK applicability</span>
      </div>
      <p style={{ fontSize:11,color:'var(--b-text-secondary)',lineHeight:1.55 }}>{cs.transferabilityNote}</p>
    </div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:`1px solid var(--b-border)` }}>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <B_TransferabilityBadge level={cs.transferability}/>
        <span style={{ fontSize:11,color:'var(--b-text-muted)' }}>{cs.costBand}</span>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <button onClick={e=>{e.stopPropagation();onAddToBrief(cs);}} style={{ fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s",background:inBrief?'var(--b-accent)':"none",color:inBrief?"#fff":'var(--b-text-secondary)',border:`1px solid ${inBrief?'var(--b-accent)':'var(--b-border)'}` }}>
          {inBrief?"✓ In brief":"+ Add to brief"}
        </button>
        <span style={{ fontSize:12,fontWeight:600,color:'var(--b-accent)',cursor:"pointer" }}>Full case →</span>
      </div>
    </div>
  </div>
);

const B_CaseStudyDetail = ({ cs, onClose, onAddToBrief, inBrief }) => (
  <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)" }} onClick={onClose}>
    <div style={{ background:'var(--b-surface)',borderRadius:24,boxShadow:"0 20px 60px rgba(0,0,0,0.25)",maxWidth:640,width:"100%",maxHeight:"88vh",overflowY:"auto",fontFamily:"'DM Sans',sans-serif" }} onClick={e=>e.stopPropagation()}>
      <div style={{ position:"sticky",top:0,background:'var(--b-surface)',borderBottom:`1px solid var(--b-border)`,padding:"16px 24px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",borderRadius:"24px 24px 0 0" }}>
        <div style={{ flex:1,paddingRight:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4 }}>
            <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:'var(--b-accent)' }}>{cs.sector}</span>
            <span style={{ color:'var(--b-text-muted)' }}>·</span>
            <span style={{ fontSize:11,color:'var(--b-text-secondary)' }}>{cs.location}</span>
          </div>
          <h2 style={{ fontSize:20,fontWeight:400,lineHeight:1.3,color:'var(--b-text-primary)',fontFamily:"'DM Serif Display',serif" }}>{cs.title}</h2>
          <p style={{ fontSize:13,fontWeight:600,color:'var(--b-accent)',marginTop:4 }}>{cs.hook}</p>
        </div>
        <button onClick={onClose} style={{ width:32,height:32,borderRadius:"50%",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:'var(--b-surface-alt)',marginTop:4 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color:'var(--b-text-secondary)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div style={{ padding:24,display:"flex",flexDirection:"column",gap:20 }}>
        <div style={{ background:'var(--b-accent-bg)',border:`1px solid var(--b-accent)`,borderRadius:16,padding:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color:'var(--b-accent)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:'var(--b-accent)' }}>Key insight</span>
          </div>
          <p style={{ fontSize:13,lineHeight:1.65,fontWeight:500,color:'var(--b-text-primary)' }}>{cs.insight}</p>
        </div>
        <div style={{ background:'var(--b-surface-alt)',borderRadius:16,padding:16 }}>
          <p style={{ fontSize:13,lineHeight:1.65,color:'var(--b-text-secondary)' }}>{cs.summary}</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
          <div><h4 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:'var(--b-text-muted)',marginBottom:8 }}>Climate drivers</h4><div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{cs.hazards.cause.map(h=><B_HazardBadge key={h} hazard={h} type="cause"/>)}</div></div>
          <div><h4 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:'var(--b-text-muted)',marginBottom:8 }}>Impacts</h4><div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{cs.hazards.effect.map(h=><B_HazardBadge key={h} hazard={h} type="effect"/>)}</div></div>
        </div>
        <div>
          <h4 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:'var(--b-text-muted)',marginBottom:8 }}>Adaptation measures</h4>
          <ul style={{ listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:6 }}>{cs.measures.map(m=><li key={m} style={{ display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:'var(--b-text-secondary)' }}><span style={{ width:6,height:6,borderRadius:"50%",background:'var(--b-accent)',flexShrink:0,marginTop:5 }}/>{m}</li>)}</ul>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div style={{ background:'var(--b-surface-alt)',borderRadius:12,padding:12,border:`1px solid var(--b-border)` }}><h4 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:'var(--b-text-muted)',marginBottom:4 }}>Investment</h4><p style={{ fontSize:13,fontWeight:600,color:'var(--b-text-primary)' }}>{cs.cost}</p><p style={{ fontSize:11,color:'var(--b-text-muted)',marginTop:2 }}>Band: {cs.costBand}</p></div>
          <div style={{ background:'var(--b-surface-alt)',borderRadius:12,padding:12,border:`1px solid var(--b-border)` }}><h4 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:'var(--b-text-muted)',marginBottom:4 }}>Delivery period</h4><p style={{ fontSize:13,fontWeight:600,color:'var(--b-text-primary)' }}>{cs.year}</p></div>
        </div>
        <div style={{ border:`1px solid var(--b-accent)`,borderRadius:12,padding:16,background:'var(--b-accent-bg)',opacity:0.9 }}>
          <div style={{ marginBottom:8 }}><B_TransferabilityBadge level={cs.transferability}/></div>
          <p style={{ fontSize:13,lineHeight:1.65,color:'var(--b-text-secondary)',marginBottom:10 }}>{cs.transferabilityNote}</p>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{cs.ukApplicability.map(a=><span key={a} style={{ fontSize:11,background:'var(--b-surface)',border:`1px solid var(--b-accent)`,borderRadius:20,padding:"2px 10px",fontWeight:500,color:'var(--b-accent-text)' }}>{a}</span>)}</div>
        </div>
        <p style={{ fontSize:11,color:'var(--b-text-muted)',paddingTop:4,borderTop:`1px solid var(--b-border)` }}>Ref: {cs.id} · {cs.organisation} · Curated & verified by HIVE</p>
        <button onClick={()=>{onAddToBrief(cs);onClose();}} style={{ width:"100%",padding:"12px 0",borderRadius:16,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s",background:inBrief?'var(--b-surface-alt)':"var(--b-accent)",color:inBrief?'var(--b-text-muted)':"#fff",border:inBrief?`1px solid var(--b-border)`:"none" }}>
          {inBrief?"✓ Already in your AI brief":"＋ Add to AI brief"}
        </button>
      </div>
    </div>
  </div>
);

const B_SynthesisPanel = ({ synthesis }) => (
  <div style={{ borderRadius:16,border:`1px solid var(--b-accent)`,background:`linear-gradient(135deg,var(--b-accent-bg) 0%,var(--b-surface) 100%)`,padding:20,marginBottom:20,fontFamily:"'DM Sans',sans-serif" }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <div style={{ width:24,height:24,borderRadius:8,background:'var(--b-accent)',display:"flex",alignItems:"center",justifyContent:"center" }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:'var(--b-accent)' }}>Cross-case analysis</span>
        <span style={{ fontSize:11,color:'var(--b-text-muted)' }}>{synthesis.count} case {synthesis.count===1?"study":"studies"}</span>
      </div>
      <span style={{ fontSize:11,color:'var(--b-text-muted)',fontStyle:"italic" }}>Indicative — review sources directly</span>
    </div>
    <p style={{ fontSize:13,lineHeight:1.7,fontWeight:500,color:'var(--b-text-primary)',marginBottom:16 }}>{synthesis.insightSentence}</p>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
      {synthesis.allCause.length>0&&<div><span style={{ fontSize:10,color:'var(--b-text-muted)',textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:6 }}>Climate drivers</span><div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{synthesis.allCause.map(h=><B_HazardBadge key={h} hazard={h} type="cause"/>)}</div></div>}
      {synthesis.commonMeasures.length>0&&<div><span style={{ fontSize:10,color:'var(--b-text-muted)',textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:6 }}>Common measures</span><div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{synthesis.commonMeasures.slice(0,3).map(m=><span key={m} style={{ fontSize:11,background:'var(--b-surface)',border:`1px solid var(--b-border)`,color:'var(--b-text-secondary)',padding:"2px 8px",borderRadius:4 }}>{m}</span>)}</div></div>}
    </div>
    <div style={{ display:"flex",flexWrap:"wrap",alignItems:"center",gap:8 }}>
      {synthesis.sectors.map(s=><span key={s} style={{ fontSize:11,background:'var(--b-surface)',border:`1px solid var(--b-accent)`,borderRadius:20,padding:"3px 12px",fontWeight:600,color:'var(--b-accent-text)' }}>{s}</span>)}
      <span style={{ fontSize:11,color:'var(--b-text-muted)' }}>{synthesis.highTransferCount} of {synthesis.count} with high UK transferability</span>
    </div>
  </div>
);

function DirectionB() {
  const [themeKey, setThemeKey] = useState("light");
  const T = B_THEMES[themeKey];
  const [query, setQuery] = useState("");
  const [selectedHazards, setSelectedHazards] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCosts, setSelectedCosts] = useState([]);
  const [aiDetectedHazards, setAiDetectedHazards] = useState([]);
  const [aiDetectedSectors, setAiDetectedSectors] = useState([]);
  const [results, setResults] = useState(B_CASE_STUDIES);
  const [selectedCase, setSelectedCase] = useState(null);
  const [synthData, setSynthData] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeMatchReasons, setActiveMatchReasons] = useState({});
  const [marqueeView, setMarqueeView] = useState("2d");
  const [marqueeSelectedId, setMarqueeSelectedId] = useState(null);
  const [brief, setBrief] = useState([]);
  const [briefOpen, setBriefOpen] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const [scrolledToResults, setScrolledToResults] = useState(false);

  const allActiveHazards = [...new Set([...selectedHazards, ...aiDetectedHazards])];
  const allActiveSectors = [...new Set([...selectedSectors, ...aiDetectedSectors])];
  const hasActiveFilters = query || selectedHazards.length > 0 || selectedSectors.length > 0 || selectedRegions.length > 0 || selectedCosts.length > 0;
  const activeFilterCount = selectedHazards.length + selectedSectors.length + selectedRegions.length + selectedCosts.length + aiDetectedHazards.length + aiDetectedSectors.length;
  const marqueeHasFilters = allActiveHazards.length > 0 || allActiveSectors.length > 0;

  useEffect(() => {
    if (query || selectedHazards.length || selectedSectors.length || selectedRegions.length || selectedCosts.length) setMarqueeSelectedId(null);
  }, [query, selectedHazards, selectedSectors, selectedRegions, selectedCosts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) { const { detectedHazards, detectedSectors } = B_detectIntent(query); setAiDetectedHazards(detectedHazards); setAiDetectedSectors(detectedSectors); }
      else { setAiDetectedHazards([]); setAiDetectedSectors([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const r = B_searchCaseStudies(query, allActiveHazards, allActiveSectors, selectedRegions, selectedCosts);
    setResults(r);
    const reasons = {};
    r.forEach(cs => { reasons[cs.id] = B_getMatchReasons(cs, query, allActiveHazards, allActiveSectors); });
    setActiveMatchReasons(reasons);
    setSynthData(hasActiveFilters && r.length > 0 ? B_generateSynthesis(r, query) : null);
  }, [query, selectedHazards, selectedSectors, aiDetectedHazards, aiDetectedSectors, selectedRegions, selectedCosts]);

  useEffect(() => {
    if (!hasActiveFilters) { setScrolledToResults(false); return; }
    if (scrolledToResults) return;
    const timer = setTimeout(() => {
      if (resultsRef.current) { resultsRef.current.scrollIntoView({ behavior:"smooth", block:"start" }); setScrolledToResults(true); }
    }, 800);
    return () => clearTimeout(timer);
  }, [hasActiveFilters, query, selectedHazards, selectedSectors]);

  const toggle = (setter, val) => setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  const toggleBrief = cs => setBrief(prev => prev.some(x => x.id === cs.id) ? prev.filter(x => x.id !== cs.id) : [...prev, cs]);
  const removeAiHazard = h => setAiDetectedHazards(prev => prev.filter(x => x !== h));
  const removeAiSector = s => setAiDetectedSectors(prev => prev.filter(x => x !== s));
  const clearAll = () => { setQuery(""); setSelectedHazards([]); setSelectedSectors([]); setSelectedRegions([]); setSelectedCosts([]); setAiDetectedHazards([]); setAiDetectedSectors([]); setScrolledToResults(false); setMarqueeSelectedId(null); };

  const handleMarqueeCardClick = c => {
    if (c.caseStudyId) { setMarqueeSelectedId(c.caseStudyId); }
    else { setMarqueeSelectedId(`PH_${c.sector.toUpperCase()}`); }
    setQuery(""); setSelectedHazards([]); setSelectedSectors([]); setSelectedRegions([]); setSelectedCosts([]); setAiDetectedHazards([]); setAiDetectedSectors([]);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
  };

  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", transition:"background 0.4s ease" }}>
      <style>{`
        :root {
          --b-bg: ${T.bg}; --b-surface: ${T.surface}; --b-surface-alt: ${T.surfaceAlt};
          --b-border: ${T.border}; --b-border-strong: ${T.borderStrong};
          --b-text-primary: ${T.textPrimary}; --b-text-secondary: ${T.textSecondary}; --b-text-muted: ${T.textMuted};
          --b-accent: ${T.accent}; --b-accent-bg: ${T.accentBg}; --b-accent-text: ${T.accentText};
          --b-input-bg: ${T.inputBg}; --b-input-border: ${T.inputBorder}; --b-section-bg: ${T.sectionBg};
        }
        .b-input { background:var(--b-input-bg) !important; border-color:var(--b-input-border) !important; color:var(--b-text-primary) !important; }
        .b-input::placeholder { color:var(--b-text-muted) !important; }
        .b-fade-up { animation: fadeUp 0.4s ease forwards; }
        .b-fade-in { animation: fadeIn 0.25s ease forwards; }
        .b-card-enter { animation: fadeUp 0.3s ease forwards; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {themeKey==='dft'&&<div style={{ height:5,background:"#006853" }}/>}
      <nav style={{ position:"sticky",top:themeKey==='dft'?5:0,zIndex:40,background:T.navBg,backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>
            </div>
            <span style={{ fontWeight:700,fontSize:15,color:T.textPrimary }}>HIVE</span>
            <span style={{ fontSize:11,color:T.textMuted }}>Transport Climate Adaptation Intelligence</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <NavPill variant={themeKey === "dark" ? "dark" : "light"} />
            <div style={{ display:"flex",gap:2,background:T.surfaceAlt,borderRadius:20,padding:3,border:`1px solid ${T.border}` }}>
              {Object.values(B_THEMES).map(th=>(
                <button key={th.key} onClick={()=>setThemeKey(th.key)} style={{ fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:16,border:"none",cursor:"pointer",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif",background:themeKey===th.key?T.accent:"transparent",color:themeKey===th.key?"#fff":T.textSecondary }}>
                  {th.label}
                </button>
              ))}
            </div>
            <button onClick={()=>setBriefOpen(true)} style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,padding:"6px 14px",borderRadius:20,border:"none",background:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",color:brief.length>0?T.accent:T.textSecondary,fontWeight:brief.length>0?700:400 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              AI Brief
              {brief.length>0&&<span style={{ background:T.accent,color:"#fff",fontSize:10,fontWeight:700,borderRadius:10,padding:"1px 7px" }}>{brief.length}</span>}
            </button>
            <button style={{ fontSize:13,fontWeight:600,padding:"7px 16px",borderRadius:20,background:T.accent,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>DfT Partner</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"52px 24px 32px" }}>
        <div className="b-fade-up">
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:T.accentBg,borderRadius:20,padding:"6px 14px",marginBottom:20 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:11,fontWeight:700,color:T.accentText,letterSpacing:"0.1em",textTransform:"uppercase" }}>Prototype · 7 of 80+ case studies fully loaded</span>
          </div>
          <h1 style={{ fontSize:46,fontWeight:400,lineHeight:1.15,marginBottom:12,color:T.textPrimary,fontFamily:"'DM Serif Display',serif" }}>
            What risk are you <em style={{ color:T.accent }}>managing?</em>
          </h1>
          <p style={{ fontSize:15,color:T.textSecondary,lineHeight:1.7,maxWidth:560,marginBottom:28 }}>Describe your infrastructure challenge in plain English. HIVE surfaces proven adaptations, comparable case studies, and structured evidence you can use immediately.</p>
        </div>

        <div className="b-fade-up" style={{ maxWidth:700,position:"relative",marginBottom:8 }}>
          <div style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:T.textMuted }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="e.g. flooding on a rail corridor, heatwave on road bridges, coastal port storm surge..."
            className="b-input"
            style={{ width:"100%",paddingLeft:44,paddingRight:40,paddingTop:15,paddingBottom:15,fontSize:15,borderRadius:16,border:`1.5px solid ${query?T.accent:T.inputBorder}`,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",transition:"border-color 0.2s",boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}/>
          {query&&<button onClick={()=>setQuery("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textMuted }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>}
        </div>
        {!query&&<p style={{ fontSize:12,marginBottom:16,fontStyle:"italic",color:T.textMuted }}>Describe your challenge — location, asset type, climate risk</p>}

        <div style={{ maxWidth:700,marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
            <p style={{ fontSize:11,color:T.textMuted }}>Search describes your situation. Filters narrow by category. Both work together.</p>
            <button onClick={()=>setFiltersOpen(!filtersOpen)} style={{ fontSize:11,fontWeight:600,color:T.accent,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontFamily:"'DM Sans',sans-serif" }}>
              {filtersOpen?"Hide filters":"Show filters"}
              {activeFilterCount>0&&<span style={{ background:T.accent,color:"#fff",fontSize:10,fontWeight:700,borderRadius:10,padding:"1px 7px" }}>{activeFilterCount}</span>}
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ transform:filtersOpen?"rotate(180deg)":"none",transition:"transform 0.2s" }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
          </div>
          {filtersOpen&&(
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                  <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.textSecondary }}>Climate driver</span>
                  {selectedHazards.length>0&&<span style={{ fontSize:10,background:T.accent,color:"#fff",borderRadius:10,padding:"1px 7px",fontWeight:700 }}>{selectedHazards.length}</span>}
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{B_HAZARDS_CAUSE.map(h=><B_FilterPill key={h} label={h} selected={selectedHazards.includes(h)} onClick={()=>toggle(setSelectedHazards,h)} color="emerald"/>)}</div>
              </div>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                  <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.textSecondary }}>Transport sector</span>
                  {selectedSectors.length>0&&<span style={{ fontSize:10,background:T.textPrimary,color:T.surface,borderRadius:10,padding:"1px 7px",fontWeight:700 }}>{selectedSectors.length}</span>}
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{SECTORS.map(s=><B_FilterPill key={s} label={s} selected={selectedSectors.includes(s)} onClick={()=>toggle(setSelectedSectors,s)} color="stone"/>)}</div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:10,paddingTop:8,borderTop:`1px solid ${T.border}` }}>
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                    <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.textSecondary }}>UK geography</span>
                    {selectedRegions.length>0&&<span style={{ fontSize:10,background:"#4338ca",color:"#fff",borderRadius:10,padding:"1px 7px",fontWeight:700 }}>{selectedRegions.length}</span>}
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{B_UK_REGIONS.map(r=><B_FilterPill key={r} label={r} selected={selectedRegions.includes(r)} onClick={()=>toggle(setSelectedRegions,r)} color="indigo"/>)}</div>
                </div>
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                    <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.textSecondary }}>Cost band</span>
                    {selectedCosts.length>0&&<span style={{ fontSize:10,background:T.textPrimary,color:T.surface,borderRadius:10,padding:"1px 7px",fontWeight:700 }}>{selectedCosts.length}</span>}
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{B_COST_BANDS.map(c=><B_FilterPill key={c} label={c} selected={selectedCosts.includes(c)} onClick={()=>toggle(setSelectedCosts,c)} color="stone"/>)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {(aiDetectedHazards.filter(h=>!selectedHazards.includes(h)).length>0||aiDetectedSectors.filter(s=>!selectedSectors.includes(s)).length>0)&&(
          <div className="b-fade-in" style={{ maxWidth:700,marginBottom:16 }}>
            <div style={{ display:"flex",flexWrap:"wrap",alignItems:"center",gap:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,color:T.accent,fontWeight:600 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Detected from your search:
              </div>
              {aiDetectedHazards.filter(h=>!selectedHazards.includes(h)).map(h=>(
                <span key={h} style={{ display:"inline-flex",alignItems:"center",gap:6,background:T.accentBg,border:`1px solid ${T.accent}`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600,color:T.accentText }}>
                  {h}<button onClick={()=>removeAiHazard(h)} style={{ background:"none",border:"none",cursor:"pointer",color:T.accent,padding:0,lineHeight:1,fontSize:14 }}>×</button>
                </span>
              ))}
              {aiDetectedSectors.filter(s=>!selectedSectors.includes(s)).map(s=>(
                <span key={s} style={{ display:"inline-flex",alignItems:"center",gap:6,background:T.accentBg,border:`1px solid ${T.accent}`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600,color:T.accentText }}>
                  {s}<button onClick={()=>removeAiSector(s)} style={{ background:"none",border:"none",cursor:"pointer",color:T.accent,padding:0,lineHeight:1,fontSize:14 }}>×</button>
                </span>
              ))}
              <span style={{ fontSize:11,color:T.textMuted }}>— remove any that don't apply</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop:`1px solid ${T.border}`,paddingTop:24,paddingBottom:8 }}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <div>
            <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.textMuted }}>From the knowledge base</p>
            <p style={{ fontSize:13,marginTop:2,color:T.textSecondary }}>
              {marqueeHasFilters ? `Showing ${allActiveSectors.length>0?allActiveSectors.join(", "):"matching"} cases — click any to view` : "50 curated case studies — click any card to explore"}
            </p>
          </div>
          <div style={{ display:"flex",gap:2,background:T.surfaceAlt,borderRadius:20,padding:3,border:`1px solid ${T.border}` }}>
            {["2d","3d"].map(v=><button key={v} onClick={()=>setMarqueeView(v)} style={{ fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:16,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",transition:"all 0.2s",background:marqueeView===v?T.textPrimary:"transparent",color:marqueeView===v?T.surface:T.textSecondary }}>{v}</button>)}
          </div>
        </div>
        {marqueeView==="2d"
          ?<B_Marquee2D cases={B_MARQUEE_CASES} onCardClick={handleMarqueeCardClick} matchingSectors={allActiveSectors} matchingHazards={allActiveHazards} hasFilters={marqueeHasFilters} gradFade={T.gradFade}/>
          :<B_Marquee3D cases={B_MARQUEE_CASES} onCardClick={handleMarqueeCardClick} matchingSectors={allActiveSectors} matchingHazards={allActiveHazards} hasFilters={marqueeHasFilters} gradFade={T.gradFade}/>
        }
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 24px",marginTop:12 }}>
          <p style={{ fontSize:11,textAlign:"center",color:T.textMuted }}>Hover to pause · Click any card to view case study · Search above to find specific cases</p>
        </div>
      </div>

      <div ref={resultsRef}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 24px 80px" }}>
          {marqueeSelectedId&&!hasActiveFilters&&(()=>{
            const cs = B_CASE_STUDIES.find(c=>c.id===marqueeSelectedId);
            const ph = !cs&&Object.values(B_PLACEHOLDER_CASES).find(p=>p.id===marqueeSelectedId);
            const display = cs||ph;
            if (!display) return null;
            return (
              <div className="b-fade-in">
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingTop:8 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <span style={{ fontSize:13,fontWeight:600,color:T.textSecondary }}>{cs?"1 case study":"Case study being curated"}</span>
                    <button onClick={clearAll} style={{ fontSize:11,color:T.textMuted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif" }}>Clear</button>
                  </div>
                  <span style={{ fontSize:11,color:T.textMuted,fontStyle:"italic" }}>Selected from marquee</span>
                </div>
                {cs?(
                  <div style={{ maxWidth:520 }}>
                    <B_CaseStudyCard cs={cs} onClick={setSelectedCase} matchReasons={[]} onAddToBrief={toggleBrief} inBrief={brief.some(b=>b.id===cs.id)}/>
                  </div>
                ):(
                  <div style={{ maxWidth:520,borderRadius:16,border:`2px dashed ${T.border}`,background:T.surfaceAlt,padding:24 }}>
                    <h3 style={{ fontSize:15,fontWeight:600,color:T.textSecondary,marginBottom:8 }}>{display.title}</h3>
                    <p style={{ fontSize:13,color:T.textMuted,lineHeight:1.65 }}>{display.summary}</p>
                    <p style={{ fontSize:11,color:T.textMuted,fontStyle:"italic",marginTop:8 }}>Search above to find related cases already in the database.</p>
                  </div>
                )}
              </div>
            );
          })()}

          {hasActiveFilters&&(
            <>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingTop:8 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <span style={{ fontSize:13,fontWeight:600,color:T.textSecondary }}>{results.length} case {results.length===1?"study":"studies"} matched</span>
                  <button onClick={clearAll} style={{ fontSize:11,color:T.textMuted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif" }}>Clear all</button>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,color:T.textMuted }}>
                  <span style={{ width:8,height:8,borderRadius:"50%",background:T.accent,display:"inline-block" }}/>
                  Curated & verified by HIVE
                </div>
              </div>
              {synthData&&<div className="b-fade-in"><B_SynthesisPanel synthesis={synthData}/></div>}
              {results.length>0?(
                <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16 }}>
                  {results.map((cs,i)=>(
                    <div key={cs.id} className="b-card-enter" style={{ animationDelay:`${i*0.04}s` }}>
                      <B_CaseStudyCard cs={cs} onClick={setSelectedCase} matchReasons={activeMatchReasons[cs.id]} onAddToBrief={toggleBrief} inBrief={brief.some(b=>b.id===cs.id)}/>
                    </div>
                  ))}
                </div>
              ):(
                <div style={{ textAlign:"center",padding:"80px 0" }}>
                  <div style={{ width:48,height:48,borderRadius:16,background:T.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color:T.textMuted }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <h3 style={{ fontSize:15,fontWeight:600,color:T.textSecondary,marginBottom:6 }}>No case studies found</h3>
                  <p style={{ fontSize:13,color:T.textMuted,marginBottom:16 }}>Try fewer filters or broader search terms</p>
                  <button onClick={clearAll} style={{ fontSize:13,color:T.accent,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif" }}>Browse all case studies</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!hasActiveFilters&&(
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 24px 80px" }}>
          <div style={{ marginTop:8,paddingTop:32,borderTop:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24 }}>
            {[["50","Case Studies","in this prototype"],["4","Transport Sectors","rail · aviation · maritime · highways"],["12","Climate Hazards","first and second order"],["8","UK Regions","with geography-specific notes"]].map(([v,l,s])=>(
              <div key={l}>
                <div style={{ fontSize:28,fontWeight:600,color:T.textPrimary,fontFamily:"'DM Serif Display',serif" }}>{v}</div>
                <div style={{ fontSize:12,fontWeight:600,color:T.textSecondary,marginTop:2 }}>{l}</div>
                <div style={{ fontSize:11,color:T.textMuted,marginTop:2 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCase&&<B_CaseStudyDetail cs={selectedCase} onClose={()=>setSelectedCase(null)} onAddToBrief={toggleBrief} inBrief={brief.some(b=>b.id===selectedCase.id)}/>}

      {briefOpen&&(
        <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"flex-end",padding:16,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(8px)" }} onClick={()=>setBriefOpen(false)}>
          <div style={{ background:T.surface,borderRadius:24,boxShadow:"0 20px 60px rgba(0,0,0,0.25)",width:"100%",maxWidth:420,maxHeight:"85vh",overflowY:"auto",fontFamily:"'DM Sans',sans-serif" }} onClick={e=>e.stopPropagation()}>
            <div style={{ position:"sticky",top:0,background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"24px 24px 0 0" }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:20,height:20,borderRadius:6,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <span style={{ fontSize:14,fontWeight:700,color:T.textPrimary }}>AI Brief</span>
                  <span style={{ fontSize:11,fontWeight:700,background:T.accentBg,color:T.accentText,borderRadius:12,padding:"2px 10px" }}>{brief.length} cases</span>
                </div>
                <p style={{ fontSize:11,color:T.textMuted,marginTop:2 }}>Cases collected for synthesis</p>
              </div>
              <button onClick={()=>setBriefOpen(false)} style={{ width:32,height:32,borderRadius:"50%",background:T.surfaceAlt,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color:T.textSecondary }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding:20 }}>
              {brief.length===0?(
                <div style={{ textAlign:"center",padding:"48px 0" }}>
                  <div style={{ width:40,height:40,borderRadius:16,background:T.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color:T.textMuted }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <p style={{ fontSize:13,color:T.textSecondary,marginBottom:4 }}>No cases added yet</p>
                  <p style={{ fontSize:11,color:T.textMuted }}>Add cases from search results using "+ Add to brief"</p>
                </div>
              ):(
                <div style={{ marginBottom:16,display:"flex",flexDirection:"column",gap:8 }}>
                  {brief.map(cs=>(
                    <div key={cs.id} style={{ display:"flex",alignItems:"flex-start",gap:12,padding:12,borderRadius:14,border:`1px solid ${T.border}`,background:T.surfaceAlt }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.accent }}>{cs.sector}</span>
                        <p style={{ fontSize:13,fontWeight:600,color:T.textPrimary,marginTop:2,lineHeight:1.35 }}>{cs.title}</p>
                        <p style={{ fontSize:11,color:T.accent,marginTop:2,fontWeight:600 }}>{cs.hook}</p>
                      </div>
                      <button onClick={()=>toggleBrief(cs)} style={{ background:"none",border:"none",cursor:"pointer",color:T.textMuted,flexShrink:0 }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {brief.length>=2&&(
                <div style={{ borderTop:`1px solid ${T.border}`,paddingTop:16 }}>
                  <div style={{ background:T.accentBg,border:`1px solid ${T.accent}`,borderRadius:16,padding:16,marginBottom:12 }}>
                    <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.accentText,marginBottom:8 }}>Pattern across {brief.length} cases</p>
                    <p style={{ fontSize:13,color:T.textPrimary,lineHeight:1.6 }}>
                      {brief.filter(c=>c.transferability==="High").length} of {brief.length} cases have high UK transferability. Common sectors: {[...new Set(brief.map(c=>c.sector))].join(", ")}. These cases collectively demonstrate that proactive climate adaptation — integrated into planned maintenance — delivers better value than reactive repair.
                    </p>
                  </div>
                  <button style={{ width:"100%",padding:"12px 0",borderRadius:16,background:T.accent,color:"#fff",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    Generate full AI brief
                    <span style={{ fontSize:12,opacity:0.7,fontWeight:400 }}>— coming in full platform</span>
                  </button>
                </div>
              )}
              {brief.length===1&&<p style={{ fontSize:11,color:T.textMuted,textAlign:"center",marginTop:8 }}>Add one more case to enable cross-case analysis</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── C: TERRAIN (Dark + Teal) ──────────────────────────────────────────────────

function DirectionC() {
  const [mode,setMode]=useState("All"); const [q,setQ]=useState(""); const [hov,setHov]=useState(null);
  const filtered=CS.filter(c=>(mode==="All"||c.sector===mode)&&(q===""||c.title.toLowerCase().includes(q.toLowerCase())||c.summary.toLowerCase().includes(q.toLowerCase())));
  const C={ bg:"#07101A",panel:"#0C1B28",raised:"#112233",teal:"#00D4AA",tealDim:"rgba(0,212,170,0.12)",tealBorder:"rgba(0,212,170,0.22)",text:"#DCE8F0",textMid:"#6E90A8",textDim:"#324D61" };
  const mCol={ Rail:"#5BC8F5",Aviation:"#C39BF5",Maritime:"#00D4AA",Highways:"#F5B043" };
  return (
    <div style={{ background:C.bg,color:C.text,minHeight:"100vh",fontFamily:"'Fira Sans',sans-serif",position:"relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@700;800;900&family=Fira+Sans:wght@300;400;500;600&display=swap');`}</style>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,212,170,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,0.025) 1px,transparent 1px)",backgroundSize:"56px 56px",zIndex:0 }}/>
      <div style={{ position:"relative",zIndex:1 }}>
        <nav style={{ borderBottom:`1px solid ${C.tealBorder}`,padding:"16px 52px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <span style={{ fontFamily:"'Epilogue',sans-serif",fontSize:22,fontWeight:900,letterSpacing:"-0.03em",color:C.teal,textShadow:"0 0 24px rgba(0,212,170,0.45)" }}>HIVE</span>
            <div style={{ width:1,height:16,background:C.tealBorder }}/>
            <span style={{ fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:C.textMid }}>Transport Intelligence Platform</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <NavPill variant="dark" />
            {Object.entries(mCol).map(([m,col])=><span key={m} style={{ fontSize:11,padding:"4px 12px",borderRadius:20,border:`1px solid ${col}44`,color:col,cursor:"pointer" }}>{m}</span>)}
          </div>
        </nav>
        <div style={{ padding:"76px 52px 56px",textAlign:"center",maxWidth:820,margin:"0 auto" }}>
          <div style={{ fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",color:C.teal,marginBottom:20,fontWeight:600 }}>DfT Climate Adaptation Handbook — v3.0</div>
          <h1 style={{ fontFamily:"'Epilogue',sans-serif",fontSize:58,fontWeight:900,letterSpacing:"-0.03em",lineHeight:1.0,marginBottom:22,background:`linear-gradient(140deg,${C.text} 30%,${C.teal} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Navigate the<br/>evidence landscape</h1>
          <p style={{ fontSize:17,color:C.textMid,lineHeight:1.65,maxWidth:520,margin:"0 auto 52px" }}>109 transport case studies. AI-assisted synthesis. Structured briefings for climate adaptation decisions.</p>
          <div style={{ maxWidth:640,margin:"0 auto",background:C.panel,border:`1px solid ${q.length>2?C.teal:C.tealBorder}`,borderRadius:14,display:"flex",alignItems:"center",transition:"border-color 0.3s,box-shadow 0.3s",boxShadow:q.length>2?"0 0 32px rgba(0,212,170,0.18)":"0 6px 40px rgba(0,0,0,0.5)" }}>
            <span style={{ padding:"0 18px",color:C.teal,fontSize:20 }}>⌕</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask about any transport climate challenge..." style={{ flex:1,background:"none",border:"none",outline:"none",fontSize:16,color:C.text,padding:"18px 0",fontFamily:"'Fira Sans',sans-serif" }}/>
            {q&&<button style={{ background:C.teal,color:C.bg,border:"none",margin:7,borderRadius:9,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Epilogue',sans-serif" }}>Search</button>}
          </div>
          {q.length>2&&<div style={{ maxWidth:640,margin:"10px auto 0",background:C.raised,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ fontSize:13,color:C.textMid }}><span style={{ color:C.teal,fontWeight:700 }}>{filtered.length} results</span> — {[...new Set(filtered.map(c=>c.sector))].join(", ")}</div>
            <button style={{ background:"none",border:`1px solid ${C.teal}`,color:C.teal,borderRadius:7,padding:"6px 16px",fontSize:12,cursor:"pointer",fontFamily:"'Epilogue',sans-serif",fontWeight:700 }}>Synthesise →</button>
          </div>}
        </div>
        <div style={{ display:"flex",justifyContent:"center",gap:8,padding:"0 52px 36px",flexWrap:"wrap" }}>
          {["All",...SECTORS].map(m=><button key={m} onClick={()=>setMode(m)} style={{ background:mode===m?C.tealDim:"none",border:`1px solid ${mode===m?C.teal:C.tealBorder}`,color:mode===m?C.teal:C.textMid,borderRadius:9,padding:"9px 20px",fontSize:13,cursor:"pointer",fontFamily:"'Epilogue',sans-serif",fontWeight:700,transition:"all 0.2s" }}>{m==="All"?"All Modes":m}</button>)}
        </div>
        <div style={{ maxWidth:1180,margin:"0 auto",padding:"0 52px 140px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {filtered.map(c=>(
            <div key={c.id} onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)}
              style={{ background:hov===c.id?C.raised:C.panel,border:`1px solid ${hov===c.id?(mCol[c.sector]+"88"):C.tealBorder}`,borderRadius:14,padding:"26px",cursor:"pointer",transition:"all 0.25s",transform:hov===c.id?"translateY(-3px)":"none",boxShadow:hov===c.id?"0 8px 40px rgba(0,0,0,0.35)":"none" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}>
                <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:mCol[c.sector],fontFamily:"'Epilogue',sans-serif" }}>{c.sector}</span>
                <span style={{ fontSize:10,color:C.textDim }}>{c.year?.split("–")[0]}</span>
              </div>
              <h3 style={{ fontFamily:"'Epilogue',sans-serif",fontSize:15,fontWeight:800,lineHeight:1.32,marginBottom:10 }}>{c.title}</h3>
              <p style={{ fontSize:12,fontWeight:600,color:C.teal,marginBottom:10 }}>{c.hook}</p>
              <p style={{ fontSize:13,color:C.textMid,lineHeight:1.65 }}>{c.summary}</p>
              <div style={{ marginTop:18,display:"flex",gap:6,flexWrap:"wrap" }}>
                {c.hazards.cause.slice(0,2).map(h=><span key={h} style={{ fontSize:10,padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,0.04)",color:C.textMid,border:"1px solid rgba(255,255,255,0.07)" }}>{h}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── D: FIELD (Forest + White) ─────────────────────────────────────────────────

function DirectionD() {
  const [mode,setMode]=useState("All"); const [q,setQ]=useState(""); const [focused,setFocused]=useState(false);
  const filtered=CS.filter(c=>(mode==="All"||c.sector===mode)&&(q===""||c.title.toLowerCase().includes(q.toLowerCase())||c.summary.toLowerCase().includes(q.toLowerCase())));
  const F={ bg:"#F6F8F6",white:"#FFFFFF",forest:"#0D2718",green:"#1A7A45",greenLight:"#EBF5EF",border:"#CFD9D3",text:"#182820",textMid:"#4A6352",textDim:"#8FA699",accent:"#0B4D2C" };
  const chips={ Rail:["#E8F2FB","#1A4A8A"],Aviation:["#F3EEF9","#5B3FA0"],Maritime:["#E6F5EE","#156840"],Highways:["#FDF0E5","#9A4812"] };
  return (
    <div style={{ background:F.bg,color:F.text,minHeight:"100vh",fontFamily:"'Source Sans 3',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Source+Sans+3:wght@300;400;600;700&display=swap');`}</style>
      <nav style={{ background:F.forest,padding:"0 44px",height:54,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ display:"flex",alignItems:"center",gap:36 }}>
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,letterSpacing:"0.06em",color:"#FFF" }}>HIVE</span>
          <NavPill variant="dark" />
          {["Handbook","Roadmap","About"].map(l=><span key={l} style={{ fontSize:13,color:"rgba(255,255,255,0.55)",cursor:"pointer",marginLeft:24 }}>{l}</span>)}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#2ECC71" }}/>
          <span style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>109 case studies · Last updated March 2026</span>
        </div>
      </nav>
      <div style={{ background:F.forest,padding:"52px 44px 64px" }}>
        <div style={{ maxWidth:700,margin:"0 auto",textAlign:"center" }}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#2ECC71",marginBottom:14 }}>DfT Climate Adaptation Handbook</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:44,fontWeight:800,color:"#FFF",letterSpacing:"-0.025em",lineHeight:1.08,marginBottom:14 }}>Find the evidence.<br/>Brief the decision.</h1>
          <p style={{ fontSize:16,color:"rgba(255,255,255,0.5)",marginBottom:38,lineHeight:1.65 }}>Search 109 case studies across rail, aviation, maritime and highways infrastructure.</p>
          <div style={{ background:"#FFF",borderRadius:10,display:"flex",alignItems:"center",border:`2px solid ${focused?F.green:"transparent"}`,transition:"border-color 0.2s",boxShadow:"0 6px 32px rgba(0,0,0,0.35)" }}>
            <span style={{ padding:"0 18px",color:F.textMid,fontSize:20 }}>⌕</span>
            <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder="Search case studies..." style={{ flex:1,background:"none",border:"none",outline:"none",fontSize:15,color:F.text,padding:"15px 0",fontFamily:"'Source Sans 3',sans-serif" }}/>
          </div>
          <div style={{ display:"flex",justifyContent:"center",gap:8,marginTop:20,flexWrap:"wrap" }}>
            {["Flooding","Rail heatwave","Sea level rise","SuDS","Monitoring"].map(qt=>(
              <button key={qt} onClick={()=>setQ(qt)} style={{ background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>{qt}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background:F.white,borderBottom:`1px solid ${F.border}`,padding:"0 44px" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center" }}>
          {["All",...SECTORS].map(m=><button key={m} onClick={()=>setMode(m)} style={{ background:"none",border:"none",cursor:"pointer",padding:"13px 18px",fontSize:13,fontWeight:700,color:mode===m?F.green:F.textMid,borderBottom:`2px solid ${mode===m?F.green:"transparent"}`,fontFamily:"'Syne',sans-serif",transition:"color 0.15s" }}>{m==="All"?"All":m}</button>)}
          <span style={{ marginLeft:"auto",fontSize:12,color:F.textDim }}>{filtered.length} results</span>
        </div>
      </div>
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"32px 44px 140px" }}>
        {q.length>2&&<div style={{ background:F.greenLight,border:`1px solid ${F.border}`,borderLeft:`4px solid ${F.green}`,borderRadius:8,padding:"14px 20px",marginBottom:24,display:"flex",gap:14,alignItems:"center" }}>
          <span style={{ fontSize:20 }}>✦</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13,fontWeight:700,color:F.accent,fontFamily:"'Syne',sans-serif",marginBottom:3 }}>AI Synthesis available</div>
            <div style={{ fontSize:13,color:F.textMid }}>{filtered.length} case studies found. Generate a structured brief.</div>
          </div>
          <button style={{ flexShrink:0,background:F.green,color:"#FFF",border:"none",borderRadius:7,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>Generate brief</button>
        </div>}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {filtered.map(c=>(
            <div key={c.id} style={{ background:F.white,border:`1px solid ${F.border}`,borderRadius:10,padding:"22px 22px 18px",cursor:"pointer",transition:"box-shadow 0.2s,border-color 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 24px rgba(13,39,24,0.1)";e.currentTarget.style.borderColor=F.green;}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=F.border;}}>
              <div style={{ display:"flex",gap:6,marginBottom:12 }}>
                {chips[c.sector]&&<span style={{ background:chips[c.sector][0],color:chips[c.sector][1],fontSize:11,fontWeight:700,borderRadius:4,padding:"3px 9px",fontFamily:"'Syne',sans-serif" }}>{c.sector}</span>}
              </div>
              <h3 style={{ fontSize:14,fontWeight:700,lineHeight:1.4,marginBottom:9,fontFamily:"'Syne',sans-serif" }}>{c.title}</h3>
              <p style={{ fontSize:12,fontWeight:600,color:F.green,marginBottom:8 }}>{c.hook}</p>
              <p style={{ fontSize:13,color:F.textMid,lineHeight:1.65 }}>{c.summary}</p>
              <div style={{ marginTop:16,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:11,color:F.textDim }}>{c.location} · {c.year?.split("–")[0]}</span>
                <span style={{ fontSize:12,color:F.green,fontWeight:700,cursor:"pointer" }}>View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SWITCHER ──────────────────────────────────────────────────────────────────

const LABELS = {
  A:{ label:"A — Signal",    sub:"Editorial · Navy + Gold",    rec:true  },
  B:{ label:"B — Prototype", sub:"Full working prototype",     rec:true  },
  C:{ label:"C — Terrain",   sub:"Superseded",                 rec:false },
  D:{ label:"D — Field",     sub:"Superseded",                 rec:false },
};

export default function HIVEDesignReview() {
  const [dir, setDir] = useState("B");
  const views = { A:DirectionA, B:DirectionB, C:DirectionC, D:DirectionD };
  const Active = views[dir];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');
        .hive-root *{box-sizing:border-box;margin:0;padding:0;}
        .hive-root input{font-family:inherit}
        .hive-root .line-clamp-1{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
        .hive-root .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        @keyframes scrollX{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scrollY{from{transform:translateY(0)}to{transform:translateY(-50%)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>
      <div className="hive-root" style={{ paddingBottom:72 }}>
        <Active/>
      </div>
      <div style={{ position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:"rgba(5,8,15,0.96)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"8px 10px",display:"flex",gap:4,boxShadow:"0 12px 48px rgba(0,0,0,0.5)",alignItems:"center" }}>
        {Object.entries(LABELS).map(([k,v],i)=>(
          <div key={k} style={{ display:"flex",alignItems:"center",gap:4 }}>
            {i===2&&<div style={{ width:1,height:28,background:"rgba(255,255,255,0.1)",marginRight:4 }}/>}
            <button type="button" onClick={()=>setDir(k)}
              style={{ background:dir===k?"rgba(255,255,255,0.12)":"none",border:`1px solid ${dir===k?"rgba(255,255,255,0.22)":"transparent"}`,borderRadius:10,padding:"7px 13px",cursor:"pointer",color:dir===k?"#fff":v.rec?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.35)",transition:"all 0.2s",textAlign:"left",fontFamily:"system-ui" }}>
              <div style={{ fontSize:11,fontWeight:700,whiteSpace:"nowrap",textDecoration:v.rec?"none":"line-through",opacity:v.rec?1:0.7 }}>
                {v.label}
              </div>
              <div style={{ fontSize:10,marginTop:1,whiteSpace:"nowrap",color:v.rec?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.2)" }}>{v.sub}</div>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}