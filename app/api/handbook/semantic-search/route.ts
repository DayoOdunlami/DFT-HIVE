/**
 * GET /api/handbook/semantic-search?q=...
 *
 * Semantic search over HIVE case study chunks via pgvector.
 * Returns matched article IDs with similarity scores.
 * Used by the landing page search bar to implement scenarios A/B/C.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { semanticSearchChunks } from "@/lib/handbook/chat-api";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 }
    );
  }

  try {
    const { chunks, mode } = await semanticSearchChunks(query, {
      limit: 12,
      threshold: 0.4,
    });

    const topSimilarity = chunks[0]?.similarity ?? 0;

    // Deduplicate by article_id and pick the highest similarity per article
    const articleMap = new Map<
      string,
      { article_id: string; similarity: number; section_key: string }
    >();
    for (const c of chunks) {
      const existing = articleMap.get(c.article_id);
      if (!existing || (c.similarity ?? 0) > existing.similarity) {
        articleMap.set(c.article_id, {
          article_id: c.article_id,
          similarity: c.similarity ?? 0,
          section_key: c.section_key ?? "general",
        });
      }
    }

    const results = Array.from(articleMap.values()).sort(
      (a, b) => b.similarity - a.similarity
    );

    // Determine scenario based on top similarity score
    let scenario: "A" | "B" | "C";
    if (topSimilarity >= 0.55) {
      scenario = "A";
    } else if (topSimilarity >= 0.4 && results.length > 0) {
      scenario = "B";
    } else {
      scenario = "C";
    }

    return NextResponse.json({
      query,
      scenario,
      top_similarity: topSimilarity,
      results,
      retrieval_mode: mode,
    });
  } catch (err) {
    console.error("Semantic search error:", err);
    return NextResponse.json(
      { error: "Search failed", scenario: "C", results: [], retrieval_mode: "fallback" },
      { status: 500 }
    );
  }
}
