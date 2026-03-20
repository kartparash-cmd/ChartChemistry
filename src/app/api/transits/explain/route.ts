/**
 * POST /api/transits/explain
 *
 * AI-generated narrative explanation for a specific transit aspect.
 * Premium-only. Rate limited to 30 requests per hour per user.
 * Cached in-memory for 1 hour by transit combo key.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClient, CLAUDE_MODEL } from "@/lib/claude";
import { createRateLimiter } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Rate limiter — 30 requests per hour per user
// ---------------------------------------------------------------------------

const rateLimiter = createRateLimiter(30, 60 * 60 * 1000, "transit-explain");

// ---------------------------------------------------------------------------
// In-memory explanation cache — 1 hour TTL
// ---------------------------------------------------------------------------

interface CacheEntry {
  explanation: string;
  expiresAt: number;
}

const explanationCache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Periodic cache cleanup
const cacheCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of explanationCache) {
    if (now >= entry.expiresAt) {
      explanationCache.delete(key);
    }
  }
}, CACHE_CLEANUP_INTERVAL_MS);

if (
  cacheCleanupTimer &&
  typeof cacheCleanupTimer === "object" &&
  "unref" in cacheCleanupTimer
) {
  cacheCleanupTimer.unref();
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Premium check
    const isPremium =
      session.user.plan === "PREMIUM" || session.user.plan === "ANNUAL";
    if (!isPremium) {
      return NextResponse.json(
        { error: "Premium plan required" },
        { status: 403 }
      );
    }

    // Rate limit check
    const rateResult = rateLimiter.check(session.user.id);
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetAt: rateResult.resetAt,
        },
        { status: 429 }
      );
    }

    // Parse body
    const body = await request.json();
    const { transitingPlanet, natalPlanet, aspect, orb, sign } = body;

    if (!transitingPlanet || !natalPlanet || !aspect || orb === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: transitingPlanet, natalPlanet, aspect, orb",
        },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${transitingPlanet}-${natalPlanet}-${aspect}`;
    const cached = explanationCache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ explanation: cached.explanation });
    }

    // Generate explanation via Claude
    const signContext = sign ? ` in ${sign}` : "";
    const prompt = `You are an expert astrologer. Explain what it means when transiting ${transitingPlanet}${signContext} is ${aspect} natal ${natalPlanet} with an orb of ${Number(orb).toFixed(1)} degrees. Keep it personal, warm, and actionable. 2-3 sentences max.`;

    const response = await getClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const explanation = textBlock ? textBlock.text.trim() : "";

    // Cache the result
    if (explanation) {
      explanationCache.set(cacheKey, {
        explanation,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("[POST /api/transits/explain] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
