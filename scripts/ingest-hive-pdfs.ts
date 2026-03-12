import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const pdfParse: (buf: Buffer) => Promise<{ text: string; numpages: number }> =
  require("pdf-parse");

// ── Config ───────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "hive" } }
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ── Known existing articles (from Phase 1) ──────────────────────────────────

const EXISTING: Record<string, { article_id: string; source_id: string }> = {
  ID_01: { article_id: "34108203-d6ca-42a5-bfc1-4f47e8253b0c", source_id: "00000000-0000-0000-0000-000000000001" },
  ID_06: { article_id: "3b321491-4239-49ba-a2f7-ef079dfb9fdb", source_id: "00000000-0000-0000-0000-000000000002" },
  ID_11: { article_id: "1143f2d5-45f3-4667-9e36-b47220841f20", source_id: "00000000-0000-0000-0000-000000000003" },
  ID_19: { article_id: "7bcb1637-69d7-4b86-9111-6c5ae47cbe95", source_id: "00000000-0000-0000-0000-000000000004" },
  ID_32: { article_id: "2294f9a4-981f-4d9b-9de6-aeb62c2f459e", source_id: "00000000-0000-0000-0000-000000000005" },
  ID_40: { article_id: "4ed0165c-e3df-482d-8d87-abcccaab6d45", source_id: "00000000-0000-0000-0000-000000000006" },
};

// ── All 36 PDF URLs ──────────────────────────────────────────────────────────

const PDF_URLS = [
  "https://trib.org.uk/documents/ID%2001_Port%20of%20Calais_Extension%20and%20sea%20defence.pdf",
  "https://trib.org.uk/documents/ID%2002_Prince%20Edward%20Island.pdf",
  "https://trib.org.uk/documents/ID%2003_Metroselskabet_multiple%20measures.pdf",
  "https://trib.org.uk/documents/ID%2004_New%20locks%20in%20the%20Albert%20canal%20in%20Flanders,%20Belgium.pdf",
  "https://trib.org.uk/documents/ID%2006_Austrian%20Federal%20Railways_climate%20adaptation%20measures.pdf",
  "https://trib.org.uk/documents/ID%2007_MTA_Saint%20George%20Terminal.pdf",
  "https://trib.org.uk/documents/ID%2009_Cooks%20Island%20Ports%20Authority_Avatiu%20Port%20Wharf%20climate%20proofing.pdf",
  "https://trib.org.uk/documents/ID%2010_Infrabel_Climate%20Adaptation%20Measures.pdf",
  "https://trib.org.uk/documents/ID%2011_Deutsche%20Bahn_Climate%20Adaptation%20Measures.pdf",
  "https://trib.org.uk/documents/ID%2012_Leeds%20flood%20alleviation%20scheme.pdf",
  "https://trib.org.uk/documents/ID%2013_Transport%20for%20London.pdf",
  "https://trib.org.uk/documents/ID%2014_Adelaide%20Airport%20Irrigation%20Project.pdf",
  "https://trib.org.uk/documents/ID%2015_Environment%20Agency_Clays%20Lake%20Scheme.pdf",
  "https://trib.org.uk/documents/ID%2016_Network%20Rail_Conwy%20Valley%20Line%20Washout.pdf",
  "https://trib.org.uk/documents/ID%2019_City%20of%20Phoenix%20Street%20Transportation%20Department_Cool%20Pavements%20Programme%20(1).pdf",
  "https://trib.org.uk/documents/ID%2020_Major%20Road%20Projects%20Victoria%20(MRPV)_Pound%20Road%20West%20Upgrade%20in%20Dandenong%20South.pdf",
  "https://trib.org.uk/documents/ID%2021_Government%20of%20South%20Australia_Fire%20Suppression%20Systems.pdf",
  "https://trib.org.uk/documents/ID%2022_City%20of%20Parramatta_Cool%20Roads%20Trial%20Project%20(1).pdf",
  "https://trib.org.uk/documents/ID%2023_LA%20Metro_climate%20adaptation%20plan.pdf",
  "https://trib.org.uk/documents/ID%2025_Dania%20Beach_Florida.pdf",
  "https://trib.org.uk/documents/ID%2026_Qatar's%20Public%20Works%20Authority_Pumping%20station%20and%20outfall%20tunnel.pdf",
  "https://trib.org.uk/documents/ID%2028_NSW%20Government_Climate%20resilient%20transport%20for%20Sydney%20Metro%20rail%20system.pdf",
  "https://trib.org.uk/documents/ID%2030_Bradford%20Metropolitan%20Council_Trees%20as%20stormwater%20attenuation%20and%20treatment%20pits.pdf",
  "https://trib.org.uk/documents/ID%2031_NetworkRail_Drainage%20System.pdf",
  "https://trib.org.uk/documents/ID%2032_Heathrow%20Airport%20Balancing%20Pond.pdf",
  "https://trib.org.uk/documents/ID%2033_%20Heathrow%20Airport%20Grass%20Standards.pdf",
  "https://trib.org.uk/documents/ID%2034_Caltran_%20Gleason%20Beach%20Roadway%20Realignment%20Project.pdf",
  "https://trib.org.uk/documents/ID%2037_The%20Panama%20Canal%20Authority%20Adapts%20Strategic%20Measures%20for%20Water%20Savings.pdf",
  "https://trib.org.uk/documents/ID%2039_Thames%20Water%20Counters%20Creek_SuDS%20.pdf",
  "https://trib.org.uk/documents/ID%2040_Sheffield%20City%20Council%20Grey%20to%20Green.pdf",
  "https://trib.org.uk/documents/ID%2042_Santa%20Barbara%20County%20Montecito's%20Randall%20Road%20Debris%20Basin.pdf",
  "https://trib.org.uk/documents/ID%2046_Network%20Rail_Dawlish%20Sea%20Wall.pdf",
  "https://trib.org.uk/documents/ID%2051_TfL_Rainwater%20harvesting.pdf",
  "https://trib.org.uk/documents/ID%2079_Environment%20Agency_Thames%20Tidal%20Barrier.pdf",
  "https://trib.org.uk/documents/ID%2080_Berlin%20BVG_Green%20Tram%20Tracks.pdf",
  "https://trib.org.uk/documents/ID%2081_Queensland%20Foamed%20Bitumen%20Stabilisation.pdf",
];

// ── Section detection ────────────────────────────────────────────────────────

const SECTION_PATTERNS: [string, RegExp][] = [
  ["challenge", /^the challenge$/i],
  ["adaptation_measures", /^adaptation measures?$/i],
  ["applicability", /^applicability$/i],
  ["financials", /^financials?$/i],
  ["resourcing", /^resourcing$/i],
  ["co_benefits", /^co.?benefits$/i],
  ["evaluation", /^evaluation$/i],
  ["challenges", /^challenges$/i],
  ["lessons_learned", /^lessons learned$/i],
  ["innovation_opportunities", /^innovation opportunities$/i],
  ["sources", /^relevant links and sources$/i],
];

function extractTribId(url: string): string {
  const m = url.match(/ID%20(\d+)/);
  return m ? `ID_${m[1]}` : "UNKNOWN";
}

function stripNoise(text: string): string {
  return text
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (t === "OFFICIAL") return false;
      if (/^\d{1}$/.test(t)) return false;
      if (/^Photo credit:/i.test(t)) return false;
      if (/^Image source:/i.test(t)) return false;
      if (/^Source:\s*$/i.test(t)) return false;
      return true;
    })
    .join("\n");
}

function splitIntoSections(text: string): Record<string, string> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections: Record<string, string> = {};
  let currentKey: string | null = null;
  let buffer: string[] = [];

  for (const line of lines) {
    let matched = false;
    for (const [key, pattern] of SECTION_PATTERNS) {
      if (pattern.test(line)) {
        if (currentKey && buffer.length) {
          sections[currentKey] = buffer.join(" ").trim();
        }
        currentKey = key;
        buffer = [];
        matched = true;
        break;
      }
    }
    if (!matched && currentKey) {
      buffer.push(line);
    }
  }
  if (currentKey && buffer.length) {
    sections[currentKey] = buffer.join(" ").trim();
  }
  return sections;
}

// ── Metadata extraction from PDF header ──────────────────────────────────────

function extractMetadata(text: string): Record<string, string | null> {
  const header = text.split("\n").slice(0, 50).join("\n");
  const get = (pattern: RegExp): string | null => {
    const m = header.match(pattern);
    return m ? m[1].trim() : null;
  };

  return {
    organisation: get(/Organisation\s+(.+)/i),
    transport_sector: get(/Transport sub.?sector\s+(.+)/i),
    hazard_cause: get(/First order climate hazards?\s*\(cause\)\s+(.+)/i),
    hazard_effect: get(/Second order climate hazards?\s*\(effect\)\s+(.+)/i),
    asset_type: get(/Transport assets?\s+impacted\s+(.+)/i),
    measure_title: get(/Adaptation measures?\s+(.+)/i),
    location: get(/Location\s+(.+)/i),
    year_of_delivery: get(/Year of delivery\s+(.+)/i),
  };
}

function semicolonToComma(val: string | null): string {
  if (!val) return "";
  return val.split(/[;,]/).map((s) => s.trim()).filter(Boolean).join(", ");
}

// ── Embedding ────────────────────────────────────────────────────────────────

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Ensure source + article exist, return IDs ────────────────────────────────

async function ensureSourceAndArticle(
  tribId: string,
  url: string,
  meta: Record<string, string | null>
): Promise<{ source_id: string; article_id: string }> {
  if (EXISTING[tribId]) return EXISTING[tribId];

  // Check if source already exists (from a previous run)
  const { data: existingSrc } = await supabase
    .from("sources")
    .select("id")
    .eq("trib_id", tribId)
    .maybeSingle();

  let source_id: string;
  if (existingSrc) {
    source_id = existingSrc.id;
  } else {
    const { data: newSrc, error: srcErr } = await supabase
      .from("sources")
      .insert({
        trib_id: tribId,
        title: meta.organisation || tribId,
        original_url: url,
        source_type: "trib_pdf",
      })
      .select("id")
      .single();
    if (srcErr) throw new Error(`Source insert for ${tribId}: ${srcErr.message}`);
    source_id = newSrc.id;
  }

  // Check if article already exists
  const { data: existingArt } = await supabase
    .from("articles")
    .select("id")
    .eq("trib_article_id", tribId)
    .maybeSingle();

  let article_id: string;
  if (existingArt) {
    article_id = existingArt.id;
  } else {
    const titleFromUrl = decodeURIComponent(url)
      .replace(/.*\//, "")
      .replace(/\.pdf$/i, "")
      .replace(/^ID\s*\d+_/, "")
      .replace(/_/g, " ")
      .trim();

    const { data: newArt, error: artErr } = await supabase
      .from("articles")
      .insert({
        trib_article_id: tribId,
        source_id,
        transport_sector: meta.transport_sector || null,
        asset_type: semicolonToComma(meta.asset_type) || null,
        hazard_cause: semicolonToComma(meta.hazard_cause) || null,
        hazard_effect: semicolonToComma(meta.hazard_effect) || null,
        project_title: meta.organisation || titleFromUrl,
        measure_title: meta.measure_title || "Climate adaptation",
        measure_description: meta.measure_title || null,
        content_type: "case_study",
      })
      .select("id")
      .single();
    if (artErr) throw new Error(`Article insert for ${tribId}: ${artErr.message}`);
    article_id = newArt.id;
  }

  return { source_id, article_id };
}

// ── Process one PDF ──────────────────────────────────────────────────────────

type IngestResult = { tribId: string; chunks: number; isNew: boolean };

async function ingestPdf(url: string): Promise<IngestResult> {
  const tribId = extractTribId(url);
  console.log(`\n── ${tribId} ──`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const parsed = await pdfParse(buffer);
  const cleaned = stripNoise(parsed.text);

  const meta = extractMetadata(cleaned);
  const sections = splitIntoSections(cleaned);
  const sectionKeys = Object.keys(sections);
  console.log(`  Sections: ${sectionKeys.join(", ") || "(none)"}`);

  const isNew = !EXISTING[tribId];
  const { source_id, article_id } = await ensureSourceAndArticle(tribId, url, meta);

  let chunkCount = 0;
  let chunkIndex = 0;
  for (const [sectionKey, content] of Object.entries(sections)) {
    if (!content || content.length < 20) continue;

    let embedding: number[] | null = null;
    try {
      embedding = await embed(content);
      await sleep(500);
    } catch (err: any) {
      console.warn(`  ⚠ Embedding failed for ${sectionKey}: ${err.message}`);
    }

    const { error: chunkErr } = await supabase
      .from("document_chunks")
      .upsert(
        {
          source_id,
          article_id,
          section_key: sectionKey,
          chunk_index: chunkIndex,
          chunk_text: content,
          metadata: { trib_id: tribId, section: sectionKey, organisation: meta.organisation },
          embedding,
        },
        { onConflict: "article_id,section_key" }
      );

    if (chunkErr) {
      console.error(`  ✗ Chunk upsert (${sectionKey}): ${chunkErr.message}`);
    } else {
      console.log(`  ✓ ${sectionKey} (${content.split(/\s+/).length} words)`);
      chunkCount++;
    }
    chunkIndex++;
  }

  // Update scraped_at on source
  await supabase
    .from("sources")
    .update({ scraped_at: new Date().toISOString() })
    .eq("id", source_id);

  return { tribId, chunks: chunkCount, isNew };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`── HIVE Ingestion — ${PDF_URLS.length} PDFs ──`);

  let success = 0;
  let failed = 0;
  let totalChunks = 0;
  let newArticles = 0;
  let updatedArticles = 0;
  const failures: { tribId: string; error: string }[] = [];

  for (const url of PDF_URLS) {
    const tribId = extractTribId(url);
    try {
      const result = await ingestPdf(url);
      success++;
      totalChunks += result.chunks;
      if (result.isNew) newArticles++;
      else updatedArticles++;
    } catch (err: any) {
      failed++;
      const msg = err.message || String(err);
      console.error(`  ✗ FAILED: ${msg}`);
      failures.push({ tribId, error: msg });
    }
  }

  console.log(`\n── HIVE Ingestion Complete ──`);
  console.log(`PDFs processed:    ${PDF_URLS.length}`);
  console.log(`  ✓ Success:       ${success}`);
  console.log(`  ✗ Failed:        ${failed}${failed > 0 ? " (see failures below)" : ""}`);
  console.log(`Chunks inserted:   ${totalChunks} (avg ${success > 0 ? Math.round(totalChunks / success) : 0} per PDF)`);
  console.log(`New articles:      ${newArticles}`);
  console.log(`Updated articles:  ${updatedArticles}`);

  if (failures.length) {
    console.log(`\nFailures:`);
    for (const f of failures) {
      console.log(`  ${f.tribId} — ${f.error}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
