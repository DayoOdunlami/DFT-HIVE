-- HIVE seed data
-- Run this after hive-schema.sql (or after the apply_migration in Supabase MCP)
-- All UUIDs are fixed — safe to re-run (INSERT ... ON CONFLICT DO NOTHING)

-- ---------------------------------------------------------------------------
-- Sources (36 reference sources)
-- ---------------------------------------------------------------------------
INSERT INTO hive.sources (id, trib_id, title, source_type) VALUES
  ('00000000-0000-0000-0000-000000000001', 'S_01', 'Port of Calais — Expansion & Sea Defence Case Study', 'trib_pdf'),
  ('00000000-0000-0000-0000-000000000002', 'S_06', 'Austrian Federal Railways (ÖBB) — Alpine Climate Adaptation', 'trib_pdf'),
  ('00000000-0000-0000-0000-000000000003', 'S_11', 'Deutsche Bahn — Multi-Hazard Climate Adaptation Programme', 'trib_pdf'),
  ('00000000-0000-0000-0000-000000000004', 'S_19', 'City of Phoenix — Cool Pavement Programme', 'trib_pdf'),
  ('00000000-0000-0000-0000-000000000005', 'S_32', 'Heathrow Airport — Balancing Pond Water Management', 'trib_pdf'),
  ('00000000-0000-0000-0000-000000000006', 'S_40', 'Sheffield Grey to Green — SuDS Corridor', 'trib_pdf'),
  ('00000000-0000-0000-0000-000000000007', 'S_UKPN', 'UK Power Networks — Grid Flood Defence Programme', 'trib_pdf')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Articles (8 case studies from CASE_STUDIES seed data)
-- ---------------------------------------------------------------------------
INSERT INTO hive.articles (id, source_id, transport_sector, asset_type, hazard_cause, hazard_effect, project_title, measure_title, measure_description, case_study_text, content_type, trib_ranking) VALUES
  (
    'ID_19',
    '00000000-0000-0000-0000-000000000004',
    'Highways',
    'Road pavement',
    'High temperatures, Urban Heat Island effect',
    'Road surface overheating, Increased energy demand',
    'Phoenix Cool Pavement Programme',
    'CoolSeal reflective coating',
    'Reflective CoolSeal coating applied to 100+ miles of residential roads to combat extreme urban heat island effect.',
    'Reflective CoolSeal coating applied to 100+ miles of residential roads to combat extreme urban heat island effect. The product increases road reflectivity by 30% and reduces surface temperatures by 6°C, integrated into existing pavement maintenance budgets. Cool pavement also extends road longevity by reducing thermal degradation — delivering avoided maintenance costs beyond the cooling benefit.',
    'case_study',
    1
  ),
  (
    'ID_40',
    '00000000-0000-0000-0000-000000000006',
    'Highways',
    'Road pavement, Rail track, Trams',
    'Flooding – fluvial, Flooding – surface water, Heavy rainfall',
    'Water damage, Infrastructure disruption',
    'Sheffield Grey to Green',
    'Sustainable Drainage Systems (SuDS)',
    '1.5km urban green corridor replacing a former ring road dual carriageway with SuDS.',
    '1.5km urban green corridor replacing a former ring road dual carriageway with Sustainable Drainage Systems following the 2007 floods that caused £30m damage, killed 2 people, closed Sheffield station, cancelled tram services and damaged 28 roads. SuDS reduced river discharge from a 1-in-100-year event by 87% — from 69.6 to 9.2 litres/sec.',
    'case_study',
    2
  ),
  (
    'ID_UKPN_01',
    '00000000-0000-0000-0000-000000000007',
    'Critical Infrastructure',
    'Electrical substation, Transformers',
    'Flooding – fluvial',
    'Power disruption, Loss of electricity supply to transport networks',
    'Croydon Grid Flood Defence',
    'Permanent flood barriers and equipment sealing',
    'Permanent flood barriers installed at Croydon Grid substation to withstand a 1-in-1,000-year flood.',
    'Permanent flood barriers installed at Croydon Grid substation to withstand a 1-in-1,000-year flood of the River Wandle, protecting electricity supply to 69,000 homes and businesses including transport infrastructure in South London. Part of UK Power Networks programme protecting 119 substations for £14m since 2010.',
    'case_study',
    3
  ),
  (
    'ID_32',
    '00000000-0000-0000-0000-000000000005',
    'Aviation',
    'Access routes, Airport services',
    'Heavy rainfall, Drought',
    'Flooding – fluvial, Flooding – surface water',
    'Heathrow Airport Balancing Ponds',
    'Balancing ponds with tilting weirs',
    'Constructed balancing ponds to manage both drought and heavy rainfall events.',
    'Constructed balancing ponds to manage both drought and heavy rainfall events, controlling water volume entering drainage systems and reducing flood risk to airport access routes. Integrating climate adaptation into planned development activities kept costs minimal — bundled with a wider infrastructure programme.',
    'case_study',
    4
  ),
  (
    'ID_06',
    '00000000-0000-0000-0000-000000000002',
    'Rail',
    'Track, Bridges, Earthworks, Signalling',
    'Heavy rainfall, Storms, Freeze-thaw cycles',
    'Landslides, Rockfalls, Flooding – fluvial',
    'Austrian Federal Railways Climate Adaptation',
    'Slope stabilisation, rockfall barriers, early warning systems',
    'Comprehensive physical and predictive technology adaptations across the Alpine rail network.',
    'Comprehensive physical and predictive technology adaptations across the Alpine rail network, combining slope stabilisation, protective barriers and geotechnical sensor monitoring. Site-specific assessment combining damage history, local conditions, and vulnerability analysis was more effective than blanket solutions.',
    'case_study',
    5
  ),
  (
    'ID_01',
    '00000000-0000-0000-0000-000000000001',
    'Maritime',
    'Port structures, Terminal, Retaining walls',
    'Sea level rise, Storms and high winds',
    'Storm surge, Coastal flooding, Coastal erosion',
    'Port of Calais Extension and Sea Defence',
    '3.3km sea wall with 100-year design life',
    'Doubled port capacity while building a 3.3km seawall designed for 100-year service life.',
    'Doubled port capacity while building a 3.3km seawall designed for 100-year service life, explicitly accounting for sea level rise and climate change projections in all structural specifications. Treating climate resilience as a core design requirement from the outset allowed the seawall to be cost-effectively integrated into a wider port upgrade.',
    'case_study',
    6
  ),
  (
    'ID_11',
    '00000000-0000-0000-0000-000000000003',
    'Rail',
    'Tracks, Trains, Overhead lines, Lineside vegetation',
    'High temperatures, Storms and high winds',
    'Vegetation dieback, Storm damage, Track overheating',
    'Deutsche Bahn Climate Adaptation Measures',
    'Air-conditioned rolling stock, IoT sensors, vegetation management',
    'Phased adaptation combining air-conditioned rolling stock, AI-assisted vegetation management and IoT sensor networks.',
    'Phased adaptation combining air-conditioned rolling stock, AI-assisted vegetation management via satellite data, and IoT sensor networks to address escalating heat and storm risks. Vegetation management delivered 25% reduction in storm damage between 2018 and 2020.',
    'case_study',
    7
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Options (first 10 from OPTIONS_DATA — run full seed from options-data.ts for all)
-- ---------------------------------------------------------------------------
INSERT INTO hive.options (transport_subsector, transport_assets, climate_hazard_cause, climate_hazard_effect, climate_risk_to_assets, adaptation_measure, adaptation_measure_description, response_and_recovery_measures, identified_cobenefits) VALUES
  ('Roads', 'Road - Pavements', 'High temperatures', 'Overheating including Urban Heat Island (UHI) effect', 'Surface failure of road pavement from thermal expansion', 'Asset temperature threshold considerations', 'Use of materials that can withstand higher temperatures or are lighter in colour, such as reflective coating for pavement surfaces', 'Emergency repair or replacement of asset', 'community, decreased energy consumption, carbon reduction'),
  ('Roads', 'Road - Pavements', 'Heavy rainfall, flooding - surface water, flooding - fluvial', 'Water damage', 'Asset flooding and scour resulting in damage to road surface', 'Appropriate drainage design to account for climate change uplift', 'Consideration of Sustainable Drainage System (SuDS) that account for climate change uplift', 'Emergency repair or replacement of asset. Alternative traffic management.', 'community, environment, biodiversity, carbon reduction'),
  ('Rail', 'Rail - Track', 'High temperatures', 'Overheating including Urban Heat Island (UHI) effect', 'Extended periods of thermal stress can lead to broken rails', 'Real-time or remote monitoring', 'Digital real-time monitoring systems for predictive decision-making when temperature trigger points are reached', 'Speed restrictions on overheated tracks. Emergency repair or replacement.', 'biodiversity, carbon reduction, decreased energy consumption'),
  ('Rail', 'Rail - Track', 'Heavy rainfall, flooding - surface water, flooding - fluvial', 'Water damage', 'Flooding of tracks causing disruption and damage', 'Improved drainage capacity', 'Installation of improved drainage to manage increased rainfall volumes', 'Emergency closure and repair. Rail replacement buses.', 'biodiversity, environment'),
  ('Aviation', 'Aviation - Airfield Pavements', 'High temperatures', 'Overheating', 'Rutting and deformation of runway surfaces under high temperatures', 'High-temperature performance asphalt mixes', 'Use of modified asphalt binders rated for higher operating temperatures', 'Emergency repair or temporary closure of runway.', 'decreased energy consumption'),
  ('Aviation', 'Aviation - Drainage Systems', 'Heavy rainfall, flooding', 'Water damage, flooding', 'Flooding of airfield affecting operations and aircraft movement', 'Enhanced airfield drainage design', 'Sustainable drainage integrated into airfield design', 'Emergency pumping and recovery operations.', 'environment, biodiversity'),
  ('Maritime', 'Maritime - Coastal Structures', 'Sea level rise, storm surge', 'Coastal flooding, erosion', 'Damage to port structures from sea level rise and increased storm surge', 'Raise design levels of coastal infrastructure', 'Increase crest levels of sea walls and breakwaters in line with sea level rise projections', 'Emergency response and recovery procedures for port closures.', 'community'),
  ('Maritime', 'Maritime - Port Operations', 'Drought, low water levels', 'Operational disruption', 'Reduced navigable depth affecting vessel access', 'Dredging programme aligned with climate projections', 'Regular dredging combined with climate-informed design of channel depths', 'Operational adjustments and vessel weight restrictions.', 'economy'),
  ('Roads', 'Road - Bridges', 'Flooding - fluvial', 'Water damage, scour', 'Bridge scour from increased river flows and flooding events', 'Scour protection and monitoring', 'Installation of scour aprons and real-time monitoring sensors at vulnerable bridge piers', 'Emergency inspection and closure protocols. Temporary weight restrictions.', 'community, safety'),
  ('Rail', 'Rail - Earthworks', 'Heavy rainfall, landslide', 'Structural failure', 'Embankment and cutting failures due to increased pore water pressure', 'Earthworks drainage and slope stabilisation', 'Improved drainage with geotextiles and slope stabilisation measures', 'Emergency possessions and bus substitution. Track inspection regime.', 'safety, environment')
ON CONFLICT DO NOTHING;
