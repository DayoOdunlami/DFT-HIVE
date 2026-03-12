import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key, { db: { schema: "hive" } });

async function countTable(table: string): Promise<number> {
  const { data, error, status, statusText } = await supabase
    .from(table)
    .select("id");
  if (error) {
    console.error(`  Table "${table}" error — status: ${status} ${statusText}, code: ${error.code}, message: ${error.message}, details: ${error.details}, hint: ${error.hint}`);
    throw new Error(`${table}: ${error.message || error.code || 'unknown error'}`);
  }
  return data?.length ?? 0;
}

async function main() {
  console.log("── HIVE Database Verification ──\n");

  const tables: [string, number][] = [
    ["sources", 7],
    ["articles", 7],
    ["options", 10],
    ["document_chunks", 0],
  ];

  for (const [table, expected] of tables) {
    const count = await countTable(table);
    const ok = count === expected ? "✓" : "✗";
    const note =
      table === "document_chunks" && count === 0
        ? " (ready for ingestion)"
        : count !== expected
          ? ` (expected ${expected})`
          : "";
    console.log(`hive.${table.padEnd(18)} ${count} rows ${ok}${note}`);
  }

  console.log("\nArticles with PDF URLs:");

  const { data: articles, error: artErr } = await supabase
    .from("articles")
    .select("id, trib_article_id, source_id")
    .order("trib_article_id");

  if (artErr) {
    console.error("  Error fetching articles:", artErr.message);
    return;
  }

  for (const art of articles ?? []) {
    const { data: src } = await supabase
      .from("sources")
      .select("original_url")
      .eq("id", art.source_id)
      .maybeSingle();

    const pdfUrl = src?.original_url;
    if (!pdfUrl) {
      console.log(`  ${art.trib_article_id?.padEnd(12)} → (no URL — skip)`);
    } else {
      const short =
        pdfUrl.length > 70 ? pdfUrl.slice(0, 67) + "..." : pdfUrl;
      console.log(`  ${art.trib_article_id?.padEnd(12)} → ${short}`);
    }
  }

  console.log("\n── Done ──");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
