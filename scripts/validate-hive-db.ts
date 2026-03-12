import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "hive" } }
);

const exportOnly = process.argv.includes("--export-only");

// ── Validation ───────────────────────────────────────────────────────────────

async function validate() {
  console.log("── HIVE Validation ──\n");

  // Total chunks
  const { data: chunks } = await supabase.from("document_chunks").select("id");
  console.log(`Total document_chunks: ${chunks?.length ?? 0}`);

  // Chunks per article
  const { data: articles } = await supabase
    .from("articles")
    .select("id, trib_article_id");

  console.log("\nChunks per article:");
  for (const art of articles ?? []) {
    const { data: artChunks } = await supabase
      .from("document_chunks")
      .select("id")
      .eq("article_id", art.id);
    console.log(`  ${(art.trib_article_id ?? "?").padEnd(12)} ${artChunks?.length ?? 0} chunks`);
  }

  // Section key distribution
  const { data: allChunks } = await supabase
    .from("document_chunks")
    .select("section_key");

  const sectionCounts: Record<string, number> = {};
  for (const c of allChunks ?? []) {
    sectionCounts[c.section_key] = (sectionCounts[c.section_key] || 0) + 1;
  }
  console.log("\nSection key distribution:");
  for (const [key, count] of Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key.padEnd(28)} ${count}`);
  }

  // Spot check: ID_32 financials contains "£2,100,000"
  console.log("\nSpot checks:");
  const { data: id32Art } = await supabase
    .from("articles")
    .select("id")
    .eq("trib_article_id", "ID_32")
    .single();

  if (id32Art) {
    const { data: id32Fin } = await supabase
      .from("document_chunks")
      .select("chunk_text")
      .eq("article_id", id32Art.id)
      .eq("section_key", "financials")
      .single();

    const has32 = id32Fin?.chunk_text?.includes("2,100,000");
    console.log(`  ID_32 financials contains "£2,100,000": ${has32 ? "✓" : "✗"}`);
  }

  // Spot check: ID_11 evaluation contains "25%"
  const { data: id11Art } = await supabase
    .from("articles")
    .select("id")
    .eq("trib_article_id", "ID_11")
    .single();

  if (id11Art) {
    const { data: id11Eval } = await supabase
      .from("document_chunks")
      .select("chunk_text")
      .eq("article_id", id11Art.id)
      .eq("section_key", "evaluation")
      .single();

    const has11 = id11Eval?.chunk_text?.includes("25%");
    console.log(`  ID_11 evaluation contains "25%": ${has11 ? "✓" : "✗"}`);
  }

  console.log("\n── Validation Complete ──");
}

// ── Export JSON ───────────────────────────────────────────────────────────────

async function exportJson() {
  console.log("\n── Exporting data/case-studies.json ──\n");

  const { data: articles } = await supabase
    .from("articles")
    .select("id, trib_article_id, source_id, transport_sector, asset_type, hazard_cause, hazard_effect, project_title, measure_title, measure_description, case_study_text, measures")
    .order("trib_article_id");

  if (!articles?.length) {
    console.error("No articles found — skipping export.");
    return;
  }

  // Get sources for original_url
  const { data: sources } = await supabase.from("sources").select("id, original_url");
  const sourceMap = new Map((sources ?? []).map((s: any) => [s.id, s.original_url]));

  const output: any[] = [];

  for (const art of articles) {
    const { data: artChunks } = await supabase
      .from("document_chunks")
      .select("section_key, chunk_text")
      .eq("article_id", art.id)
      .order("chunk_index");

    const sections: Record<string, string> = {};
    for (const c of artChunks ?? []) {
      if (c.section_key && c.chunk_text) {
        sections[c.section_key] = c.chunk_text;
      }
    }

    output.push({
      trib_id: art.trib_article_id,
      organisation: art.project_title,
      transport_subsector: art.transport_sector,
      hazard_cause: art.hazard_cause,
      hazard_effect: art.hazard_effect,
      asset_type: art.asset_type,
      measure_title: art.measure_title,
      measure_description: art.measure_description,
      case_study_text: art.case_study_text,
      source_pdf_url: sourceMap.get(art.source_id) ?? null,
      measures: art.measures ?? [],
      sections,
    });
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const outPath = path.join(dataDir, "case-studies.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${output.length} case studies to ${outPath}`);
  console.log(`  With sections: ${output.filter((o) => Object.keys(o.sections).length > 0).length}`);
  console.log(`  Without sections: ${output.filter((o) => Object.keys(o.sections).length === 0).length}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!exportOnly) await validate();
  await exportJson();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
