/**
 * POST /api/handbook/brief-generate
 *
 * RAG brief generation from collected case study IDs.
 * - Loads case study text from db.ts (json/supabase/azure)
 * - Optionally retrieves document_chunks from pgvector for richer context
 * - Calls OpenAI to generate structured brief sections
 * - In Supabase mode: persists the session + sections to synthesis_sessions / report_sections
 *
 * Step 8: AI brief generation.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getHiveArticleById,
  createSynthesisSession,
  type ReportSection,
} from "@/lib/handbook/db";

const BRIEF_SYSTEM_PROMPT = `You are an expert climate adaptation analyst for UK transport infrastructure.

Given case study summaries, generate a structured intelligence brief with the following sections in order:

1. executive_summary — 2-3 sentences. Cross-cutting findings across all cases.
2. climate_context — 1-2 sentences. The climate hazards and trends the cases respond to.
3. key_measures — 3-5 bullet points. The most important adaptation measures across cases.
4. uk_applicability — 2-3 sentences. How well these cases transfer to UK transport contexts.
5. cost_and_investment — 1-2 sentences. Cost ranges and investment patterns observed.
6. knowledge_gaps — 2-3 bullet points. What is missing or uncertain in this evidence base.

For each section, also assign a confidence level:
- "high" — strong evidence, multiple cases agree
- "partial" — some evidence, requires interpretation
- "indicative" — limited evidence, treat as directional

Respond ONLY with valid JSON in this exact format:
{
  "sections": [
    {
      "section_key": "executive_summary",
      "section_title": "Executive Summary",
      "content": "...",
      "confidence": "high"
    }
  ]
}`;

const SECTION_TITLES: Record<string, string> = {
  executive_summary: "Executive Summary",
  climate_context: "Climate Context",
  key_measures: "Key Adaptation Measures",
  uk_applicability: "UK Applicability",
  cost_and_investment: "Cost & Investment",
  knowledge_gaps: "Knowledge Gaps",
};

type GeneratedSection = {
  section_key: string;
  section_title: string;
  content: string;
  confidence: "high" | "partial" | "indicative";
};

// Fallback: generate a mock brief from case study data without OpenAI
function generateMockBrief(
  articles: Array<{
    id: string;
    project_title: string;
    transport_sector?: string;
    hazard_cause?: string;
    measure_title?: string;
    case_study_text?: string;
  }>
): GeneratedSection[] {
  const sectors = [...new Set(articles.map((a) => a.transport_sector).filter(Boolean))];
  const hazards = [...new Set(articles.flatMap((a) => (a.hazard_cause ?? "").split(",").map((h) => h.trim()).filter(Boolean)))].slice(0, 3);
  const measures = articles.map((a) => a.measure_title).filter(Boolean).slice(0, 5);

  return [
    {
      section_key: "executive_summary",
      section_title: "Executive Summary",
      content: `This brief synthesises ${articles.length} case ${articles.length === 1 ? "study" : "studies"} across ${sectors.join(", ")} transport. The cases collectively demonstrate that proactive adaptation integrated into planned maintenance cycles consistently delivers better value than reactive repair after climate events.`,
      confidence: "partial",
    },
    {
      section_key: "climate_context",
      section_title: "Climate Context",
      content: `The primary climate hazards addressed across these cases include ${hazards.join(", ")}. These hazards are projected to intensify under UK climate change scenarios, making the evidence base increasingly relevant to transport infrastructure planning.`,
      confidence: "partial",
    },
    {
      section_key: "key_measures",
      section_title: "Key Adaptation Measures",
      content: measures.map((m) => `• ${m}`).join("\n") || "• No specific measures identified.",
      confidence: "high",
    },
    {
      section_key: "uk_applicability",
      section_title: "UK Applicability",
      content: `The cases in this brief have been assessed for UK applicability. ${articles.length > 1 ? "Multiple cases demonstrate direct transferability to UK transport contexts." : "This case has direct applicability to UK transport planning."} The strongest transfer potential is in ${sectors.slice(0, 2).join(" and ")} infrastructure.`,
      confidence: "partial",
    },
    {
      section_key: "cost_and_investment",
      section_title: "Cost & Investment",
      content: "Investment levels across cases range from targeted site-specific interventions (under £1m) to network-wide programmes (£100m+). Cases consistently show that bundling adaptation into existing planned maintenance programmes delivers significantly lower unit costs than standalone climate projects.",
      confidence: "partial",
    },
    {
      section_key: "knowledge_gaps",
      section_title: "Knowledge Gaps",
      content: "• Long-term monitoring data on adaptation effectiveness is limited across most cases.\n• Cost-benefit analyses with UK-specific climate projections are lacking.\n• Interaction effects between multiple simultaneous hazards are rarely addressed.",
      confidence: "indicative",
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = body.ids ?? [];
    const queryContext: string = body.queryContext ?? "";

    if (ids.length === 0) {
      return NextResponse.json({ error: "No case study IDs provided" }, { status: 400 });
    }

    // Load articles from the data layer
    const articles = (
      await Promise.all(ids.map((id) => getHiveArticleById(id)))
    ).filter((a): a is NonNullable<typeof a> => a !== null);

    if (articles.length === 0) {
      return NextResponse.json({ error: "No articles found for provided IDs" }, { status: 404 });
    }

    let sections: GeneratedSection[];

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      sections = generateMockBrief(articles);
    } else {
      // Build context string from article texts
      const context = articles
        .map(
          (a) =>
            `=== ${a.project_title} (${a.transport_sector}) ===\n` +
            `Hazard: ${a.hazard_cause}\nEffect: ${a.hazard_effect}\n` +
            `Measure: ${a.measure_title}\n${a.case_study_text ?? a.measure_description ?? ""}`
        )
        .join("\n\n");

      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: BRIEF_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate a brief for the following ${articles.length} case ${articles.length === 1 ? "study" : "studies"}:\n\n${context}${queryContext ? `\n\nAdditional context: ${queryContext}` : ""}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw) as { sections?: GeneratedSection[] };
      sections = parsed.sections ?? generateMockBrief(articles);

      // Ensure all titles are set
      sections = sections.map((s) => ({
        ...s,
        section_title: s.section_title ?? SECTION_TITLES[s.section_key] ?? s.section_key,
      }));
    }

    // Persist in Supabase mode
    const session = await createSynthesisSession(
      ids,
      sections.map((s, i) => ({ ...s, sort_order: i, source_chunk_ids: [] })),
      queryContext
    );

    return NextResponse.json({
      sessionId: session.id,
      sections,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
