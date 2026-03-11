import { useState, useRef, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const HAZARDS = [
  { id: "heat", label: "High Temp" },
  { id: "rain", label: "Heavy Rain" },
  { id: "flood_sw", label: "Flooding" },
  { id: "storms", label: "Storms" },
  { id: "sealevel", label: "Sea Level" },
  { id: "drought", label: "Drought" },
];

const SECTORS = [
  { id: "roads", label: "Roads" },
  { id: "rail", label: "Rail" },
  { id: "aviation", label: "Aviation" },
  { id: "maritime", label: "Maritime" },
];

// options count per sector × hazard (derived from real CSV data)
const MATRIX = {
  roads:    { heat: 3, rain: 5, flood_sw: 5, storms: 3, sealevel: 3, drought: 2 },
  rail:     { heat: 6, rain: 6, flood_sw: 4, storms: 1, sealevel: 4, drought: 2 },
  aviation: { heat: 7, rain: 3, flood_sw: 4, storms: 5, sealevel: 2, drought: 1 },
  maritime: { heat: 6, rain: 2, flood_sw: 3, storms: 6, sealevel: 5, drought: 3 },
};

const maxVal = 7;

const OPTIONS_DATA = [
  {
    id: 1,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Surface failure of road pavement from thermal expansion",
    adaptation_measure: "Asset temperature threshold considerations",
    adaptation_measure_description: "Use of materials that can withstand higher temperatures or are lighter in colour, such as reflective coating for pavement surfaces, aimed at reducing heat impact on roads",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    identified_cobenefits: "community, decreased energy consumption, carbon reduction",
  },
  {
    id: 2,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water, flooding - fluvial",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets: "Asset flooding and scour resulting in damage to road surface",
    adaptation_measure: "Appropriate drainage design to account for climate change uplift",
    adaptation_measure_description: "Consideration of Sustainable Drainage System (SuDS) that account for climate change uplift. Review climate uplift recommendations based on Environment Agency guidance.",
    response_and_recovery_measures: "Emergency repair or replacement of asset. Alternative traffic management.",
    identified_cobenefits: "community, environment, biodiversity, carbon reduction",
  },
  {
    id: 3,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Extended periods of thermal stress can lead to broken rails, posing significant safety and operational risks from rail fractures, misalignment and buckling.",
    adaptation_measure: "Real-time or remote monitoring",
    adaptation_measure_description: "Digital real-time monitoring systems for predictive decision-making when temperature trigger points are reached. Establish maximum temperature thresholds for each specific asset.",
    response_and_recovery_measures: "Speed restrictions on overheated tracks. Emergency repair or replacement.",
    identified_cobenefits: "biodiversity, carbon reduction, decreased energy consumption",
  },
  {
    id: 4,
    transport_subsector: "Rail",
    transport_assets: "Rail - Geotech",
    climate_hazard_cause: "Heavy rainfall",
    climate_hazard_effect: "Rockfalls, landslides, avalanches, scouring",
    climate_risk_to_assets: "Landslips and shrink-swell clays can cause ground movements, increasing the risk of track deformation and misalignment due to unstable ground conditions.",
    adaptation_measure: "Slope stabilisation / Real-time monitoring",
    adaptation_measure_description: "Alterations to earthworks using geotextiles, boulders or soil nails to reinforce embankments. Use of LIDAR technology to monitor slope movement and detect early signs of instability.",
    response_and_recovery_measures: "Response teams for landslip clearance, stabilisation and temporary service diversion.",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, economic",
  },
  {
    id: 5,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Risks to operations include flight delays, cancellations, and rerouting, as well as reduced air density affecting take-off and landing capabilities",
    adaptation_measure: "Adapting operations to environmental conditions / Cooling systems",
    adaptation_measure_description: "Adjust flight schedules and loading capacities based on air density and peak temperatures. Use cooling towers and irrigation techniques nearby the airfield.",
    response_and_recovery_measures: "Emergency response (flight cancellations, rerouting, changes to schedules)",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, decreased energy consumption, economic",
  },
  {
    id: 6,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets: "Structural damage to port infrastructure (e.g. breakwaters and quay walls) due to overtopping and increased wave action",
    adaptation_measure: "Improve protection structures",
    adaptation_measure_description: "Increase sizing (height, length and width) of breakwaters to reduce overtopping and risk of failure, appropriate height of protection structures to account for suitable climate change uplifts.",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    identified_cobenefits: "Community, Biodiversity, Carbon reduction, Decreased energy consumption, Economic",
  },
  {
    id: 7,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Dredged channels and berth-pockets",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Other",
    climate_risk_to_assets: "Sea level rise leads to high water levels in the port, resulting in a reduced window for berthing and disruption of operations",
    adaptation_measure: "Operational/maintenance adjustments",
    adaptation_measure_description: "Increased maintenance dredging schedule due to change in water level in port",
    response_and_recovery_measures: "Changes to schedules, emergency diversions to other ports",
    identified_cobenefits: "Economic",
  },
  {
    id: 8,
    transport_subsector: "Roads",
    transport_assets: "Road - Structures",
    climate_hazard_cause: "Flooding - fluvial",
    climate_hazard_effect: "Rockfalls, landslides, avalanches, scouring",
    climate_risk_to_assets: "Structure scour may cause structural instability and potential for bridge failure",
    adaptation_measure: "Scour protection",
    adaptation_measure_description: "Evaluate the need for scour protection. Consider rock armour (riprap) and articulated block mats. Integrate climate uplift into the foundation design.",
    response_and_recovery_measures: "Emergency response. Bridge inspection after severe flooding events.",
    identified_cobenefits: "",
  },
];

// ─── CHAT PANEL (drawer, options context) ────────────────────────────────────

const STARTERS = {
  options: [
    "What options exist for coastal flooding on rail?",
    "Which measures have the most co-benefits?",
    "What's available for aviation heat resilience?",
    "Show me drainage options across all sectors",
  ],
  landing: [
    "What adaptation options match my current search?",
    "Which sectors have the most coverage for storms?",
    "What are the most common measures across all options?",
    "Where are the biggest gaps in the options library?",
  ],
};

const MOCK_RESPONSES = {
  "What options exist for coastal flooding on rail?":
    "There are **4 options** for coastal flooding on rail in the library. These include installation of flood protection devices (MTA New York), drainage renewal and refurbishment (Network Rail), design uplifts for culvert systems, and cathodic protection for saltwater-exposed infrastructure. 3 of 4 options have high UK transferability. Would you like me to filter the table to show these now?",
  "Which measures have the most co-benefits?":
    "Sustainable Drainage Systems (SuDS) and nature-based solutions consistently show the broadest co-benefit profiles — typically covering **community, environment, biodiversity, and carbon reduction** together. Slope stabilisation and vegetation management measures also score highly across multiple co-benefit categories. Options with zero co-benefits are mostly emergency/reactive measures.",
  "What options exist for aviation heat resilience?":
    "There are **7 options** for aviation under high temperature — the most of any sector × hazard combination. These cover runway rutting prevention, cargo cooling, ground staff heat exposure, air density impacts on take-off, and fire risk from battery storage. Adelaide Airport's irrigation system is the most-referenced case study across these options.",
  "Show me drainage options across all sectors":
    "Drainage is a cross-cutting theme. The library includes drainage options for Roads (5), Rail (4), Aviation (3), and Maritime (2). Key measures include SuDS design, climate uplift factors for pipe sizing, balancing ponds, and groundwater backflow prevention. The Environment Agency guidance on climate uplift is referenced across 6 of these options.",
};

function ChatPanel({ context, open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const starters = STARTERS[context] || STARTERS.options;

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = MOCK_RESPONSES[text] ||
        "I can help you explore the adaptation options library. Try asking about a specific sector, hazard, or measure type — or use one of the suggested questions above.";
      setMessages(m => [...m, { role: "ai", text: reply }]);
      setTyping(false);
    }, 900);
  };

  return (
    <>
      {/* backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)",
            zIndex: 40, transition: "opacity 0.2s",
          }}
        />
      )}

      {/* drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 400,
        background: "#fff",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        zIndex: 50,
        display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: "'GDS Transport', Arial, sans-serif",
      }}>
        {/* header */}
        <div style={{
          height: 5, background: "#006853", flexShrink: 0,
        }} />
        <div style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: "#1d70b8",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0b0c0c" }}>Ask about options</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                {context === "options" ? "Filtering & exploring this library" : "Options coverage for your search"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6,
            background: "#f3f4f6", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280", fontSize: 16, lineHeight: 1,
          }}>✕</button>
        </div>

        {/* messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {messages.length === 0 && (
            <div>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, lineHeight: 1.6 }}>
                {context === "options"
                  ? "Ask me to help you explore the adaptation options library — by sector, hazard, measure type, or co-benefits."
                  : "I can surface adaptation options relevant to your current search and explain where the library has the best coverage."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {starters.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    textAlign: "left", fontSize: 12, padding: "8px 12px",
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 6, color: "#065f46", cursor: "pointer",
                    fontFamily: "inherit", lineHeight: 1.4,
                    transition: "background 0.1s",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              marginBottom: 14,
              display: "flex",
              flexDirection: m.role === "user" ? "row-reverse" : "row",
              gap: 8, alignItems: "flex-start",
            }}>
              {m.role === "ai" && (
                <div style={{
                  width: 24, height: 24, borderRadius: 5, background: "#1d70b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 2,
                }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
              <div style={{
                maxWidth: "82%",
                fontSize: 13, lineHeight: 1.6,
                padding: "8px 12px",
                borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                background: m.role === "user" ? "#1d70b8" : "#f9fafb",
                color: m.role === "user" ? "#fff" : "#111827",
                border: m.role === "ai" ? "1px solid #e5e7eb" : "none",
              }}
                dangerouslySetInnerHTML={{
                  __html: m.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                }}
              />
            </div>
          ))}

          {typing && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 5, background: "#1d70b8",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div style={{
                padding: "10px 14px", background: "#f9fafb",
                border: "1px solid #e5e7eb", borderRadius: "12px 12px 12px 4px",
                display: "flex", gap: 4, alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#9ca3af",
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid #e5e7eb",
          flexShrink: 0,
          background: "#fff",
        }}>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={{
              fontSize: 11, color: "#9ca3af", background: "none", border: "none",
              cursor: "pointer", padding: "0 0 8px", fontFamily: "inherit",
              textDecoration: "underline", textUnderlineOffset: 2,
            }}>
              Clear conversation
            </button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="Ask about adaptation options..."
              style={{
                flex: 1, fontSize: 13, padding: "8px 12px",
                border: "1px solid #d1d5db", borderRadius: 6,
                fontFamily: "inherit", outline: "none",
                background: "#f9fafb", color: "#111827",
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 6,
                background: input.trim() ? "#1d70b8" : "#e5e7eb",
                border: "none", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background 0.15s",
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={input.trim() ? "#fff" : "#9ca3af"} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
          <p style={{ fontSize: 10, color: "#9ca3af", margin: "6px 0 0", lineHeight: 1.4 }}>
            Prototype — responses are illustrative, not AI-generated
          </p>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
          }
        `}</style>
      </div>
    </>
  );
}

// ─── CHAT TRIGGER BUTTON ─────────────────────────────────────────────────────

function ChatTrigger({ onClick, hasMessages }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 13, fontWeight: 600,
      padding: "6px 12px",
      borderRadius: 6,
      background: "#1d70b8",
      color: "#fff",
      border: "none", cursor: "pointer",
      fontFamily: "'GDS Transport', Arial, sans-serif",
      transition: "background 0.15s",
      flexShrink: 0,
    }}>
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Ask about options
      {hasMessages && (
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#22c55e", display: "inline-block", marginLeft: 2,
        }} />
      )}
    </button>
  );
}

// ─── HEATMAP ─────────────────────────────────────────────────────────────────


function getCellStyle(count, isHighlighted, isActive) {
  if (count === 0) return { bg: "#f3f4f6", text: "#9ca3af", border: "#e5e7eb" };
  const intensity = count / maxVal;
  if (isActive) return { bg: "#1d70b8", text: "#fff", border: "#1558a0" };
  if (isHighlighted) return { bg: "#dbeafe", text: "#1e3a5f", border: "#93c5fd" };
  if (intensity >= 0.8) return { bg: "#bbf7d0", text: "#14532d", border: "#86efac" };
  if (intensity >= 0.5) return { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" };
  if (intensity >= 0.3) return { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" };
  return { bg: "#f0fdf4", text: "#065f46", border: "#d1fae5" };
}

// ─── HEATMAP PANEL (landing page component) ──────────────────────────────────

function HeatmapPanel({ activeSector, activeHazard, onCellClick }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 4,
      overflow: "hidden",
      fontFamily: "'GDS Transport', Arial, sans-serif",
    }}>
      {/* header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, background: "#006853", borderRadius: 1 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0b0c0c", letterSpacing: "-0.01em" }}>
            Adaptation options coverage
          </span>
          <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 4 }}>
            — click any cell to explore options for that combination
          </span>
        </div>
        <a href="/options" style={{
          fontSize: 12,
          color: "#1d70b8",
          textDecoration: "underline",
          textUnderlineOffset: 3,
          flexShrink: 0,
        }}>
          Browse all options →
        </a>
      </div>

      {/* grid */}
      <div style={{ padding: "12px 16px 16px", overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 480 }}>
          <thead>
            <tr>
              <th style={{ width: 90, paddingBottom: 8 }} />
              {HAZARDS.map(h => (
                <th key={h.id} style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: activeHazard === h.id ? "#1d70b8" : "#6b7280",
                  textAlign: "center",
                  paddingBottom: 8,
                  paddingLeft: 4,
                  paddingRight: 4,
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTORS.map(s => (
              <tr key={s.id}>
                <td style={{
                  fontSize: 12,
                  fontWeight: activeSector === s.id ? 700 : 600,
                  color: activeSector === s.id ? "#1d70b8" : "#374151",
                  paddingRight: 12,
                  paddingTop: 4,
                  paddingBottom: 4,
                  whiteSpace: "nowrap",
                }}>
                  {s.label}
                </td>
                {HAZARDS.map(h => {
                  const count = MATRIX[s.id]?.[h.id] ?? 0;
                  const isActive = activeSector === s.id && activeHazard === h.id;
                  const isHighlighted = (activeSector === s.id || activeHazard === h.id) && !isActive;
                  const isHovered = hovered === `${s.id}-${h.id}`;
                  const style = getCellStyle(count, isHighlighted, isActive || isHovered);
                  return (
                    <td key={h.id} style={{ padding: "3px 4px", textAlign: "center" }}>
                      {count > 0 ? (
                        <button
                          onMouseEnter={() => setHovered(`${s.id}-${h.id}`)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => onCellClick(s.id, h.id)}
                          title={`${count} adaptation option${count !== 1 ? "s" : ""} — ${s.label} × ${h.label}`}
                          style={{
                            width: "100%",
                            minWidth: 40,
                            padding: "6px 4px",
                            background: isHovered ? "#1d70b8" : style.bg,
                            color: isHovered ? "#fff" : style.text,
                            border: `1px solid ${style.border}`,
                            borderRadius: 3,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.12s",
                            fontFamily: "inherit",
                          }}>
                          {count}
                        </button>
                      ) : (
                        <div style={{
                          width: "100%",
                          minWidth: 40,
                          padding: "6px 4px",
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: 3,
                          fontSize: 11,
                          color: style.text,
                          textAlign: "center",
                        }}>—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* legend */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.04em" }}>FEWER OPTIONS</span>
          {["#f0fdf4","#d1fae5","#bbf7d0","#6ee7b7","#34d399"].map((c,i) => (
            <div key={i} style={{ width: 18, height: 10, background: c, border: "1px solid #d1d5db", borderRadius: 2 }} />
          ))}
          <span style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.04em" }}>MORE OPTIONS</span>
        </div>
      </div>
    </div>
  );
}

// ─── OPTIONS PAGE ─────────────────────────────────────────────────────────────

function OptionsPage({ initialSector, initialHazard, onBack }) {
  const [sector, setSector] = useState(initialSector || "");
  const [hazard, setHazard] = useState(initialHazard || "");
  const [asset, setAsset] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const hazardMap = {
    heat: "High temperatures",
    rain: "Heavy rainfall",
    flood_sw: "Flooding",
    storms: "Storms",
    sealevel: "Sea level rise",
    drought: "Drought",
  };
  const sectorMap = {
    roads: "Roads",
    rail: "Rail",
    aviation: "Aviation",
    maritime: "Maritime",
  };

  const filtered = OPTIONS_DATA.filter(row => {
    if (sector && !row.transport_subsector.toLowerCase().includes(sectorMap[sector]?.toLowerCase() ?? "")) return false;
    if (hazard && !row.climate_hazard_cause.toLowerCase().includes(hazardMap[hazard]?.toLowerCase() ?? "")) return false;
    return true;
  });

  const uniqueAssets = [...new Set(OPTIONS_DATA.map(r => r.transport_assets))].sort();

  return (
    <div style={{ fontFamily: "'GDS Transport', Arial, sans-serif", background: "#f9f9f8", minHeight: "100vh" }}>
      {/* nav stripe */}
      <div style={{ height: 5, background: "#006853" }} />

      {/* header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px" }}>
          <button onClick={onBack} style={{
            fontSize: 13, color: "#1d70b8", background: "none", border: "none",
            cursor: "pointer", padding: 0, marginBottom: 12, textDecoration: "underline",
            textUnderlineOffset: 3, fontFamily: "inherit",
          }}>
            ← Back to case studies
          </button>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0b0c0c", margin: 0, letterSpacing: "-0.02em" }}>
                Adaptation Options Library
              </h1>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
                Structured guidance on climate adaptation measures by transport sector and hazard
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 13, color: "#374151" }}>
                <span style={{ fontWeight: 700, color: "#0b0c0c" }}>{filtered.length}</span> options
                {(sector || hazard) && <span style={{ color: "#6b7280" }}> matching filters</span>}
              </div>
              <ChatTrigger onClick={() => setChatOpen(true)} hasMessages={chatMessages.length > 0} />
            </div>
          </div>
        </div>
      </div>

      <ChatPanel context="options" open={chatOpen} onClose={() => setChatOpen(false)} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* filter row */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", flexShrink: 0 }}>Filter by:</span>

          {[
            { label: "Transport sector", val: sector, setter: setSector, opts: Object.entries(sectorMap) },
            { label: "Climate hazard", val: hazard, setter: setHazard, opts: Object.entries(hazardMap) },
          ].map(({ label, val, setter, opts }) => (
            <select
              key={label}
              value={val}
              onChange={e => setter(e.target.value)}
              style={{
                fontSize: 13,
                padding: "6px 10px",
                border: "1px solid",
                borderColor: val ? "#1d70b8" : "#d1d5db",
                borderRadius: 3,
                background: val ? "#eff6ff" : "#fff",
                color: val ? "#1d70b8" : "#374151",
                cursor: "pointer",
                fontFamily: "inherit",
                minWidth: 160,
              }}>
              <option value="">{label}: All</option>
              {opts.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          ))}

          {(sector || hazard) && (
            <button
              onClick={() => { setSector(""); setHazard(""); setAsset(""); }}
              style={{
                fontSize: 12, color: "#6b7280", background: "none", border: "1px solid #d1d5db",
                borderRadius: 3, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit",
              }}>
              Clear filters
            </button>
          )}
        </div>

        {/* heatmap mini — stays visible on options page too */}
        <div style={{ marginBottom: 20 }}>
          <HeatmapPanel
            activeSector={sector}
            activeHazard={hazard}
            onCellClick={(s, h) => { setSector(s); setHazard(h); }}
          />
        </div>

        {/* results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4,
              padding: "32px 20px", textAlign: "center", color: "#6b7280", fontSize: 14,
            }}>
              No options match the current filters. Try broadening your selection.
            </div>
          ) : filtered.map(row => (
            <div
              key={row.id}
              style={{
                background: "#fff",
                border: "1px solid",
                borderColor: expanded === row.id ? "#1d70b8" : "#e5e7eb",
                borderRadius: 4,
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}>
              {/* collapsed header */}
              <button
                onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  padding: "14px 16px", textAlign: "left", fontFamily: "inherit",
                  display: "grid",
                  gridTemplateColumns: "100px 130px 1fr 24px",
                  gap: 12,
                  alignItems: "center",
                }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: row.transport_subsector === "Roads" ? "#fef3c7" :
                    row.transport_subsector === "Rail" ? "#dbeafe" :
                    row.transport_subsector === "Aviation" ? "#ede9fe" : "#dcfce7",
                  color: row.transport_subsector === "Roads" ? "#92400e" :
                    row.transport_subsector === "Rail" ? "#1e3a5f" :
                    row.transport_subsector === "Aviation" ? "#4c1d95" : "#14532d",
                  padding: "2px 8px", borderRadius: 100, display: "inline-block",
                }}>
                  {row.transport_subsector}
                </span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{row.transport_assets}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0b0c0c", lineHeight: 1.4 }}>
                    {row.adaptation_measure}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {row.climate_hazard_cause} → {row.climate_hazard_effect}
                  </div>
                </div>
                <span style={{
                  fontSize: 16, color: "#6b7280", transform: expanded === row.id ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s", display: "block", lineHeight: 1,
                }}>›</span>
              </button>

              {/* expanded detail */}
              {expanded === row.id && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 6 }}>
                        CLIMATE RISK TO ASSETS
                      </div>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>
                        {row.climate_risk_to_assets}
                      </p>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 6 }}>
                        ADAPTATION MEASURE
                      </div>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>
                        {row.adaptation_measure_description}
                      </p>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 6 }}>
                        RESPONSE & RECOVERY
                      </div>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>
                        {row.response_and_recovery_measures}
                      </p>
                    </div>
                    {row.identified_cobenefits && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 6 }}>
                          CO-BENEFITS
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {row.identified_cobenefits.split(",").map(b => (
                            <span key={b} style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 100,
                              background: "#f0fdf4", border: "1px solid #86efac",
                              color: "#14532d",
                            }}>
                              {b.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE (with heatmap in context) ───────────────────────────────────

function LandingPage({ onNavigate }) {
  const [showOptions, setShowOptions] = useState(false);
  const [optsSector, setOptsSector] = useState("");
  const [optsHazard, setOptsHazard] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const handleCellClick = (sector, hazard) => {
    setOptsSector(sector);
    setOptsHazard(hazard);
    setShowOptions(true);
  };

  if (showOptions) {
    return (
      <OptionsPage
        initialSector={optsSector}
        initialHazard={optsHazard}
        onBack={() => setShowOptions(false)}
      />
    );
  }

  return (
    <div style={{ fontFamily: "'GDS Transport', Arial, sans-serif", background: "#f9f9f8", minHeight: "100vh" }}>
      <div style={{ height: 5, background: "#006853" }} />

      {/* nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 52, gap: 32 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0b0c0c", letterSpacing: "-0.02em" }}>
            TRIB — Climate Adaptation HIVE
          </span>
          <nav style={{ display: "flex", gap: 24, flex: 1 }}>
            {["Case Studies", "Options Library", "Briefing"].map((n, i) => (
              <button key={n} onClick={i === 1 ? () => setShowOptions(true) : undefined} style={{
                fontSize: 13, fontWeight: i === 0 ? 700 : 500,
                color: i === 0 ? "#1d70b8" : "#374151",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: i === 0 ? "2px solid #1d70b8" : "2px solid transparent",
                padding: "0 0 2px", fontFamily: "inherit",
              }}>{n}</button>
            ))}
          </nav>
          <ChatTrigger onClick={() => setChatOpen(true)} hasMessages={chatMessages.length > 0} />
        </div>
      </div>

      <ChatPanel context="landing" open={chatOpen} onClose={() => setChatOpen(false)} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* simulated search + synthesis panel */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4,
          padding: "16px 20px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            Search results for: <strong style={{ color: "#0b0c0c" }}>"coastal flooding maritime"</strong>
          </div>
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 4,
            padding: "12px 16px", fontSize: 13, color: "#065f46",
          }}>
            <strong>Cross-case analysis:</strong> 7 of 12 cases show high UK transferability. Common measures: breakwater upgrades, drainage capacity increases, operational scheduling adjustments.
            <a href="/brief" style={{ marginLeft: 12, color: "#065f46", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
              Generate brief from this analysis →
            </a>
          </div>
        </div>

        {/* ── HEATMAP PANEL — sits here, between synthesis and case cards ── */}
        <div style={{ marginBottom: 16 }}>
          <HeatmapPanel
            activeSector="maritime"
            activeHazard="sealevel"
            onCellClick={handleCellClick}
          />
        </div>

        {/* browse all row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 0", marginBottom: 16,
          borderBottom: "1px solid #e5e7eb",
        }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>12 case studies below</span>
          <a href="/cases" style={{ fontSize: 12, color: "#1d70b8", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Browse all 109 cases →
          </a>
        </div>

        {/* stub case cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { title: "Port Extension & Sea Defence", org: "Société des Ports du Détroit", sector: "Maritime", hazard: "Storm damage" },
            { title: "Wharf Height Increase", org: "Cook Islands Ports Authority", sector: "Maritime", hazard: "Sea level rise" },
            { title: "Drainage Systems Resilience", org: "Resilient Florida Program", sector: "Maritime", hazard: "Flooding" },
          ].map(c => (
            <div key={c.title} style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4,
              padding: 16,
            }}>
              <div style={{ fontSize: 11, color: "#14532d", background: "#dcfce7", display: "inline-block", padding: "2px 8px", borderRadius: 100, marginBottom: 8 }}>
                {c.sector}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0b0c0c", marginBottom: 4, lineHeight: 1.4 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{c.org}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{c.hazard}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("landing");
  const [optsSector, setOptsSector] = useState("");
  const [optsHazard, setOptsHazard] = useState("");

  if (page === "options") {
    return (
      <OptionsPage
        initialSector={optsSector}
        initialHazard={optsHazard}
        onBack={() => setPage("landing")}
      />
    );
  }

  return (
    <LandingPage
      onNavigate={(s, h) => {
        setOptsSector(s);
        setOptsHazard(h);
        setPage("options");
      }}
    />
  );
}
