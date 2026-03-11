/**
 * Chat API logic for HIVE handbook.
 *
 * Current: mock responses + OpenAI integration (when OPENAI_API_KEY is set).
 * Step 8: swap to full RAG over document_chunks via pgvector.
 */

export type ChatMessageIn = {
  role: "user" | "ai";
  text: string;
};

export type ChatResponse = {
  text: string;
  chips?: string[];
  gap?: string | null;
  actions?: Array<{ label: string; primary?: boolean; demo?: boolean }>;
};

// Mock responses cycle through these per context
const MOCK: Record<string, ChatResponse[]> = {
  browse: [
    {
      text: "The HIVE knowledge base has strong evidence for flooding adaptation on urban transport corridors. Sheffield Grey to Green (ID_40) reduced river discharge from a 1-in-100-year event by 87% using SuDS alongside a city-centre rail and tram network. Heathrow's balancing ponds (ID_32) demonstrate complementary dual-resilience — addressing both flooding and drought.",
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
      text: "UK transferability: Sheffield and Heathrow are both rated High — UK cases with direct applicability. Phoenix Cool Pavements (ID_19) is rated Medium — applicable to UK urban streets ≤25mph including depot roads and urban bus corridors, less applicable to A-roads.",
      chips: ["ID_40", "ID_32", "ID_19"],
      gap: null,
      actions: [
        { label: "Build a brief from these 3 cases", primary: true },
        { label: "Run Applicability Scan", demo: true },
      ],
    },
  ],
  options: [
    {
      text: "There are **4 options** for coastal flooding on rail in the library. These include installation of flood protection devices, drainage renewal and refurbishment (Network Rail), design uplifts for culvert systems, and cathodic protection for saltwater-exposed infrastructure. 3 of 4 options have high UK transferability.",
      gap: null,
      actions: [
        { label: "Filter table to show these", primary: true },
        { label: "What about co-benefits?" },
      ],
    },
    {
      text: "Sustainable Drainage Systems (SuDS) and nature-based solutions consistently show the broadest co-benefit profiles — typically covering **community, environment, biodiversity, and carbon reduction** together. Slope stabilisation and vegetation management measures also score highly across multiple co-benefit categories.",
      gap: null,
    },
  ],
  brief: [
    {
      text: "Looking across these cases, the main gap I can see is climate hazard diversity — you have strong flooding and heat evidence but nothing on coastal erosion, sea level rise, or wind damage. If your brief is for a coastal or port context, I'd recommend adding ID_15 (Rotterdam Climate Dock) or ID_07 (Deutsche Bahn slope stability) to broaden the hazard range.",
      chips: ["ID_15", "ID_07"],
      gap: null,
      actions: [
        { label: "Add Rotterdam to brief", primary: true },
        { label: "Keep brief focused on flooding" },
      ],
    },
  ],
  case: [
    {
      text: "This case has **high UK transferability** — the measures have been applied in UK conditions and the costs are in sterling. The key applicability insight is that the approach can be embedded into planned maintenance cycles rather than treated as standalone climate spend, significantly reducing effective cost.",
      gap: null,
      actions: [
        { label: "Add to Brief", primary: true },
        { label: "Show related cases" },
      ],
    },
  ],
};

const mockCounters: Record<string, number> = {};

function getMockContext(context: string): string {
  if (context.startsWith("case:")) return "case";
  if (context.startsWith("brief:")) return "brief";
  return context;
}

export function getMockResponse(context: string): ChatResponse {
  const key = getMockContext(context);
  const pool = MOCK[key] ?? MOCK.browse;
  const count = mockCounters[key] ?? 0;
  mockCounters[key] = (count + 1) % pool.length;
  return pool[count];
}

// Build OpenAI system prompt from context
function buildSystemPrompt(context: string, articlesJson: string): string {
  const base = `You are HIVE, an AI assistant for the HIVE Climate Adaptation Intelligence Platform. You help UK transport professionals (DfT, Network Rail, Highways England, local authorities) understand climate adaptation case studies and options.

You have access to a curated database of case studies. When referencing specific cases, use their ID format (e.g. ID_40, ID_32) so they render as clickable chips.

Keep responses concise (2-4 sentences for simple questions, up to 8 sentences for complex ones). Always ground responses in the evidence base. Flag uncertainty clearly.

Case study data:
${articlesJson}`;

  if (context.startsWith("case:")) {
    const id = context.replace("case:", "");
    return `${base}\n\nThe user is currently viewing case study ${id}. Focus on that case's details, applicability, costs, and related cases.`;
  }
  if (context.startsWith("brief:")) {
    const ids = context.replace("brief:", "").split(",");
    return `${base}\n\nThe user has collected these cases for a brief: ${ids.join(", ")}. Help them interrogate the brief, identify gaps, and reframe for specific audiences.`;
  }
  if (context === "options") {
    return `${base}\n\nThe user is browsing the Adaptation Options Library. Help them find relevant options by sector, hazard, measure type, or co-benefits.`;
  }
  return base;
}

export async function getAIResponse(
  messages: ChatMessageIn[],
  context: string
): Promise<ChatResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return getMockResponse(context);
  }

  // Build messages for OpenAI — lazy import to avoid edge runtime issues
  const { CASE_STUDIES } = await import("@/lib/hive/seed-data");
  const articlesJson = JSON.stringify(
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

  const systemPrompt = buildSystemPrompt(context, articlesJson);

  const openaiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    })),
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      temperature: 0.4,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI error:", res.status, await res.text());
    return getMockResponse(context);
  }

  const data = await res.json();
  const text: string =
    data.choices?.[0]?.message?.content ?? "I couldn't generate a response.";

  // Extract any ID chips mentioned in the response
  const chipMatches = text.match(/\bID_[\w]+\b/g);
  const chips = chipMatches ? [...new Set(chipMatches)] : undefined;

  return { text, chips };
}
