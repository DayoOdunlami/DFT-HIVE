/**
 * Adaptation options library — static seed data.
 * Wire to Supabase `options` table in Step 7.
 */

export type OptionRow = {
  id: number | string;
  transport_subsector: string;
  transport_assets: string;
  climate_hazard_cause: string;
  climate_hazard_effect: string;
  climate_risk_to_assets: string;
  adaptation_measure: string;
  adaptation_measure_description: string;
  response_and_recovery_measures: string;
  identified_cobenefits: string;
  prompts_assumptions_comments?: string;
  relevant_case_studies?: string;
  case_study_id?: string;
};

export const OPTIONS_DATA: OptionRow[] = [
  {
    id: 1,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Surface failure of road pavement from thermal expansion",
    adaptation_measure: "Asset temperature threshold considerations",
    adaptation_measure_description:
      "Use of materials that can withstand higher temperatures or are lighter in colour, such as reflective coating for pavement surfaces, aimed at reducing heat impact on roads",
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
    adaptation_measure_description:
      "Consideration of Sustainable Drainage System (SuDS) that account for climate change uplift. Review climate uplift recommendations based on Environment Agency guidance.",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset. Alternative traffic management.",
    identified_cobenefits: "community, environment, biodiversity, carbon reduction",
  },
  {
    id: 3,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Extended periods of thermal stress can lead to broken rails, posing significant safety and operational risks from rail fractures, misalignment and buckling.",
    adaptation_measure: "Real-time or remote monitoring",
    adaptation_measure_description:
      "Digital real-time monitoring systems for predictive decision-making when temperature trigger points are reached. Establish maximum temperature thresholds for each specific asset.",
    response_and_recovery_measures: "Speed restrictions on overheated tracks. Emergency repair or replacement.",
    identified_cobenefits: "biodiversity, carbon reduction, decreased energy consumption",
  },
  {
    id: 4,
    transport_subsector: "Rail",
    transport_assets: "Rail - Geotech",
    climate_hazard_cause: "Heavy rainfall",
    climate_hazard_effect: "Rockfalls, landslides, avalanches, scouring",
    climate_risk_to_assets:
      "Landslips and shrink-swell clays can cause ground movements, increasing the risk of track deformation and misalignment due to unstable ground conditions.",
    adaptation_measure: "Slope stabilisation / Real-time monitoring",
    adaptation_measure_description:
      "Alterations to earthworks using geotextiles, boulders or soil nails to reinforce embankments. Use of LIDAR technology to monitor slope movement and detect early signs of instability.",
    response_and_recovery_measures:
      "Response teams for landslip clearance, stabilisation and temporary service diversion.",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, economic",
  },
  {
    id: 5,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Risks to operations include flight delays, cancellations, and rerouting, as well as reduced air density affecting take-off and landing capabilities",
    adaptation_measure: "Adapting operations to environmental conditions / Cooling systems",
    adaptation_measure_description:
      "Adjust flight schedules and loading capacities based on air density and peak temperatures. Use cooling towers and irrigation techniques nearby the airfield.",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)",
    identified_cobenefits:
      "community, environmental, biodiversity, carbon reduction, decreased energy consumption, economic",
  },
  {
    id: 6,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets:
      "Structural damage to port infrastructure (e.g. breakwaters and quay walls) due to overtopping and increased wave action",
    adaptation_measure: "Improve protection structures",
    adaptation_measure_description:
      "Increase sizing (height, length and width) of breakwaters to reduce overtopping and risk of failure, appropriate height of protection structures to account for suitable climate change uplifts.",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    identified_cobenefits: "Community, Biodiversity, Carbon reduction, Decreased energy consumption, Economic",
  },
  {
    id: 7,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Dredged channels and berth-pockets",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Sea level rise leads to high water levels in the port, resulting in a reduced window for berthing and disruption of operations",
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
    climate_risk_to_assets:
      "Structure scour may cause structural instability and potential for bridge failure",
    adaptation_measure: "Scour protection",
    adaptation_measure_description:
      "Evaluate the need for scour protection. Consider rock armour (riprap) and articulated block mats. Integrate climate uplift into the foundation design.",
    response_and_recovery_measures: "Emergency response. Bridge inspection after severe flooding events.",
    identified_cobenefits: "",
  },
  {
    id: 9,
    transport_subsector: "Rail",
    transport_assets: "Rail - Overhead Line Equipment",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Thermal expansion and increased sag on overhead lines can cause pantograph contact issues and power supply disruptions.",
    adaptation_measure: "Auto-tension systems / reflective coatings",
    adaptation_measure_description:
      "Install automatic tensioning devices to maintain consistent contact wire height across temperature ranges from -20°C to +40°C. Apply reflective coatings to reduce thermal absorption.",
    response_and_recovery_measures: "Speed restrictions and emergency engineering response teams.",
    identified_cobenefits: "carbon reduction, decreased energy consumption",
  },
  {
    id: 10,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airfield drainage",
    climate_hazard_cause: "Heavy rainfall",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Runway flooding and standing water risk aircraft hydroplaning and airfield closures during intense rainfall events.",
    adaptation_measure: "Enhanced drainage capacity and SuDS",
    adaptation_measure_description:
      "Increase drainage pipe sizing using climate uplift factors. Introduce balancing ponds and reed beds to manage peak flows and provide nature-based co-benefits.",
    response_and_recovery_measures: "Runway closure procedures and surface inspection protocols after intense rainfall.",
    identified_cobenefits: "community, environment, biodiversity",
  },
  {
    id: 11,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Breakwaters and sea walls",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Coastal flooding",
    climate_risk_to_assets:
      "Overtopping of existing coastal structures as mean sea level rises, increasing inundation risk to port operations and adjacent infrastructure.",
    adaptation_measure: "Raise crest level / rock armour extension",
    adaptation_measure_description:
      "Increase structural crest height incorporating UKCP18 sea level rise projections to 2100. Extend rock armour apron to reduce wave run-up and overtopping rates.",
    response_and_recovery_measures: "Port closure protocols and emergency response for tidal surge events.",
    identified_cobenefits: "Biodiversity, Economic",
  },
  {
    id: 12,
    transport_subsector: "Roads",
    transport_assets: "Road - Embankments",
    climate_hazard_cause: "Heavy rainfall",
    climate_hazard_effect: "Landslides, slope failure",
    climate_risk_to_assets:
      "Increased saturation from prolonged rainfall causes embankment slope failures and erosion, particularly on older infrastructure.",
    adaptation_measure: "Geotechnical monitoring and slope reinforcement",
    adaptation_measure_description:
      "Install piezometers and inclinometers to monitor pore water pressure and ground movement in real time. Reinforce vulnerable slopes with soil nails, sheet piling or vegetation.",
    response_and_recovery_measures: "Road closure procedures and emergency geotechnical response.",
    identified_cobenefits: "community, biodiversity",
  },
];

/** ID-to-label maps for filter dropdowns */
export const SECTOR_MAP: Record<string, string> = {
  roads:    "Roads",
  rail:     "Rail",
  aviation: "Aviation",
  maritime: "Maritime",
};

export const HAZARD_MAP: Record<string, string> = {
  heat:     "High temperatures",
  rain:     "Heavy rainfall",
  flooding: "Flooding",
  storms:   "Storms",
  sealevel: "Sea level rise",
  drought:  "Drought",
};
