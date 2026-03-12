import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const tribMeasures: Array<{
  trib_article_id: string;
  project_title: string;
  measures: Array<{ name: string; description: string }>;
}> = require("../data/trib-measures.json");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "hive" } }
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function backfillMissingEmbeddings() {
  console.log("\n=== Backfill missing embeddings ===\n");

  const { data: chunks, error } = await supabase
    .from("document_chunks")
    .select("id, chunk_text, section_key")
    .is("embedding", null);

  if (error) throw error;
  if (!chunks?.length) {
    console.log("No missing embeddings found.");
    return;
  }

  console.log(`Found ${chunks.length} chunks missing embeddings`);

  for (const chunk of chunks) {
    console.log(`Embedding chunk ${chunk.id} (${chunk.section_key})...`);

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk.chunk_text.slice(0, 8000),
    });

    const embedding = response.data[0].embedding;

    const { error: updateError } = await supabase
      .from("document_chunks")
      .update({ embedding })
      .eq("id", chunk.id);

    if (updateError) throw updateError;
    console.log(`  Updated chunk ${chunk.id}`);

    await sleep(500);
  }

  console.log("Embedding backfill complete.");
}

async function backfillMeasuresColumn() {
  console.log("\n=== Backfill measures column in hive.articles ===\n");

  let updated = 0;
  for (const source of tribMeasures) {
    const measureNames = source.measures.map((m) => m.name);

    const { error } = await supabase
      .from("articles")
      .update({ measures: measureNames })
      .eq("trib_article_id", source.trib_article_id);

    if (error) {
      console.error(`Failed ${source.trib_article_id}:`, error.message);
    } else {
      console.log(
        `  ${source.trib_article_id}: ${measureNames.join(", ")}`
      );
      updated++;
    }
  }

  console.log(`\nMeasures backfill complete. Updated ${updated}/${tribMeasures.length} articles.`);
}

async function verify() {
  console.log("\n=== Verification ===\n");

  const { data: nullEmbeddings } = await supabase
    .from("document_chunks")
    .select("id")
    .is("embedding", null);

  console.log(`Chunks with null embeddings: ${nullEmbeddings?.length ?? "error"}`);

  const { data: articles } = await supabase
    .from("articles")
    .select("trib_article_id, measures")
    .neq("measures", "[]");

  console.log(`Articles with non-empty measures: ${articles?.length ?? "error"}`);

  if (articles?.length) {
    for (const a of articles.slice(0, 5)) {
      console.log(`  ${a.trib_article_id}: ${JSON.stringify(a.measures)}`);
    }
    if (articles.length > 5) console.log(`  ... and ${articles.length - 5} more`);
  }
}

async function main() {
  await backfillMissingEmbeddings();
  await backfillMeasuresColumn();
  await verify();
}

main().catch(console.error);
