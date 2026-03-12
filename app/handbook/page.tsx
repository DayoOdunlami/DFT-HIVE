// @ts-nocheck
"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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


const SECTOR_STYLES: Record<string, { background: string; color: string; borderColor: string }> = {
  Rail: { background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" },
  Aviation: { background: "#f0f9ff", color: "#0369a1", borderColor: "#bae6fd" },
  Maritime: { background: "#f0fdfa", color: "#0f766e", borderColor: "#99f6e4" },
  Road: { background: "#fffbeb", color: "#b45309", borderColor: "#fde68a" },
  Highways: { background: "#fffbeb", color: "#b45309", borderColor: "#fde68a" },
  Energy: { background: "#faf5ff", color: "#7e22ce", borderColor: "#e9d5ff" },
  Multiple: { background: "#fafaf9", color: "#57534e", borderColor: "#e7e5e4" },
};
const DEFAULT_SECTOR_STYLE = { background: "#fafaf9", color: "#57534e", borderColor: "#e7e5e4" };

const HAZARD_CAUSE_STYLES: Record<string, { background: string; color: string; borderColor: string }> = {
  "Heavy rainfall": { background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" },
  "High temperatures": { background: "#fff7ed", color: "#c2410c", borderColor: "#fed7aa" },
  Storms: { background: "#faf5ff", color: "#7e22ce", borderColor: "#e9d5ff" },
  "Sea level rise": { background: "#f0fdfa", color: "#0f766e", borderColor: "#99f6e4" },
  Drought: { background: "#fffbeb", color: "#b45309", borderColor: "#fde68a" },
  "Freeze-thaw": { background: "#f0f9ff", color: "#0369a1", borderColor: "#bae6fd" },
};
const DEFAULT_HAZARD_STYLE = { background: "#f9fafb", color: "#4b5563", borderColor: "#e5e7eb" };
const EFFECT_STYLE = { background: "#fafaf9", color: "#57534e", borderColor: "#e7e5e4" };

// ── MARQUEE CARD ──
const MarqueeCard = ({ c, onClick, dimmed, highlighted }) => {
  const [hovered, setHovered] = useState(false);
  const sectorStyle = SECTOR_STYLES[c.sector] || DEFAULT_SECTOR_STYLE;
  return (
  <div
    onClick={() => onClick(c)}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    className={`marquee-card ${highlighted ? "highlighted" : ""}`}
    style={{
      width: "280px",
      flexShrink: 0,
      cursor: "pointer",
      borderRadius: 16,
      border: "1px solid",
      fontFamily: "'DM Sans', sans-serif",
      opacity: dimmed ? 0.25 : 1,
      boxShadow: highlighted ? "0 2px 12px rgba(0,0,0,0.10)" : hovered ? "0 8px 24px rgba(0,0,0,0.12)" : "none",
      transform: highlighted ? "translateY(-2px)" : hovered ? "translateY(-3px) scale(1.03)" : "none",
      borderColor: hovered && !highlighted ? "var(--border-strong)" : undefined,
      transition: "all 0.3s",
      padding: 16,
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.375 }}>{c.title}</h4>
      <span style={{ fontSize: 12, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, border: "1px solid", fontWeight: 500, flexShrink: 0, ...sectorStyle }}>{c.sector}</span>
    </div>
    <p className="line-clamp-1" style={{ fontSize: 12, marginBottom: 8, color: "var(--text-muted)" }}>{c.measure}</p>
    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{c.hook}</p>
  </div>
  );
};

// ── STANDARD MARQUEE (slowed) ──
const Marquee2D = ({ cases, onCardClick, matchingSectors, matchingHazards, hasFilters, gradFade = '#F7F5F0' }) => {
  const half = Math.ceil(cases.length / 2);
  const rowA = cases.slice(0, half);
  const rowB = cases.slice(half);
  const trackARef = useRef<HTMLDivElement>(null);
  const trackBRef = useRef<HTMLDivElement>(null);

  const isHighlighted = (c) => {
    if (!hasFilters) return false;
    const sectorMatch = matchingSectors.length === 0 || matchingSectors.includes(c.sector);
    const hazardMatch = matchingHazards.length === 0 || c.hazards.some(h => matchingHazards.some(mh => h.toLowerCase().includes(mh.toLowerCase())));
    return sectorMatch && hazardMatch;
  };
  const isDimmed = (c) => hasFilters && !isHighlighted(c);

  return (
    <div style={{ position: "relative", paddingTop: 24, paddingBottom: 24, overflow: "visible" }}>
      <div style={{ overflow: "hidden", paddingTop: "12px", paddingBottom: "12px", marginBottom: "4px" }} onMouseEnter={() => { if (trackARef.current) trackARef.current.style.animationPlayState = "paused"; }} onMouseLeave={() => { if (trackARef.current) trackARef.current.style.animationPlayState = "running"; }}>
        <div ref={trackARef} style={{ display: "flex", gap: 12, width: "max-content", animation: "scrollX 160s linear infinite" }}>
          {[...rowA, ...rowA].map((c, i) => <MarqueeCard key={`a-${i}`} c={c} onClick={onCardClick} dimmed={isDimmed(c)} highlighted={isHighlighted(c)} />)}
        </div>
      </div>
      <div style={{ overflow: "hidden", paddingTop: "12px", paddingBottom: "12px" }} onMouseEnter={() => { if (trackBRef.current) trackBRef.current.style.animationPlayState = "paused"; }} onMouseLeave={() => { if (trackBRef.current) trackBRef.current.style.animationPlayState = "running"; }}>
        <div ref={trackBRef} style={{ display: "flex", gap: 12, width: "max-content", animation: "scrollX 185s linear infinite reverse" }}>
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
      <div ref={trackRef} style={{ display: "flex", gap: 12, width: "max-content", willChange: "transform" }}>
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
    <div style={{ position: "relative", paddingTop: 16, paddingBottom: 16 }}>
      <VelocityRow cases={rowA} onCardClick={onCardClick} isHighlighted={isHighlighted} isDimmed={isDimmed} direction={1} />
      <VelocityRow cases={rowB} onCardClick={onCardClick} isHighlighted={isHighlighted} isDimmed={isDimmed} direction={-1} />
    </div>
  );
};

// ── SHARED COMPONENTS ──

const TransferabilityBadge = ({ level }) => {
  const isHigh = level === "High";
  const bg = isHigh ? "#d1fae5" : "#fef3c7";
  const text = isHigh ? "#065f46" : "#92400e";
  const dot = isHigh ? "#10b981" : "#f59e0b";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, background: bg, color: text }}>
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: dot }} />
      {level} UK transferability
    </span>
  );
};

const HazardBadge = ({ hazard, type }) => {
  const style = type === "cause" ? (HAZARD_CAUSE_STYLES[hazard] || DEFAULT_HAZARD_STYLE) : EFFECT_STYLE;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", border: "1px solid", borderRadius: 6, fontSize: 12, fontWeight: 500, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, ...style }}>
      {type === "effect" && <span style={{ marginRight: 4, opacity: 0.4 }}>→</span>}
      {hazard}
    </span>
  );
};

const FilterPill = ({ label, selected, onClick, color }) => (
  <button onClick={onClick}
    style={{
      fontSize: 12,
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 6,
      paddingBottom: 6,
      borderRadius: 9999,
      whiteSpace: "nowrap",
      transition: "all 0.2s",
      fontWeight: 500,
      border: "1px solid",
      ...(selected
        ? { background: color === "emerald" ? "var(--accent)" : color === "indigo" ? "#4338ca" : "var(--text-primary)", color: "#fff", borderColor: color === "emerald" ? "var(--accent)" : color === "indigo" ? "#4338ca" : "var(--text-primary)" }
        : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }),
    }}>
    {selected && <span style={{ marginRight: 4, opacity: 0.7 }}>✓</span>}
    {label}
  </button>
);

const CaseStudyCard = ({ cs, onClick, matchReasons, onAddToBrief, inBrief }) => (
  <div onClick={() => onClick(cs)}
    className="hive-card"
    style={{
      cursor: "pointer",
      borderRadius: 16,
      border: "1px solid",
      transition: "all 0.2s",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif",
    }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent)" }}>{cs.sector}</span>
          <span style={{ color: "var(--text-muted)" }}>·</span>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{cs.location}</span>
          <span style={{ color: "var(--text-muted)" }}>·</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{cs.year}</span>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.375, transition: "color 0.2s" }}>{cs.title}</h3>
      </div>
    </div>
    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>{cs.hook}</p>
    <p className="line-clamp-2" style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.625, marginBottom: 12, flex: 1 }}>{cs.summary}</p>
    {matchReasons && matchReasons.length > 0 && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Matched on:</span>
        {matchReasons.map(r => <span key={r} style={{ fontSize: 12, background: "var(--accent-bg)", color: "var(--accent-text)", border: "1px solid", borderColor: "var(--accent)", paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 6, fontWeight: 500 }}>{r}</span>)}
      </div>
    )}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
      {cs.hazards.cause.slice(0, 2).map(h => <HazardBadge key={h} hazard={h} type="cause" />)}
      {cs.hazards.effect.slice(0, 2).map(h => <HazardBadge key={h} hazard={h} type="effect" />)}
    </div>
    <div style={{ background: "var(--accent-bg)", border: "1px solid", borderColor: "var(--accent)", borderRadius: 12, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, marginBottom: 12, opacity: 0.85 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <svg style={{ width: 12, height: 12, flexShrink: 0, color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>UK applicability</span>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.625 }}>{cs.transferabilityNote}</p>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid", borderColor: "var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <TransferabilityBadge level={cs.transferability} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{cs.costBand}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={e => { e.stopPropagation(); onAddToBrief(cs); }}
          style={{
            fontSize: 12,
            fontWeight: 500,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 4,
            paddingBottom: 4,
            borderRadius: 9999,
            border: "1px solid",
            transition: "all 0.2s",
            ...(inBrief ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : { borderColor: "var(--border)", color: "var(--text-secondary)" }),
          }}>
          {inBrief ? "✓ In brief" : "+ Add to brief"}
        </button>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}>
          Full case
          <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </span>
      </div>
    </div>
  </div>
);

const CaseStudyDetail = ({ cs, onClose, onAddToBrief, inBrief }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
    <div className="hive-modal" style={{ borderRadius: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", maxWidth: 672, width: "100%", maxHeight: "88vh", overflowY: "auto", fontFamily: "'DM Sans', sans-serif" }} onClick={e => e.stopPropagation()}>
      <div className="hive-modal" style={{ position: "sticky", top: 0, backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <div style={{ flex: 1, paddingRight: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent)" }}>{cs.sector}</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{cs.location}</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.25, fontFamily: "'DM Serif Display', serif" }}>{cs.title}</h2>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginTop: 4 }}>{cs.hook}</p>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9999, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, color 0.2s", flexShrink: 0, marginTop: 4 }}>
          <svg style={{ width: 16, height: 16, color: "var(--text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "var(--accent-bg)", border: "1px solid", borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)", borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg style={{ width: 16, height: 16, color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent)" }}>Key insight</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.625, fontWeight: 500 }}>{cs.insight}</p>
        </div>
        <div style={{ background: "var(--surface-alt)", borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.625 }}>{cs.summary}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Climate drivers</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{cs.hazards.cause.map(h => <HazardBadge key={h} hazard={h} type="cause" />)}</div>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Impacts</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{cs.hazards.effect.map(h => <HazardBadge key={h} hazard={h} type="effect" />)}</div>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Adaptation measures</h4>
          <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>{cs.measures.map(m => <li key={m} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "var(--text-secondary)" }}><span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--accent)", flexShrink: 0, marginTop: 6 }} />{m}</li>)}</ul>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "var(--surface-alt)", borderRadius: 12, padding: 12, border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Investment</h4>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{cs.cost}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Band: {cs.costBand}</p>
          </div>
          <div style={{ background: "var(--surface-alt)", borderRadius: 12, padding: 12, border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Delivery period</h4>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{cs.year}</p>
          </div>
        </div>
        <div style={{ border: "1px solid", borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)", borderRadius: 12, padding: 16, background: "color-mix(in srgb, var(--accent-bg) 50%, transparent)" }}>
          <div style={{ marginBottom: 8 }}><TransferabilityBadge level={cs.transferability} /></div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.625, marginBottom: 12 }}>{cs.transferabilityNote}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{cs.ukApplicability.map(a => <span key={a} style={{ fontSize: 12, background: "var(--surface)", border: "1px solid", borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)", color: "var(--accent-text)", paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, fontWeight: 500 }}>{a}</span>)}</div>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", paddingTop: 4, borderTop: "1px solid var(--border)" }}>Ref: {cs.id} · {cs.organisation} · Curated & verified by HIVE</p>
        <button
          onClick={() => { onAddToBrief(cs); onClose(); }}
          style={{
            width: "100%",
            paddingTop: 12,
            paddingBottom: 12,
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 600,
            transition: "all 0.2s",
            ...(inBrief ? { background: "var(--surface-alt)", color: "var(--text-muted)", border: "1px solid var(--border)" } : { background: "var(--accent)", color: "#fff", border: "none" }),
          }}>
          {inBrief ? "✓ Already in your AI brief" : "＋ Add to AI brief"}
        </button>
      </div>
    </div>
  </div>
);

const SynthesisPanel = ({ synthesis, themeKey = "light", resultIds = [] }: { synthesis: { count: number; sectors: string[]; highTransferCount: number; insightSentence: string; allCause: string[]; commonMeasures: string[] }; themeKey?: string; resultIds?: string[] }) => (
  <div style={{ borderRadius: 16, border: "1px solid", borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)", background: "linear-gradient(to bottom right, var(--accent-bg), color-mix(in srgb, #99f6e4 40%, transparent))", padding: 20, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg style={{ width: 14, height: 14, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent)" }}>Cross-case analysis</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{synthesis.count} case {synthesis.count === 1 ? "study" : "studies"}</span>
      </div>
      <span className="show-from-sm-block" style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Indicative — review sources directly</span>
    </div>
    <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.625, marginBottom: 16, fontWeight: 500 }}>{synthesis.insightSentence}</p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
      {synthesis.allCause.length > 0 && (
        <div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Climate drivers</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{synthesis.allCause.map(h => <HazardBadge key={h} hazard={h} type="cause" />)}</div>
        </div>
      )}
      {synthesis.commonMeasures.length > 0 && (
        <div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Common measures</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{synthesis.commonMeasures.slice(0, 3).map(m => <span key={m} style={{ fontSize: 12, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 6 }}>{m}</span>)}</div>
        </div>
      )}
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {synthesis.sectors.map(s => <span key={s} style={{ fontSize: 12, background: "rgba(255,255,255,0.8)", border: "1px solid", borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)", color: "var(--accent-text)", paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 9999, fontWeight: 500 }}>{s}</span>)}
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>{synthesis.highTransferCount} of {synthesis.count} with high UK transferability</span>
      </div>
      <Link
        href={`/handbook/brief?theme=${themeKey}&ids=${resultIds.join(",")}`}
        style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 8, flexShrink: 0, transition: "all 0.2s", background: "#065f46", color: "#fff", textDecoration: "none" }}
        title="Generate brief from this analysis">
        <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Generate brief from this analysis →
      </Link>
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

const HeatmapPanel = ({ activeSectors = [], activeHazards = [], position, onTogglePosition, themeKey = "light", onCellClick }: { activeSectors?: string[]; activeHazards?: string[]; position: string; onTogglePosition: (pos: string) => void; themeKey?: string; onCellClick?: (sector: string, hazardId: string) => void }) => {
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
    <div style={{ borderRadius: 12, border: "1px solid", borderColor: "var(--border)", background: "var(--surface)", marginBottom: 20, overflow: "hidden" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 16, borderRadius: 2, flexShrink: 0, background: "#006853" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Adaptation options coverage</span>
          <span className="show-from-sm-inline" style={{ fontSize: 12, color: "var(--text-muted)" }}>— click any cell to explore options for that combination</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* position toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, borderRadius: 8, padding: 2, border: "1px solid var(--border)", background: "var(--bg)" }}>
            {["above", "below"].map(pos => (
              <button key={pos} onClick={() => onTogglePosition(pos)}
                style={{
                  fontSize: 12,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 4,
                  paddingBottom: 4,
                  borderRadius: 6,
                  transition: "all 0.2s",
                  fontWeight: 500,
                  textTransform: "capitalize",
                  background: position === pos ? "var(--accent)" : "transparent",
                  color: position === pos ? "#fff" : "var(--text-muted)",
                }}>
                {pos}
              </button>
            ))}
          </div>
          <Link
            href={`/handbook/options?theme=${themeKey}`}
            style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Browse all options →
          </Link>
        </div>
      </div>

      {/* grid */}
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, overflowX: "auto" }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: '3px', width: '100%', minWidth: 460 }}>
          <thead>
            <tr>
              <th style={{ width: 80 }} />
              {HEATMAP_HAZARDS.map(h => {
                const isActive = matchedHazardIds.includes(h.id);
                return (
                  <th key={h.id} style={{
                    textAlign: "center",
                    paddingBottom: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    whiteSpace: "nowrap",
                    paddingLeft: 2,
                    paddingRight: 2,
                  }}>
                    {h.label}
                    {isActive && <div style={{ width: 4, height: 4, borderRadius: 9999, margin: "2px auto 0", background: "var(--accent)" }} />}
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
                  <td style={{
                    paddingRight: 12,
                    paddingTop: 2,
                    paddingBottom: 2,
                    fontSize: 12,
                    fontWeight: sectorMatch ? 700 : 600,
                    color: sectorMatch ? "var(--accent)" : "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}>
                    {sector}
                  </td>
                  {HEATMAP_HAZARDS.map(h => {
                    const count = HEATMAP_MATRIX[sector]?.[h.id] ?? 0;
                    const hazardMatch = matchedHazardIds.includes(h.id);
                    const isHovered = hoveredCell === `${sector}-${h.id}`;
                    const colors = getCellColor(count, sectorMatch, hazardMatch);
                    return (
                      <td key={h.id} style={{ textAlign: "center", padding: "2px" }}>
                        {count > 0 ? (
                          <button
                            onMouseEnter={() => setHoveredCell(`${sector}-${h.id}`)}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => onCellClick ? onCellClick(sector, h.id) : undefined}
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
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.06em" }}>FEWER</span>
          {["#f0fdf4", "#d1fae5", "#bbf7d0", "#6ee7b7"].map((c, i) => (
            <div key={i} style={{ width: 14, height: 8, background: c, borderRadius: 2, border: "1px solid #d1d5db" }} />
          ))}
          <span style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.06em" }}>MORE</span>
          {(matchedSectors.length > 0 || matchedHazardIds.length > 0) && (
            <span style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--text-muted)" }}>
              <div style={{ width: 14, height: 8, background: '#1d70b8', borderRadius: 2 }} />
              matches your current search
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT (uses useSearchParams — must be inside Suspense) ──
function HandbookLandingPageContent() {
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
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync theme from URL so brief/options back-links restore theme
  useEffect(() => {
    const themeFromUrl = searchParams.get("theme");
    if (themeFromUrl === "light" || themeFromUrl === "dark" || themeFromUrl === "dft") {
      setThemeKey(themeFromUrl);
    }
  }, [searchParams]);

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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .show-from-sm-inline { display: none; }
        @media (min-width: 640px) { .show-from-sm-inline { display: inline; } }
        .show-from-sm-block { display: none; }
        @media (min-width: 640px) { .show-from-sm-block { display: block; } }
        .show-from-md-flex { display: none; }
        @media (min-width: 768px) { .show-from-md-flex { display: flex; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes scrollX { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollY { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .fade-in { animation: fadeIn 0.25s ease forwards; }
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

      <div className="hive-root" style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", transition: "background 0.4s ease, color 0.4s ease" }}>

        {/* Nav — DfT theme: green stripe at top per GOV.UK / DfT branding */}
        {themeKey === "dft" && <div aria-hidden="true" style={{ height: "5px", background: "#006853", position: "relative", zIndex: 41 }} />}
        <nav style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid", borderColor: T.border, background: T.navBg, backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto", paddingLeft: 24, paddingRight: 24, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: T.accent }}>
                <svg style={{ width: 16, height: 16, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <span style={{ fontWeight: 600, letterSpacing: "-0.025em", color: T.textPrimary }}>HIVE</span>
              <span className="show-from-sm-block" style={{ fontSize: 12, color: T.textMuted }}>Transport Climate Adaptation Intelligence</span>
            </div>
            {/* Theme picker */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="show-from-sm-block" style={{ fontSize: 12, color: T.textMuted }}>Theme:</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, borderRadius: 9999, padding: 2, border: "1px solid", borderColor: T.border, background: T.surfaceAlt }}>
                {Object.values(THEMES).map(th => (
                  <button key={th.key} onClick={() => setThemeKey(th.key)}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 6,
                      paddingBottom: 6,
                      borderRadius: 9999,
                      transition: "all 0.2s",
                      background: themeKey === th.key ? T.accent : "transparent",
                      color: themeKey === th.key ? "#ffffff" : T.textSecondary,
                    }}>
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => { clearAll(); inputRef.current?.focus(); }}
                className="show-from-md-flex"
                style={{ fontSize: 14, paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 9999, transition: "all 0.2s", alignItems: "center", gap: 6, color: T.textSecondary }}>
                <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Search
              </button>
              <a
                href={brief.length === 0 ? "/handbook/brief" : "#"}
                className="show-from-md-flex"
                onClick={(e) => {
                  if (brief.length > 0) {
                    e.preventDefault();
                    sessionStorage.setItem("hiveBriefCases", JSON.stringify(brief.map((c: { id: string }) => c.id)));
                    sessionStorage.setItem("hiveBriefTheme", themeKey);
                    window.location.href = "/handbook/brief?tutorial=false";
                  }
                }}
                style={{ fontSize: 14, paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 9999, transition: "all 0.2s", alignItems: "center", gap: 6, color: brief.length > 0 ? T.accent : T.textSecondary, fontWeight: brief.length > 0 ? 600 : 400, textDecoration: "none", display: "flex" }}>
                <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Brief
                {brief.length > 0 && (
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, marginLeft: 4, background: T.accent }}>{brief.length}</span>
                )}
              </a>
              <button style={{ fontSize: 14, fontWeight: 500, color: "#fff", paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 6, borderRadius: 9999, transition: "background 0.2s, color 0.2s", marginLeft: 8, background: T.accent }}>DfT Partner</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ maxWidth: 1152, margin: "0 auto", paddingLeft: 24, paddingRight: 24, paddingTop: 56, paddingBottom: 24 }}>
          <div className="fade-up" style={{ maxWidth: 768 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 9999, marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase", background: T.accentBg, color: T.accentText }}>
              <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: 9999, background: T.accent }} />
              Prototype · 7 of 80+ case studies fully loaded
            </div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 400, lineHeight: 1.25, marginBottom: 12, fontFamily: "'DM Serif Display', serif", color: T.textPrimary }}>
              What risk are you
              <span style={{ fontStyle: "italic", color: T.accent }}> managing?</span>
            </h1>
            <p style={{ fontSize: 16, marginBottom: 24, maxWidth: 576, lineHeight: 1.625, color: T.textSecondary }}>
              Describe your infrastructure challenge in plain English. HIVE surfaces proven adaptations, comparable case studies, and structured evidence you can use immediately.
            </p>
          </div>

          {/* Search */}
          <div className="fade-up" style={{ maxWidth: 768, animationDelay: "0.1s" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                placeholder="e.g. flooding on a rail corridor, heatwave on road bridges, coastal port storm surge..."
                className="hive-input"
                style={{ width: "100%", paddingLeft: 44, paddingRight: 40, paddingTop: 16, paddingBottom: 16, fontSize: 16, borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1.5px solid var(--input-border)", transition: "all 0.2s" }} />
              {query && (
                <button onClick={() => setQuery("")} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                  <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {!query && (
              <p style={{ fontSize: 12, marginTop: 12, fontStyle: "italic", color: "var(--text-muted)" }}>Describe your challenge — location, asset type, climate risk</p>
            )}
          </div>

          {/* Filters */}
          <div className="fade-up" style={{ marginTop: 20, maxWidth: 768, animationDelay: "0.15s", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Search describes your situation. Filters narrow by category. Both work together.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <Link
                  href="/handbook/cases"
                  style={{ fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 6, border: "1px solid", borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)", transition: "all 0.2s", textDecoration: "none" }}
                  title="Browse all case studies">
                  <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  All cases
                </Link>
                <Link
                  href="/handbook/cases"
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textDecoration: "none" }}
                  title="Case study library">
                  Case Studies →
                </Link>
                <Link
                  href={`/handbook/brief?theme=${themeKey}`}
                  style={{ fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 6, border: "1px solid", borderColor: "var(--accent)", background: "var(--surface)", color: "var(--accent)", transition: "all 0.2s", textDecoration: "none" }}
                  title="Open Brief mode">
                  <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Brief mode
                </Link>
                <button onClick={() => setFiltersOpen(!filtersOpen)}
                  style={{ fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s", color: "var(--accent)" }}>
                  {filtersOpen ? "Hide filters" : "Show filters"}
                  {activeFilterCount > 0 && <span style={{ color: "#fff", paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, marginLeft: 4, background: "var(--accent)" }}>{activeFilterCount}</span>}
                  <svg style={{ width: 12, height: 12, transform: filtersOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>
            {filtersOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-secondary)" }}>Climate driver</span>
                    {selectedHazards.length > 0 && <span style={{ fontSize: 12, color: "#fff", paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, fontWeight: 500, background: "var(--accent)" }}>{selectedHazards.length}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{HAZARDS_CAUSE.map(h => <FilterPill key={h} label={h} selected={selectedHazards.includes(h)} onClick={() => toggle(setSelectedHazards, h)} color="emerald" />)}</div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-secondary)" }}>Transport sector</span>
                    {selectedSectors.length > 0 && <span style={{ fontSize: 12, color: "#fff", paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, fontWeight: 500, background: "var(--text-primary)" }}>{selectedSectors.length}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{SECTORS.map(s => <FilterPill key={s} label={s} selected={selectedSectors.includes(s)} onClick={() => toggle(setSelectedSectors, s)} color="stone" />)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-secondary)" }}>UK geography</span>
                      {selectedRegions.length > 0 && <span style={{ fontSize: 12, background: "#4338ca", color: "#fff", paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, fontWeight: 500 }}>{selectedRegions.length}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{UK_REGIONS.map(r => <FilterPill key={r} label={r} selected={selectedRegions.includes(r)} onClick={() => toggle(setSelectedRegions, r)} color="indigo" />)}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>Cost band</span>
                      {selectedCosts.length > 0 && <span style={{ fontSize: 12, background: "#292524", color: "#fff", paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, fontWeight: 500 }}>{selectedCosts.length}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{COST_BANDS.map(c => <FilterPill key={c} label={c} selected={selectedCosts.includes(c)} onClick={() => toggle(setSelectedCosts, c)} color="stone" />)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI detected */}
          {(aiDetectedHazards.filter(h => !selectedHazards.includes(h)).length > 0 || aiDetectedSectors.filter(s => !selectedSectors.includes(s)).length > 0) && (
            <div className="fade-in" style={{ marginTop: 16, maxWidth: 768 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                  <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Detected from your search:
                </div>
                {aiDetectedHazards.filter(h => !selectedHazards.includes(h)).map(h => (
                  <span key={h} style={{ display: "inline-flex", alignItems: "center", gap: 6, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 9999, fontSize: 12, fontWeight: 500, border: "1px solid", background: "var(--accent-bg)", color: "var(--accent-text)", borderColor: "color-mix(in srgb, var(--accent) 60%, transparent)" }}>
                    {h}
                    <button onClick={() => removeAiHazard(h)} style={{ opacity: 0.7 }}><svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </span>
                ))}
                {aiDetectedSectors.filter(s => !selectedSectors.includes(s)).map(s => (
                  <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 9999, fontSize: 12, fontWeight: 500, border: "1px solid", background: "var(--accent-bg)", color: "var(--accent-text)", borderColor: "color-mix(in srgb, var(--accent) 60%, transparent)" }}>
                    {s}
                    <button onClick={() => removeAiSector(s)} style={{ opacity: 0.7 }}><svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </span>
                ))}
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>— remove any that don't apply</span>
              </div>
            </div>
          )}
        </div>

        {/* ── MARQUEE — always visible, responds to filters in place ── */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 32, paddingBottom: 16 }}>
          <div style={{ maxWidth: 1152, margin: "0 auto", paddingLeft: 24, paddingRight: 24, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>From the knowledge base</p>
              <p style={{ fontSize: 14, marginTop: 2, color: "var(--text-secondary)" }}>
                {marqueeHasFilters
                  ? `Showing ${marqueeMatchingSectors.length > 0 ? marqueeMatchingSectors.join(", ") : "matching"} cases — click any to view`
                  : "50 curated case studies — click any card to explore"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, borderRadius: 9999, padding: 2, border: "1px solid var(--border)", background: "var(--surface-alt)" }}>
              {[{ id: "marquee", label: "Marquee" }, { id: "velocity", label: "Scroll velocity" }].map(v => (
                <button key={v.id} onClick={() => setMarqueeView(v.id)}
                  style={{ fontSize: 12, fontWeight: 600, paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 9999, transition: "all 0.2s", background: marqueeView === v.id ? "var(--text-primary)" : "transparent", color: marqueeView === v.id ? "var(--surface)" : "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          {marqueeView === "marquee"
            ? <Marquee2D cases={MARQUEE_CASES} onCardClick={handleMarqueeCardClick} matchingSectors={marqueeMatchingSectors} matchingHazards={marqueeMatchingHazards} hasFilters={marqueeHasFilters} gradFade={T.gradFade} />
            : <ScrollVelocityMarquee cases={MARQUEE_CASES} onCardClick={handleMarqueeCardClick} matchingSectors={marqueeMatchingSectors} matchingHazards={marqueeMatchingHazards} hasFilters={marqueeHasFilters} gradFade={T.gradFade} />
          }
          <div style={{ maxWidth: 1152, margin: "0 auto", paddingLeft: 24, paddingRight: 24, marginTop: 16 }}>
            <p style={{ fontSize: 12, textAlign: "center", color: "var(--text-muted)" }}>Hover to pause · Click any card to view case study · Search above to find specific cases</p>
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div ref={resultsRef}>
          <div style={{ maxWidth: 1152, margin: "0 auto", paddingLeft: 24, paddingRight: 24, paddingBottom: 80 }}>

            {/* Marquee-driven single case view */}
            {marqueeSelectedId && !hasActiveFilters && (() => {
              const cs = CASE_STUDIES.find(c => c.id === marqueeSelectedId);
              const ph = !cs && Object.values(PLACEHOLDER_CASES).find(p => p.id === marqueeSelectedId);
              const display = cs || ph;
              if (!display) return null;
              const phSectorStyle = SECTOR_STYLES[display.sector] || DEFAULT_SECTOR_STYLE;
              return (
                <div className="fade-in">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
                        {cs ? "1 case study" : "Case study being curated"}
                      </span>
                      <button onClick={clearAll} style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "underline" }}>Clear</button>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Selected from marquee</span>
                  </div>
                  {cs ? (
                    <div style={{ maxWidth: 512 }}>
                      <CaseStudyCard cs={cs} onClick={setSelectedCase} matchReasons={[]} onAddToBrief={toggleBrief} inBrief={brief.some(b => b.id === cs.id)} />
                    </div>
                  ) : (
                    <div style={{ maxWidth: 512 }}>
                      <div style={{ borderRadius: 16, border: "1px dashed var(--border)", background: "var(--surface-alt)", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, border: "1px solid", ...phSectorStyle }}>{display.sector}</span>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Being curated</span>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>{display.title}</h3>
                        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.625 }}>{display.summary}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", marginTop: 4 }}>This case study will appear here once curated and verified by the HIVE editorial team. Search above to find related cases already in the database.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Search/filter-driven multi-result view */}
            {hasActiveFilters && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
                      {results.length} case {results.length === 1 ? "study" : "studies"} matched
                    </span>
                    <button onClick={clearAll} style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "underline" }}>Clear all</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 9999, background: "var(--accent)" }} />
                    Curated & verified by HIVE
                  </div>
                </div>

                {synthesis && <div className="fade-in"><SynthesisPanel synthesis={synthesis} themeKey={themeKey} resultIds={results.map((c: { id: string }) => c.id)} /></div>}

                {/* Heatmap panel — ABOVE position (between synthesis and browse row) */}
                {results.length > 0 && heatmapPosition === "above" && (
                  <div className="fade-in">
                    <HeatmapPanel
                      activeSectors={allActiveSectors}
                      activeHazards={allActiveHazards}
                      position={heatmapPosition}
                      onTogglePosition={setHeatmapPosition}
                      themeKey={themeKey}
                      onCellClick={(sector, hazardId) => router.push(`/handbook/options?theme=${themeKey}&sector=${sector.toLowerCase()}&hazard=${hazardId}`)}
                    />
                  </div>
                )}

                {/* Link 4 — between synthesis and cards: filtered all-cases view → case study page with filter params */}
                {results.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
                      {results.length} case {results.length === 1 ? "study" : "studies"} below
                    </span>
                    <Link
                      href={(() => {
                        const params = new URLSearchParams();
                        if (query?.trim()) params.set("q", query.trim());
                        if (allActiveSectors.length) params.set("sector", allActiveSectors.join(","));
                        if (allActiveHazards.length) params.set("hazard", allActiveHazards.join(","));
                        if (selectedRegions.length) params.set("region", selectedRegions.join(","));
                        if (selectedCosts.length) params.set("cost", selectedCosts.join(","));
                        const qs = params.toString();
                        return `/handbook/cases${qs ? `?${qs}` : ""}`;
                      })()}
                      style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s", color: "var(--accent)", textDecoration: "none" }}
                      title="View these case studies on the case study page">
                      <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                      Browse all {results.length} cases →
                    </Link>
                  </div>
                )}

                {results.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                    {results.map((cs, i) => (
                      <div key={cs.id} className="card-enter" style={{ animationDelay: `${i * 0.04}s` }}>
                        <CaseStudyCard cs={cs} onClick={setSelectedCase} matchReasons={activeMatchReasons[cs.id]} onAddToBrief={toggleBrief} inBrief={brief.some(b => b.id === cs.id)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="fade-in" style={{ textAlign: "center", paddingTop: 80, paddingBottom: 80 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <svg style={{ width: 24, height: 24, color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4 }}>No case studies found</h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>Try fewer filters or broader search terms</p>
                    <Link href="/handbook/cases" style={{ fontSize: 14, color: "var(--accent)", textDecoration: "underline" }}>Browse all case studies</Link>
                  </div>
                )}

                {/* Heatmap panel — BELOW position (after case cards) */}
                {results.length > 0 && heatmapPosition === "below" && (
                  <div className="fade-in" style={{ marginTop: 8 }}>
                    <HeatmapPanel
                      activeSectors={allActiveSectors}
                      activeHazards={allActiveHazards}
                      position={heatmapPosition}
                      onTogglePosition={setHeatmapPosition}
                      themeKey={themeKey}
                      onCellClick={(sector, hazardId) => router.push(`/handbook/options?theme=${themeKey}&sector=${sector.toLowerCase()}&hazard=${hazardId}`)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        {!hasActiveFilters && (
          <div style={{ maxWidth: 1152, margin: "0 auto", paddingLeft: 24, paddingRight: 24, paddingBottom: 80 }}>
            <div style={{ marginTop: 32, borderTop: "1px solid var(--border)", paddingTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[
                { label: "Case Studies", value: "50", sub: "fully loaded in this prototype" },
                { label: "Transport Sectors", value: "4", sub: "rail, aviation, maritime, highways" },
                { label: "Climate Hazards", value: "12", sub: "first and second order covered" },
                { label: "UK Regions", value: "8", sub: "with geography-specific applicability" },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600, fontFamily: "'DM Serif Display', serif", color: "var(--text-primary)" }}>{stat.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: "var(--text-secondary)" }}>{stat.label}</div>
                  <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-muted)" }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCase && <CaseStudyDetail cs={selectedCase} onClose={() => setSelectedCase(null)} onAddToBrief={toggleBrief} inBrief={brief.some(b => b.id === selectedCase.id)} />}

        {/* ── BRIEF PANEL ── */}
        {briefOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: 16, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }} onClick={() => setBriefOpen(false)}>
            <div className="hive-modal" style={{ borderRadius: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", width: "100%", maxWidth: 448, maxHeight: "88vh", overflowY: "auto", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }} onClick={e => e.stopPropagation()}>
              <div className="hive-modal" style={{ position: "sticky", top: 0, borderBottom: "1px solid var(--border)", paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)" }}>
                      <svg style={{ width: 12, height: 12, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>AI Brief</span>
                    <span style={{ fontSize: 12, background: "var(--accent-bg)", color: "var(--accent-text)", paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, fontWeight: 600 }}>{brief.length} cases</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Cases collected for synthesis</p>
                </div>
                <button onClick={() => setBriefOpen(false)} style={{ width: 32, height: 32, borderRadius: 9999, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, color 0.2s" }}>
                  <svg style={{ width: 16, height: 16, color: "var(--text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div style={{ padding: 24, flex: 1 }}>
                {brief.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 48 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 16, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <svg style={{ width: 20, height: 20, color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>No cases added yet</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Add cases from search results using "+ Add to brief"</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    {brief.map(cs => (
                      <div key={cs.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface-alt)" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{cs.sector}</span>
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.375 }}>{cs.title}</p>
                          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--accent)", marginTop: 2 }}>{cs.hook}</p>
                        </div>
                        <button onClick={() => toggleBrief(cs)} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2, transition: "color 0.2s" }}>
                          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {brief.length >= 2 && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    <div style={{ background: "var(--accent-bg)", border: "1px solid", borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Pattern across {brief.length} cases</p>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.625 }}>
                        {brief.length >= 2
                          ? `${brief.filter(c => c.transferability === "High").length} of ${brief.length} cases have high UK transferability. Common sectors: ${[...new Set(brief.map(c => c.sector))].join(", ")}. These cases collectively demonstrate that proactive climate adaptation — integrated into planned maintenance — delivers better value than reactive repair.`
                          : "Add more cases to see cross-case analysis."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sessionStorage.setItem("hiveBriefCases", JSON.stringify(brief.map((c: { id: string }) => c.id)));
                        sessionStorage.setItem("hiveBriefTheme", themeKey);
                        window.location.href = "/handbook/brief?tutorial=false";
                      }}
                      style={{ width: "100%", paddingTop: 12, paddingBottom: 12, borderRadius: 16, background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600, transition: "background 0.2s, color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Generate full AI brief →
                    </button>
                  </div>
                )}

                {brief.length === 1 && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>Add one more case to enable cross-case analysis</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function HandbookLandingPageFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", color: "#6b7280" }}>
      Loading…
    </div>
  );
}

export default function HandbookLandingPage() {
  return (
    <Suspense fallback={<HandbookLandingPageFallback />}>
      <HandbookLandingPageContent />
    </Suspense>
  );
}