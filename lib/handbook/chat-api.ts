/**
 * HIVE Chat API — RAG-first, context-aware.
 *
 * Architecture: retrieve chunks via pgvector → inject into prompt → LLM synthesises.
 * Fallback: if RAG unavailable (DB down, no creds, no chunks), inject full case JSON.
 *
 * This module is the single source of truth for all AI chat behaviour in the app.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChatMessageIn = {
  role: "user" | "ai";
  text: string;
};

export type ChatContext = {
  mode: "explore" | "deep_dive" | "synthesis";
  result_set?: { id: string; title: string; sector: string }[];
  active_filters?: {
    sector?: string;
    hazard_cause?: string;
    hazard_effect?: string;
  };
  article_id?: string;
  article_chunks?: { section_key: string; chunk_text: string }[];
  brief_case_ids?: string[];
  brief_case_chunks?: {
    article_id: string;
    section_key: string;
    chunk_text: string;
  }[];
  brief_sections?: { section: string; content: string }[];
  session_intent?: string;
};

export type ChatAction = {
  type:
    | "update_filters"
    | "add_to_brief"
    | "update_brief_section"
    | "suggest_cases";
  payload: Record<string, unknown>;
};

export type ChatApiResponse = {
  message: string;
  text: string;
  action?: ChatAction;
  sources?: string[];
  chips?: string[];
  gap?: string | null;
  actions?: Array<{ label: string; primary?: boolean; demo?: boolean }>;
  retrieval_mode: "rag" | "fallback";
};

// ---------------------------------------------------------------------------
// RAG retrieval
// ---------------------------------------------------------------------------

type RetrievedChunk = {
  article_id: string;
  section_key?: string;
  chunk_text: string;
  similarity?: number;
};

async function retrieveContext(
  query: string,
  options?: { section?: string; limit?: number; threshold?: number }
): Promise<{ chunks: RetrievedChunk[]; formatted: string; mode: "rag" | "fallback" }> {
  try {
    const supabaseUrl =
      process.env.HIVE_SUPABASE_URL ??
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.HIVE_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !supabaseKey || !openaiKey) {
      throw new Error("Missing Supabase or OpenAI credentials for RAG");
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    const embResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = embResponse.data[0].embedding;

    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "hive" },
    });

    // hive_match_chunks is in the public schema; .rpc() calls public by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: chunks, error } = await (sb as any).rpc("hive_match_chunks", {
      query_embedding: queryEmbedding,
      match_threshold: options?.threshold ?? 0.5,
      match_count: options?.limit ?? 8,
      filter_section: options?.section ?? null,
    });

    if (error || !chunks?.length) {
      throw new Error(error?.message ?? "No chunks returned from pgvector");
    }

    const typedChunks: RetrievedChunk[] = chunks.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => ({
        article_id: c.article_id,
        section_key: c.section_key ?? "general",
        chunk_text: c.chunk_text,
        similarity: c.similarity,
      })
    );

    const formatted = typedChunks
      .map(
        (c) => `[${c.article_id}] (${c.section_key}):\n${c.chunk_text}`
      )
      .join("\n\n---\n\n");

    return { chunks: typedChunks, formatted, mode: "rag" };
  } catch (err) {
    console.warn("[HIVE] RAG unavailable, falling back to full case JSON:", err);
    const fallbackJson = await getFallbackCaseJson();
    return { chunks: [], formatted: fallbackJson, mode: "fallback" };
  }
}

async function getFallbackCaseJson(): Promise<string> {
  const { CASE_STUDIES } = await import("@/lib/hive/seed-data");
  return JSON.stringify(
    CASE_STUDIES.map((cs) => ({
      id: cs.id,
      title: cs.title,
      sector: cs.sector,
      hazards: cs.hazards,
      measures: cs.measures,
      location: cs.location,
      transferability: cs.transferability,
      insight: cs.insight,
      cost: cs.cost,
      ukApplicability: cs.ukApplicability,
    }))
  );
}

/** Public: run semantic search and return raw chunks with similarity scores. */
export async function semanticSearchChunks(
  query: string,
  options?: { limit?: number; threshold?: number }
): Promise<{
  chunks: RetrievedChunk[];
  mode: "rag" | "fallback";
}> {
  const result = await retrieveContext(query, options);
  return { chunks: result.chunks, mode: result.mode };
}

// ---------------------------------------------------------------------------
// System prompts (Brief v3 §8)
// ---------------------------------------------------------------------------

const BASE_PROMPT = `You are HIVE, a climate adaptation intelligence assistant for transport professionals working in the UK. You help users find, understand, and synthesise case studies of climate adaptation measures from transport infrastructure around the world.

Evidence rules — absolute:
- Only use information from the provided case study chunks or retrieved context.
- Never invent details, costs, dates, outcomes, or statistics.
- If the data doesn't support a claim, say "the data doesn't specify."
- Cite every substantive claim with a case ID in brackets, e.g. [ID_06], [ID_31].
- Do not merge or confuse two different case studies.

Behaviour:
- Be concise. These are time-poor professionals.
- Before suggesting an action, describe what it will do.
- Never auto-apply changes. Always present as a suggestion.
- If a query is vague, ask one clarifying question rather than guessing.`;

const EXPLORE_PROMPT = `
The user is exploring the case study library. Your job is to help them find the most relevant case studies and understand what worked. If their query is vague, ask one clarifying question (infrastructure type, location, specific hazard). If results are returned, explain why they are relevant — don't just list them. Prefer citing specific case IDs.`;

const DEEP_DIVE_PROMPT = `
The user is reading a specific case study. All sections of this case are provided below. Answer only from this case's content. If asked about similar cases, draw on your knowledge of the broader library but clearly flag you are doing so. If the user wants to add content to their brief, suggest they do so.`;

const SYNTHESIS_PROMPT = `
The user is building a structured brief from selected case studies. All relevant case chunks are provided. Every claim must cite a case ID. Return suggested text clearly formatted. When identifying gaps, be specific — name the missing hazard, sector, or evidence type. Never auto-apply changes to the brief. Always present as a suggestion.`;

function buildSystemPrompt(
  context: ChatContext,
  retrievedContent: string,
  retrievalMode: "rag" | "fallback"
): string {
  const dataLabel =
    retrievalMode === "rag"
      ? "Retrieved case study evidence (from knowledge base):"
      : "Case study data (full library — RAG was unavailable):";

  let modePrompt: string;
  let modeContext = "";

  switch (context.mode) {
    case "deep_dive": {
      modePrompt = DEEP_DIVE_PROMPT;
      if (context.article_id) {
        modeContext = `\nThe user is currently viewing case study ${context.article_id}.`;
      }
      if (context.article_chunks?.length) {
        modeContext += "\n\nFull article sections:\n" +
          context.article_chunks
            .map((c) => `[${context.article_id}] (${c.section_key}):\n${c.chunk_text}`)
            .join("\n\n---\n\n");
      }
      break;
    }
    case "synthesis": {
      modePrompt = SYNTHESIS_PROMPT;
      if (context.brief_case_ids?.length) {
        modeContext = `\nThe user's brief contains cases: ${context.brief_case_ids.join(", ")}.`;
      }
      if (context.brief_case_chunks?.length) {
        modeContext += "\n\nBrief case evidence:\n" +
          context.brief_case_chunks
            .map((c) => `[${c.article_id}] (${c.section_key}):\n${c.chunk_text}`)
            .join("\n\n---\n\n");
      }
      if (context.brief_sections?.length) {
        modeContext += "\n\nCurrent brief sections:\n" +
          context.brief_sections
            .map((s) => `## ${s.section}\n${s.content}`)
            .join("\n\n");
      }
      break;
    }
    default: {
      modePrompt = EXPLORE_PROMPT;
      if (context.active_filters) {
        const f = context.active_filters;
        const parts = [
          f.sector && `sector: ${f.sector}`,
          f.hazard_cause && `hazard: ${f.hazard_cause}`,
          f.hazard_effect && `effect: ${f.hazard_effect}`,
        ].filter(Boolean);
        if (parts.length) {
          modeContext = `\nActive filters: ${parts.join(", ")}.`;
        }
      }
      if (context.result_set?.length) {
        modeContext += `\nCurrently showing ${context.result_set.length} cases: ${context.result_set.map((r) => `${r.id} (${r.title})`).join(", ")}.`;
      }
      break;
    }
  }

  const intentLine = context.session_intent
    ? `\nUser's original search intent: "${context.session_intent}"`
    : "";

  return [
    BASE_PROMPT,
    modePrompt,
    modeContext,
    intentLine,
    "",
    dataLabel,
    retrievedContent,
  ]
    .filter(Boolean)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Source candidate flagging (background — never affects chat response)
// ---------------------------------------------------------------------------

export async function flagSourceCandidate({
  url,
  title,
  ai_category,
  ai_assessment,
}: {
  url: string;
  title?: string;
  ai_category:
    | "too_thin"
    | "withdrawn"
    | "wrong_taxonomy"
    | "fetch_failed"
    | "pdf_pending"
    | "promising";
  ai_assessment: string;
}) {
  try {
    const sbUrl =
      process.env.HIVE_SUPABASE_URL ??
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey =
      process.env.HIVE_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey) return;

    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(sbUrl, sbKey, { db: { schema: "hive" } });

    await sb.from("source_candidates").insert({
      url,
      title: title ?? null,
      suggested_by: "ai",
      ai_category,
      ai_assessment,
      status: "pending",
    });
  } catch (err) {
    console.warn("[HIVE] flagSourceCandidate failed (non-blocking):", err);
  }
}

// ---------------------------------------------------------------------------
// Mock fallback (no OPENAI_API_KEY)
// ---------------------------------------------------------------------------

type MockResponse = {
  text: string;
  chips?: string[];
  gap?: string | null;
  actions?: Array<{ label: string; primary?: boolean; demo?: boolean }>;
};

const MOCK: Record<string, MockResponse[]> = {
  explore: [
    {
      text: "The HIVE knowledge base has strong evidence for flooding adaptation on urban transport corridors. Sheffield Grey to Green [ID_40] reduced river discharge from a 1-in-100-year event by 87% using SuDS alongside a city-centre rail and tram network. Heathrow's balancing ponds [ID_32] demonstrate complementary dual-resilience — addressing both flooding and drought.",
      chips: ["ID_40", "ID_32"],
      gap: null,
      actions: [
        { label: "Add both to Brief", primary: true },
        { label: "Tell me about costs" },
      ],
    },
    {
      text: "Cost data: Sheffield ran £3.6m–£6.3m per phase (ERDF + local authority funded). Heathrow's retaining walls cost ~£2.1m but adaptation was integrated into planned business development — making the marginal climate cost minimal. Both report significant avoided costs that were not formally quantified.",
      chips: ["ID_40", "ID_32"],
      gap: "Cost data is indicative. Original years/currencies apply — not inflation-adjusted.",
      actions: [
        { label: "What about UK transferability?" },
        { label: "Generate cost benchmark", demo: true },
      ],
    },
    {
      text: "UK transferability: Sheffield and Heathrow are both rated High — UK cases with direct applicability. Phoenix Cool Pavements [ID_19] is rated Medium — applicable to UK urban streets ≤25mph including depot roads and urban bus corridors, less applicable to A-roads.",
      chips: ["ID_40", "ID_32", "ID_19"],
      gap: null,
      actions: [
        { label: "Build a brief from these 3 cases", primary: true },
        { label: "Run Applicability Scan", demo: true },
      ],
    },
  ],
  deep_dive: [
    {
      text: "This case has **high UK transferability** — the measures have been applied in UK conditions and the costs are in sterling. The key applicability insight is that the approach can be embedded into planned maintenance cycles rather than treated as standalone climate spend, significantly reducing effective cost.",
      gap: null,
      actions: [
        { label: "Add to Brief", primary: true },
        { label: "Show related cases" },
      ],
    },
  ],
  synthesis: [
    {
      text: "Looking across these cases, the main gap I can see is climate hazard diversity — you have strong flooding and heat evidence but nothing on coastal erosion, sea level rise, or wind damage. If your brief is for a coastal or port context, I'd recommend adding [ID_15] (Rotterdam Climate Dock) or [ID_07] (Deutsche Bahn slope stability) to broaden the hazard range.",
      chips: ["ID_15", "ID_07"],
      gap: null,
      actions: [
        { label: "Add Rotterdam to brief", primary: true },
        { label: "Keep brief focused on flooding" },
      ],
    },
  ],
};

const mockCounters: Record<string, number> = {};

function getMockResponse(mode: string): ChatApiResponse {
  const pool = MOCK[mode] ?? MOCK.explore;
  const count = mockCounters[mode] ?? 0;
  mockCounters[mode] = (count + 1) % pool.length;
  const mock = pool[count];
  return {
    message: mock.text,
    text: mock.text,
    chips: mock.chips,
    gap: mock.gap,
    actions: mock.actions,
    retrieval_mode: "fallback",
  };
}

// ---------------------------------------------------------------------------
// Parse legacy string context → ChatContext
// ---------------------------------------------------------------------------

export function parseStringContext(raw: string): ChatContext {
  if (raw.startsWith("case:")) {
    return { mode: "deep_dive", article_id: raw.replace("case:", "") };
  }
  if (raw.startsWith("brief:")) {
    const ids = raw.replace("brief:", "").split(",").filter(Boolean);
    return { mode: "synthesis", brief_case_ids: ids };
  }
  if (raw === "options") {
    return { mode: "explore" };
  }
  return { mode: "explore" };
}

// ---------------------------------------------------------------------------
// Main AI response
// ---------------------------------------------------------------------------

export async function getAIResponse(
  messages: ChatMessageIn[],
  context: ChatContext
): Promise<ChatApiResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return getMockResponse(context.mode);
  }

  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.text ?? "";

  // Retrieve context via RAG (or fallback)
  const retrieval = await retrieveContext(lastUserMessage, {
    limit: context.mode === "deep_dive" ? 12 : 8,
    threshold: 0.5,
  });

  const systemPrompt = buildSystemPrompt(
    context,
    retrieval.formatted,
    retrieval.mode
  );

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: (m.role === "ai" ? "assistant" : "user") as "assistant" | "user",
        content: m.text,
      })),
    ],
    temperature: 0.4,
    max_tokens: 600,
  });

  const text =
    completion.choices[0]?.message?.content ??
    "I couldn't generate a response.";

  // Extract cited case IDs from both LLM output and retrieved chunks
  const chipMatches = text.match(/\[?(ID_[\w]+)\]?/g);
  const chips = chipMatches
    ? [...new Set(chipMatches.map((m) => m.replace(/[[\]]/g, "")))]
    : undefined;

  const sources = retrieval.chunks.length
    ? [...new Set(retrieval.chunks.map((c) => c.article_id))]
    : chips;

  return {
    message: text,
    text,
    chips,
    sources,
    retrieval_mode: retrieval.mode,
  };
}
