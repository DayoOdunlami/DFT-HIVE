/**
 * POST /api/handbook/intent
 *
 * Extracts climate hazards and transport sectors from a plain-English query.
 * Uses OpenAI when OPENAI_API_KEY is set; falls back to keyword matching.
 *
 * Step 8: AI intent detection.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { detectIntent } from "@/lib/hive/search";

type IntentResponse = {
  detectedHazards: string[];
  detectedSectors: string[];
  source: "ai" | "keyword";
};

const SYSTEM_PROMPT = `You are an AI assistant that extracts structured intent from climate adaptation queries.

Given a query about transport infrastructure and climate adaptation, extract:
1. Climate hazards mentioned (from: Heavy rainfall, High temperatures, Storms, Sea level rise, Drought, Freeze-thaw cycles, Coastal erosion, Wildfire, Flooding – fluvial, Flooding – surface water)
2. Transport sectors mentioned (from: Rail, Aviation, Maritime, Highways, Critical Infrastructure)

Respond ONLY with valid JSON in this exact format:
{
  "hazards": ["hazard1", "hazard2"],
  "sectors": ["sector1"]
}

Use empty arrays if nothing is detected. Use exact names from the lists above.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = body.query ?? "";

    if (!query.trim()) {
      return NextResponse.json<IntentResponse>({
        detectedHazards: [],
        detectedSectors: [],
        source: "keyword",
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Keyword fallback
      const result = detectIntent(query);
      return NextResponse.json<IntentResponse>({ ...result, source: "keyword" });
    }

    // AI extraction
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { hazards?: string[]; sectors?: string[] };

    return NextResponse.json<IntentResponse>({
      detectedHazards: parsed.hazards ?? [],
      detectedSectors: parsed.sectors ?? [],
      source: "ai",
    });
  } catch (err) {
    // Fallback to keyword on any error
    const body = await req.json().catch(() => ({}));
    const result = detectIntent(body?.query ?? "");
    return NextResponse.json<IntentResponse>({ ...result, source: "keyword" });
  }
}
