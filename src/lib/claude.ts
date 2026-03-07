/**
 * Claude AI integration layer for ChartChemistry.
 *
 * Provides system prompts, data formatting helpers, and three main
 * entry points used by the API routes:
 *
 *   - generateFreeReport()    — "The Big Picture" narrative (200-300 words)
 *   - generatePremiumReport() — all 7 report sections  (800-1200 words)
 *   - chatWithAstrologer()    — conversational follow-up
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  SynastryResult,
  CompositeChart,
  NatalChart,
  Aspect,
  PlanetPosition,
  ChatMessage,
} from "@/types/astrology";

// ============================================================
// Client setup
// ============================================================

let _claude: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_claude) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
    }
    _claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 30_000,
    });
  }
  return _claude;
}

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// ============================================================
// System prompts
// ============================================================

const FREE_REPORT_PROMPT = `You are an expert astrologer with deep knowledge of synastry and relationship astrology. You combine traditional astrological wisdom with modern psychological insight.

You are writing "The Big Picture" section of a compatibility report. This is the FREE tier — a concise, compelling snapshot that gives the couple meaningful insight while encouraging them to explore deeper.

GUIDELINES:
- Write exactly 200-300 words.
- Open with the most striking aspect or pattern in their synastry chart.
- Mention 2-3 specific planetary aspects (e.g., "Your Venus trine their Moon") and what they mean.
- Be warm, honest, and balanced — mention both strengths and one area to watch.
- Use accessible language. Explain astrological terms briefly when you introduce them.
- End with a forward-looking statement that hints at deeper layers they could explore.
- Do NOT use bullet points or section headers. Write flowing prose.
- Do NOT make deterministic predictions. Frame things as tendencies and invitations.
- Reference the compatibility scores naturally (e.g., "your strong emotional score of 82 reflects...").

OUTPUT: Return ONLY the narrative text. No titles, no markdown headers, no preamble.`;

const PREMIUM_REPORT_PROMPT = `You are an expert astrologer with 20+ years of experience in synastry and relationship astrology. You combine deep astrological knowledge with modern psychological insights to provide nuanced, empathetic, and actionable compatibility reports.

Write a comprehensive compatibility report with EXACTLY these 7 sections. Each section should be 100-180 words for a total of 800-1200 words.

SECTIONS (use these exact headers):

## The Big Picture
The overall energy of the relationship. Open with the most defining pattern or aspect. What draws these two together? What is the relationship's core theme?

## Communication Style
Mercury aspects, air sign emphasis, 3rd house overlays. How do they exchange ideas, argue, and reach understanding? Practical communication tips.

## Emotional Landscape
Moon aspects, water sign emphasis, 4th house overlays. How do they nurture each other? What does emotional safety look like for this pair?

## Passion & Attraction
Venus-Mars aspects, 5th and 8th house overlays, Pluto aspects. The chemistry, desire, and physical connection. What keeps the spark alive?

## Long-Term Potential
Saturn aspects, 7th and 10th house overlays, Jupiter aspects. Can this relationship go the distance? What foundations exist for lasting commitment?

## Challenge Zones
Squares, oppositions, and difficult aspects. Be honest but compassionate. Frame challenges as growth opportunities, not deal-breakers.

## Cosmic Advice
Synthesize everything into 3-4 specific, actionable pieces of relationship advice grounded in the chart data. What should they lean into? What should they be mindful of?

GUIDELINES:
- Reference specific planetary aspects (e.g., "Your Mars conjunct their Venus at 2 degree orb") throughout.
- Be warm, insightful, and non-judgmental.
- Provide practical relationship advice grounded in the chart data.
- Highlight both strengths and challenges honestly.
- Use accessible language while maintaining astrological accuracy.
- Do NOT make deterministic predictions. Frame things as tendencies and invitations.
- Reference the compatibility scores where relevant.

After the 7 sections, add two special sections:

## Red Flags
List 2-4 potential red flags or areas of friction based on difficult aspects. Each should be a single sentence. Format as a JSON array of strings.

## Growth Areas
List 3-5 specific growth opportunities for this couple. Each should be a single sentence. Format as a JSON array of strings.

OUTPUT FORMAT:
Return the 7 narrative sections separated by their ## headers, followed by the Red Flags and Growth Areas sections with JSON arrays.`;

const CHAT_PROMPT = `You are ChartChemistry's AI astrologer — a warm, knowledgeable guide who helps users understand their compatibility reports and astrological charts.

PERSONALITY:
- Conversational, supportive, and genuinely curious about the user's relationship
- You blend astrological expertise with practical relationship wisdom
- You explain concepts in accessible terms without being condescending
- You're honest about challenges but always frame them constructively

GUIDELINES:
- Reference the user's specific chart data and report when available
- Explain astrological terms when you first use them
- Offer balanced perspectives — no doom-and-gloom predictions
- Encourage self-reflection and personal growth
- If the user asks about timing, discuss current transits if data is available
- Keep responses focused and helpful (150-300 words unless they ask for detail)
- Never make deterministic predictions about relationships ending or beginning
- If asked about topics outside astrology/relationships, gently redirect
- You can discuss general astrological concepts even without chart context`;

// ============================================================
// Data formatting helpers
// ============================================================

/**
 * Format a planet position into a readable string.
 */
function formatPlanet(p: PlanetPosition): string {
  const retro = p.retrograde ? " (R)" : "";
  const house = p.house ? ` in House ${p.house}` : "";
  return `${p.planet}: ${p.degree}d${p.minute}m ${p.sign}${retro}${house}`;
}

/**
 * Format an aspect into a readable string.
 */
function formatAspect(a: Aspect): string {
  const applying = a.applying ? "applying" : "separating";
  return `${a.planet1} ${a.aspect} ${a.planet2} (orb: ${a.orb.toFixed(1)}d, ${applying})`;
}

/**
 * Build a clear text summary of synastry data for the AI prompt.
 */
function formatSynastryForPrompt(
  synastry: SynastryResult,
  person1Name: string,
  person2Name: string,
  person1Chart?: NatalChart,
  person2Chart?: NatalChart
): string {
  const lines: string[] = [];

  lines.push("=== COMPATIBILITY SCORES ===");
  lines.push(`Overall: ${synastry.scores.overall}/100`);
  lines.push(`Emotional: ${synastry.scores.emotional}/100`);
  lines.push(`Chemistry: ${synastry.scores.chemistry}/100`);
  lines.push(`Communication: ${synastry.scores.communication}/100`);
  lines.push(`Stability: ${synastry.scores.stability}/100`);
  lines.push(`Conflict: ${synastry.scores.conflict}/100`);
  lines.push("");

  if (person1Chart) {
    lines.push(`=== ${person1Name.toUpperCase()}'S NATAL PLANETS ===`);
    for (const p of person1Chart.planets) {
      lines.push(formatPlanet(p));
    }
    lines.push(`Dominant Planet: ${person1Chart.dominantPlanet}`);
    lines.push(
      `Elements: Fire ${person1Chart.elementBalance.fire}, Earth ${person1Chart.elementBalance.earth}, Air ${person1Chart.elementBalance.air}, Water ${person1Chart.elementBalance.water}`
    );
    lines.push("");
  }

  if (person2Chart) {
    lines.push(`=== ${person2Name.toUpperCase()}'S NATAL PLANETS ===`);
    for (const p of person2Chart.planets) {
      lines.push(formatPlanet(p));
    }
    lines.push(`Dominant Planet: ${person2Chart.dominantPlanet}`);
    lines.push(
      `Elements: Fire ${person2Chart.elementBalance.fire}, Earth ${person2Chart.elementBalance.earth}, Air ${person2Chart.elementBalance.air}, Water ${person2Chart.elementBalance.water}`
    );
    lines.push("");
  }

  lines.push("=== INTER-CHART ASPECTS ===");
  for (const a of synastry.interAspects) {
    lines.push(formatAspect(a));
  }
  lines.push("");

  if (synastry.houseOverlays && synastry.houseOverlays.length > 0) {
    lines.push("=== HOUSE OVERLAYS ===");
    for (const h of synastry.houseOverlays) {
      lines.push(
        `${h.planetOwner}'s ${h.planet} in ${h.houseOwner}'s House ${h.house} (${h.sign})`
      );
    }
    lines.push("");
  }

  lines.push("=== ELEMENT COMPATIBILITY ===");
  lines.push(JSON.stringify(synastry.elementCompatibility, null, 2));
  lines.push("");

  lines.push("=== MODALITY COMPATIBILITY ===");
  lines.push(JSON.stringify(synastry.modalityCompatibility, null, 2));

  return lines.join("\n");
}

/**
 * Build a text summary of a composite chart for the AI prompt.
 */
function formatCompositeForPrompt(composite: CompositeChart): string {
  const lines: string[] = [];

  lines.push("=== COMPOSITE CHART PLANETS ===");
  for (const p of composite.planets) {
    lines.push(formatPlanet(p));
  }
  lines.push("");

  lines.push("=== COMPOSITE ASPECTS ===");
  for (const a of composite.aspects) {
    lines.push(formatAspect(a));
  }
  lines.push("");

  lines.push(
    `Composite Elements: Fire ${composite.elementBalance.fire}, Earth ${composite.elementBalance.earth}, Air ${composite.elementBalance.air}, Water ${composite.elementBalance.water}`
  );
  lines.push(
    `Composite Modalities: Cardinal ${composite.modalityBalance.cardinal}, Fixed ${composite.modalityBalance.fixed}, Mutable ${composite.modalityBalance.mutable}`
  );

  return lines.join("\n");
}

// ============================================================
// Top-level synastry highlights extractor
// ============================================================

/**
 * Pick the most noteworthy aspects from synastry data.
 * Returns an array of { aspect, description, category } objects.
 */
export function extractSynastryHighlights(
  synastry: SynastryResult
): { aspect: Aspect; description: string; category: "strength" | "challenge" | "dynamic" }[] {
  const highlights: {
    aspect: Aspect;
    description: string;
    category: "strength" | "challenge" | "dynamic";
  }[] = [];

  const harmoniousAspects = ["trine", "sextile", "conjunction"];
  const challengingAspects = ["square", "opposition"];

  // Sort by tightest orb first — tighter orbs = stronger influence
  const sorted = [...synastry.interAspects].sort((a, b) => a.orb - b.orb);

  for (const aspect of sorted) {
    if (highlights.length >= 5) break;

    const isHarmonious = harmoniousAspects.includes(aspect.aspect.toLowerCase());
    const isChallenging = challengingAspects.includes(aspect.aspect.toLowerCase());

    // Prioritize aspects involving personal planets
    const personalPlanets = ["Sun", "Moon", "Venus", "Mars", "Mercury"];
    const involvesPersonal =
      personalPlanets.includes(aspect.planet1) ||
      personalPlanets.includes(aspect.planet2);

    if (!involvesPersonal && highlights.length >= 3) continue;

    let description: string;
    let category: "strength" | "challenge" | "dynamic";

    if (isHarmonious) {
      category = "strength";
      description = `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} with a tight ${aspect.orb.toFixed(1)} degree orb creates natural harmony and flow between these energies.`;
    } else if (isChallenging) {
      category = "challenge";
      description = `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.orb.toFixed(1)} degree orb) generates creative tension that requires conscious navigation.`;
    } else {
      category = "dynamic";
      description = `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.orb.toFixed(1)} degree orb) adds an unusual dynamic to the relationship.`;
    }

    highlights.push({ aspect, description, category });
  }

  return highlights;
}

// ============================================================
// Main AI generation functions
// ============================================================

/**
 * Generate the free-tier "Big Picture" narrative (200-300 words).
 */
export async function generateFreeReport(
  synastryData: SynastryResult,
  person1Name: string,
  person2Name: string,
  person1Chart?: NatalChart,
  person2Chart?: NatalChart
): Promise<{ narrative: string }> {
  const chartContext = formatSynastryForPrompt(
    synastryData,
    person1Name,
    person2Name,
    person1Chart,
    person2Chart
  );

  const response = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: FREE_REPORT_PROMPT,
    messages: [
      {
        role: "user",
        content: `Write "The Big Picture" compatibility narrative for ${person1Name} and ${person2Name} based on the following astrological data:\n\n${chartContext}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const narrative = textBlock ? textBlock.text.trim() : "";

  return { narrative };
}

/**
 * Generate the premium full report with all 7 sections (800-1200 words).
 */
export async function generatePremiumReport(
  synastryData: SynastryResult,
  person1Name: string,
  person2Name: string,
  person1Chart?: NatalChart,
  person2Chart?: NatalChart,
  compositeData?: CompositeChart
): Promise<{
  narrative: string;
  sections: Record<string, string>;
  redFlags: string[];
  growthAreas: string[];
}> {
  let chartContext = formatSynastryForPrompt(
    synastryData,
    person1Name,
    person2Name,
    person1Chart,
    person2Chart
  );

  if (compositeData) {
    chartContext +=
      "\n\n" + formatCompositeForPrompt(compositeData);
  }

  const response = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: PREMIUM_REPORT_PROMPT,
    messages: [
      {
        role: "user",
        content: `Write a comprehensive compatibility report for ${person1Name} and ${person2Name} based on the following astrological data:\n\n${chartContext}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const fullText = textBlock ? textBlock.text.trim() : "";

  // Parse the response into sections
  const parsedSections = parseReportSections(fullText);

  return parsedSections;
}

/**
 * Parse the AI response into structured sections.
 */
function parseReportSections(text: string): {
  narrative: string;
  sections: Record<string, string>;
  redFlags: string[];
  growthAreas: string[];
} {
  const sectionMap: Record<string, string> = {
    "The Big Picture": "theBigPicture",
    "Communication Style": "communicationStyle",
    "Emotional Landscape": "emotionalLandscape",
    "Passion & Attraction": "passionAndAttraction",
    "Passion &amp; Attraction": "passionAndAttraction",
    "Long-Term Potential": "longTermPotential",
    "Challenge Zones": "challengeZones",
    "Cosmic Advice": "cosmicAdvice",
    "Red Flags": "redFlags",
    "Growth Areas": "growthAreas",
  };

  const sections: Record<string, string> = {};
  let redFlags: string[] = [];
  let growthAreas: string[] = [];

  // Split on ## headers
  const headerRegex = /^## (.+)$/gm;
  const headers: { title: string; index: number; fullMatchLength: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(text)) !== null) {
    headers.push({
      title: match[1].trim(),
      index: match.index,
      fullMatchLength: match[0].length,
    });
  }

  for (let i = 0; i < headers.length; i++) {
    const startIdx = headers[i].index + headers[i].fullMatchLength;
    const endIdx = i + 1 < headers.length ? headers[i + 1].index : text.length;
    const content = text.slice(startIdx, endIdx).trim();
    const key = sectionMap[headers[i].title];

    if (key === "redFlags") {
      redFlags = extractJsonArray(content);
    } else if (key === "growthAreas") {
      growthAreas = extractJsonArray(content);
    } else if (key) {
      sections[key] = content;
    }
  }

  // Build the full narrative from the 7 main sections
  const narrativeSections = [
    "theBigPicture",
    "communicationStyle",
    "emotionalLandscape",
    "passionAndAttraction",
    "longTermPotential",
    "challengeZones",
    "cosmicAdvice",
  ];

  const narrative = narrativeSections
    .map((key) => sections[key] || "")
    .filter(Boolean)
    .join("\n\n");

  return { narrative, sections, redFlags, growthAreas };
}

/**
 * Extract a JSON array from text that may contain surrounding prose.
 */
function extractJsonArray(text: string): string[] {
  // Try to find a JSON array in the text
  const arrayMatch = text.match(/\[[\s\S]*?\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch {
      // Fallback: parse as bullet points
    }
  }

  // Fallback: parse bullet points or numbered items
  const lines = text
    .split("\n")
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((line) => line.length > 10);

  return lines;
}

/**
 * Chat with the AI astrologer.
 */
export async function chatWithAstrologer(
  messages: ChatMessage[],
  chartContext?: string
): Promise<string> {
  let systemPrompt = CHAT_PROMPT;

  if (chartContext) {
    systemPrompt += `\n\nCHART CONTEXT (reference this data in your responses):\n${chartContext}`;
  }

  // Convert our ChatMessage format to Anthropic's message format
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text.trim() : "";
}

/**
 * Build chart context string for the chat system prompt
 * from report and birth profile data.
 */
export function buildChatContext(
  report: {
    synastryData: unknown;
    compositeData: unknown;
    summaryNarrative: string;
    overallScore: number;
    communicationScore: number;
    emotionalScore: number;
    chemistryScore: number;
    stabilityScore: number;
    conflictScore: number;
  },
  person1: { name: string; chartData: unknown },
  person2: { name: string; chartData: unknown }
): string {
  const lines: string[] = [];

  lines.push("=== REPORT SUMMARY ===");
  lines.push(report.summaryNarrative);
  lines.push("");

  lines.push("=== COMPATIBILITY SCORES ===");
  lines.push(`Overall: ${report.overallScore}/100`);
  lines.push(`Communication: ${report.communicationScore}/100`);
  lines.push(`Emotional: ${report.emotionalScore}/100`);
  lines.push(`Chemistry: ${report.chemistryScore}/100`);
  lines.push(`Stability: ${report.stabilityScore}/100`);
  lines.push(`Conflict: ${report.conflictScore}/100`);
  lines.push("");

  lines.push(`Person 1: ${person1.name}`);
  lines.push(`Person 2: ${person2.name}`);

  // Include natal chart details if available
  if (person1.chartData && typeof person1.chartData === "object") {
    const chart1 = person1.chartData as NatalChart;
    if (chart1.planets) {
      lines.push("");
      lines.push(`=== ${person1.name.toUpperCase()}'S NATAL CHART ===`);
      for (const p of chart1.planets) {
        lines.push(formatPlanet(p));
      }
      if (chart1.dominantPlanet) {
        lines.push(`Dominant Planet: ${chart1.dominantPlanet}`);
      }
      if (chart1.elementBalance) {
        lines.push(
          `Elements: Fire ${chart1.elementBalance.fire}, Earth ${chart1.elementBalance.earth}, Air ${chart1.elementBalance.air}, Water ${chart1.elementBalance.water}`
        );
      }
      if (chart1.aspects) {
        lines.push("");
        lines.push(`=== ${person1.name.toUpperCase()}'S NATAL ASPECTS ===`);
        for (const a of chart1.aspects) {
          lines.push(formatAspect(a));
        }
      }
    }
  }

  if (person2.chartData && typeof person2.chartData === "object") {
    const chart2 = person2.chartData as NatalChart;
    if (chart2.planets) {
      lines.push("");
      lines.push(`=== ${person2.name.toUpperCase()}'S NATAL CHART ===`);
      for (const p of chart2.planets) {
        lines.push(formatPlanet(p));
      }
      if (chart2.dominantPlanet) {
        lines.push(`Dominant Planet: ${chart2.dominantPlanet}`);
      }
      if (chart2.elementBalance) {
        lines.push(
          `Elements: Fire ${chart2.elementBalance.fire}, Earth ${chart2.elementBalance.earth}, Air ${chart2.elementBalance.air}, Water ${chart2.elementBalance.water}`
        );
      }
      if (chart2.aspects) {
        lines.push("");
        lines.push(`=== ${person2.name.toUpperCase()}'S NATAL ASPECTS ===`);
        for (const a of chart2.aspects) {
          lines.push(formatAspect(a));
        }
      }
    }
  }

  // Include synastry aspects if available
  if (report.synastryData && typeof report.synastryData === "object") {
    const synastry = report.synastryData as SynastryResult;
    if (synastry.interAspects) {
      lines.push("");
      lines.push("=== SYNASTRY ASPECTS ===");
      for (const a of synastry.interAspects) {
        lines.push(formatAspect(a));
      }
    }
    if (synastry.houseOverlays && synastry.houseOverlays.length > 0) {
      lines.push("");
      lines.push("=== HOUSE OVERLAYS ===");
      for (const h of synastry.houseOverlays) {
        lines.push(
          `${h.planetOwner}'s ${h.planet} in ${h.houseOwner}'s House ${h.house} (${h.sign})`
        );
      }
    }
  }

  return lines.join("\n");
}

// ============================================================
// Daily Horoscope
// ============================================================

const HOROSCOPE_PROMPT = `You are an expert astrologer writing a personalized daily horoscope based on the user's full natal chart and today's planetary transits. This is NOT a generic sun-sign horoscope — it's deeply personal.

GUIDELINES:
- Write 150-250 words.
- Reference 2-3 specific transits affecting this person's chart today.
- Cover: overall energy, love/relationships, career/purpose, and one actionable tip.
- Be warm, specific, and encouraging. Avoid doom-and-gloom.
- Use accessible language. Briefly explain any astrological terms.
- Frame everything as tendencies, not predictions.
- End with a "Cosmic tip" — one specific, actionable piece of advice for the day.

OUTPUT FORMAT:
Return a JSON object with these fields:
{
  "summary": "One sentence capturing today's overall energy (max 120 chars)",
  "body": "The full horoscope text (150-250 words, flowing prose)",
  "cosmicTip": "One actionable tip for the day (1-2 sentences)",
  "luckyTime": "A time window suggestion like 'Late morning' or '2-4 PM'",
  "mood": "One word capturing the day's energy: 'expansive' | 'reflective' | 'passionate' | 'grounded' | 'transformative' | 'playful' | 'intense' | 'harmonious'"
}`;

/**
 * Generate a personalized daily horoscope.
 */
export async function generateDailyHoroscope(
  natalChartData: NatalChart,
  transitData: { aspectsToNatal: { transitingPlanet: string; natalPlanet: string; aspect: string; orb: number; keywords: string }[]; transitingPositions: PlanetPosition[] },
  userName: string,
  date: string
): Promise<{
  summary: string;
  body: string;
  cosmicTip: string;
  luckyTime: string;
  mood: string;
}> {
  const chartLines: string[] = [];

  chartLines.push(`=== ${userName.toUpperCase()}'S NATAL CHART ===`);
  for (const p of natalChartData.planets) {
    chartLines.push(formatPlanet(p));
  }
  chartLines.push(`Dominant Planet: ${natalChartData.dominantPlanet}`);
  chartLines.push("");

  chartLines.push(`=== TODAY'S TRANSITS TO NATAL (${date}) ===`);
  for (const t of transitData.aspectsToNatal) {
    chartLines.push(`Transit ${t.transitingPlanet} ${t.aspect} Natal ${t.natalPlanet} (orb: ${t.orb.toFixed(1)}°) — ${t.keywords}`);
  }
  chartLines.push("");

  chartLines.push("=== CURRENT PLANETARY POSITIONS ===");
  for (const p of transitData.transitingPositions) {
    chartLines.push(formatPlanet(p));
  }

  const response = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: HOROSCOPE_PROMPT,
    messages: [
      {
        role: "user",
        content: `Write a personalized daily horoscope for ${userName} for ${date}.\n\n${chartLines.join("\n")}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock ? textBlock.text.trim() : "";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback
  }

  return {
    summary: "A day of cosmic potential awaits you.",
    body: raw,
    cosmicTip: "Trust your intuition today.",
    luckyTime: "Mid-afternoon",
    mood: "harmonious",
  };
}

/**
 * Generate an AI explanation for a specific chart placement or aspect.
 */
export async function explainChartElement(
  element: string,
  chartData: NatalChart,
  userName: string
): Promise<string> {
  const chartContext = chartData.planets.map(formatPlanet).join("\n");

  const response = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 512,
    system: `You are an expert astrologer explaining a specific placement or aspect in someone's natal chart. Be warm, insightful, and educational. Write 80-150 words. Use accessible language. Reference how this placement interacts with other elements in their chart.`,
    messages: [
      {
        role: "user",
        content: `Explain what "${element}" means in ${userName}'s natal chart.\n\nFull chart:\n${chartContext}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text.trim() : "";
}

// ============================================================
// Wellness & Timing Suggestions
// ============================================================

const WELLNESS_PROMPT = `You are an expert astrologer specializing in electional astrology and personal timing. You analyze natal charts and current transits to suggest optimal timing for various life activities.

You will receive the user's natal chart and today's planetary transits. Based on this data, generate practical wellness and timing suggestions across 6 life categories.

CATEGORIES (provide exactly one suggestion per category):
1. career — Work, professional moves, negotiations, presentations
2. relationships — Love, friendships, social gatherings, important conversations
3. health — Exercise, rest, medical appointments, diet changes
4. creativity — Art, writing, music, brainstorming, starting creative projects
5. finances — Investments, purchases, contract signing, budget planning
6. spirituality — Meditation, journaling, introspection, energy work

GUIDELINES:
- Reference specific transits and aspects affecting the user's chart today.
- Be practical and actionable — give concrete advice, not vague platitudes.
- Include timing recommendations (morning, afternoon, evening, or specific windows).
- Confidence should reflect how strongly the transits support the suggestion (0.0-1.0).
- Be warm, encouraging, and non-deterministic. Frame as "favorable energy" not "you must."
- Each description should be 2-3 sentences.
- Each title should be concise (3-7 words).

OUTPUT FORMAT:
Return a JSON array with exactly 6 objects:
[
  {
    "category": "career",
    "title": "Short actionable title",
    "description": "2-3 sentence description referencing specific transits",
    "timing": "Optimal time window (e.g., 'Morning hours, 9-11 AM' or 'Late afternoon')",
    "confidence": 0.85
  }
]

Return ONLY the JSON array. No preamble, no markdown, no explanation outside the JSON.`;

/**
 * Generate wellness and timing suggestions based on natal chart and current transits.
 */
export async function generateWellnessSuggestions(
  natalChartData: NatalChart,
  transitData: { aspectsToNatal: { transitingPlanet: string; natalPlanet: string; aspect: string; orb: number; keywords: string }[]; transitingPositions: PlanetPosition[] },
  userName: string,
  date: string
): Promise<
  {
    category: string;
    title: string;
    description: string;
    timing: string;
    confidence: number;
  }[]
> {
  const chartLines: string[] = [];

  chartLines.push(`=== ${userName.toUpperCase()}'S NATAL CHART ===`);
  for (const p of natalChartData.planets) {
    chartLines.push(formatPlanet(p));
  }
  chartLines.push(`Dominant Planet: ${natalChartData.dominantPlanet}`);
  chartLines.push(
    `Elements: Fire ${natalChartData.elementBalance.fire}, Earth ${natalChartData.elementBalance.earth}, Air ${natalChartData.elementBalance.air}, Water ${natalChartData.elementBalance.water}`
  );
  chartLines.push("");

  chartLines.push(`=== TODAY'S TRANSITS TO NATAL (${date}) ===`);
  for (const t of transitData.aspectsToNatal) {
    chartLines.push(`Transit ${t.transitingPlanet} ${t.aspect} Natal ${t.natalPlanet} (orb: ${t.orb.toFixed(1)}°) — ${t.keywords}`);
  }
  chartLines.push("");

  chartLines.push("=== CURRENT PLANETARY POSITIONS ===");
  for (const p of transitData.transitingPositions) {
    chartLines.push(formatPlanet(p));
  }

  const response = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: WELLNESS_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate wellness and timing suggestions for ${userName} for ${date}.\n\n${chartLines.join("\n")}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock ? textBlock.text.trim() : "";

  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          category: String(item.category || "career"),
          title: String(item.title || "Cosmic guidance"),
          description: String(item.description || ""),
          timing: String(item.timing || "Throughout the day"),
          confidence: typeof item.confidence === "number" ? Math.min(1, Math.max(0, item.confidence)) : 0.5,
        }));
      }
    }
  } catch {
    // Fallback below
  }

  // Fallback if parsing fails
  return [
    { category: "career", title: "Stay focused and plan ahead", description: "The current planetary alignments suggest a day for steady progress. Focus on completing existing tasks rather than starting new ventures.", timing: "Morning hours", confidence: 0.5 },
    { category: "relationships", title: "Open heart, open mind", description: "Favorable energy for meaningful conversations. Reach out to someone you care about and share your authentic feelings.", timing: "Evening", confidence: 0.5 },
    { category: "health", title: "Balance activity and rest", description: "Listen to your body's signals today. A mix of gentle movement and rest will serve you well.", timing: "Afternoon", confidence: 0.5 },
    { category: "creativity", title: "Let inspiration flow", description: "Creative energy is accessible today. Try free-form expression without judgment — let ideas emerge naturally.", timing: "Late morning", confidence: 0.5 },
    { category: "finances", title: "Review before committing", description: "A good day for reviewing your financial plans rather than making major decisions. Gather information and reflect.", timing: "Midday", confidence: 0.5 },
    { category: "spirituality", title: "Quiet reflection time", description: "Set aside a few minutes for stillness. Meditation or journaling can help you connect with your inner guidance.", timing: "Early morning or before bed", confidence: 0.5 },
  ];
}

// ============================================================
// Relationship Insights
// ============================================================

const RELATIONSHIP_INSIGHTS_PROMPT = `You are an expert relationship astrologer specializing in romantic compatibility and dating dynamics. You combine traditional synastry analysis with modern attachment theory and love language frameworks.

Analyze the two natal charts provided and generate dating-specific relationship insights. This is a focused "relationship mode" analysis — deeper and more practical than a general compatibility report.

GUIDELINES:
- Be warm, specific, and actionable. Ground every insight in actual chart data.
- Use accessible language. Briefly explain astrological terms.
- Frame everything as tendencies, not predictions.
- Be honest about challenges but always constructive.
- Reference specific planetary placements and aspects.

OUTPUT FORMAT:
Return a JSON object with these exact fields:
{
  "compatibility_style": "A 2-3 sentence description of how these two people naturally relate as romantic partners. What archetype does this relationship embody? (e.g., 'The Adventurous Duo', 'The Slow-Burn Romance'). Include the archetype name and explain it.",
  "love_language_prediction": {
    "person1": { "primary": "One of the 5 love languages", "reason": "1-2 sentences explaining why, based on Venus/Moon placements" },
    "person2": { "primary": "One of the 5 love languages", "reason": "1-2 sentences explaining why, based on Venus/Moon placements" },
    "synergy": "1-2 sentences on how their love languages interact — do they naturally speak each other's language or will they need to learn?"
  },
  "potential_challenges": [
    "A specific challenge grounded in chart aspects (1-2 sentences each)",
    "Another specific challenge",
    "A third challenge"
  ],
  "growth_areas": [
    "A specific area where this relationship can help both people grow (1-2 sentences each)",
    "Another growth opportunity",
    "A third growth area"
  ],
  "date_night_suggestions": [
    { "idea": "A specific date idea", "reason": "Why this works for this specific pairing based on their charts (1 sentence)" },
    { "idea": "Another date idea", "reason": "Astrological reason" },
    { "idea": "A third date idea", "reason": "Astrological reason" },
    { "idea": "A fourth date idea", "reason": "Astrological reason" }
  ],
  "communication_tips": [
    "A specific, actionable communication tip grounded in Mercury/air sign placements (1-2 sentences)",
    "Another communication tip",
    "A third communication tip",
    "A fourth communication tip"
  ]
}`;

/**
 * Response shape for relationship insights.
 */
export interface RelationshipInsightsResult {
  compatibility_style: string;
  love_language_prediction: {
    person1: { primary: string; reason: string };
    person2: { primary: string; reason: string };
    synergy: string;
  };
  potential_challenges: string[];
  growth_areas: string[];
  date_night_suggestions: { idea: string; reason: string }[];
  communication_tips: string[];
}

/**
 * Generate relationship-specific dating insights from two natal charts.
 */
export async function generateRelationshipInsights(
  chart1: NatalChart,
  chart2: NatalChart,
  name1: string,
  name2: string
): Promise<RelationshipInsightsResult> {
  const chartLines: string[] = [];

  chartLines.push(`=== ${name1.toUpperCase()}'S NATAL CHART ===`);
  for (const p of chart1.planets) {
    chartLines.push(formatPlanet(p));
  }
  chartLines.push(`Dominant Planet: ${chart1.dominantPlanet}`);
  chartLines.push(
    `Elements: Fire ${chart1.elementBalance.fire}, Earth ${chart1.elementBalance.earth}, Air ${chart1.elementBalance.air}, Water ${chart1.elementBalance.water}`
  );
  chartLines.push("");

  chartLines.push(`=== ${name2.toUpperCase()}'S NATAL CHART ===`);
  for (const p of chart2.planets) {
    chartLines.push(formatPlanet(p));
  }
  chartLines.push(`Dominant Planet: ${chart2.dominantPlanet}`);
  chartLines.push(
    `Elements: Fire ${chart2.elementBalance.fire}, Earth ${chart2.elementBalance.earth}, Air ${chart2.elementBalance.air}, Water ${chart2.elementBalance.water}`
  );

  const response = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: RELATIONSHIP_INSIGHTS_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate romantic relationship insights for ${name1} and ${name2} based on their natal charts:\n\n${chartLines.join("\n")}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock ? textBlock.text.trim() : "";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as RelationshipInsightsResult;
    }
  } catch {
    // Fallback below
  }

  // Fallback if JSON parsing fails
  return {
    compatibility_style:
      "A unique pairing with complementary energies that create both attraction and room for growth.",
    love_language_prediction: {
      person1: {
        primary: "Quality Time",
        reason:
          "Based on their chart emphasis, they value presence and shared experiences.",
      },
      person2: {
        primary: "Words of Affirmation",
        reason:
          "Their Mercury and Venus placements suggest verbal expressions of love resonate most.",
      },
      synergy:
        "Learning to express love in each other's preferred style will deepen this connection over time.",
    },
    potential_challenges: [
      "Different emotional processing speeds may require patience from both sides.",
      "Finding a balance between independence and togetherness could be an ongoing negotiation.",
      "Communication styles may differ — one more direct, the other more reflective.",
    ],
    growth_areas: [
      "This relationship encourages both people to step outside their comfort zones.",
      "Together, you can develop a deeper emotional vocabulary.",
      "The partnership naturally builds resilience and mutual understanding.",
    ],
    date_night_suggestions: [
      {
        idea: "Stargazing picnic",
        reason: "Connects with the cosmic energy of this pairing.",
      },
      {
        idea: "Cooking class together",
        reason: "Nurtures the emotional bond through shared creation.",
      },
      {
        idea: "Live music event",
        reason: "Stimulates the creative and social energies in both charts.",
      },
      {
        idea: "Nature hike or garden visit",
        reason: "Grounds the relationship in earth-element energy.",
      },
    ],
    communication_tips: [
      "Lead with curiosity rather than assumptions when tensions arise.",
      "Schedule regular check-ins to share feelings before they build up.",
      "Acknowledge each other's communication style as valid, even when it differs from your own.",
      "Use 'I feel' statements to express needs without triggering defensiveness.",
    ],
  };
}

// Re-export prompts for testing or direct use
export const SYSTEM_PROMPTS = {
  free: FREE_REPORT_PROMPT,
  premium: PREMIUM_REPORT_PROMPT,
  chat: CHAT_PROMPT,
  horoscope: HOROSCOPE_PROMPT,
  wellness: WELLNESS_PROMPT,
  relationshipInsights: RELATIONSHIP_INSIGHTS_PROMPT,
} as const;
