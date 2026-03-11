import { useState, useEffect, useRef } from "react";

// ── ALL 50 MARQUEE CASE STUDIES ──
// caseStudyId = links marquee card directly to a rich result card
// sector used for placeholder fallback on unmatched cards
const MARQUEE_CASES = [
  { id: '01', title: 'Port of Calais Extension', sector: 'Maritime', measure: 'Port extension', hazards: ['Sea level rise', 'Storm surge'], hook: '+65ha reclaimed · €863m (2021)', caseStudyId: 'ID_01' },
  { id: '02', title: 'Port of Calais Sea Defence', sector: 'Maritime', measure: 'Sea defence', hazards: ['Sea level rise', 'Storm surge'], hook: '3.3km seawall · 100ha basin', caseStudyId: 'ID_01' },
  { id: '03', title: 'Prince Edward Island', sector: 'Highways', measure: 'Intertidal reefs', hazards: ['Coastal erosion', 'Storm surge'], hook: '2,400 tonnes sandstone reefs' },
  { id: '04', title: 'Copenhagen Metro – Waterproofing', sector: 'Rail', measure: 'Waterproof tunnel designs', hazards: ['Flooding', 'Sea waves'], hook: 'Waterproof walls up to 2.3m' },
  { id: '05', title: 'Copenhagen Metro – Drainage', sector: 'Rail', measure: 'Improved drainage', hazards: ['Flooding', 'Heavy rainfall'], hook: 'Drains + pumping systems' },
  { id: '06', title: 'Panama Canal Water Saving', sector: 'Maritime', measure: 'Water optimisation', hazards: ['Drought'], hook: 'Strategic water conservation' },
  { id: '07', title: 'Albert Canal – Archimedes Screws', sector: 'Maritime', measure: 'Archimedes screws', hazards: ['Drought', 'Water shortage'], hook: 'Largest screws in the world' },
  { id: '08', title: 'Albert Canal – Hydroelectric', sector: 'Maritime', measure: 'Hydroelectric power', hazards: ['High water levels'], hook: 'Dual pump + power generation' },
  { id: '09', title: 'ÖBB – Slope Stabilisation', sector: 'Rail', measure: 'Slope stabilisation', hazards: ['Landslide', 'Rockfall'], hook: '3,370 hectares protected forest', caseStudyId: 'ID_06' },
  { id: '10', title: 'ÖBB – Rockfall Barriers', sector: 'Rail', measure: 'Rockfall barriers', hazards: ['Rockfall', 'Avalanche'], hook: '212km barriers installed', caseStudyId: 'ID_06' },
  { id: '11', title: 'ÖBB – Flood Defences', sector: 'Rail', measure: 'Flood defences', hazards: ['Flooding', 'Extreme precipitation'], hook: 'Retention basins + drainage', caseStudyId: 'ID_06' },
  { id: '12', title: 'ÖBB – Early Warning Systems', sector: 'Rail', measure: 'Early warning systems', hazards: ['Multiple hazards'], hook: 'Geotechnical sensors + forecasting', caseStudyId: 'ID_06' },
  { id: '13', title: 'MTA Saint George – Flood Protection', sector: 'Rail', measure: 'Flood protection devices', hazards: ['Flooding', 'Storm surge'], hook: '3,000+ flood barriers installed' },
  { id: '14', title: 'MTA – Elevated Equipment', sector: 'Rail', measure: 'Elevating equipment', hazards: ['Flooding', 'Hurricane'], hook: 'Signal room elevated 12 feet' },
  { id: '15', title: 'CIPA Port – Wharf Height', sector: 'Maritime', measure: 'Wharf height increase', hazards: ['Sea level rise', 'Storm surge'], hook: '+0.5m with 0.5m flexibility' },
  { id: '16', title: 'CIPA Port – Rock Armour', sector: 'Maritime', measure: 'Rock armour', hazards: ['Storm surge', 'Erosion'], hook: '92m breakwater extension' },
  { id: '17', title: 'Infrabel – Tension Release Devices', sector: 'Rail', measure: 'Tension release devices', hazards: ['Extreme heat', 'Extreme cold'], hook: 'Prevents buckling + fracturing' },
  { id: '18', title: 'Infrabel – Storm Basins', sector: 'Rail', measure: 'Storm basins', hazards: ['Flooding'], hook: 'Flood-prone area mitigation' },
  { id: '19', title: 'Deutsche Bahn – ICE 4 Trains', sector: 'Rail', measure: 'Air-conditioned trains', hazards: ['Extreme heat'], hook: 'AC rated to 45°C', caseStudyId: 'ID_11' },
  { id: '20', title: 'Deutsche Bahn – Vegetation Mgmt', sector: 'Rail', measure: 'Vegetation management', hazards: ['Storms', 'Falling trees'], hook: '26,000+ trees planted', caseStudyId: 'ID_11' },
  { id: '21', title: 'Deutsche Bahn – Sensors', sector: 'Rail', measure: 'Environmental sensors', hazards: ['Multiple hazards'], hook: 'IoT monitoring for prevention', caseStudyId: 'ID_11' },
  { id: '22', title: 'Leeds Flood Alleviation – NFM', sector: 'Highways', measure: 'Natural Flood Management', hazards: ['Flooding'], hook: '500,000 trees planted' },
  { id: '23', title: 'Leeds Flood Alleviation – Engineering', sector: 'Highways', measure: 'Traditional engineering', hazards: ['Flooding'], hook: '1.8M m³ flood storage' },
  { id: '24', title: 'TfL Marylebone – SuDS', sector: 'Highways', measure: 'Sustainable Drainage', hazards: ['Flooding', 'Heavy rainfall'], hook: '3,500m² rainwater collection' },
  { id: '25', title: 'Adelaide Airport Irrigation', sector: 'Aviation', measure: 'Irrigation', hazards: ['Extreme heat'], hook: '200 hectares irrigated land' },
  { id: '26', title: 'Gatwick – Clays Lake Scheme', sector: 'Aviation', measure: 'Flood storage reservoirs', hazards: ['Flooding'], hook: '400,000 m³ capacity' },
  { id: '27', title: 'Network Rail Conwy Valley', sector: 'Rail', measure: 'Earthworks', hazards: ['Flooding', 'Washout'], hook: '16,000 tonnes rock armour' },
  { id: '28', title: 'Phoenix Cool Pavements', sector: 'Highways', measure: 'Cool pavement technology', hazards: ['Extreme heat'], hook: '100+ miles treated', caseStudyId: 'ID_19' },
  { id: '29', title: 'South Australia – Fire Suppression', sector: 'Highways', measure: 'Ventilation systems', hazards: ['Wildfire', 'Smoke'], hook: '23 new exhaust fans' },
  { id: '30', title: 'Qatar – Pumping Station', sector: 'Aviation', measure: 'Pumping station', hazards: ['Flooding', 'Storm'], hook: '10km undersea outfall tunnel' },
  { id: '31', title: 'Hammersmith Bridge Cooling', sector: 'Highways', measure: 'Bridge deck cooling', hazards: ['Extreme heat'], hook: 'Water spray cooling system' },
  { id: '32', title: 'Heathrow Balancing Pond', sector: 'Aviation', measure: 'Water management', hazards: ['Flooding', 'Drought'], hook: 'Year-round flow control · £2.1m', caseStudyId: 'ID_32' },
  { id: '33', title: 'Heathrow Climate-Resilient Grass', sector: 'Aviation', measure: 'Climate-resilient grass', hazards: ['Drought', 'Extreme heat'], hook: 'Deeper root systems' },
  { id: '34', title: 'Santa Barbara Debris Basin', sector: 'Highways', measure: 'Debris basin', hazards: ['Heavy rainfall', 'Debris flow'], hook: '6-acre capture basin' },
  { id: '35', title: 'Croydon Grid Flood Defence', sector: 'Energy', measure: 'Flood barriers + equipment sealing', hazards: ['High winds', 'Flooding'], hook: '69,000 customers protected · £800k', caseStudyId: 'ID_UKPN_01' },
  { id: '36', title: 'Queensland Foamed Bitumen', sector: 'Highways', measure: 'Foamed bitumen', hazards: ['Flooding'], hook: 'Water-resistant pavement' },
  { id: '37', title: 'Network Rail – CWR Tracks', sector: 'Rail', measure: 'Thermally resilient tracks', hazards: ['Extreme heat'], hook: 'Continuous Welded Rail' },
  { id: '38', title: 'Network Rail – Auto Monitoring', sector: 'Rail', measure: 'Automated track monitoring', hazards: ['Extreme heat'], hook: 'Real-time temperature sensors' },
  { id: '39', title: 'Network Rail – Water Cooling', sector: 'Rail', measure: 'Water cooling', hazards: ['Extreme heat'], hook: 'White paint + water · 5–10°C reduction' },
  { id: '40', title: 'Network Rail – OLE Auto-tension', sector: 'Rail', measure: 'Auto-tension overhead wires', hazards: ['Extreme heat'], hook: 'Spring tensioners to 38°C' },
  { id: '41', title: 'LA Metro – Hardening Infrastructure', sector: 'Rail', measure: 'Hardening infrastructure', hazards: ['Flooding', 'Wildfire'], hook: 'Raised rail + wetlands' },
  { id: '42', title: 'LA Metro – Operational Adjustments', sector: 'Rail', measure: 'Adjusting operations', hazards: ['Flooding', 'Wildfire'], hook: 'Blue water detours' },
  { id: '43', title: 'LA Metro – Wetlands Park', sector: 'Rail', measure: 'Relocating infrastructure', hazards: ['Flooding', 'Stormwater'], hook: '46-acre wetlands park' },
  { id: '44', title: 'Sheffield Grey to Green', sector: 'Highways', measure: 'SuDS', hazards: ['Heavy rainfall', 'Flooding'], hook: '60% grey to green · 1.5km', caseStudyId: 'ID_40' },
  { id: '45', title: 'Network Rail Dawlish Sea Wall', sector: 'Rail', measure: 'Sea wall', hazards: ['Waves', 'Storm surge'], hook: '8m height with recurve design' },
  { id: '46', title: 'TfL Rainwater Harvesting', sector: 'Rail', measure: 'Rainwater harvesting', hazards: ['Water runoff'], hook: '23,000 m³ recycled annually' },
  { id: '47', title: 'Thames Tidal Barrier', sector: 'Multiple', measure: 'Tidal barriers', hazards: ['Flooding', 'Storm surge'], hook: '520m · protects 1.5M people' },
  { id: '48', title: 'Berlin BVG Green Tram Tracks', sector: 'Rail', measure: 'Green tramways', hazards: ['Extreme heat', 'Heavy rainfall'], hook: '22,000+ metres green track' },
  { id: '49', title: 'Thames Water – SuDS', sector: 'Highways', measure: 'SuDS', hazards: ['Flooding', 'Urban creep'], hook: 'Geocellular + rain gardens' },
  { id: '50', title: 'Panama Canal – Fresh Water Surcharge', sector: 'Maritime', measure: 'Fresh water surcharge', hazards: ['Drought'], hook: 'Variable fee for water preservation' },
];

// ── PLACEHOLDER CARDS (one per sector, shown when marquee card has no rich data yet) ──
const PLACEHOLDER_CASES = {
  Rail: {
    id: 'PH_RAIL', title: 'Rail case study being curated', organisation: 'HIVE editorial team',
    sector: 'Rail', hook: 'Full case study coming soon', placeholder: true,
    hazards: { cause: [], effect: [] }, assets: [], measures: [], tags: [],
    location: '—', ukRegion: '—', year: '—', cost: '—', costBand: '—',
    summary: 'This case study is currently being curated and verified by the HIVE editorial team. It will include full adaptation measures, cost data, and UK applicability assessment.',
    transferability: '—', transferabilityNote: '—', ukApplicability: [], insight: '—',
  },
  Aviation: {
    id: 'PH_AVIATION', title: 'Aviation case study being curated', organisation: 'HIVE editorial team',
    sector: 'Aviation', hook: 'Full case study coming soon', placeholder: true,
    hazards: { cause: [], effect: [] }, assets: [], measures: [], tags: [],
    location: '—', ukRegion: '—', year: '—', cost: '—', costBand: '—',
    summary: 'This case study is currently being curated and verified by the HIVE editorial team. It will include full adaptation measures, cost data, and UK applicability assessment.',
    transferability: '—', transferabilityNote: '—', ukApplicability: [], insight: '—',
  },
  Maritime: {
    id: 'PH_MARITIME', title: 'Maritime & ports case study being curated', organisation: 'HIVE editorial team',
    sector: 'Maritime', hook: 'Full case study coming soon', placeholder: true,
    hazards: { cause: [], effect: [] }, assets: [], measures: [], tags: [],
    location: '—', ukRegion: '—', year: '—', cost: '—', costBand: '—',
    summary: 'This case study is currently being curated and verified by the HIVE editorial team. It will include full adaptation measures, cost data, and UK applicability assessment.',
    transferability: '—', transferabilityNote: '—', ukApplicability: [], insight: '—',
  },
  Highways: {
    id: 'PH_HIGHWAYS', title: 'Highways case study being curated', organisation: 'HIVE editorial team',
    sector: 'Highways', hook: 'Full case study coming soon', placeholder: true,
    hazards: { cause: [], effect: [] }, assets: [], measures: [], tags: [],
    location: '—', ukRegion: '—', year: '—', cost: '—', costBand: '—',
    summary: 'This case study is currently being curated and verified by the HIVE editorial team. It will include full adaptation measures, cost data, and UK applicability assessment.',
    transferability: '—', transferabilityNote: '—', ukApplicability: [], insight: '—',
  },
};

// ── 7 RICH CASE STUDIES FOR GRID ──
const CASE_STUDIES = [
  {
    id: "ID_19", title: "Phoenix Cool Pavement Programme", organisation: "City of Phoenix Street Transportation Department",
    sector: "Highways", hook: "100+ miles treated · 6°C surface temp reduction · $4.8m annual",
    hazards: { cause: ["High temperatures", "Urban Heat Island effect"], effect: ["Road surface overheating", "Increased energy demand"] },
    assets: ["Road pavement"],
    measures: ["CoolSeal reflective coating", "Pavement maintenance programme", "University monitoring partnership"],
    location: "Phoenix, USA", ukRegion: "Applicable to UK urban areas", year: "2021–ongoing",
    cost: "USD $4.8m annual (£3.73m); initial pilot £2.33m", costBand: "£1m–£10m",
    summary: "Reflective CoolSeal coating applied to 100+ miles of residential roads to combat extreme urban heat island effect. The product increases road reflectivity by 30% and reduces surface temperatures by 6°C, integrated into existing pavement maintenance budgets.",
    transferability: "Medium",
    transferabilityNote: "Directly applicable to UK cities experiencing urban heat island intensification. London hotspots already 4.5°C warmer at night than rural surroundings. Heat-related deaths in London more than doubled in 2022. Currently limited to streets with ≤25mph speed limit due to skid resistance constraints.",
    ukApplicability: ["London urban roads", "Major UK city centres", "Transport for London managed streets", "Local authority highway maintenance programmes"],
    insight: "Cool pavement also extends road longevity by reducing thermal degradation — delivering avoided maintenance costs beyond the cooling benefit. Funded from existing pavement maintenance budgets, not additional climate spend.",
    tags: ["highways", "roads", "heat", "urban heat island", "heatwave", "pavement", "reflective coating", "surface temperature", "city"],
  },
  {
    id: "ID_40", title: "Sheffield Grey to Green", organisation: "Sheffield City Council",
    sector: "Highways", hook: "60% grey to green · discharge cut 80% · 75,000 plants · 561% biodiversity uplift",
    hazards: { cause: ["Flooding – fluvial", "Flooding – surface water", "Heavy rainfall"], effect: ["Water damage", "Infrastructure disruption"] },
    assets: ["Road pavement", "Foot and cycle paths", "Rail track", "Trams", "Bridges", "Signals and signalling", "Buildings and stations"],
    measures: ["Sustainable Drainage Systems (SuDS)", "Rain gardens", "Vegetated swales", "Nature-based solutions", "Green street corridor"],
    location: "Sheffield, UK", ukRegion: "Yorkshire & Humber", year: "2014–ongoing",
    cost: "Phase 1 £3.6m; Phase 2 £6.3m; Phase 3 ongoing", costBand: "£1m–£10m per phase",
    summary: "1.5km urban green corridor replacing a former ring road dual carriageway with Sustainable Drainage Systems following the 2007 floods that caused £30m damage, killed 2 people, closed Sheffield station, cancelled tram services and damaged 28 roads.",
    transferability: "High",
    transferabilityNote: "UK case directly applicable nationwide. The largest retrofit grey-to-green project in the UK. Explicitly applicable to rail corridors following river valleys. Cross-sector impact — originally a road project that also protects rail and tram infrastructure downstream.",
    ukApplicability: ["UK city centre transport corridors", "Rail lines following river valleys", "Urban tram networks", "Local authority highway flood management"],
    insight: "SuDS reduced river discharge from a 1-in-100-year event by 87% — from 69.6 to 9.2 litres/sec. Inspired an £80m SuDS project in Mansfield. Now the default approach for Sheffield city centre regeneration.",
    tags: ["highways", "roads", "rail", "tram", "flooding", "surface water", "SuDS", "nature-based", "urban drainage", "heavy rainfall", "green infrastructure", "river valley", "urban flooding"],
  },
  {
    id: "ID_UKPN_01", title: "Croydon Grid Flood Defence", organisation: "UK Power Networks",
    sector: "Critical Infrastructure", hook: "69,000 customers protected · 1-in-1,000-year flood standard · £800k",
    hazards: { cause: ["Flooding – fluvial"], effect: ["Power disruption", "Loss of electricity supply to transport networks"] },
    assets: ["Electrical substation", "Transformers", "Electrical buildings"],
    measures: ["Permanent flood barriers", "Equipment sealing", "Equipment elevation above flood level", "Flood walls around transformers"],
    location: "Croydon, London, UK", ukRegion: "London & South East", year: "c.2022–2023",
    cost: "£800,000 (this site); £14m total programme since 2010", costBand: "Under £1m (site); £10m–£100m (programme)",
    summary: "Permanent flood barriers installed at Croydon Grid substation to withstand a 1-in-1,000-year flood of the River Wandle, protecting electricity supply to 69,000 homes and businesses including transport infrastructure in South London.",
    transferability: "High",
    transferabilityNote: "Part of UK Power Networks' programme that has now protected 119 substations from river, tidal and surface water flooding. Highly relevant to substations supporting rail electrification infrastructure and EV charging networks across South East England.",
    ukApplicability: ["UK electrical substations in flood-risk zones", "Rail electrification supply infrastructure", "Urban transport power supply", "South East England energy grid"],
    insight: "Equipment sealing, raising above flood level, and targeted flood walling at a single site cost £800k — part of a £14m programme protecting 119 substations since 2010. Demonstrates that site-specific incremental hardening at modest cost delivers significant network resilience.",
    tags: ["energy", "flooding", "fluvial", "critical infrastructure", "substation", "power supply", "resilience", "flood barriers", "south london", "rail electrification"],
  },
  {
    id: "ID_32", title: "Heathrow Airport Balancing Ponds", organisation: "Heathrow Airport Ltd",
    sector: "Aviation", hook: "Year-round flow control · £2.1m bundled into wider programme",
    hazards: { cause: ["Heavy rainfall", "Drought"], effect: ["Flooding – fluvial", "Flooding – surface water"] },
    assets: ["Access routes", "Airport services"],
    measures: ["Balancing ponds", "Tilting weirs", "Nature-based solution", "MBBR wastewater treatment"],
    location: "London, UK", ukRegion: "London & South East", year: "2016–2022",
    cost: "£2.1m (sheet piling component)", costBand: "£1m–£10m",
    summary: "Constructed balancing ponds to manage both drought and heavy rainfall events, controlling water volume entering drainage systems and reducing flood risk to airport access routes.",
    transferability: "High",
    transferabilityNote: "Tilting weir systems and Nature-based Solutions directly applicable to other airports, ports, and urban transport infrastructure facing surface water flooding.",
    ukApplicability: ["Other UK airports", "Urban transport hubs", "Coastal infrastructure"],
    insight: "Integrating climate adaptation into planned development activities kept costs minimal — bundled with a wider infrastructure programme rather than treated as standalone.",
    tags: ["aviation", "flooding", "drought", "nature-based", "urban drainage", "water management", "heavy rainfall", "surface water"],
  },
  {
    id: "ID_06", title: "Austrian Federal Railways Climate Adaptation", organisation: "Austrian Federal Railways (ÖBB)",
    sector: "Rail", hook: "212km barriers · 3,370ha protected forest · sensors across Alpine network",
    hazards: { cause: ["Heavy rainfall", "Storms", "Freeze-thaw cycles"], effect: ["Landslides", "Rockfalls", "Flooding – fluvial"] },
    assets: ["Track", "Bridges", "Earthworks", "Signalling", "Level crossings"],
    measures: ["Slope stabilisation", "Rockfall barriers", "Flood retention basins", "Early warning systems", "Real-time geotechnical monitoring"],
    location: "Alpine regions, Austria", ukRegion: "Applicable UK-wide", year: "2005–present",
    cost: "€3bn+ annual infrastructure budget", costBand: "Large programme",
    summary: "Comprehensive physical and predictive technology adaptations across the Alpine rail network, combining slope stabilisation, protective barriers and geotechnical sensor monitoring.",
    transferability: "High",
    transferabilityNote: "Rockfall barriers, drainage management and slope stabilisation directly applicable to UK upland rail. Particularly relevant to the Peak District, Scottish Highlands, and Welsh valley lines.",
    ukApplicability: ["UK upland rail", "Scottish Highlands lines", "Welsh Valley lines", "Peak District infrastructure"],
    insight: "Site-specific assessment — combining damage history, local conditions, and vulnerability analysis — was more effective than blanket solutions. Early warning systems reduced reactive maintenance costs significantly.",
    tags: ["rail", "landslide", "flooding", "sensors", "monitoring", "earthworks", "slope", "embankment", "precipitation", "rockfall"],
  },
  {
    id: "ID_01", title: "Port of Calais Extension and Sea Defence", organisation: "Société des Ports du Détroit",
    sector: "Maritime", hook: "3.3km seawall · 100-year design life · €863m total",
    hazards: { cause: ["Sea level rise", "Storms and high winds"], effect: ["Storm surge", "Coastal flooding", "Coastal erosion"] },
    assets: ["Port structures", "Terminal", "Retaining walls"],
    measures: ["3.3km sea wall", "Land reclamation", "Reinforced retaining walls", "100-year design life specification"],
    location: "Calais, France", ukRegion: "Applicable to UK coastal", year: "2021",
    cost: "€863m total project", costBand: "£100m+",
    summary: "Doubled port capacity while building a 3.3km seawall designed for 100-year service life, explicitly accounting for sea level rise and climate change projections in all structural specifications.",
    transferability: "High",
    transferabilityNote: "Directly applicable to UK ports facing sea level rise risk. Humber Ports specifically identified as having medium sea level rise risk.",
    ukApplicability: ["Humber Ports", "Port of Dover", "Thames Estuary infrastructure", "East coast ports"],
    insight: "Treating climate resilience as a core design requirement from the outset — not as an add-on — allowed the seawall to be cost-effectively integrated into a wider port upgrade.",
    tags: ["maritime", "ports", "sea level rise", "storm surge", "coastal", "flooding", "seawall", "infrastructure"],
  },
  {
    id: "ID_11", title: "Deutsche Bahn Climate Adaptation Measures", organisation: "Deutsche Bahn",
    sector: "Rail", hook: "25% storm damage reduction · 20% fewer heat disruptions · IoT across national network",
    hazards: { cause: ["High temperatures", "Storms and high winds"], effect: ["Vegetation dieback", "Storm damage", "Track overheating"] },
    assets: ["Tracks", "Trains", "Overhead lines", "Lineside vegetation"],
    measures: ["Air-conditioned rolling stock (ICE 4)", "AI-assisted vegetation mapping", "IoT temperature sensors", "DB Climate Forest programme"],
    location: "Germany", ukRegion: "Applicable UK-wide", year: "2007–2024",
    cost: "€6bn (ICE 4 fleet); €625m (vegetation programme)", costBand: "Large programme",
    summary: "Phased adaptation combining air-conditioned rolling stock, AI-assisted vegetation management via satellite data, and IoT sensor networks to address escalating heat and storm risks.",
    transferability: "High",
    transferabilityNote: "Vegetation management and rolling stock air-conditioning directly applicable to UK rail. Highest priority in South and East England where temperatures are projected to reach higher peaks.",
    ukApplicability: ["Network Rail Southern region", "East Midlands Railway", "UK rolling stock procurement", "Lineside vegetation management"],
    insight: "Vegetation management delivered 25% reduction in storm damage between 2018 and 2020 — one of the highest ROI findings in the HIVE database. Heat disruptions fell 20% after ICE 4 deployment.",
    tags: ["rail", "heat", "temperature", "vegetation", "sensors", "rolling stock", "storms", "heatwave", "overheating"],
  },
];

const HAZARDS_CAUSE = ["Heavy rainfall", "High temperatures", "Storms", "Sea level rise", "Drought", "Freeze-thaw"];
const SECTORS = ["Rail", "Aviation", "Maritime", "Highways"];
const UK_REGIONS = ["London & South East", "East of England", "East Midlands", "North West", "Scotland", "Wales", "Coastal UK", "UK-wide"];
const COST_BANDS = ["Under £1m", "£1m–£10m", "£10m–£100m", "£100m+", "Large programme"];

const detectIntent = (query) => {
  const q = query.toLowerCase();
  const detectedHazards = [], detectedSectors = [];
  if (q.includes("flood") || q.includes("water") || q.includes("rain") || q.includes("drainage")) detectedHazards.push("Heavy rainfall");
  if (q.includes("heat") || q.includes("hot") || q.includes("temperature") || q.includes("heatwave")) detectedHazards.push("High temperatures");
  if (q.includes("storm") || q.includes("wind")) detectedHazards.push("Storms");
  if (q.includes("sea level") || q.includes("coastal") || q.includes("surge")) detectedHazards.push("Sea level rise");
  if (q.includes("landslide") || q.includes("slope") || q.includes("embankment") || q.includes("rockfall") || q.includes("stability")) detectedHazards.push("Heavy rainfall");
  if (q.includes("drought") || q.includes("dry")) detectedHazards.push("Drought");
  if (q.includes("rail") || q.includes("train") || q.includes("track") || q.includes("railway")) detectedSectors.push("Rail");
  if (q.includes("aviation") || q.includes("airport") || q.includes("heathrow")) detectedSectors.push("Aviation");
  if (q.includes("port") || q.includes("maritime") || q.includes("harbour")) detectedSectors.push("Maritime");
  if (q.includes("road") || q.includes("highway") || q.includes("motorway")) detectedSectors.push("Highways");
  return { detectedHazards: [...new Set(detectedHazards)], detectedSectors: [...new Set(detectedSectors)] };
};

const getMatchReasons = (cs, query, selectedHazards, selectedSectors) => {
  const reasons = [];
  const q = query.toLowerCase();
  const allHazards = [...cs.hazards.cause, ...cs.hazards.effect];
  if (q) {
    const words = q.split(" ").filter(w => w.length > 3);
    words.forEach(word => {
      cs.tags.forEach(t => { if (t.includes(word)) reasons.push(t); });
      allHazards.forEach(h => { if (h.toLowerCase().includes(word)) reasons.push(h); });
      cs.measures.forEach(m => { if (m.toLowerCase().includes(word)) reasons.push(m); });
    });
  }
  selectedHazards.forEach(h => { if (allHazards.some(ch => ch.toLowerCase().includes(h.toLowerCase()))) reasons.push(h); });
  selectedSectors.forEach(s => { if (cs.sector.toLowerCase() === s.toLowerCase()) reasons.push(cs.sector); });
  return [...new Set(reasons)].slice(0, 4);
};

const scoreResult = (cs, query) => {
  if (!query.trim()) return 1;
  const q = query.toLowerCase();
  let score = 0;
  const allHazards = [...cs.hazards.cause, ...cs.hazards.effect];
  if (cs.title.toLowerCase().includes(q)) score += 10;
  if (cs.summary.toLowerCase().includes(q)) score += 6;
  if (cs.insight.toLowerCase().includes(q)) score += 4;
  cs.tags.forEach(t => { if (t.includes(q) || q.includes(t)) score += 3; });
  allHazards.forEach(h => { if (h.toLowerCase().includes(q) || q.includes(h.toLowerCase())) score += 5; });
  cs.measures.forEach(m => { if (m.toLowerCase().includes(q)) score += 3; });
  cs.ukApplicability.forEach(a => { if (a.toLowerCase().includes(q)) score += 4; });
  const words = q.split(" ").filter(w => w.length > 3);
  words.forEach(word => {
    cs.tags.forEach(t => { if (t.includes(word)) score += 2; });
    if (cs.summary.toLowerCase().includes(word)) score += 1;
    allHazards.forEach(h => { if (h.toLowerCase().includes(word)) score += 3; });
  });
  return score;
};

const searchCaseStudies = (query, selectedHazards, selectedSectors, selectedRegions, selectedCosts) => {
  let results = [...CASE_STUDIES];
  if (selectedHazards.length > 0) {
    results = results.filter(cs => {
      const allH = [...cs.hazards.cause, ...cs.hazards.effect];
      return selectedHazards.some(h => allH.some(ch => ch.toLowerCase().includes(h.toLowerCase())));
    });
  }
  if (selectedSectors.length > 0) results = results.filter(cs => selectedSectors.some(s => cs.sector.toLowerCase() === s.toLowerCase()));
  if (selectedRegions.length > 0) results = results.filter(cs => selectedRegions.some(r => cs.ukRegion.includes(r) || cs.ukApplicability.some(a => a.toLowerCase().includes(r.toLowerCase()))));
  if (selectedCosts.length > 0) results = results.filter(cs => selectedCosts.includes(cs.costBand));
  if (query.trim()) {
    results = results.map(cs => ({ ...cs, _score: scoreResult(cs, query) })).filter(cs => cs._score > 0).sort((a, b) => b._score - a._score);
  }
  return results;
};

const generateSynthesis = (results, query) => {
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
      ? `A consistent pattern across these cases: ${commonMeasureTypes.slice(0, 2).join(" and ")} are deployed together rather than in isolation. ${highTransfer.length} of ${results.length} cases have explicitly identified UK applicability. ${results[0].insight}`
      : `${highTransfer.length} of ${results.length} matching cases have high transferability to UK transport contexts. The strongest cross-cutting lesson is that proactive adaptation — integrating resilience into planned maintenance cycles — consistently delivers lower cost than reactive repair after climate events.`;
  return { count: results.length, sectors, allCause: [...new Set(results.flatMap(r => r.hazards.cause))].slice(0, 3), commonMeasures: [...new Set(allMeasures)].slice(0, 4), commonMeasureTypes, highTransferCount: highTransfer.length, insightSentence };
};

// ── THEMES ──
const THEMES = {
  light: {
    key: 'light', label: 'Light',
    bg: '#F7F5F0', surface: '#ffffff', surfaceAlt: '#fafaf9',
    border: '#e7e5e4', borderStrong: '#a8a29e',
    textPrimary: '#1c1917', textSecondary: '#78716c', textMuted: '#a8a29e',
    accent: '#047857', accentBg: '#d1fae5', accentText: '#065f46',
    navBg: 'rgba(255,255,255,0.92)', gradFade: '#F7F5F0',
    badgeBg: '#ecfdf5', badgeText: '#065f46', badgeBorder: '#a7f3d0',
    inputBg: '#ffffff', inputBorder: '#d6d3d1',
    sectionBg: '#f5f5f4',
  },
  dark: {
    key: 'dark', label: 'Dark',
    bg: '#0d1117', surface: '#161b27', surfaceAlt: '#1e2535',
    border: '#2d3446', borderStrong: '#4a5568',
    textPrimary: '#e2e8f0', textSecondary: '#94a3b8', textMuted: '#64748b',
    accent: '#34d399', accentBg: '#064e3b', accentText: '#34d399',
    navBg: 'rgba(13,17,23,0.96)', gradFade: '#0d1117',
    badgeBg: '#064e3b', badgeText: '#34d399', badgeBorder: '#065f46',
    inputBg: '#1e2535', inputBorder: '#2d3446',
    sectionBg: '#161b27',
  },
  dft: {
    // DfT / GOV.UK palette: white bg, GOV.UK blue (#1d70b8) for interactive elements,
    // DfT green (#006853) used sparingly as accent border stripe only (not as fill).
    // ACCESSIBILITY BACKLOG: improve colour-contrast ratios across all themes to WCAG AA
    // (4.5:1 normal text, 3:1 large text), add focus-visible ring styles, and audit
    // filter pill contrast for selected states. Log as issue before v1 launch.
    key: 'dft', label: 'DfT',
    bg: '#f3f2f1', surface: '#ffffff', surfaceAlt: '#f8f8f8',
    border: '#b1b4b6', borderStrong: '#505a5f',
    textPrimary: '#0b0c0c', textSecondary: '#505a5f', textMuted: '#6f777b',
    accent: '#1d70b8', accentBg: '#e8f1fb', accentText: '#003a70',
    navBg: 'rgba(255,255,255,0.97)', gradFade: '#f3f2f1',
    badgeBg: '#e8f1fb', badgeText: '#003a70', badgeBorder: '#99c4e8',
    inputBg: '#ffffff', inputBorder: '#0b0c0c',
    sectionBg: '#f8f8f8',
    // DfT green stripe — applied manually to nav left-border / logo accent in JSX below
    dftGreen: '#006853',
  },
};


const SECTOR_COLOR = {
  Rail: "bg-blue-50 text-blue-700 border-blue-200",
  Aviation: "bg-sky-50 text-sky-700 border-sky-200",
  Maritime: "bg-teal-50 text-teal-700 border-teal-200",
  Road: "bg-amber-50 text-amber-700 border-amber-200",
  Highways: "bg-amber-50 text-amber-700 border-amber-200",
  Energy: "bg-purple-50 text-purple-700 border-purple-200",
  Multiple: "bg-stone-50 text-stone-600 border-stone-200",
};

// ── MARQUEE CARD ──
const MarqueeCard = ({ c, onClick, dimmed, highlighted }) => {
  const [hovered, setHovered] = useState(false);
  return (
  <div
    onClick={() => onClick(c)}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    className={`flex-shrink-0 cursor-pointer rounded-2xl border marquee-card ${highlighted ? 'highlighted' : ''} transition-all duration-300 p-4`}
    style={{
      width: "280px",
      fontFamily: "'DM Sans', sans-serif",
      opacity: dimmed ? 0.25 : 1,
      boxShadow: highlighted ? "0 2px 12px rgba(0,0,0,0.10)" : hovered ? "0 8px 24px rgba(0,0,0,0.12)" : "none",
      transform: highlighted ? "translateY(-2px)" : hovered ? "translateY(-3px) scale(1.03)" : "none",
      borderColor: hovered && !highlighted ? "var(--border-strong)" : undefined,
    }}
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <h4 className="text-sm font-semibold leading-snug">{c.title}</h4>
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${SECTOR_COLOR[c.sector] || "bg-stone-50 text-stone-600 border-stone-200"}`}>{c.sector}</span>
    </div>
    <p className="measure text-xs mb-2 line-clamp-1">{c.measure}</p>
    <p className="hook text-xs font-semibold">{c.hook}</p>
  </div>
  );
};

// ── STANDARD MARQUEE (slowed) ──
const Marquee2D = ({ cases, onCardClick, matchingSectors, matchingHazards, hasFilters, gradFade = '#F7F5F0' }) => {
  const half = Math.ceil(cases.length / 2);
  const rowA = cases.slice(0, half);
  const rowB = cases.slice(half);

  const isHighlighted = (c) => {
    if (!hasFilters) return false;
    const sectorMatch = matchingSectors.length === 0 || matchingSectors.includes(c.sector);
    const hazardMatch = matchingHazards.length === 0 || c.hazards.some(h => matchingHazards.some(mh => h.toLowerCase().includes(mh.toLowerCase())));
    return sectorMatch && hazardMatch;
  };
  const isDimmed = (c) => hasFilters && !isHighlighted(c);

  return (
    <div className="relative py-6" style={{ overflow: "visible" }}>
      <div style={{ overflow: "hidden", paddingTop: "12px", paddingBottom: "12px", marginBottom: "4px" }} onMouseEnter={e => e.currentTarget.querySelector('.track-a').style.animationPlayState = 'paused'} onMouseLeave={e => e.currentTarget.querySelector('.track-a').style.animationPlayState = 'running'}>
        <div className="track-a flex gap-3" style={{ width: "max-content", animation: "scrollX 160s linear infinite" }}>
          {[...rowA, ...rowA].map((c, i) => <MarqueeCard key={`a-${i}`} c={c} onClick={onCardClick} dimmed={isDimmed(c)} highlighted={isHighlighted(c)} />)}
        </div>
      </div>
      <div style={{ overflow: "hidden", paddingTop: "12px", paddingBottom: "12px" }} onMouseEnter={e => e.currentTarget.querySelector('.track-b').style.animationPlayState = 'paused'} onMouseLeave={e => e.currentTarget.querySelector('.track-b').style.animationPlayState = 'running'}>
        <div className="track-b flex gap-3" style={{ width: "max-content", animation: "scrollX 185s linear infinite reverse" }}>
          {[...rowB, ...rowB].map((c, i) => <MarqueeCard key={`b-${i}`} c={c} onClick={onCardClick} dimmed={isDimmed(c)} highlighted={isHighlighted(c)} />)}
        </div>
      </div>
    </div>
  );
};

// ── SCROLL VELOCITY MARQUEE ──
// Each row has a base direction (1 or -1). Last scroll direction modulates the effective
// direction: scroll down → rows move in their default direction; scroll up → rows reverse.
// Direction latches — stays until next scroll event changes it.
// Uses translateX via RAF. Wrap logic uses simple range clamping (no modulo weirdness).

const VelocityRow = ({ cases, onCardClick, isHighlighted, isDimmed, direction = 1 }) => {
  const trackRef = useRef(null);
  const xRef = useRef(0);
  // lastScrollDir: +1 = scrolling down (default), -1 = scrolling up
  const lastScrollDirRef = useRef(1);

  // Shared scroll direction listener — updates the latch
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      if (Math.abs(dy) > 1) lastScrollDirRef.current = dy > 0 ? 1 : -1;
      lastY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let rafId;
    const SPEED = 0.9; // px per frame at 60fps ≈ 54px/s — gentle, same feel as slow marquee
    const loop = () => {
      if (!trackRef.current) { rafId = requestAnimationFrame(loop); return; }
      const trackW = trackRef.current.scrollWidth / 2;
      if (trackW <= 0) { rafId = requestAnimationFrame(loop); return; }

      // Effective direction = row base direction × last scroll direction
      const effectiveDir = direction * lastScrollDirRef.current;
      xRef.current -= SPEED * effectiveDir;

      // Clamp to [-trackW, 0] regardless of which direction we're going
      if (xRef.current < -trackW) xRef.current += trackW;
      if (xRef.current > 0) xRef.current -= trackW;

      trackRef.current.style.transform = `translateX(${xRef.current.toFixed(2)}px)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [direction]);

  return (
    <div style={{ overflow: "hidden", paddingTop: "12px", paddingBottom: "12px" }}>
      <div ref={trackRef} className="flex gap-3" style={{ width: "max-content", willChange: "transform" }}>
        {[...cases, ...cases].map((c, i) => (
          <MarqueeCard key={i} c={c} onClick={onCardClick} dimmed={isDimmed(c)} highlighted={isHighlighted(c)} />
        ))}
      </div>
    </div>
  );
};

const ScrollVelocityMarquee = ({ cases, onCardClick, matchingSectors, matchingHazards, hasFilters }) => {
  const half = Math.ceil(cases.length / 2);
  const rowA = cases.slice(0, half);
  const rowB = cases.slice(half);

  const isHighlighted = (c) => {
    if (!hasFilters) return false;
    const sectorMatch = matchingSectors.length === 0 || matchingSectors.includes(c.sector);
    const hazardMatch = matchingHazards.length === 0 || c.hazards.some(h => matchingHazards.some(mh => h.toLowerCase().includes(mh.toLowerCase())));
    return sectorMatch && hazardMatch;
  };
  const isDimmed = (c) => hasFilters && !isHighlighted(c);

  return (
    <div className="relative py-4">
      <VelocityRow cases={rowA} onCardClick={onCardClick} isHighlighted={isHighlighted} isDimmed={isDimmed} direction={1} />
      <VelocityRow cases={rowB} onCardClick={onCardClick} isHighlighted={isHighlighted} isDimmed={isDimmed} direction={-1} />
    </div>
  );
};

// ── SHARED COMPONENTS ──

const TransferabilityBadge = ({ level }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${level === "High" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${level === "High" ? "bg-emerald-500" : "bg-amber-500"}`} />
    {level} UK transferability
  </span>
);

const HazardBadge = ({ hazard, type }) => {
  const causeColors = {
    "Heavy rainfall": "bg-blue-50 text-blue-700 border-blue-200",
    "High temperatures": "bg-orange-50 text-orange-700 border-orange-200",
    "Storms": "bg-purple-50 text-purple-700 border-purple-200",
    "Sea level rise": "bg-teal-50 text-teal-700 border-teal-200",
    "Drought": "bg-amber-50 text-amber-700 border-amber-200",
    "Freeze-thaw": "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span className={`inline-flex items-center border rounded text-xs font-medium px-2 py-0.5 ${type === "cause" ? (causeColors[hazard] || "bg-gray-50 text-gray-600 border-gray-200") : "bg-stone-50 text-stone-600 border-stone-200"}`}>
      {type === "effect" && <span className="mr-1 opacity-40">→</span>}
      {hazard}
    </span>
  );
};

const FilterPill = ({ label, selected, onClick, color }) => (
  <button onClick={onClick}
    className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium border"
    style={selected
      ? { background: color === 'emerald' ? 'var(--accent)' : color === 'indigo' ? '#4338ca' : 'var(--text-primary)', color: '#fff', borderColor: color === 'emerald' ? 'var(--accent)' : color === 'indigo' ? '#4338ca' : 'var(--text-primary)' }
      : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
    {selected && <span className="mr-1 opacity-70">✓</span>}
    {label}
  </button>
);

const CaseStudyCard = ({ cs, onClick, matchReasons, onAddToBrief, inBrief }) => (
  <div onClick={() => onClick(cs)}
    className="group hive-card cursor-pointer rounded-2xl border transition-all duration-200 p-5 flex flex-col"
    style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <div className="flex items-start gap-3 mb-1">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest t-accent">{cs.sector}</span>
          <span className="t-text-muted">·</span>
          <span className="text-xs t-text-sec">{cs.location}</span>
          <span className="t-text-muted">·</span>
          <span className="text-xs t-text-muted">{cs.year}</span>
        </div>
        <h3 className="text-base font-semibold leading-snug transition-colors">{cs.title}</h3>
      </div>
    </div>
    <p className="text-xs font-semibold t-accent mb-2">{cs.hook}</p>
    <p className="text-sm t-text-sec leading-relaxed mb-3 line-clamp-2 flex-1">{cs.summary}</p>
    {matchReasons && matchReasons.length > 0 && (
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-xs t-text-muted">Matched on:</span>
        {matchReasons.map(r => <span key={r} className="text-xs t-accent-bg t-accent-text border px-1.5 py-0.5 rounded font-medium" style={{ borderColor: 'var(--accent)' }}>{r}</span>)}
      </div>
    )}
    <div className="flex flex-wrap gap-1.5 mb-3">
      {cs.hazards.cause.slice(0, 2).map(h => <HazardBadge key={h} hazard={h} type="cause" />)}
      {cs.hazards.effect.slice(0, 2).map(h => <HazardBadge key={h} hazard={h} type="effect" />)}
    </div>
    <div className="t-accent-bg border rounded-xl px-3 py-2 mb-3" style={{ borderColor: 'var(--accent)', opacity: 0.85 }}>
      <div className="flex items-center gap-1.5 mb-1">
        <svg className="w-3 h-3 flex-shrink-0 t-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <span className="text-xs font-semibold t-accent">UK applicability</span>
      </div>
      <p className="text-xs t-text-sec leading-relaxed">{cs.transferabilityNote}</p>
    </div>
    <div className="flex items-center justify-between pt-1 border-t t-border">
      <div className="flex items-center gap-2">
        <TransferabilityBadge level={cs.transferability} />
        <span className="text-xs t-text-muted">{cs.costBand}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={e => { e.stopPropagation(); onAddToBrief(cs); }}
          className="text-xs font-medium px-2.5 py-1 rounded-full border transition-all"
          style={inBrief ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          {inBrief ? "✓ In brief" : "+ Add to brief"}
        </button>
        <span className="text-xs font-medium t-accent flex items-center gap-1 group-hover:gap-1.5 transition-all" style={{ color: 'var(--accent)' }}>
          Full case
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </span>
      </div>
    </div>
  </div>
);

const CaseStudyDetail = ({ cs, onClose, onAddToBrief, inBrief }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
    <div className="hive-modal rounded-3xl shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }} onClick={e => e.stopPropagation()}>
      <div className="sticky top-0 hive-modal backdrop-blur border-b px-6 py-4 flex items-start justify-between rounded-t-3xl" style={{ borderColor: 'var(--border)' }}>
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">{cs.sector}</span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">{cs.location}</span>
          </div>
          <h2 className="text-xl font-normal text-stone-900 leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>{cs.title}</h2>
          <p className="text-sm font-semibold text-emerald-700 mt-1">{cs.hook}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors flex-shrink-0 mt-1">
          <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="p-6 space-y-5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Key insight</span>
          </div>
          <p className="text-sm text-stone-800 leading-relaxed font-medium">{cs.insight}</p>
        </div>
        <div className="bg-stone-50 rounded-2xl p-4">
          <p className="text-sm text-stone-700 leading-relaxed">{cs.summary}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Climate drivers</h4>
            <div className="flex flex-wrap gap-1.5">{cs.hazards.cause.map(h => <HazardBadge key={h} hazard={h} type="cause" />)}</div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Impacts</h4>
            <div className="flex flex-wrap gap-1.5">{cs.hazards.effect.map(h => <HazardBadge key={h} hazard={h} type="effect" />)}</div>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Adaptation measures</h4>
          <ul className="space-y-1.5">{cs.measures.map(m => <li key={m} className="flex items-start gap-2 text-sm text-stone-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />{m}</li>)}</ul>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Investment</h4>
            <p className="text-sm font-medium text-stone-800">{cs.cost}</p>
            <p className="text-xs text-stone-400 mt-0.5">Band: {cs.costBand}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Delivery period</h4>
            <p className="text-sm font-medium text-stone-800">{cs.year}</p>
          </div>
        </div>
        <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/50">
          <div className="mb-2"><TransferabilityBadge level={cs.transferability} /></div>
          <p className="text-sm text-stone-700 leading-relaxed mb-3">{cs.transferabilityNote}</p>
          <div className="flex flex-wrap gap-1.5">{cs.ukApplicability.map(a => <span key={a} className="text-xs bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">{a}</span>)}</div>
        </div>
        <p className="text-xs text-stone-400 pt-1 border-t border-stone-100">Ref: {cs.id} · {cs.organisation} · Curated & verified by HIVE</p>
        <button
          onClick={() => { onAddToBrief(cs); onClose(); }}
          className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all ${inBrief ? "bg-stone-100 text-stone-500 border border-stone-200" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}>
          {inBrief ? "✓ Already in your AI brief" : "＋ Add to AI brief"}
        </button>
      </div>
    </div>
  </div>
);

const SynthesisPanel = ({ synthesis }) => (
  <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Cross-case analysis</span>
        <span className="text-xs text-stone-400">{synthesis.count} case {synthesis.count === 1 ? "study" : "studies"}</span>
      </div>
      <span className="text-xs text-stone-400 italic hidden sm:block">Indicative — review sources directly</span>
    </div>
    <p className="text-sm text-stone-800 leading-relaxed mb-4 font-medium">{synthesis.insightSentence}</p>
    <div className="grid grid-cols-2 gap-3 mb-3">
      {synthesis.allCause.length > 0 && (
        <div>
          <span className="text-xs text-stone-400 uppercase tracking-wider block mb-1.5">Climate drivers</span>
          <div className="flex flex-wrap gap-1">{synthesis.allCause.map(h => <HazardBadge key={h} hazard={h} type="cause" />)}</div>
        </div>
      )}
      {synthesis.commonMeasures.length > 0 && (
        <div>
          <span className="text-xs text-stone-400 uppercase tracking-wider block mb-1.5">Common measures</span>
          <div className="flex flex-wrap gap-1">{synthesis.commonMeasures.slice(0, 3).map(m => <span key={m} className="text-xs bg-white border border-stone-200 text-stone-700 px-1.5 py-0.5 rounded">{m}</span>)}</div>
        </div>
      )}
    </div>
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        {synthesis.sectors.map(s => <span key={s} className="text-xs bg-white/80 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full font-medium">{s}</span>)}
        <span className="text-xs text-stone-400 ml-1">{synthesis.highTransferCount} of {synthesis.count} with high UK transferability</span>
      </div>
      {/* Link 3 — filtered brief from this analysis */}
      <a href="/brief" onClick={e => { e.preventDefault(); alert(`→ /brief?from=analysis\nGenerates a structured brief from these ${synthesis.count} matched cases, pre-populated with this cross-case analysis.`); }}
        className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors"
        style={{ background: '#065f46', color: '#fff' }}
        title="Generate brief from this analysis">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Generate brief from this analysis →
      </a>
    </div>
  </div>
);

// ── HEATMAP DATA ──
const HEATMAP_SECTORS = ["Roads", "Rail", "Aviation", "Maritime"];
const HEATMAP_HAZARDS = [
  { id: "heat",     label: "High Temp",    match: ["heat", "temperature", "thermal"] },
  { id: "rain",     label: "Heavy Rain",   match: ["rain", "rainfall", "precipitation"] },
  { id: "flooding", label: "Flooding",     match: ["flood", "surface water", "fluvial", "coastal"] },
  { id: "storms",   label: "Storms",       match: ["storm", "wind", "cyclone"] },
  { id: "sealevel", label: "Sea Level",    match: ["sea level", "coastal", "tidal", "inundation"] },
  { id: "drought",  label: "Drought",      match: ["drought", "dry", "water scarcity"] },
];
const HEATMAP_MATRIX = {
  Roads:    { heat: 3, rain: 5, flooding: 5, storms: 3, sealevel: 3, drought: 2 },
  Rail:     { heat: 6, rain: 6, flooding: 4, storms: 1, sealevel: 4, drought: 2 },
  Aviation: { heat: 7, rain: 3, flooding: 4, storms: 5, sealevel: 2, drought: 1 },
  Maritime: { heat: 6, rain: 2, flooding: 3, storms: 6, sealevel: 5, drought: 3 },
};
const HEATMAP_MAX = 7;

const HeatmapPanel = ({ activeSectors = [], activeHazards = [], position, onTogglePosition }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  // normalise active context to heatmap IDs
  const matchedSectors = HEATMAP_SECTORS.filter(s =>
    activeSectors.some(a => s.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(s.toLowerCase()))
  );
  const matchedHazardIds = HEATMAP_HAZARDS
    .filter(h => activeHazards.some(a => h.match.some(m => a.toLowerCase().includes(m))))
    .map(h => h.id);

  const getCellColor = (count, sectorMatch, hazardMatch) => {
    if (count === 0) return { bg: "rgba(0,0,0,0.04)", text: "#9ca3af", border: "transparent" };
    const isContextMatch = sectorMatch && hazardMatch;
    const isPartialMatch = sectorMatch || hazardMatch;
    if (isContextMatch) return { bg: "#1d70b8", text: "#fff", border: "#1558a0" };
    const intensity = count / HEATMAP_MAX;
    if (isPartialMatch) {
      return intensity >= 0.7
        ? { bg: "#bbf7d0", text: "#14532d", border: "#86efac" }
        : { bg: "#dcfce7", text: "#065f46", border: "#bbf7d0" };
    }
    return intensity >= 0.7
      ? { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" }
      : intensity >= 0.4
        ? { bg: "#ecfdf5", text: "#065f46", border: "#d1fae5" }
        : { bg: "#f0fdf4", text: "#86efac", border: "#d1fae5" };
  };

  return (
    <div className="rounded-xl border mb-5 overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-sm flex-shrink-0" style={{ background: '#006853' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Adaptation options coverage</span>
          <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>— click any cell to explore options for that combination</span>
        </div>
        <div className="flex items-center gap-3">
          {/* position toggle */}
          <div className="flex items-center gap-1 rounded-lg p-0.5 border" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
            {["above", "below"].map(pos => (
              <button key={pos} onClick={() => onTogglePosition(pos)}
                className="text-xs px-2.5 py-1 rounded-md transition-all font-medium capitalize"
                style={{
                  background: position === pos ? 'var(--accent)' : 'transparent',
                  color: position === pos ? '#fff' : 'var(--text-muted)',
                }}>
                {pos}
              </button>
            ))}
          </div>
          <a href="/options" onClick={e => { e.preventDefault(); alert("→ /options\nFull adaptation options library with filters"); }}
            className="text-xs font-semibold"
            style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Browse all options →
          </a>
        </div>
      </div>

      {/* grid */}
      <div className="px-4 py-3 overflow-x-auto">
        <table style={{ borderCollapse: 'separate', borderSpacing: '3px', width: '100%', minWidth: 460 }}>
          <thead>
            <tr>
              <th style={{ width: 80 }} />
              {HEATMAP_HAZARDS.map(h => {
                const isActive = matchedHazardIds.includes(h.id);
                return (
                  <th key={h.id} className="text-center pb-1.5" style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap', paddingLeft: 2, paddingRight: 2,
                  }}>
                    {h.label}
                    {isActive && <div className="w-1 h-1 rounded-full mx-auto mt-0.5" style={{ background: 'var(--accent)' }} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HEATMAP_SECTORS.map(sector => {
              const sectorMatch = matchedSectors.includes(sector);
              return (
                <tr key={sector}>
                  <td className="pr-3 py-0.5" style={{
                    fontSize: 12, fontWeight: sectorMatch ? 700 : 600,
                    color: sectorMatch ? 'var(--accent)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}>
                    {sector}
                  </td>
                  {HEATMAP_HAZARDS.map(h => {
                    const count = HEATMAP_MATRIX[sector]?.[h.id] ?? 0;
                    const hazardMatch = matchedHazardIds.includes(h.id);
                    const isHovered = hoveredCell === `${sector}-${h.id}`;
                    const colors = getCellColor(count, sectorMatch, hazardMatch);
                    return (
                      <td key={h.id} className="text-center" style={{ padding: '2px' }}>
                        {count > 0 ? (
                          <button
                            onMouseEnter={() => setHoveredCell(`${sector}-${h.id}`)}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => alert(`→ /options?sector=${sector.toLowerCase()}&hazard=${h.id}\n${count} adaptation option${count !== 1 ? 's' : ''} for ${sector} × ${h.label}`)}
                            title={`${count} option${count !== 1 ? 's' : ''} — ${sector} × ${h.label}`}
                            style={{
                              width: '100%', minWidth: 38, padding: '5px 4px',
                              background: isHovered ? '#1d70b8' : colors.bg,
                              color: isHovered ? '#fff' : colors.text,
                              border: `1px solid ${isHovered ? '#1558a0' : colors.border}`,
                              borderRadius: 4, fontSize: 13, fontWeight: 700,
                              cursor: 'pointer', transition: 'all 0.1s',
                              fontFamily: 'inherit',
                            }}>
                            {count}
                          </button>
                        ) : (
                          <div style={{
                            minWidth: 38, padding: '5px 4px',
                            background: colors.bg, borderRadius: 4,
                            fontSize: 11, color: colors.text, textAlign: 'center',
                          }}>—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* legend */}
        <div className="flex items-center gap-1.5 mt-2">
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>FEWER</span>
          {['#f0fdf4','#d1fae5','#bbf7d0','#6ee7b7'].map((c,i) => (
            <div key={i} style={{ width: 14, height: 8, background: c, borderRadius: 2, border: '1px solid #d1d5db' }} />
          ))}
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>MORE</span>
          {(matchedSectors.length > 0 || matchedHazardIds.length > 0) && (
            <span className="ml-3 flex items-center gap-1" style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              <div style={{ width: 14, height: 8, background: '#1d70b8', borderRadius: 2 }} />
              matches your current search
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ──
export default function HIVEPrototypeV4() {
  const [query, setQuery] = useState("");
  const [selectedHazards, setSelectedHazards] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCosts, setSelectedCosts] = useState([]);
  const [aiDetectedHazards, setAiDetectedHazards] = useState([]);
  const [aiDetectedSectors, setAiDetectedSectors] = useState([]);
  const [results, setResults] = useState(CASE_STUDIES);
  const [selectedCase, setSelectedCase] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeMatchReasons, setActiveMatchReasons] = useState({});
  const [themeKey, setThemeKey] = useState("light");
  const T = THEMES[themeKey];
  const [marqueeView, setMarqueeView] = useState("marquee");
  const [marqueeSelectedId, setMarqueeSelectedId] = useState(null); // caseStudyId or 'PH_SECTOR'
  const [brief, setBrief] = useState([]);
  const [briefOpen, setBriefOpen] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (query || selectedHazards.length || selectedSectors.length || selectedRegions.length || selectedCosts.length) {
      setMarqueeSelectedId(null);
    }
  }, [query, selectedHazards, selectedSectors, selectedRegions, selectedCosts]);
  const allActiveHazards = [...new Set([...selectedHazards, ...aiDetectedHazards])];
  const allActiveSectors = [...new Set([...selectedSectors, ...aiDetectedSectors])];
  const hasActiveFilters = query || selectedHazards.length > 0 || selectedSectors.length > 0 || selectedRegions.length > 0 || selectedCosts.length > 0;
  const activeFilterCount = selectedHazards.length + selectedSectors.length + selectedRegions.length + selectedCosts.length + aiDetectedHazards.length + aiDetectedSectors.length;

  // What the marquee should respond to (sector + hazard filters only, not full-text query)
  const marqueeMatchingSectors = allActiveSectors;
  const marqueeMatchingHazards = allActiveHazards;
  const marqueeHasFilters = marqueeMatchingSectors.length > 0 || marqueeMatchingHazards.length > 0;
  const [scrolledToResults, setScrolledToResults] = useState(false);
  const [heatmapPosition, setHeatmapPosition] = useState("above"); // 'above' | 'below'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const { detectedHazards, detectedSectors } = detectIntent(query);
        setAiDetectedHazards(detectedHazards);
        setAiDetectedSectors(detectedSectors);
      } else {
        setAiDetectedHazards([]);
        setAiDetectedSectors([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const r = searchCaseStudies(query, allActiveHazards, allActiveSectors, selectedRegions, selectedCosts);
    setResults(r);
    const reasons = {};
    r.forEach(cs => { reasons[cs.id] = getMatchReasons(cs, query, allActiveHazards, allActiveSectors); });
    setActiveMatchReasons(reasons);
    setSynthesis(hasActiveFilters && r.length > 0 ? generateSynthesis(r, query) : null);
  }, [query, selectedHazards, selectedSectors, aiDetectedHazards, aiDetectedSectors, selectedRegions, selectedCosts]);

  // Scroll to results only once per search session, after typing settles
  useEffect(() => {
    if (!hasActiveFilters) { setScrolledToResults(false); return; }
    if (scrolledToResults) return;
    const timer = setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setScrolledToResults(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [hasActiveFilters, query, selectedHazards, selectedSectors]);

  const toggle = (setter, val) => setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  const toggleBrief = (cs) => setBrief(prev => prev.some(x => x.id === cs.id) ? prev.filter(x => x.id !== cs.id) : [...prev, cs]);
  const removeAiHazard = h => setAiDetectedHazards(prev => prev.filter(x => x !== h));
  const removeAiSector = s => setAiDetectedSectors(prev => prev.filter(x => x !== s));
  const clearAll = () => { setQuery(""); setSelectedHazards([]); setSelectedSectors([]); setSelectedRegions([]); setSelectedCosts([]); setAiDetectedHazards([]); setAiDetectedSectors([]); setScrolledToResults(false); setMarqueeSelectedId(null); };

  const handleMarqueeCardClick = (c) => {
    if (c.caseStudyId) {
      // Has rich data — show just that case study
      setMarqueeSelectedId(c.caseStudyId);
      setQuery(""); setSelectedHazards([]); setSelectedSectors([]); setSelectedRegions([]); setSelectedCosts([]); setAiDetectedHazards([]); setAiDetectedSectors([]);
    } else {
      // No rich data yet — show sector placeholder
      const phId = `PH_${c.sector.toUpperCase()}`;
      setMarqueeSelectedId(phId);
      setQuery(""); setSelectedHazards([]); setSelectedSectors([]); setSelectedRegions([]); setSelectedCosts([]); setAiDetectedHazards([]); setAiDetectedSectors([]);
    }
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        * { box-sizing: border-box; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes scrollX { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollY { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .fade-in { animation: fadeIn 0.25s ease forwards; }
        .card-enter { animation: fadeUp 0.3s ease forwards; }

        :root {
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
          --grad-fade: ${T.gradFade};
          --input-bg: ${T.inputBg};
          --input-border: ${T.inputBorder};
          --section-bg: ${T.sectionBg};
        }

        /* Theme-aware utility classes */
        .t-bg { background: var(--bg) !important; }
        .t-surface { background: var(--surface) !important; }
        .t-surface-alt { background: var(--surface-alt) !important; }
        .t-border { border-color: var(--border) !important; }
        .t-text { color: var(--text-primary) !important; }
        .t-text-sec { color: var(--text-secondary) !important; }
        .t-text-muted { color: var(--text-muted) !important; }
        .t-accent { color: var(--accent) !important; }
        .t-accent-bg { background: var(--accent-bg) !important; }
        .t-accent-text { color: var(--accent-text) !important; }

        /* Card theming */
        .hive-card {
          background: var(--surface) !important;
          border-color: var(--border) !important;
          transition: background 0.3s, border-color 0.3s, box-shadow 0.2s, transform 0.2s;
        }
        .hive-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .hive-card h3 { color: var(--text-primary) !important; }
        .hive-card p, .hive-card span.secondary { color: var(--text-secondary) !important; }

        /* Marquee card theming */
        .marquee-card {
          background: var(--surface) !important;
          border-color: var(--border) !important;
          transition: background 0.3s, border-color 0.3s;
        }
        .marquee-card.highlighted {
          background: var(--accent-bg) !important;
          border-color: var(--accent) !important;
        }
        .marquee-card h4 { color: var(--text-primary) !important; }
        .marquee-card .measure { color: var(--text-muted) !important; }
        .marquee-card .hook { color: var(--accent) !important; }

        /* Input theming */
        .hive-input {
          background: var(--input-bg) !important;
          border-color: var(--input-border) !important;
          color: var(--text-primary) !important;
        }
        .hive-input::placeholder { color: var(--text-muted) !important; }

        /* Filter chip */
        .filter-chip {
          background: var(--surface) !important;
          border-color: var(--border) !important;
          color: var(--text-secondary) !important;
        }
        .filter-chip.active {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: #fff !important;
        }

        /* Section bg */
        .hive-section { background: var(--section-bg) !important; }

        /* Modal */
        .hive-modal {
          background: var(--surface) !important;
          color: var(--text-primary) !important;
        }
        .hive-modal h2, .hive-modal h3 { color: var(--text-primary) !important; }
        .hive-modal p { color: var(--text-secondary) !important; }
        .hive-modal .border-t, .hive-modal .border-b { border-color: var(--border) !important; }

        /* Global theme overrides — catch any remaining hardcoded colours */
        .hive-root .text-stone-900, .hive-root .text-stone-800 { color: var(--text-primary) !important; }
        .hive-root .text-stone-700, .hive-root .text-stone-600, .hive-root .text-stone-500 { color: var(--text-secondary) !important; }
        .hive-root .text-stone-400, .hive-root .text-stone-300 { color: var(--text-muted) !important; }
        .hive-root .bg-white { background: var(--surface) !important; }
        .hive-root .bg-stone-50, .hive-root .bg-stone-100 { background: var(--surface-alt) !important; }
        .hive-root .border-stone-200, .hive-root .border-stone-100 { border-color: var(--border) !important; }
        .hive-root .text-emerald-700, .hive-root .text-emerald-800, .hive-root .text-emerald-600 { color: var(--accent) !important; }
        .hive-root .bg-emerald-700, .hive-root .bg-emerald-800 { background: var(--accent) !important; }
        .hive-root .bg-emerald-50, .hive-root .bg-emerald-100 { background: var(--accent-bg) !important; }
        .hive-root .border-emerald-100 { border-color: color-mix(in srgb, var(--accent) 40%, transparent) !important; }
        .hive-root .border-emerald-200 { border-color: color-mix(in srgb, var(--accent) 50%, transparent) !important; }
      `}</style>

      <div className="min-h-screen hive-root" style={{ background: T.bg, fontFamily: "'DM Sans', sans-serif", transition: "background 0.4s ease, color 0.4s ease" }}>

        {/* Nav — DfT theme: green stripe at top per GOV.UK / DfT branding */}
        {themeKey === 'dft' && <div aria-hidden="true" style={{ height: '5px', background: '#006853', position: 'relative', zIndex: 41 }} />}
        <nav className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: T.navBg, borderColor: T.border }}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.accent }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <span className="font-semibold tracking-tight" style={{ color: T.textPrimary }}>HIVE</span>
              <span className="text-xs hidden sm:block" style={{ color: T.textMuted }}>Transport Climate Adaptation Intelligence</span>
            </div>
            {/* Theme picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs hidden sm:block" style={{ color: T.textMuted }}>Theme:</span>
              <div className="flex items-center gap-1 rounded-full p-0.5 border" style={{ borderColor: T.border, background: T.surfaceAlt }}>
                {Object.values(THEMES).map(th => (
                  <button key={th.key} onClick={() => setThemeKey(th.key)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: themeKey === th.key ? T.accent : 'transparent',
                      color: themeKey === th.key ? '#ffffff' : T.textSecondary,
                    }}>
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { clearAll(); inputRef.current?.focus(); }}
                className="text-sm px-3 py-1.5 rounded-full transition-all hidden md:flex items-center gap-1.5"
                style={{ color: T.textSecondary }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Search
              </button>
              <button
                onClick={() => setBriefOpen(true)}
                className="text-sm px-3 py-1.5 rounded-full transition-all hidden md:flex items-center gap-1.5"
                style={{ color: brief.length > 0 ? T.accent : T.textSecondary, fontWeight: brief.length > 0 ? 600 : 400 }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Brief
                {brief.length > 0 && (
                  <span className="text-white text-xs font-semibold px-1.5 py-0.5 rounded-full ml-1" style={{ background: T.accent }}>{brief.length}</span>
                )}
              </button>
              <button className="text-sm font-medium text-white px-4 py-1.5 rounded-full transition-colors ml-2" style={{ background: T.accent }}>DfT Partner</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-6">
          <div className="max-w-3xl fade-up">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest" style={{ background: T.accentBg, color: T.accentText }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.accent }} />
              Prototype · 7 of 80+ case studies fully loaded
            </div>
            <h1 className="text-4xl sm:text-5xl font-normal leading-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: T.textPrimary }}>
              What risk are you
              <span className="italic" style={{ color: T.accent }}> managing?</span>
            </h1>
            <p className="text-base mb-6 max-w-xl leading-relaxed" style={{ color: T.textSecondary }}>
              Describe your infrastructure challenge in plain English. HIVE surfaces proven adaptations, comparable case studies, and structured evidence you can use immediately.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-3xl fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                placeholder="e.g. flooding on a rail corridor, heatwave on road bridges, coastal port storm surge..."
                className="hive-input w-full pl-11 pr-10 py-4 text-base rounded-2xl shadow-sm focus:outline-none transition-all"
                style={{ border: '1.5px solid var(--input-border)' }} />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {!query && (
              <p className="text-xs mt-3 italic" style={{ color: 'var(--text-muted)' }}>Describe your challenge — location, asset type, climate risk</p>
            )}
          </div>

          {/* Filters */}
          <div className="mt-5 max-w-3xl space-y-3 fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Search describes your situation. Filters narrow by category. Both work together.</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* All cases — unfiltered browse */}
                <a href="/cases" onClick={e => { e.preventDefault(); alert("→ /cases\nBrowse all 109 case studies (no filters applied)"); }}
                  className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors"
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', background: 'var(--surface)' }}
                  title="Browse all case studies">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  All cases
                </a>
                {/* Brief mode — tutorial/default brief */}
                <a href="/brief" onClick={e => { e.preventDefault(); alert("→ /brief\nOpens Brief mode with a tutorial brief explaining each section.\nUse '+ Add to brief' on any case to build your own."); }}
                  className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors"
                  style={{ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--surface)' }}
                  title="Open Brief mode">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Brief mode
                </a>
                {/* Show/hide filters */}
                <button onClick={() => setFiltersOpen(!filtersOpen)}
                  className="text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: 'var(--accent)' }}>
                  {filtersOpen ? "Hide filters" : "Show filters"}
                  {activeFilterCount > 0 && <span className="text-white px-1.5 py-0.5 rounded-full ml-1" style={{ background: 'var(--accent)' }}>{activeFilterCount}</span>}
                  <svg className={`w-3 h-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>
            {filtersOpen && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Climate driver</span>
                    {selectedHazards.length > 0 && <span className="text-xs text-white px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--accent)' }}>{selectedHazards.length}</span>}
                  </div>
                  <div className="flex gap-2 flex-wrap">{HAZARDS_CAUSE.map(h => <FilterPill key={h} label={h} selected={selectedHazards.includes(h)} onClick={() => toggle(setSelectedHazards, h)} color="emerald" />)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Transport sector</span>
                    {selectedSectors.length > 0 && <span className="text-xs text-white px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--text-primary)' }}>{selectedSectors.length}</span>}
                  </div>
                  <div className="flex gap-2 flex-wrap">{SECTORS.map(s => <FilterPill key={s} label={s} selected={selectedSectors.includes(s)} onClick={() => toggle(setSelectedSectors, s)} color="stone" />)}</div>
                </div>
                <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>UK geography</span>
                      {selectedRegions.length > 0 && <span className="text-xs bg-indigo-700 text-white px-1.5 py-0.5 rounded-full font-medium">{selectedRegions.length}</span>}
                    </div>
                    <div className="flex gap-2 flex-wrap">{UK_REGIONS.map(r => <FilterPill key={r} label={r} selected={selectedRegions.includes(r)} onClick={() => toggle(setSelectedRegions, r)} color="indigo" />)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Cost band</span>
                      {selectedCosts.length > 0 && <span className="text-xs bg-stone-800 text-white px-1.5 py-0.5 rounded-full font-medium">{selectedCosts.length}</span>}
                    </div>
                    <div className="flex gap-2 flex-wrap">{COST_BANDS.map(c => <FilterPill key={c} label={c} selected={selectedCosts.includes(c)} onClick={() => toggle(setSelectedCosts, c)} color="stone" />)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI detected */}
          {(aiDetectedHazards.filter(h => !selectedHazards.includes(h)).length > 0 || aiDetectedSectors.filter(s => !selectedSectors.includes(s)).length > 0) && (
            <div className="mt-4 max-w-3xl fade-in">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Detected from your search:
                </div>
                {aiDetectedHazards.filter(h => !selectedHazards.includes(h)).map(h => (
                  <span key={h} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-300">
                    {h}
                    <button onClick={() => removeAiHazard(h)} className="hover:opacity-70">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                {aiDetectedSectors.filter(s => !selectedSectors.includes(s)).map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-300">
                    {s}
                    <button onClick={() => removeAiSector(s)} className="hover:opacity-70">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                <span className="text-xs text-stone-400">— remove any that don't apply</span>
              </div>
            </div>
          )}
        </div>

        {/* ── MARQUEE — always visible, responds to filters in place ── */}
        <div className="border-t pt-8 pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-6xl mx-auto px-6 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>From the knowledge base</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {marqueeHasFilters
                  ? `Showing ${marqueeMatchingSectors.length > 0 ? marqueeMatchingSectors.join(", ") : "matching"} cases — click any to view`
                  : "50 curated case studies — click any card to explore"}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full p-0.5 border" style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
              {[{ id: "marquee", label: "Marquee" }, { id: "velocity", label: "Scroll velocity" }].map(v => (
                <button key={v.id} onClick={() => setMarqueeView(v.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  style={{ background: marqueeView === v.id ? 'var(--text-primary)' : 'transparent', color: marqueeView === v.id ? 'var(--surface)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          {marqueeView === "marquee"
            ? <Marquee2D cases={MARQUEE_CASES} onCardClick={handleMarqueeCardClick} matchingSectors={marqueeMatchingSectors} matchingHazards={marqueeMatchingHazards} hasFilters={marqueeHasFilters} gradFade={T.gradFade} />
            : <ScrollVelocityMarquee cases={MARQUEE_CASES} onCardClick={handleMarqueeCardClick} matchingSectors={marqueeMatchingSectors} matchingHazards={marqueeMatchingHazards} hasFilters={marqueeHasFilters} gradFade={T.gradFade} />
          }
          <div className="max-w-6xl mx-auto px-6 mt-4">
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Hover to pause · Click any card to view case study · Search above to find specific cases</p>
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div ref={resultsRef}>
          <div className="max-w-6xl mx-auto px-6 pb-20">

            {/* Marquee-driven single case view */}
            {marqueeSelectedId && !hasActiveFilters && (() => {
              const cs = CASE_STUDIES.find(c => c.id === marqueeSelectedId);
              const ph = !cs && Object.values(PLACEHOLDER_CASES).find(p => p.id === marqueeSelectedId);
              const display = cs || ph;
              if (!display) return null;
              return (
                <div className="fade-in">
                  <div className="flex items-center justify-between mb-4 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-stone-700">
                        {cs ? "1 case study" : "Case study being curated"}
                      </span>
                      <button onClick={clearAll} className="text-xs text-stone-400 hover:text-stone-600 underline">Clear</button>
                    </div>
                    <span className="text-xs text-stone-400 italic">Selected from marquee</span>
                  </div>
                  {cs ? (
                    <div className="max-w-lg">
                      <CaseStudyCard cs={cs} onClick={setSelectedCase} matchReasons={[]} onAddToBrief={toggleBrief} inBrief={brief.some(b => b.id === cs.id)} />
                    </div>
                  ) : (
                    <div className="max-w-lg">
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${SECTOR_COLOR[display.sector] || "bg-stone-100 text-stone-500 border-stone-200"}`}>{display.sector}</span>
                          <span className="text-xs text-stone-400">Being curated</span>
                        </div>
                        <h3 className="text-base font-semibold text-stone-700">{display.title}</h3>
                        <p className="text-sm text-stone-500 leading-relaxed">{display.summary}</p>
                        <p className="text-xs text-stone-400 italic mt-1">This case study will appear here once curated and verified by the HIVE editorial team. Search above to find related cases already in the database.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Search/filter-driven multi-result view */}
            {hasActiveFilters && (
              <>
                <div className="flex items-center justify-between mb-4 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-stone-700">
                      {results.length} case {results.length === 1 ? "study" : "studies"} matched
                    </span>
                    <button onClick={clearAll} className="text-xs text-stone-400 hover:text-stone-600 underline">Clear all</button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Curated & verified by HIVE
                  </div>
                </div>

                {synthesis && <div className="fade-in"><SynthesisPanel synthesis={synthesis} /></div>}

                {/* Heatmap panel — ABOVE position (between synthesis and browse row) */}
                {results.length > 0 && heatmapPosition === "above" && (
                  <div className="fade-in">
                    <HeatmapPanel
                      activeSectors={allActiveSectors}
                      activeHazards={allActiveHazards}
                      position={heatmapPosition}
                      onTogglePosition={setHeatmapPosition}
                    />
                  </div>
                )}

                {/* Link 4 — between synthesis and cards: filtered all-cases view */}
                {results.length > 0 && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {results.length} case {results.length === 1 ? "study" : "studies"} below
                    </span>
                    <a href="/cases" onClick={e => { e.preventDefault(); alert(`→ /cases?filtered\nOpens the full case study browser pre-filtered to these ${results.length} matched results.\nUser can scroll, sort, and explore without leaving the search context.`); }}
                      className="text-xs font-semibold flex items-center gap-1 transition-colors"
                      style={{ color: 'var(--accent)' }}
                      title="Browse these results in full case study view">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                      Browse all {results.length} cases →
                    </a>
                  </div>
                )}

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((cs, i) => (
                      <div key={cs.id} className="card-enter" style={{ animationDelay: `${i * 0.04}s` }}>
                        <CaseStudyCard cs={cs} onClick={setSelectedCase} matchReasons={activeMatchReasons[cs.id]} onAddToBrief={toggleBrief} inBrief={brief.some(b => b.id === cs.id)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h3 className="text-base font-medium text-stone-700 mb-1">No case studies found</h3>
                    <p className="text-sm text-stone-400 mb-4">Try fewer filters or broader search terms</p>
                    <button onClick={clearAll} className="text-sm text-emerald-700 underline">Browse all case studies</button>
                  </div>
                )}

                {/* Heatmap panel — BELOW position (after case cards) */}
                {results.length > 0 && heatmapPosition === "below" && (
                  <div className="fade-in mt-2">
                    <HeatmapPanel
                      activeSectors={allActiveSectors}
                      activeHazards={allActiveHazards}
                      position={heatmapPosition}
                      onTogglePosition={setHeatmapPosition}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        {!hasActiveFilters && (
          <div className="max-w-6xl mx-auto px-6 pb-20">
            <div className="mt-8 border-t pt-8 grid grid-cols-2 md:grid-cols-4 gap-6" style={{ borderColor: 'var(--border)' }}>
              {[
                { label: "Case Studies", value: "50", sub: "fully loaded in this prototype" },
                { label: "Transport Sectors", value: "4", sub: "rail, aviation, maritime, highways" },
                { label: "Climate Hazards", value: "12", sub: "first and second order covered" },
                { label: "UK Regions", value: "8", sub: "with geography-specific applicability" },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-semibold t-text" style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCase && <CaseStudyDetail cs={selectedCase} onClose={() => setSelectedCase(null)} onAddToBrief={toggleBrief} inBrief={brief.some(b => b.id === selectedCase.id)} />}

        {/* ── BRIEF PANEL ── */}
        {briefOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-4 bg-black/30 backdrop-blur-sm" onClick={() => setBriefOpen(false)}>
            <div className="hive-modal rounded-3xl shadow-2xl w-full max-w-md max-h-[88vh] overflow-y-auto flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }} onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 hive-modal border-b px-6 py-4 flex items-center justify-between rounded-t-3xl" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-stone-900">AI Brief</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">{brief.length} cases</span>
                  </div>
                  <p className="text-xs text-stone-400">Cases collected for synthesis</p>
                </div>
                <button onClick={() => setBriefOpen(false)} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 flex-1">
                {brief.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p className="text-sm text-stone-500 mb-1">No cases added yet</p>
                    <p className="text-xs text-stone-400">Add cases from search results using "+ Add to brief"</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {brief.map(cs => (
                      <div key={cs.id} className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">{cs.sector}</span>
                          </div>
                          <p className="text-sm font-semibold text-stone-900 leading-snug">{cs.title}</p>
                          <p className="text-xs font-medium text-emerald-700 mt-0.5">{cs.hook}</p>
                        </div>
                        <button onClick={() => toggleBrief(cs)} className="text-stone-300 hover:text-stone-500 flex-shrink-0 mt-0.5 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {brief.length >= 2 && (
                  <div className="border-t border-stone-100 pt-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">Pattern across {brief.length} cases</p>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        {brief.length >= 2
                          ? `${brief.filter(c => c.transferability === "High").length} of ${brief.length} cases have high UK transferability. Common sectors: ${[...new Set(brief.map(c => c.sector))].join(", ")}. These cases collectively demonstrate that proactive climate adaptation — integrated into planned maintenance — delivers better value than reactive repair.`
                          : "Add more cases to see cross-case analysis."}
                      </p>
                    </div>
                    <button className="w-full py-3 rounded-2xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Generate full AI brief
                      <span className="text-emerald-300 text-xs font-normal">— coming in full platform</span>
                    </button>
                  </div>
                )}

                {brief.length === 1 && (
                  <p className="text-xs text-stone-400 text-center mt-2">Add one more case to enable cross-case analysis</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
