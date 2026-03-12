// ── HIVE Handbook data
// Loads from data/case-studies.json when available, falls back to hardcoded seed data.
// All consumers import from here — never directly from the JSON file.

export type CaseStudy = {
  id: string;
  title: string;
  organisation: string;
  sector: string;
  hook: string;
  hazards: { cause: string[]; effect: string[] };
  summary: string;
  transferability: string;
  transferabilityNote: string;
  ukApplicability: string[];
  insight: string;
  measures: string[];
  assets: string[];
  tags: string[];
  location: string;
  ukRegion: string;
  year: string;
  cost: string;
  costBand: string;
  placeholder?: boolean;
  sections?: Record<string, string>;
  source_pdf_url?: string;
};

export type MarqueeEntry = {
  id: string;
  title: string;
  sector: string;
  measure: string;
  hazards: string[];
  hook: string;
  caseStudyId?: string;
};

export const SECTORS = ["Rail", "Aviation", "Maritime", "Highways"] as const;

export const HAZARDS_CAUSE = ["Heavy rainfall", "High temperatures", "Storms", "Sea level rise", "Drought", "Freeze-thaw"] as const;

export const MARQUEE_ENTRIES: MarqueeEntry[] = [
  { id: "01", title: "Port of Calais Extension", sector: "Maritime", measure: "Port extension", hazards: ["Sea level rise", "Storm surge"], hook: "+65ha reclaimed · €863m (2021)", caseStudyId: "ID_01" },
  { id: "02", title: "Port of Calais Sea Defence", sector: "Maritime", measure: "Sea defence", hazards: ["Sea level rise", "Storm surge"], hook: "3.3km seawall · 100ha basin", caseStudyId: "ID_01" },
  { id: "03", title: "Prince Edward Island", sector: "Highways", measure: "Intertidal reefs", hazards: ["Coastal erosion", "Storm surge"], hook: "2,400 tonnes sandstone reefs" },
  { id: "04", title: "Copenhagen Metro – Waterproofing", sector: "Rail", measure: "Waterproof tunnel designs", hazards: ["Flooding", "Sea waves"], hook: "Waterproof walls up to 2.3m" },
  { id: "05", title: "Copenhagen Metro – Drainage", sector: "Rail", measure: "Improved drainage", hazards: ["Flooding", "Heavy rainfall"], hook: "Drains + pumping systems" },
  { id: "06", title: "Panama Canal Water Saving", sector: "Maritime", measure: "Water optimisation", hazards: ["Drought"], hook: "Strategic water conservation" },
  { id: "07", title: "Albert Canal – Archimedes Screws", sector: "Maritime", measure: "Archimedes screws", hazards: ["Drought", "Water shortage"], hook: "Largest screws in the world" },
  { id: "08", title: "Albert Canal – Hydroelectric", sector: "Maritime", measure: "Hydroelectric power", hazards: ["High water levels"], hook: "Dual pump + power generation" },
  { id: "09", title: "ÖBB – Slope Stabilisation", sector: "Rail", measure: "Slope stabilisation", hazards: ["Landslide", "Rockfall"], hook: "3,370 hectares protected forest", caseStudyId: "ID_06" },
  { id: "10", title: "ÖBB – Rockfall Barriers", sector: "Rail", measure: "Rockfall barriers", hazards: ["Rockfall", "Avalanche"], hook: "212km barriers installed", caseStudyId: "ID_06" },
  { id: "11", title: "ÖBB – Flood Defences", sector: "Rail", measure: "Flood defences", hazards: ["Flooding", "Extreme precipitation"], hook: "Retention basins + drainage", caseStudyId: "ID_06" },
  { id: "12", title: "ÖBB – Early Warning Systems", sector: "Rail", measure: "Early warning systems", hazards: ["Multiple hazards"], hook: "Geotechnical sensors + forecasting", caseStudyId: "ID_06" },
  { id: "13", title: "MTA Saint George – Flood Protection", sector: "Rail", measure: "Flood protection devices", hazards: ["Flooding", "Storm surge"], hook: "3,000+ flood barriers installed" },
  { id: "14", title: "MTA – Elevated Equipment", sector: "Rail", measure: "Elevating equipment", hazards: ["Flooding", "Hurricane"], hook: "Signal room elevated 12 feet" },
  { id: "15", title: "CIPA Port – Wharf Height", sector: "Maritime", measure: "Wharf height increase", hazards: ["Sea level rise", "Storm surge"], hook: "+0.5m with 0.5m flexibility" },
  { id: "16", title: "CIPA Port – Rock Armour", sector: "Maritime", measure: "Rock armour", hazards: ["Storm surge", "Erosion"], hook: "92m breakwater extension" },
  { id: "17", title: "Infrabel – Tension Release Devices", sector: "Rail", measure: "Tension release devices", hazards: ["Extreme heat", "Extreme cold"], hook: "Prevents buckling + fracturing" },
  { id: "18", title: "Infrabel – Storm Basins", sector: "Rail", measure: "Storm basins", hazards: ["Flooding"], hook: "Flood-prone area mitigation" },
  { id: "19", title: "Deutsche Bahn – ICE 4 Trains", sector: "Rail", measure: "Air-conditioned trains", hazards: ["Extreme heat"], hook: "AC rated to 45°C", caseStudyId: "ID_11" },
  { id: "20", title: "Deutsche Bahn – Vegetation Mgmt", sector: "Rail", measure: "Vegetation management", hazards: ["Storms", "Falling trees"], hook: "26,000+ trees planted", caseStudyId: "ID_11" },
  { id: "21", title: "Deutsche Bahn – Sensors", sector: "Rail", measure: "Environmental sensors", hazards: ["Multiple hazards"], hook: "IoT monitoring for prevention", caseStudyId: "ID_11" },
  { id: "22", title: "Leeds Flood Alleviation – NFM", sector: "Highways", measure: "Natural Flood Management", hazards: ["Flooding"], hook: "500,000 trees planted" },
  { id: "23", title: "Leeds Flood Alleviation – Engineering", sector: "Highways", measure: "Traditional engineering", hazards: ["Flooding"], hook: "1.8M m³ flood storage" },
  { id: "24", title: "TfL Marylebone – SuDS", sector: "Highways", measure: "Sustainable Drainage", hazards: ["Flooding", "Heavy rainfall"], hook: "3,500m² rainwater collection" },
  { id: "25", title: "Adelaide Airport Irrigation", sector: "Aviation", measure: "Irrigation", hazards: ["Extreme heat"], hook: "200 hectares irrigated land" },
  { id: "26", title: "Gatwick – Clays Lake Scheme", sector: "Aviation", measure: "Flood storage reservoirs", hazards: ["Flooding"], hook: "400,000 m³ capacity" },
  { id: "27", title: "Network Rail Conwy Valley", sector: "Rail", measure: "Earthworks", hazards: ["Flooding", "Washout"], hook: "16,000 tonnes rock armour" },
  { id: "28", title: "Phoenix Cool Pavements", sector: "Highways", measure: "Cool pavement technology", hazards: ["Extreme heat"], hook: "100+ miles treated", caseStudyId: "ID_19" },
  { id: "29", title: "South Australia – Fire Suppression", sector: "Highways", measure: "Ventilation systems", hazards: ["Wildfire", "Smoke"], hook: "23 new exhaust fans" },
  { id: "30", title: "Qatar – Pumping Station", sector: "Aviation", measure: "Pumping station", hazards: ["Flooding", "Storm"], hook: "10km undersea outfall tunnel" },
  { id: "31", title: "Hammersmith Bridge Cooling", sector: "Highways", measure: "Bridge deck cooling", hazards: ["Extreme heat"], hook: "Water spray cooling system" },
  { id: "32", title: "Heathrow Balancing Pond", sector: "Aviation", measure: "Water management", hazards: ["Flooding", "Drought"], hook: "Year-round flow control · £2.1m", caseStudyId: "ID_32" },
  { id: "33", title: "Heathrow Climate-Resilient Grass", sector: "Aviation", measure: "Climate-resilient grass", hazards: ["Drought", "Extreme heat"], hook: "Deeper root systems" },
  { id: "34", title: "Santa Barbara Debris Basin", sector: "Highways", measure: "Debris basin", hazards: ["Heavy rainfall", "Debris flow"], hook: "6-acre capture basin" },
  { id: "35", title: "Croydon Grid Flood Defence", sector: "Energy", measure: "Flood barriers + equipment sealing", hazards: ["High winds", "Flooding"], hook: "69,000 customers protected · £800k", caseStudyId: "ID_UKPN_01" },
  { id: "36", title: "Queensland Foamed Bitumen", sector: "Highways", measure: "Foamed bitumen", hazards: ["Flooding"], hook: "Water-resistant pavement" },
  { id: "37", title: "Network Rail – CWR Tracks", sector: "Rail", measure: "Thermally resilient tracks", hazards: ["Extreme heat"], hook: "Continuous Welded Rail" },
  { id: "38", title: "Network Rail – Auto Monitoring", sector: "Rail", measure: "Automated track monitoring", hazards: ["Extreme heat"], hook: "Real-time temperature sensors" },
  { id: "39", title: "Network Rail – Water Cooling", sector: "Rail", measure: "Water cooling", hazards: ["Extreme heat"], hook: "White paint + water · 5–10°C reduction" },
  { id: "40", title: "Network Rail – OLE Auto-tension", sector: "Rail", measure: "Auto-tension overhead wires", hazards: ["Extreme heat"], hook: "Spring tensioners to 38°C" },
  { id: "41", title: "LA Metro – Hardening Infrastructure", sector: "Rail", measure: "Hardening infrastructure", hazards: ["Flooding", "Wildfire"], hook: "Raised rail + wetlands" },
  { id: "42", title: "LA Metro – Operational Adjustments", sector: "Rail", measure: "Adjusting operations", hazards: ["Flooding", "Wildfire"], hook: "Blue water detours" },
  { id: "43", title: "LA Metro – Wetlands Park", sector: "Rail", measure: "Relocating infrastructure", hazards: ["Flooding", "Stormwater"], hook: "46-acre wetlands park" },
  { id: "44", title: "Sheffield Grey to Green", sector: "Highways", measure: "SuDS", hazards: ["Heavy rainfall", "Flooding"], hook: "60% grey to green · 1.5km", caseStudyId: "ID_40" },
  { id: "45", title: "Network Rail Dawlish Sea Wall", sector: "Rail", measure: "Sea wall", hazards: ["Waves", "Storm surge"], hook: "8m height with recurve design" },
  { id: "46", title: "TfL Rainwater Harvesting", sector: "Rail", measure: "Rainwater harvesting", hazards: ["Water runoff"], hook: "23,000 m³ recycled annually" },
  { id: "47", title: "Thames Tidal Barrier", sector: "Multiple", measure: "Tidal barriers", hazards: ["Flooding", "Storm surge"], hook: "520m · protects 1.5M people" },
  { id: "48", title: "Berlin BVG Green Tram Tracks", sector: "Rail", measure: "Green tramways", hazards: ["Extreme heat", "Heavy rainfall"], hook: "22,000+ metres green track" },
  { id: "49", title: "Thames Water – SuDS", sector: "Highways", measure: "SuDS", hazards: ["Flooding", "Urban creep"], hook: "Geocellular + rain gardens" },
  { id: "50", title: "Panama Canal – Fresh Water Surcharge", sector: "Maritime", measure: "Fresh water surcharge", hazards: ["Drought"], hook: "Variable fee for water preservation" },
];

export const PLACEHOLDER_CASES: Record<string, CaseStudy> = {
  Rail: {
    id: "PH_RAIL",
    title: "Rail case study being curated",
    organisation: "HIVE editorial team",
    sector: "Rail",
    hook: "Full case study coming soon",
    placeholder: true,
    hazards: { cause: [], effect: [] },
    assets: [],
    measures: [],
    tags: [],
    location: "—",
    ukRegion: "—",
    year: "—",
    cost: "—",
    costBand: "—",
    summary:
      "This case study is currently being curated and verified by the HIVE editorial team. It will include full adaptation measures, cost data, and UK applicability assessment.",
    transferability: "—",
    transferabilityNote: "—",
    ukApplicability: [],
    insight: "—",
  },
  Aviation: {
    id: "PH_AVIATION",
    title: "Aviation case study being curated",
    organisation: "HIVE editorial team",
    sector: "Aviation",
    hook: "Full case study coming soon",
    placeholder: true,
    hazards: { cause: [], effect: [] },
    assets: [],
    measures: [],
    tags: [],
    location: "—",
    ukRegion: "—",
    year: "—",
    cost: "—",
    costBand: "—",
    summary:
      "This case study is currently being curated and verified by the HIVE editorial team. It will include full adaptation measures, cost data, and UK applicability assessment.",
    transferability: "—",
    transferabilityNote: "—",
    ukApplicability: [],
    insight: "—",
  },
  Maritime: {
    id: "PH_MARITIME",
    title: "Maritime & ports case study being curated",
    organisation: "HIVE editorial team",
    sector: "Maritime",
    hook: "Full case study coming soon",
    placeholder: true,
    hazards: { cause: [], effect: [] },
    assets: [],
    measures: [],
    tags: [],
    location: "—",
    ukRegion: "—",
    year: "—",
    cost: "—",
    costBand: "—",
    summary:
      "This case study is currently being curated and verified by the HIVE editorial team. It will include full adaptation measures, cost data, and UK applicability assessment.",
    transferability: "—",
    transferabilityNote: "—",
    ukApplicability: [],
    insight: "—",
  },
  Highways: {
    id: "PH_HIGHWAYS",
    title: "Highways case study being curated",
    organisation: "HIVE editorial team",
    sector: "Highways",
    hook: "Full case study coming soon",
    placeholder: true,
    hazards: { cause: [], effect: [] },
    assets: [],
    measures: [],
    tags: [],
    location: "—",
    ukRegion: "—",
    year: "—",
    cost: "—",
    costBand: "—",
    summary:
      "This case study is currently being curated and verified by the HIVE editorial team. It will include full adaptation measures, cost data, and UK applicability assessment.",
    transferability: "—",
    transferabilityNote: "—",
    ukApplicability: [],
    insight: "—",
  },
};

// Hand-curated rich entries (7 original) — used as enrichment overrides
const SEED_OVERRIDES: Record<string, Partial<CaseStudy>> = {
  ID_19: { title: "Phoenix Cool Pavement Programme", sector: "Highways", hook: "100+ miles treated · 6°C surface temp reduction · $4.8m annual", hazards: { cause: ["High temperatures", "Urban Heat Island effect"], effect: ["Road surface overheating", "Increased energy demand"] }, assets: ["Road pavement"], measures: ["CoolSeal reflective coating", "Pavement maintenance programme", "University monitoring partnership"], ukRegion: "Applicable to UK urban areas", cost: "USD $4.8m annual (£3.73m); initial pilot £2.33m", costBand: "£1m–£10m", summary: "Reflective CoolSeal coating applied to 100+ miles of residential roads to combat extreme urban heat island effect. The product increases road reflectivity by 30% and reduces surface temperatures by 6°C, integrated into existing pavement maintenance budgets.", transferability: "Medium", transferabilityNote: "Directly applicable to UK cities experiencing urban heat island intensification. London hotspots already 4.5°C warmer at night than rural surroundings. Heat-related deaths in London more than doubled in 2022. Currently limited to streets with ≤25mph speed limit due to skid resistance constraints.", ukApplicability: ["London urban roads", "Major UK city centres", "Transport for London managed streets", "Local authority highway maintenance programmes"], insight: "Cool pavement also extends road longevity by reducing thermal degradation — delivering avoided maintenance costs beyond the cooling benefit. Funded from existing pavement maintenance budgets, not additional climate spend.", tags: ["highways", "roads", "heat", "urban heat island", "heatwave", "pavement", "reflective coating", "surface temperature", "city"] },
  ID_40: { title: "Sheffield Grey to Green", sector: "Highways", hook: "60% grey to green · discharge cut 80% · 75,000 plants · 561% biodiversity uplift", hazards: { cause: ["Flooding – fluvial", "Flooding – surface water", "Heavy rainfall"], effect: ["Water damage", "Infrastructure disruption"] }, assets: ["Road pavement", "Foot and cycle paths", "Rail track", "Trams", "Bridges", "Signals and signalling", "Buildings and stations"], measures: ["Sustainable Drainage Systems (SuDS)", "Rain gardens", "Vegetated swales", "Nature-based solutions", "Green street corridor"], ukRegion: "Yorkshire & Humber", cost: "Phase 1 £3.6m; Phase 2 £6.3m; Phase 3 ongoing", costBand: "£1m–£10m per phase", summary: "1.5km urban green corridor replacing a former ring road dual carriageway with Sustainable Drainage Systems following the 2007 floods that caused £30m damage, killed 2 people, closed Sheffield station, cancelled tram services and damaged 28 roads.", transferability: "High", transferabilityNote: "UK case directly applicable nationwide. The largest retrofit grey-to-green project in the UK. Explicitly applicable to rail corridors following river valleys. Cross-sector impact — originally a road project that also protects rail and tram infrastructure downstream.", ukApplicability: ["UK city centre transport corridors", "Rail lines following river valleys", "Urban tram networks", "Local authority highway flood management"], insight: "SuDS reduced river discharge from a 1-in-100-year event by 87% — from 69.6 to 9.2 litres/sec. Inspired an £80m SuDS project in Mansfield. Now the default approach for Sheffield city centre regeneration.", tags: ["highways", "roads", "rail", "tram", "flooding", "surface water", "SuDS", "nature-based", "urban drainage", "heavy rainfall", "green infrastructure", "river valley", "urban flooding"] },
  ID_UKPN_01: { title: "Croydon Grid Flood Defence", sector: "Critical Infrastructure", hook: "69,000 customers protected · 1-in-1,000-year flood standard · £800k", hazards: { cause: ["Flooding – fluvial"], effect: ["Power disruption", "Loss of electricity supply to transport networks"] }, assets: ["Electrical substation", "Transformers", "Electrical buildings"], measures: ["Permanent flood barriers", "Equipment sealing", "Equipment elevation above flood level", "Flood walls around transformers"], ukRegion: "London & South East", cost: "£800,000 (this site); £14m total programme since 2010", costBand: "Under £1m (site); £10m–£100m (programme)", summary: "Permanent flood barriers installed at Croydon Grid substation to withstand a 1-in-1,000-year flood of the River Wandle, protecting electricity supply to 69,000 homes and businesses including transport infrastructure in South London.", transferability: "High", transferabilityNote: "Part of UK Power Networks' programme that has now protected 119 substations from river, tidal and surface water flooding. Highly relevant to substations supporting rail electrification infrastructure and EV charging networks across South East England.", ukApplicability: ["UK electrical substations in flood-risk zones", "Rail electrification supply infrastructure", "Urban transport power supply", "South East England energy grid"], insight: "Equipment sealing, raising above flood level, and targeted flood walling at a single site cost £800k — part of a £14m programme protecting 119 substations since 2010. Demonstrates that site-specific incremental hardening at modest cost delivers significant network resilience.", tags: ["energy", "flooding", "fluvial", "critical infrastructure", "substation", "power supply", "resilience", "flood barriers", "south london", "rail electrification"] },
  ID_32: { title: "Heathrow Airport Balancing Ponds", sector: "Aviation", hook: "Year-round flow control · £2.1m bundled into wider programme", hazards: { cause: ["Heavy rainfall", "Drought"], effect: ["Flooding – fluvial", "Flooding – surface water"] }, assets: ["Access routes", "Airport services"], measures: ["Balancing ponds", "Tilting weirs", "Nature-based solution", "MBBR wastewater treatment"], ukRegion: "London & South East", cost: "£2.1m (sheet piling component)", costBand: "£1m–£10m", summary: "Constructed balancing ponds to manage both drought and heavy rainfall events, controlling water volume entering drainage systems and reducing flood risk to airport access routes.", transferability: "High", transferabilityNote: "Tilting weir systems and Nature-based Solutions directly applicable to other airports, ports, and urban transport infrastructure facing surface water flooding.", ukApplicability: ["Other UK airports", "Urban transport hubs", "Coastal infrastructure"], insight: "Integrating climate adaptation into planned development activities kept costs minimal — bundled with a wider infrastructure programme rather than treated as standalone.", tags: ["aviation", "flooding", "drought", "nature-based", "urban drainage", "water management", "heavy rainfall", "surface water"] },
  ID_06: { title: "Austrian Federal Railways Climate Adaptation", sector: "Rail", hook: "212km barriers · 3,370ha protected forest · sensors across Alpine network", hazards: { cause: ["Heavy rainfall", "Storms", "Freeze-thaw cycles"], effect: ["Landslides", "Rockfalls", "Flooding – fluvial"] }, assets: ["Track", "Bridges", "Earthworks", "Signalling", "Level crossings"], measures: ["Slope stabilisation", "Rockfall barriers", "Flood retention basins", "Early warning systems", "Real-time geotechnical monitoring"], ukRegion: "Applicable UK-wide", cost: "€3bn+ annual infrastructure budget", costBand: "Large programme", summary: "Comprehensive physical and predictive technology adaptations across the Alpine rail network, combining slope stabilisation, protective barriers and geotechnical sensor monitoring.", transferability: "High", transferabilityNote: "Rockfall barriers, drainage management and slope stabilisation directly applicable to UK upland rail. Particularly relevant to the Peak District, Scottish Highlands, and Welsh valley lines.", ukApplicability: ["UK upland rail", "Scottish Highlands lines", "Welsh Valley lines", "Peak District infrastructure"], insight: "Site-specific assessment — combining damage history, local conditions, and vulnerability analysis — was more effective than blanket solutions. Early warning systems reduced reactive maintenance costs significantly.", tags: ["rail", "landslide", "flooding", "sensors", "monitoring", "earthworks", "slope", "embankment", "precipitation", "rockfall"] },
  ID_01: { title: "Port of Calais Extension and Sea Defence", sector: "Maritime", hook: "3.3km seawall · 100-year design life · €863m total", hazards: { cause: ["Sea level rise", "Storms and high winds"], effect: ["Storm surge", "Coastal flooding", "Coastal erosion"] }, assets: ["Port structures", "Terminal", "Retaining walls"], measures: ["3.3km sea wall", "Land reclamation", "Reinforced retaining walls", "100-year design life specification"], ukRegion: "Applicable to UK coastal", cost: "€863m total project", costBand: "£100m+", summary: "Doubled port capacity while building a 3.3km seawall designed for 100-year service life, explicitly accounting for sea level rise and climate change projections in all structural specifications.", transferability: "High", transferabilityNote: "Directly applicable to UK ports facing sea level rise risk. Humber Ports specifically identified as having medium sea level rise risk.", ukApplicability: ["Humber Ports", "Port of Dover", "Thames Estuary infrastructure", "East coast ports"], insight: "Treating climate resilience as a core design requirement from the outset — not as an add-on — allowed the seawall to be cost-effectively integrated into a wider port upgrade.", tags: ["maritime", "ports", "sea level rise", "storm surge", "coastal", "flooding", "seawall", "infrastructure"] },
  ID_11: { title: "Deutsche Bahn Climate Adaptation Measures", sector: "Rail", hook: "25% storm damage reduction · 20% fewer heat disruptions · IoT across national network", hazards: { cause: ["High temperatures", "Storms and high winds"], effect: ["Vegetation dieback", "Storm damage", "Track overheating"] }, assets: ["Tracks", "Trains", "Overhead lines", "Lineside vegetation"], measures: ["Air-conditioned rolling stock (ICE 4)", "AI-assisted vegetation mapping", "IoT temperature sensors", "DB Climate Forest programme"], ukRegion: "Applicable UK-wide", cost: "€6bn (ICE 4 fleet); €625m (vegetation programme)", costBand: "Large programme", summary: "Phased adaptation combining air-conditioned rolling stock, AI-assisted vegetation management via satellite data, and IoT sensor networks to address escalating heat and storm risks.", transferability: "High", transferabilityNote: "Vegetation management and rolling stock air-conditioning directly applicable to UK rail. Highest priority in South and East England where temperatures are projected to reach higher peaks.", ukApplicability: ["Network Rail Southern region", "East Midlands Railway", "UK rolling stock procurement", "Lineside vegetation management"], insight: "Vegetation management delivered 25% reduction in storm damage between 2018 and 2020 — one of the highest ROI findings in the HIVE database. Heat disruptions fell 20% after ICE 4 deployment.", tags: ["rail", "heat", "temperature", "vegetation", "sensors", "rolling stock", "storms", "heatwave", "overheating"] },
};

// Sector mapping from PDF metadata values to display sectors
const SECTOR_MAP: Record<string, string> = {
  "railways": "Rail", "rail": "Rail",
  "aviation": "Aviation",
  "ports, coastal and offshore": "Maritime", "maritime": "Maritime", "ports": "Maritime",
  "highways": "Highways", "roads": "Highways",
  "inland waterways": "Maritime",
  "multiple": "Multiple",
};

function mapSector(raw?: string | null): string {
  if (!raw) return "Highways";
  const lower = raw.toLowerCase().trim();
  return SECTOR_MAP[lower] ?? raw;
}

function mapJsonToCaseStudy(json: any): CaseStudy {
  const id = json.trib_id;
  const override = SEED_OVERRIDES[id];
  const challengeText = json.sections?.challenge ?? "";
  const adaptText = json.sections?.adaptation_measures ?? "";
  const summaryFallback = challengeText
    ? challengeText.split(". ").slice(0, 3).join(". ") + "."
    : "";

  return {
    id,
    title: override?.title ?? json.organisation ?? id,
    organisation: json.organisation ?? "",
    sector: override?.sector ?? mapSector(json.transport_subsector),
    hook: override?.hook ?? (json.measure_title ?? "").slice(0, 80),
    hazards: override?.hazards ?? {
      cause: json.hazard_cause ? json.hazard_cause.split(", ").filter(Boolean) : [],
      effect: json.hazard_effect ? json.hazard_effect.split(", ").filter(Boolean) : [],
    },
    summary: override?.summary ?? json.case_study_text ?? summaryFallback,
    transferability: override?.transferability ?? "Medium",
    transferabilityNote: override?.transferabilityNote ?? json.sections?.applicability?.split(". ").slice(0, 2).join(". ") ?? "—",
    ukApplicability: override?.ukApplicability ?? [],
    insight: override?.insight ?? json.sections?.evaluation?.split(". ").slice(0, 2).join(". ") ?? "—",
    measures: override?.measures ?? (json.measures?.length ? json.measures : json.measure_title ? [json.measure_title] : []),
    assets: override?.assets ?? (json.asset_type ? json.asset_type.split(", ").filter(Boolean) : []),
    tags: override?.tags ?? [],
    location: json.sections ? (json.organisation ?? "—") : "—",
    ukRegion: override?.ukRegion ?? "—",
    year: "—",
    cost: override?.cost ?? "—",
    costBand: override?.costBand ?? "—",
    sections: json.sections,
    source_pdf_url: json.source_pdf_url,
  };
}

// Load from JSON file, falling back to hardcoded overrides
let _caseStudies: CaseStudy[] | null = null;

function loadCaseStudies(): CaseStudy[] {
  if (_caseStudies) return _caseStudies;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jsonData = require("@/data/case-studies.json") as any[];
    _caseStudies = jsonData.map(mapJsonToCaseStudy);
    return _caseStudies;
  } catch {
    // Fall back to the 7 hand-curated overrides
    _caseStudies = Object.entries(SEED_OVERRIDES).map(([id, o]) => ({
      id,
      title: o.title ?? id,
      organisation: o.title ?? "",
      sector: o.sector ?? "Highways",
      hook: o.hook ?? "",
      hazards: o.hazards ?? { cause: [], effect: [] },
      summary: o.summary ?? "",
      transferability: o.transferability ?? "Medium",
      transferabilityNote: o.transferabilityNote ?? "—",
      ukApplicability: o.ukApplicability ?? [],
      insight: o.insight ?? "—",
      measures: o.measures ?? [],
      assets: o.assets ?? [],
      tags: o.tags ?? [],
      location: "—",
      ukRegion: o.ukRegion ?? "—",
      year: "—",
      cost: o.cost ?? "—",
      costBand: o.costBand ?? "—",
    }));
    return _caseStudies;
  }
}

export const CASE_STUDIES: CaseStudy[] = loadCaseStudies();
