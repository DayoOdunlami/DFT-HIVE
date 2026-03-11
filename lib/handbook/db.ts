/**
 * HIVE data abstraction layer.
 *
 * DATA_PROVIDER env var controls the backend:
 *   "json"      (L0) — static JSON/seed data, no external deps (default)
 *   "supabase"  (Phase A) — Supabase Postgres + pgvector
 *   "azure"     (Phase B) — Azure Postgres Flexible Server (same schema, different conn string)
 *
 * All functions are async so callers never need to change when the provider switches.
 * Pages and components import from here only — never from @supabase/* directly.
 */

import type { CaseStudy } from "@/lib/hive/seed-data";
import type { OptionRow } from "@/lib/handbook/options-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HiveArticle = {
  id: string;
  source_id?: string;
  transport_sector?: string;
  asset_type?: string;
  hazard_cause?: string;
  hazard_effect?: string;
  project_title: string;
  measure_title: string;
  measure_description?: string;
  case_study_text?: string;
  content_type?: "case_study" | "guidance";
  trib_ranking?: number;
  created_at?: string;
};

export type HiveOption = {
  id: string;
  transport_subsector: string;
  transport_assets?: string;
  climate_hazard_cause?: string;
  climate_hazard_effect?: string;
  climate_risk_to_assets?: string;
  adaptation_measure: string;
  adaptation_measure_description?: string;
  response_and_recovery_measures?: string;
  identified_cobenefits?: string;
};

export type SynthesisSession = {
  id: string;
  article_ids: string[];
  query_context?: string;
  created_at?: string;
};

export type ReportSection = {
  id: string;
  session_id: string;
  section_key: string;
  section_title: string;
  content: string;
  confidence?: "high" | "partial" | "indicative";
  source_chunk_ids?: string[];
  sort_order: number;
};

export type DocumentChunk = {
  id: string;
  article_id?: string;
  chunk_index: number;
  chunk_text: string;
  metadata?: Record<string, unknown>;
  similarity?: number;
};

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

function getProvider(): "json" | "supabase" | "azure" {
  const p = process.env.DATA_PROVIDER;
  if (p === "supabase" || p === "azure") return p;
  return "json";
}

// ---------------------------------------------------------------------------
// Supabase client (lazy — only instantiated when provider is supabase/azure)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseClient(): any {
  if (_supabase) return _supabase;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require("@supabase/supabase-js");
  const url =
    process.env.HIVE_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.HIVE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "HIVE_SUPABASE_URL and HIVE_SUPABASE_ANON_KEY must be set when DATA_PROVIDER=supabase"
    );
  }

  _supabase = createClient(url, key, { db: { schema: "hive" } });
  return _supabase;
}

// ---------------------------------------------------------------------------
// JSON (L0) providers — from seed data
// ---------------------------------------------------------------------------

async function getJsonArticles(): Promise<HiveArticle[]> {
  const { CASE_STUDIES } = await import("@/lib/hive/seed-data");
  return CASE_STUDIES.map((cs: CaseStudy) => ({
    id: cs.id,
    transport_sector: cs.sector,
    hazard_cause: cs.hazards.cause.join(", "),
    hazard_effect: cs.hazards.effect.join(", "),
    project_title: cs.title,
    measure_title: cs.measures.join(", "),
    measure_description: cs.measures.join(", "),
    case_study_text: cs.summary,
    content_type: "case_study" as const,
  }));
}

async function getJsonOptions(): Promise<HiveOption[]> {
  const { OPTIONS_DATA } = await import("@/lib/handbook/options-data");
  return OPTIONS_DATA.map((row: OptionRow) => ({
    id: String(row.id),
    transport_subsector: row.transport_subsector,
    transport_assets: row.transport_assets,
    climate_hazard_cause: row.climate_hazard_cause,
    climate_hazard_effect: row.climate_hazard_effect,
    climate_risk_to_assets: row.climate_risk_to_assets,
    adaptation_measure: row.adaptation_measure,
    adaptation_measure_description: row.adaptation_measure_description,
    response_and_recovery_measures: row.response_and_recovery_measures,
    identified_cobenefits: row.identified_cobenefits,
  }));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch all case study articles, optionally filtered by sector/hazard. */
export async function getHiveArticles(filters?: {
  sector?: string;
  hazard?: string;
}): Promise<HiveArticle[]> {
  const provider = getProvider();

  if (provider === "json") {
    const articles = await getJsonArticles();
    if (!filters) return articles;
    return articles.filter((a) => {
      if (filters.sector && !a.transport_sector?.toLowerCase().includes(filters.sector.toLowerCase()))
        return false;
      if (filters.hazard && !a.hazard_cause?.toLowerCase().includes(filters.hazard.toLowerCase()))
        return false;
      return true;
    });
  }

  const sb = getSupabaseClient();
  let query = sb.from("articles").select("*");
  if (filters?.sector) query = query.ilike("transport_sector", `%${filters.sector}%`);
  if (filters?.hazard) query = query.ilike("hazard_cause", `%${filters.hazard}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Supabase getHiveArticles: ${error.message}`);
  // Normalise id: prefer trib_article_id for compatibility with /handbook/[id] routes
  return ((data ?? []) as Array<HiveArticle & { trib_article_id?: string }>).map((row) => ({
    ...row,
    id: row.trib_article_id ?? row.id,
  }));
}

/** Fetch a single article by its trib_article_id (e.g. "ID_40") or UUID. */
export async function getHiveArticleById(id: string): Promise<HiveArticle | null> {
  const provider = getProvider();

  if (provider === "json") {
    const articles = await getJsonArticles();
    return articles.find((a) => a.id === id) ?? null;
  }

  const sb = getSupabaseClient();
  // In Supabase mode, prefer lookup by trib_article_id (string IDs from CASE_STUDIES)
  // then fall back to UUID lookup
  const { data: byTribId } = await sb
    .from("articles")
    .select("*")
    .eq("trib_article_id", id)
    .maybeSingle();
  if (byTribId) return { ...byTribId, id: byTribId.trib_article_id ?? byTribId.id } as HiveArticle;

  const { data, error } = await sb.from("articles").select("*").eq("id", id).single();
  if (error) return null;
  return { ...data, id: data.trib_article_id ?? data.id } as HiveArticle;
}

/** Fetch all adaptation options, optionally filtered by sector/hazard. */
export async function getHiveOptions(filters?: {
  sector?: string;
  hazard?: string;
}): Promise<HiveOption[]> {
  const provider = getProvider();

  if (provider === "json") {
    const options = await getJsonOptions();
    if (!filters) return options;
    return options.filter((o) => {
      if (
        filters.sector &&
        !o.transport_subsector.toLowerCase().includes(filters.sector.toLowerCase())
      )
        return false;
      if (
        filters.hazard &&
        !o.climate_hazard_cause?.toLowerCase().includes(filters.hazard.toLowerCase())
      )
        return false;
      return true;
    });
  }

  const sb = getSupabaseClient();
  let query = sb.from("options").select("*");
  if (filters?.sector) query = query.ilike("transport_subsector", `%${filters.sector}%`);
  if (filters?.hazard) query = query.ilike("climate_hazard_cause", `%${filters.hazard}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Supabase getHiveOptions: ${error.message}`);
  return (data ?? []) as HiveOption[];
}

/**
 * Semantic search over document_chunks using pgvector.
 * Falls back to keyword search in json mode.
 */
export async function semanticSearch(
  query: string,
  opts?: { limit?: number; threshold?: number }
): Promise<DocumentChunk[]> {
  const provider = getProvider();
  const limit = opts?.limit ?? 10;

  if (provider === "json") {
    // Keyword fallback — good enough for L0
    const articles = await getJsonArticles();
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results = articles
      .filter((a) =>
        words.some(
          (w) =>
            a.case_study_text?.toLowerCase().includes(w) ||
            a.project_title.toLowerCase().includes(w) ||
            a.measure_title.toLowerCase().includes(w)
        )
      )
      .slice(0, limit)
      .map((a, i) => ({
        id: `json-${a.id}-${i}`,
        article_id: a.id,
        chunk_index: 0,
        chunk_text: a.case_study_text ?? a.measure_description ?? a.project_title,
      }));
    return results;
  }

  // Supabase: call OpenAI to get embedding, then pgvector RPC
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const embResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });
  const embedding = embResponse.data[0].embedding;

  const sb = getSupabaseClient();
  // hive_match_chunks is a public-schema function — call without schema prefix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any).rpc("hive_match_chunks", {
    query_embedding: embedding,
    match_threshold: opts?.threshold ?? 0.7,
    match_count: limit,
  });

  if (error) throw new Error(`Supabase semanticSearch: ${error.message}`);
  return (data ?? []) as DocumentChunk[];
}

/** Create a synthesis session and persist generated sections. */
export async function createSynthesisSession(
  articleIds: string[],
  sections: Omit<ReportSection, "id" | "session_id">[],
  queryContext?: string
): Promise<SynthesisSession> {
  const provider = getProvider();

  if (provider === "json") {
    // In L0 mode, return an in-memory session — nothing persisted
    return {
      id: `session-${Date.now()}`,
      article_ids: articleIds,
      query_context: queryContext,
    };
  }

  const sb = getSupabaseClient();

  const { data: session, error: sessionError } = await sb
    .from("synthesis_sessions")
    .insert({ article_ids: articleIds, query_context: queryContext ?? null })
    .select()
    .single();

  if (sessionError) throw new Error(`Supabase createSynthesisSession: ${sessionError.message}`);

  const sectionRows = sections.map((s, i) => ({
    ...s,
    session_id: session.id,
    sort_order: s.sort_order ?? i,
  }));

  const { error: sectionsError } = await sb.from("report_sections").insert(sectionRows);
  if (sectionsError) throw new Error(`Supabase insertReportSections: ${sectionsError.message}`);

  return session as SynthesisSession;
}

/** Fetch all report sections for a synthesis session. */
export async function getReportSections(sessionId: string): Promise<ReportSection[]> {
  const provider = getProvider();

  if (provider === "json") return [];

  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("report_sections")
    .select("*")
    .eq("session_id", sessionId)
    .order("sort_order");

  if (error) throw new Error(`Supabase getReportSections: ${error.message}`);
  return (data ?? []) as ReportSection[];
}

/** Check connectivity and return provider info — used by the admin health panel. */
export async function getProviderStatus(): Promise<{
  provider: string;
  healthy: boolean;
  message?: string;
  articleCount?: number;
  optionCount?: number;
}> {
  const provider = getProvider();

  if (provider === "json") {
    const { CASE_STUDIES } = await import("@/lib/hive/seed-data");
    const { OPTIONS_DATA } = await import("@/lib/handbook/options-data");
    return {
      provider: "json (L0 offline)",
      healthy: true,
      articleCount: CASE_STUDIES.length,
      optionCount: OPTIONS_DATA.length,
    };
  }

  try {
    const sb = getSupabaseClient();
    const [{ count: articleCount }, { count: optionCount }] = await Promise.all([
      sb.from("articles").select("*", { count: "exact", head: true }),
      sb.from("options").select("*", { count: "exact", head: true }),
    ]);
    return {
      provider: provider === "azure" ? "azure (Phase B)" : "supabase (Phase A)",
      healthy: true,
      articleCount: articleCount ?? 0,
      optionCount: optionCount ?? 0,
    };
  } catch (err) {
    return {
      provider,
      healthy: false,
      message: err instanceof Error ? err.message : "Unknown connection error",
    };
  }
}
