import { useState, useEffect, useRef } from "react";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#f8f7f4", surface:"#ffffff", surfaceAlt:"#f3f1ec",
  border:"#e4e0d8", text:"#1a1814", textSec:"#5a5650", textMuted:"#9a948a",
  accent:"#1d70b8", accentLight:"#e8f1fb", accentMid:"#b3d4ef",
  green:"#006853", greenLight:"#e6f4f1", greenMid:"#a7d8d0",
  amber:"#b45309", amberLight:"#fef3c7",
  navBg:"rgba(248,247,244,0.97)",
};

const FONT = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#e4e0d8;border-radius:2px}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes dotBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
  .msg{animation:slideUp 0.2s ease forwards}
`;

const CARDS = [
  {id:"ID_40",title:"Sheffield Grey to Green",sector:"Highways",location:"Sheffield, UK",hazards:["Flooding","Heavy rainfall"],transfer:"High"},
  {id:"ID_19",title:"Phoenix Cool Pavement",sector:"Highways",location:"Phoenix, USA",hazards:["Heat","UHI"],transfer:"Medium"},
  {id:"ID_32",title:"Heathrow Balancing Ponds",sector:"Aviation",location:"London, UK",hazards:["Flooding","Drought"],transfer:"High"},
  {id:"ID_22",title:"W. Sydney Cool Roads",sector:"Highways",location:"Sydney, AU",hazards:["Heat","UHI"],transfer:"Low"},
  {id:"ID_07",title:"Deutsche Bahn Slope Stability",sector:"Rail",location:"Germany",hazards:["Landslides","Rainfall"],transfer:"High"},
  {id:"ID_15",title:"Rotterdam Climate Dock",sector:"Maritime",location:"Netherlands",hazards:["Sea level rise","Storms"],transfer:"Medium"},
];

const AI_TURNS = [
  {text:"The HIVE knowledge base has strong evidence for flooding adaptation on urban transport corridors. Sheffield Grey to Green reduced river discharge from a 1-in-100-year event by 87% using SuDS alongside a city-centre rail and tram network. Heathrow's balancing ponds demonstrate complementary dual-resilience — addressing both flooding and drought.",chips:["ID_40","ID_32"],gap:null,actions:[{label:"Add both to Brief",primary:true},{label:"Tell me about costs"}]},
  {text:"Cost data: Sheffield ran £3.6m–£6.3m per phase (ERDF + local authority funded). Heathrow's retaining walls cost ~£2.1m but adaptation was integrated into planned business development — making the marginal climate cost minimal. Both report significant avoided costs that weren't formally quantified.",chips:["ID_40","ID_32"],gap:"Cost data is indicative. Original years/currencies apply — not inflation-adjusted.",actions:[{label:"What about UK transferability?"},{label:"Generate cost benchmark",demo:true}]},
  {text:"UK transferability: Sheffield and Heathrow are both rated High — UK cases with direct applicability. Phoenix Cool Pavements is rated Medium — applicable to UK urban streets ≤25mph including depot roads and urban bus corridors, less applicable to A-roads.",chips:["ID_40","ID_32","ID_19"],gap:null,actions:[{label:"Build a brief from these 3 cases",primary:true},{label:"Run Applicability Scan",demo:true}]},
];

// ── SHARED ATOMS ──────────────────────────────────────────────────────────────
function Chip({id}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,background:T.accentLight,color:T.accent,border:`1px solid ${T.accentMid}`,cursor:"pointer",whiteSpace:"nowrap"}}>{id} ↗</span>;
}

function TypingDots(){
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px"}}>
      {[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:T.textMuted,display:"inline-block",animation:`dotBounce 1.2s ease ${i*0.15}s infinite`}}/>)}
      <span style={{fontSize:11,color:T.textMuted,marginLeft:2}}>Searching…</span>
    </div>
  );
}

function CardGrid({highlighted=[]}){
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      {CARDS.map(c=>{
        const hi=highlighted.includes(c.id), dim=highlighted.length>0&&!hi;
        return (
          <div key={c.id} style={{background:hi?T.accentLight:T.surface,border:`1.5px solid ${hi?T.accent:T.border}`,borderTop:`3px solid ${hi?T.accent:"transparent"}`,borderRadius:8,padding:"12px 14px",opacity:dim?0.4:1,transition:"all 0.25s"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:10,fontWeight:700,color:hi?T.accent:T.textMuted,letterSpacing:"0.06em"}}>{c.id}</span>
              <span style={{fontSize:10,fontWeight:700,padding:"2px 5px",borderRadius:3,background:c.transfer==="High"?T.greenLight:c.transfer==="Medium"?T.amberLight:T.surfaceAlt,color:c.transfer==="High"?T.green:c.transfer==="Medium"?T.amber:T.textMuted}}>{c.transfer}</span>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:2}}>{c.title}</div>
            <div style={{fontSize:11,color:T.textSec,marginBottom:6}}>{c.location}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{c.hazards.map(h=><span key={h} style={{fontSize:9,fontWeight:600,padding:"2px 5px",borderRadius:3,background:T.amberLight,color:T.amber}}>{h}</span>)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── SHARED CHAT COMPONENT — same in both B and D ──────────────────────────────
// context = "search" | "brief"
function ChatPanel({context="search", onHighlight, onClose, compact=false}){
  const [messages,setMessages]=useState([
    context==="search"
      ? {role:"ai",text:"What are you trying to find? I can search across 109 curated case studies.",chips:[],gap:null}
      : {role:"ai",text:"I can help you interrogate this brief — explain patterns, identify gaps, or suggest cases to add.",chips:[],gap:null}
  ]);
  const [input,setInput]=useState("");
  const [thinking,setThinking]=useState(false);
  const turnRef=useRef(0);
  const bottomRef=useRef(null);

  const STARTERS = context==="search"
    ? ["Flooding on rail corridors","Urban heat — what works?","High UK transferability cases"]
    : ["What am I missing?","Reframe for a rail audience","Add coastal flooding cases","What's the confidence level?"];

  const send=(text)=>{
    const q=text||input; if(!q.trim())return;
    setInput("");
    setMessages(m=>[...m,{role:"user",text:q}]);
    setThinking(true);
    setTimeout(()=>{
      const r=AI_TURNS[turnRef.current%AI_TURNS.length]; turnRef.current++;
      setMessages(m=>[...m,{role:"ai",text:r.text,chips:r.chips,gap:r.gap,actions:r.actions}]);
      onHighlight?.(r.chips||[]);
      setThinking(false);
    },1500);
  };

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[messages,thinking]);

  const fs=compact?12:13;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:compact?"12px 14px":"14px 20px"}}>
        {messages.map((msg,i)=>(
          <div key={i} className="msg" style={{marginBottom:compact?10:14}}>
            {msg.role==="user"?(
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{background:T.accent,color:"#fff",padding:compact?"8px 11px":"10px 14px",borderRadius:"12px 12px 3px 12px",fontSize:fs,maxWidth:"85%",lineHeight:1.5}}>{msg.text}</div>
              </div>
            ):(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                  <div style={{width:compact?16:18,height:compact?16:18,borderRadius:4,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:T.accent}}>HIVE</span>
                </div>
                <div style={{background:T.surfaceAlt,padding:compact?"10px 12px":"12px 14px",borderRadius:"3px 12px 12px 12px",fontSize:fs,lineHeight:1.7,color:T.text}}>
                  {msg.text.split(/\b(ID_\d+)\b/).map((part,j)=>/^ID_\d+$/.test(part)?<Chip key={j} id={part}/>:part)}
                  {msg.gap&&<div style={{marginTop:7,padding:"7px 10px",background:T.amberLight,borderRadius:5,fontSize:11,color:T.textSec}}><span style={{fontWeight:700,color:T.amber}}>Gap: </span>{msg.gap}</div>}
                </div>
                {msg.actions&&(
                  <div style={{marginTop:7,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {msg.actions.map((a,j)=>(
                      <button key={j} onClick={()=>send(a.label)} style={{padding:compact?"4px 9px":"6px 11px",borderRadius:5,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:a.primary?T.accent:T.surfaceAlt,color:a.primary?"#fff":T.textSec,display:"flex",alignItems:"center",gap:4}}>
                        {a.label.length>24?a.label.slice(0,24)+"…":a.label}
                        {a.demo&&<span style={{fontSize:9,background:T.amberLight,color:T.amber,padding:"1px 4px",borderRadius:2}}>DEMO</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {thinking&&<TypingDots/>}
        <div ref={bottomRef}/>
      </div>

      {/* Starters */}
      {messages.length===1&&(
        <div style={{padding:compact?"8px 14px":"10px 18px",borderTop:`1px solid ${T.border}`,display:"flex",gap:6,flexWrap:"wrap"}}>
          {STARTERS.map(s=>(
            <button key={s} onClick={()=>send(s)} style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,cursor:"pointer",padding:"5px 9px",borderRadius:5,fontSize:11,color:T.textSec}}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{padding:compact?"10px 14px":"12px 18px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder={context==="brief"?"Ask about this brief…":"Ask a question…"}
          style={{flex:1,padding:compact?"8px 11px":"10px 13px",fontSize:fs,border:`1.5px solid ${T.border}`,borderRadius:7,outline:"none",fontFamily:"'DM Sans', sans-serif",color:T.text}}
          onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}
        />
        <button onClick={()=>send()} style={{padding:"0 14px",background:T.accent,color:"#fff",border:"none",borderRadius:7,fontSize:14,fontWeight:700,cursor:"pointer"}}>→</button>
      </div>
    </div>
  );
}

// ── TOP NAV ───────────────────────────────────────────────────────────────────
function TopNav({current,onSelect}){
  return (
    <div style={{background:"#1a1814",position:"sticky",top:0,zIndex:99,borderBottom:"1px solid #252520"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",height:46,display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:11,fontWeight:700,color:"#444",marginRight:12,letterSpacing:"0.08em",flexShrink:0}}>HIVE CHAT — B vs D</span>
        {[{id:"B",label:"B — Slide-in Drawer"},{id:"D",label:"D — Floating Widget"},{id:"compare",label:"⊞ Architecture Note"}].map(o=>(
          <button key={o.id} onClick={()=>onSelect(o.id)} style={{background:current===o.id?"#fff":"none",color:current===o.id?"#1a1814":"#777",border:"none",cursor:"pointer",padding:"5px 14px",borderRadius:5,fontSize:12,fontWeight:current===o.id?700:500,whiteSpace:"nowrap"}}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function NavBar({right}){
  return (
    <>
      <div style={{height:5,background:T.green}}/>
      <nav style={{background:T.navBg,borderBottom:`1px solid ${T.border}`,backdropFilter:"blur(10px)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:24,height:24,borderRadius:5,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064"/></svg>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>HIVE</span>
            <span style={{fontSize:10,fontWeight:700,background:T.amberLight,color:T.amber,padding:"2px 7px",borderRadius:3,border:`1px solid #fcd34d`}}>DEMO</span>
          </div>
          {right}
        </div>
      </nav>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// OPTION B — SLIDE-IN DRAWER
// ═════════════════════════════════════════════════════════════════════════════
function OptionB(){
  const [open,setOpen]=useState(false);
  const [highlighted,setHighlighted]=useState([]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans', sans-serif"}}>
      <style>{FONT}</style>
      <NavBar right={
        <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.15s",background:open?T.accent:T.surface,color:open?"#fff":T.accent,border:`1.5px solid ${T.accent}`}}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          {open?"Close chat":"Ask HIVE"}
        </button>
      }/>

      {/* Page shifts left when drawer opens */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px 80px",transition:"padding-right 0.25s",paddingRight:open?"calc(24px + 420px)":"24px"}}>
        <div style={{marginBottom:16}}>
          <h2 style={{fontFamily:"'DM Serif Display', serif",fontSize:26,fontWeight:400,color:T.text,marginBottom:4}}>Case Studies</h2>
          <p style={{fontSize:13,color:T.textSec}}>Browse {CARDS.length} curated cases — or click <strong>Ask HIVE</strong> to explore with AI. Matching cases highlight as you chat.</p>
        </div>
        <CardGrid highlighted={highlighted}/>

        <div style={{marginTop:28,padding:"16px 20px",background:"#1a1814",borderRadius:8}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9a9a8a",letterSpacing:"0.08em",marginBottom:5}}>OPTION B — Slide-in Drawer</div>
          <p style={{fontSize:12,color:"#ccc",lineHeight:1.65}}>
            Page content shifts left, drawer slides in from right. Grid stays fully readable and interactive alongside the conversation. Multi-turn thread persists while the drawer is open. Matching cases light up in the grid in real time. The same <code style={{background:"#333",padding:"1px 5px",borderRadius:3,fontSize:11}}>ChatPanel</code> component renders inside the drawer here and inside the floating widget in Option D — only the container differs.
          </p>
        </div>
      </div>

      {/* Drawer */}
      {open&&(
        <div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:"#fff",boxShadow:"-4px 0 32px rgba(0,0,0,0.08)",zIndex:40,display:"flex",flexDirection:"column",animation:"slideRight 0.2s ease",borderLeft:`1px solid ${T.border}`}}>
          {/* Header */}
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:20,height:20,borderRadius:4,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:T.text}}>Ask HIVE</span>
                <span style={{fontSize:10,fontWeight:700,background:T.amberLight,color:T.amber,padding:"2px 6px",borderRadius:3,border:`1px solid #fcd34d`}}>DEMO</span>
              </div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>109 curated case studies · answers grounded in evidence</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:20,lineHeight:1,padding:4}}>×</button>
          </div>
          {/* Chat */}
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <ChatPanel context="search" onHighlight={setHighlighted} onClose={()=>setOpen(false)}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// OPTION D — FLOATING WIDGET
// ═════════════════════════════════════════════════════════════════════════════
function OptionD(){
  const [open,setOpen]=useState(false);
  const [highlighted,setHighlighted]=useState([]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans', sans-serif"}}>
      <style>{FONT+`@keyframes slideUpWidget{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <NavBar/>

      {/* Full-width grid — NOT dimmed, NOT shifted */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px 100px"}}>
        <div style={{marginBottom:16}}>
          <h2 style={{fontFamily:"'DM Serif Display', serif",fontSize:26,fontWeight:400,color:T.text,marginBottom:4}}>Case Studies</h2>
          <p style={{fontSize:13,color:T.textSec}}>Full grid visible at all times. Use the floating button to chat without leaving the page.</p>
        </div>
        <CardGrid highlighted={highlighted}/>

        <div style={{marginTop:28,padding:"16px 20px",background:"#1a1814",borderRadius:8}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9a9a8a",letterSpacing:"0.08em",marginBottom:5}}>OPTION D — Floating Widget</div>
          <p style={{fontSize:12,color:"#ccc",lineHeight:1.65}}>
            Grid never shifts or dims. Widget floats over the bottom-right corner. User can scroll the grid, read cards, and chat simultaneously. The same <code style={{background:"#333",padding:"1px 5px",borderRadius:3,fontSize:11}}>ChatPanel</code> component is inside — only the container differs from Option B. Feature flag switches between the two containers. Extra build cost: ~2 hours of positioning/breakpoint logic on top of B.
          </p>
        </div>
      </div>

      {/* Floating button */}
      {!open&&(
        <button onClick={()=>setOpen(true)} style={{position:"fixed",bottom:28,right:28,zIndex:40,background:T.accent,color:"#fff",border:"none",borderRadius:50,cursor:"pointer",padding:"12px 20px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 20px rgba(29,112,184,0.3)",animation:"slideUpWidget 0.25s ease"}}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          Ask HIVE
          <span style={{fontSize:9,fontWeight:700,background:"rgba(255,255,255,0.2)",padding:"2px 6px",borderRadius:3}}>DEMO</span>
        </button>
      )}

      {/* Widget */}
      {open&&(
        <div style={{position:"fixed",bottom:24,right:24,width:370,height:530,zIndex:50,background:"#fff",borderRadius:14,boxShadow:"0 8px 40px rgba(0,0,0,0.13)",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",animation:"slideUpWidget 0.2s ease"}}>
          {/* Widget header */}
          <div style={{padding:"13px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",borderRadius:"14px 14px 0 0",background:T.accent,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>Ask HIVE</span>
              <span style={{fontSize:9,fontWeight:700,background:"rgba(255,255,255,0.2)",color:"#fff",padding:"2px 5px",borderRadius:3}}>DEMO</span>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.75)",fontSize:20,lineHeight:1,padding:4}}>×</button>
          </div>
          {/* Chat */}
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <ChatPanel context="search" onHighlight={setHighlighted} onClose={()=>setOpen(false)} compact={true}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ARCHITECTURE NOTE — shared component diagram
// ═════════════════════════════════════════════════════════════════════════════
function ArchNote(){
  return (
    <div style={{minHeight:"100vh",background:"#111",fontFamily:"'DM Sans', sans-serif",padding:"40px 32px"}}>
      <style>{FONT}</style>
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <h1 style={{fontFamily:"'DM Serif Display', serif",fontSize:26,color:"#fff",fontWeight:400,marginBottom:8}}>Shared Component Architecture</h1>
        <p style={{fontSize:13,color:"#9a9a8a",marginBottom:32}}>One <code style={{background:"#222",padding:"2px 6px",borderRadius:3,color:"#ccc"}}>ChatPanel</code> component. Two containers. One feature flag.</p>

        {/* Component tree */}
        <div style={{background:"#1a1a19",border:"1px solid #2a2a28",borderRadius:12,padding:24,marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:16}}>Component tree</div>
          <div style={{fontFamily:"monospace",fontSize:13,color:"#ccc",lineHeight:2}}>
            <div style={{color:"#60a5fa"}}>{"<ChatPanel"}</div>
            <div style={{paddingLeft:24,color:"#a78bfa"}}>{"context={\"search\" | \"brief\"}"}</div>
            <div style={{paddingLeft:24,color:"#a78bfa"}}>{"onHighlight={fn}"}</div>
            <div style={{paddingLeft:24,color:"#a78bfa"}}>{"compact={bool}"}</div>
            <div style={{color:"#60a5fa"}}>{"/"+">"}</div>
            <br/>
            <div style={{color:"#555"}}>{"// Rendered inside one of:"}</div>
            <br/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:4}}>
              <div style={{padding:"12px 14px",background:"#111",borderRadius:8,border:"1px solid #333"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#34d399",marginBottom:6}}>DrawerContainer</div>
                <div style={{fontSize:11,color:"#666",lineHeight:1.7}}>position: fixed right<br/>width: 420px<br/>page shifts left<br/>slideRight animation</div>
              </div>
              <div style={{padding:"12px 14px",background:"#111",borderRadius:8,border:"1px solid #333"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#60a5fa",marginBottom:6}}>FloatingContainer</div>
                <div style={{fontSize:11,color:"#666",lineHeight:1.7}}>position: fixed bottom-right<br/>width: 370px<br/>page unchanged<br/>slideUp animation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature flag */}
        <div style={{background:"#1a1a19",border:"1px solid #2a2a28",borderRadius:12,padding:24,marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Feature flag (env var or admin toggle)</div>
          <div style={{fontFamily:"monospace",fontSize:13,color:"#ccc",lineHeight:1.8,background:"#111",padding:"14px 16px",borderRadius:8}}>
            <div><span style={{color:"#9ca3af"}}>{"// lib/features.ts"}</span></div>
            <div><span style={{color:"#60a5fa"}}>export const</span> <span style={{color:"#34d399"}}>CHAT_STYLE</span> <span style={{color:"#fff"}}>=</span></div>
            <div style={{paddingLeft:16}}><span style={{color:"#f59e0b"}}>process.env.NEXT_PUBLIC_CHAT_STYLE</span></div>
            <div style={{paddingLeft:16}}><span style={{color:"#9ca3af"}}>?? </span><span style={{color:"#a78bfa"}}>"drawer"</span><span style={{color:"#9ca3af"}}>;  // "drawer" | "floating"</span></div>
            <br/>
            <div><span style={{color:"#9ca3af"}}>{"// In page component:"}</span></div>
            <div><span style={{color:"#60a5fa"}}>const</span> <span style={{color:"#34d399"}}>Container</span> <span style={{color:"#fff"}}>=</span> <span style={{color:"#f59e0b"}}>CHAT_STYLE</span> <span style={{color:"#fff"}}>===</span> <span style={{color:"#a78bfa"}}>"floating"</span></div>
            <div style={{paddingLeft:16}}><span style={{color:"#fff"}}>? <span style={{color:"#60a5fa"}}>FloatingContainer</span></span></div>
            <div style={{paddingLeft:16}}><span style={{color:"#fff"}}>: <span style={{color:"#60a5fa"}}>DrawerContainer</span><span style={{color:"#9ca3af"}}>;  // default</span></span></div>
          </div>
        </div>

        {/* Context awareness */}
        <div style={{background:"#1a1a19",border:"1px solid #2a2a28",borderRadius:12,padding:24,marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Context awareness — search vs brief page</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {page:"Search page",ctx:"search",starters:["Flooding on rail corridors","High UK transferability","What does SuDS cost?"],effect:"Matching cases highlight in grid"},
              {page:"Brief page",ctx:"brief",starters:["What am I missing?","Reframe for rail","Add coastal cases","Confidence level?"],effect:"Suggests cases to add / reframes brief sections"},
            ].map(c=>(
              <div key={c.ctx} style={{padding:"14px",background:"#111",borderRadius:8,border:"1px solid #2a2a28"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#34d399",marginBottom:8}}>{c.page}</div>
                <div style={{fontSize:11,fontWeight:600,color:"#9a9a8a",marginBottom:5}}>Starter questions:</div>
                {c.starters.map(s=><div key={s} style={{fontSize:11,color:"#666",padding:"2px 0"}}>· {s}</div>)}
                <div style={{marginTop:10,fontSize:11,color:"#60a5fa"}}>{c.effect}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Build estimate */}
        <div style={{background:"#1a1a19",border:"1px solid #2a2a28",borderRadius:12,padding:24}}>
          <div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Build estimate</div>
          {[
            {item:"ChatPanel component (shared)", hours:"2–3h",note:"Messages, starters, typing indicator, source chips"},
            {item:"DrawerContainer (Option B)", hours:"1–2h",note:"Fixed drawer, slideRight animation, page shift"},
            {item:"Feature flag + FloatingContainer (Option D)", hours:"+2h",note:"Fixed widget, slideUp, focus trap, breakpoint handling"},
            {item:"Context prop (search vs brief)", hours:"+1h",note:"Different starters and system prompt passed in"},
            {item:"Total (B only)", hours:"~4–5h",color:"#34d399"},
            {item:"Total (B + D toggle)", hours:"~6–7h",color:"#60a5fa"},
          ].map((row,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 80px 3fr",gap:12,padding:"8px 0",borderBottom:"1px solid #222",alignItems:"start"}}>
              <span style={{fontSize:12,fontWeight:row.color?700:500,color:row.color||"#ccc"}}>{row.item}</span>
              <span style={{fontSize:12,fontWeight:700,color:row.color||"#60a5fa",fontFamily:"monospace"}}>{row.hours}</span>
              <span style={{fontSize:11,color:"#555"}}>{row.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function HiveChatV2(){
  const [view,setView]=useState("B");
  return (
    <>
      <TopNav current={view} onSelect={setView}/>
      {view==="B"&&<OptionB/>}
      {view==="D"&&<OptionD/>}
      {view==="compare"&&<ArchNote/>}
    </>
  );
}
