/**
 * GET /api/relationship/weekly?reportId=<id>
 *
 * Generates a "This Week in Your Relationship" narrative for premium users.
 *
 * Fetches the compatibility report, retrieves current transits for both
 * people, then uses Claude to produce a personalised weekly insight about
 * how current planetary weather affects the relationship.
 *
 * Rate-limited: 5 requests per hour per user.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTransits } from "@/lib/astro-client";
import { getClient, CLAUDE_MODEL } from "@/lib/claude";
import { createRateLimiter } from "@/lib/rate-limit";
import type { NatalChartInput, TransitResult, NatalChart } from "@/types/astrology";

// ============================================================
// Rate limiter: 5 per hour per user
// ============================================================

const weeklyLimiter = createRateLimiter(5, 60 * 60 * 1000, "weekly-insight");

// ============================================================
// System prompt
// ============================================================

const WEEKLY_RELATIONSHIP_PROMPT = `You are an expert relationship astrologer writing a personalised weekly relationship forecast. You combine deep astrological knowledge with warm, practical relationship advice.

You will receive:
1. A compatibility report with scores and synastry aspects for two people
2. Current planetary transits affecting each person's natal chart

Write a "This Week in Your Relationship" narrative (250-400 words) that covers:

1. **Weekly Theme**: Open with a compelling 1-sentence theme for the week based on the dominant transits.
2. **How Transits Affect Your Connection**: Reference 2-3 specific current transits and explain how they interact with the couple's synastry aspects. Be specific about which planets and aspects you're referring to.
3. **What to Focus On This Week**: Practical, grounded advice for how the couple can make the most of the current cosmic weather. Be specific.
4. **Activity Suggestion**: One concrete date idea or relationship activity that aligns with the week's energy, with an astrological reason for why it works now.

GUIDELINES:
- Reference the couple's specific compatibility scores and aspects.
- Mention actual current transits and how they interact with natal placements.
- Be warm, encouraging, and actionable.
- Frame everything as tendencies and invitations, not predictions.
- Use accessible language — explain astrological terms briefly.
- Do NOT use section headers or bullet points. Write flowing prose with natural paragraph breaks.
- End with an encouraging, forward-looking statement.

OUTPUT: Return ONLY the narrative text. No titles, no markdown headers, no preamble.`;

// ============================================================
// Helper: build NatalChartInput from a BirthProfile record
// ============================================================

function profileToChartInput(profile: {
  birthDate: Date;
  birthTime: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
}): NatalChartInput {
  return {
    birthDate: profile.birthDate.toISOString().split("T")[0],
    birthTime: profile.birthTime ?? undefined,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timezone: profile.timezone,
  };
}

// ============================================================
// Helper: format transit data for the prompt
// ============================================================

function formatTransitsForPrompt(
  transits: TransitResult,
  personName: string
): string {
  const lines: string[] = [];
  lines.push(`=== CURRENT TRANSITS TO ${personName.toUpperCase()}'S CHART ===`);

  if (transits.aspectsToNatal && transits.aspectsToNatal.length > 0) {
    for (const t of transits.aspectsToNatal) {
      lines.push(
        `Transit ${t.transitingPlanet} ${t.aspect} Natal ${t.natalPlanet} (orb: ${t.orb.toFixed(1)}deg) — ${t.keywords}`
      );
    }
  } else {
    lines.push("No major transits to natal chart today.");
  }

  return lines.join("\n");
}

// ============================================================
// Route handler
// ============================================================

export async function GET(request: Request) {
  try {
    // --- 1. Auth check ---
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isPremium =
      session.user.plan === "PREMIUM" || session.user.plan === "ANNUAL";

    if (!isPremium) {
      return NextResponse.json(
        { error: "Premium plan required for weekly relationship insights" },
        { status: 403 }
      );
    }

    // --- 2. Parse reportId from query ---
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json(
        { error: "reportId query parameter is required" },
        { status: 400 }
      );
    }

    // --- 3. Rate limit (5 per hour per user) ---
    const rateLimitResult = weeklyLimiter.check(session.user.id);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message:
            "You can generate up to 5 weekly insights per hour. Please try again later.",
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    // --- 4. Fetch compatibility report with birth profiles ---
    const report = await prisma.compatibilityReport.findUnique({
      where: { id: reportId },
      include: {
        person1: true,
        person2: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Compatibility report not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this report
    if (report.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have access to this report" },
        { status: 403 }
      );
    }

    // --- 5. Build natal chart inputs and fetch current transits ---
    const input1 = profileToChartInput(report.person1);
    const input2 = profileToChartInput(report.person2);

    const today = new Date().toISOString().split("T")[0];

    let transits1: TransitResult;
    let transits2: TransitResult;

    try {
      [transits1, transits2] = await Promise.all([
        calculateTransits(input1, today),
        calculateTransits(input2, today),
      ]);
    } catch (err) {
      console.error("[GET /api/relationship/weekly] Transit calculation error:", err);
      return NextResponse.json(
        {
          error: "Calculation service unavailable",
          message:
            "Our astrology calculation service is temporarily unavailable. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    // --- 6. Build context for Claude ---
    const contextLines: string[] = [];

    // Report scores
    contextLines.push("=== COMPATIBILITY SCORES ===");
    contextLines.push(`Overall: ${report.overallScore}/100`);
    contextLines.push(`Communication: ${report.communicationScore}/100`);
    contextLines.push(`Emotional: ${report.emotionalScore}/100`);
    contextLines.push(`Chemistry: ${report.chemistryScore}/100`);
    contextLines.push(`Stability: ${report.stabilityScore}/100`);
    contextLines.push(`Conflict: ${report.conflictScore}/100`);
    contextLines.push("");

    // Natal chart data (if cached on profiles)
    if (report.person1.chartData) {
      const chart1 = report.person1.chartData as unknown as NatalChart;
      if (chart1.planets) {
        contextLines.push(`=== ${report.person1.name.toUpperCase()}'S KEY PLACEMENTS ===`);
        for (const p of chart1.planets.slice(0, 7)) {
          contextLines.push(`${p.planet}: ${p.degree}d${p.minute}m ${p.sign}${p.retrograde ? " (R)" : ""}`);
        }
        contextLines.push("");
      }
    }

    if (report.person2.chartData) {
      const chart2 = report.person2.chartData as unknown as NatalChart;
      if (chart2.planets) {
        contextLines.push(`=== ${report.person2.name.toUpperCase()}'S KEY PLACEMENTS ===`);
        for (const p of chart2.planets.slice(0, 7)) {
          contextLines.push(`${p.planet}: ${p.degree}d${p.minute}m ${p.sign}${p.retrograde ? " (R)" : ""}`);
        }
        contextLines.push("");
      }
    }

    // Synastry aspects from the report
    const synastryData = report.synastryData as Record<string, unknown> | null;
    if (synastryData && Array.isArray(synastryData.interAspects)) {
      contextLines.push("=== KEY SYNASTRY ASPECTS ===");
      for (const a of synastryData.interAspects.slice(0, 10)) {
        const aspect = a as { planet1: string; planet2: string; aspect: string; orb: number };
        contextLines.push(
          `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (orb: ${aspect.orb.toFixed(1)}deg)`
        );
      }
      contextLines.push("");
    }

    // Report summary
    contextLines.push("=== REPORT SUMMARY ===");
    contextLines.push(report.summaryNarrative.slice(0, 500));
    contextLines.push("");

    // Current transits
    contextLines.push(formatTransitsForPrompt(transits1, report.person1.name));
    contextLines.push("");
    contextLines.push(formatTransitsForPrompt(transits2, report.person2.name));

    const fullContext = contextLines.join("\n");

    // --- 7. Generate with Claude ---
    const response = await getClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: WEEKLY_RELATIONSHIP_PROMPT,
      messages: [
        {
          role: "user",
          content: `Write a "This Week in Your Relationship" narrative for ${report.person1.name} and ${report.person2.name} for the week of ${today}.\n\n${fullContext}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const weeklyInsight = textBlock ? textBlock.text.trim() : "";

    if (!weeklyInsight) {
      return NextResponse.json(
        { error: "Failed to generate weekly insight" },
        { status: 500 }
      );
    }

    // --- 8. Return response ---
    return NextResponse.json({
      weeklyInsight,
      generatedAt: new Date().toISOString(),
      reportId,
      person1: report.person1.name,
      person2: report.person2.name,
    });
  } catch (error) {
    console.error("[GET /api/relationship/weekly] Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
