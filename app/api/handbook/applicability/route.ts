/**
 * POST /api/handbook/applicability
 *
 * Dedicated endpoint for the "How does this apply to [sector]?" panel.
 * Tight prompt, single API call, returns 3 transfer considerations.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are HIVE, a climate adaptation analyst for UK transport.

Given a case study text and a target transport sector, provide exactly 3 numbered transfer considerations explaining how the case study's approach could apply to that sector in a UK context.

Rules:
- Only use information from the provided case study text.
- Never invent details not present in the source material.
- Cite the case study ID in brackets, e.g. [ID_40].
- Each consideration should be 1-2 sentences.
- Be specific about what would transfer and what would need adaptation.
- If the case has no relevance to the target sector, say so honestly.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { article_id, article_text, target_sector } = body;

    if (!article_id || !article_text || !target_sector) {
      return NextResponse.json(
        { error: "Missing article_id, article_text, or target_sector" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        article_id,
        target_sector,
        considerations: [
          `[${article_id}] The adaptation approach described here could be applied to ${target_sector} infrastructure in the UK, particularly where similar climate hazards are anticipated.`,
          `[${article_id}] Cost and delivery mechanisms would need to be adapted for ${target_sector} procurement and maintenance cycles.`,
          `[${article_id}] The lessons learned regarding stakeholder engagement and phased delivery are broadly transferable across sectors.`,
        ],
        mode: "fallback",
      });
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Case study [${article_id}]:\n${article_text}\n\nTarget sector: ${target_sector}\n\nProvide 3 transfer considerations for applying this case study to ${target_sector} in the UK.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const text =
      completion.choices[0]?.message?.content ?? "Unable to generate considerations.";

    const considerations = text
      .split(/\d+\.\s+/)
      .filter((s) => s.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 3);

    return NextResponse.json({
      article_id,
      target_sector,
      considerations:
        considerations.length > 0 ? considerations : [text],
      mode: "rag",
    });
  } catch (err) {
    console.error("Applicability API error:", err);
    return NextResponse.json(
      { error: "Failed to generate applicability analysis" },
      { status: 500 }
    );
  }
}
