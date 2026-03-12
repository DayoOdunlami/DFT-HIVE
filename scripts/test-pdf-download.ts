import "dotenv/config";

// pdf-parse v1.x CJS module
const pdfParse: (buffer: Buffer) => Promise<{ text: string; numpages: number }> =
  require("pdf-parse");

const TEST_URL =
  "https://trib.org.uk/documents/ID%2032_Heathrow%20Airport%20Balancing%20Pond.pdf";

const SECTION_PATTERNS: [string, RegExp][] = [
  ["challenge", /^the challenge$/i],
  ["adaptation_measures", /^adaptation measures?$/i],
  ["applicability", /^applicability$/i],
  ["financials", /^financials?$/i],
  ["resourcing", /^resourcing$/i],
  ["co_benefits", /^co.?benefits$/i],
  ["evaluation", /^evaluation$/i],
  ["challenges", /^challenges$/i],
  ["lessons_learned", /^lessons learned$/i],
  ["innovation_opportunities", /^innovation opportunities$/i],
  ["sources", /^relevant links and sources$/i],
];

async function main() {
  console.log("── Phase 2: Test PDF Download & Section Detection ──\n");
  console.log(`Downloading: ${TEST_URL}\n`);

  const res = await fetch(TEST_URL);
  if (!res.ok) {
    console.error(`Download failed: HTTP ${res.status}`);
    process.exit(1);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  console.log(`Downloaded: ${(buffer.length / 1024).toFixed(0)} KB\n`);

  const parsed = await pdfParse(buffer);
  const text = parsed.text;

  console.log("── First 500 characters ──");
  console.log(text.slice(0, 500));
  console.log("\n── Section heading detection ──\n");

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const found: string[] = [];

  for (const line of lines) {
    for (const [key, pattern] of SECTION_PATTERNS) {
      if (pattern.test(line)) {
        found.push(key);
        console.log(`  ✓ "${line}" → ${key}`);
      }
    }
  }

  console.log(`\nDetected ${found.length} of ${SECTION_PATTERNS.length} sections`);
  const missing = SECTION_PATTERNS
    .map(([k]) => k)
    .filter((k) => !found.includes(k));
  if (missing.length) {
    console.log(`Missing: ${missing.join(", ")}`);
  }

  console.log("\n── All unique lines that could be headings (<=60 chars, all-alpha-ish) ──\n");
  const seen = new Set<string>();
  for (const line of lines) {
    if (line.length <= 60 && line.length >= 3 && /^[A-Za-z\s\-–':()]+$/.test(line) && !seen.has(line)) {
      seen.add(line);
      console.log(`  "${line}"`);
    }
  }

  console.log("\n── Done ──");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
