/**
 * POST /api/compatibility
 *
 * Free-tier compatibility endpoint. Accepts two people's birth data,
 * calculates natal charts + synastry via the Python microservice,
 * then generates a "Big Picture" narrative via Claude AI.
 *
 * Rate-limited: 3 checks per day per IP for unauthenticated users.
 * Authenticated premium/annual users are unlimited.
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateNatalChart, calculateSynastry } from "@/lib/astro-client";
import { generateFreeReport, extractSynastryHighlights } from "@/lib/claude";
import { checkRateLimit, getClientIp, getRemainingChecks } from "@/lib/rate-limit";
import { geocodeCity } from "@/lib/geocode";
import { find as findTimezone } from "geo-tz";
import { sanitizeInput } from "@/lib/sanitize";
import type {
  PersonInput,
  CompatibilityRequest,
  NatalChartInput,
} from "@/types/astrology";

// ============================================================
// Validation
// ============================================================

function validatePersonInput(
  person: unknown,
  label: string
): { valid: true; data: PersonInput } | { valid: false; error: string } {
  if (!person || typeof person !== "object") {
    return { valid: false, error: `${label} is required and must be an object` };
  }

  const p = person as Record<string, unknown>;

  if (!p.name || typeof p.name !== "string" || p.name.trim().length === 0) {
    return { valid: false, error: `${label}.name is required` };
  }

  if (
    !p.birthDate ||
    typeof p.birthDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)
  ) {
    return {
      valid: false,
      error: `${label}.birthDate is required in YYYY-MM-DD format`,
    };
  }

  // Validate date is real and within range
  const dateObj = new Date(p.birthDate as string);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: `${label}.birthDate is not a valid date` };
  }
  const year = dateObj.getFullYear();
  if (year < 1800 || year > new Date().getFullYear()) {
    return { valid: false, error: `${label}.birthDate must be between 1800 and the current year` };
  }

  if (
    p.birthTime !== undefined &&
    p.birthTime !== null &&
    (typeof p.birthTime !== "string" || !/^\d{2}:\d{2}$/.test(p.birthTime))
  ) {
    return {
      valid: false,
      error: `${label}.birthTime must be in HH:MM format if provided`,
    };
  }

  if (!p.birthCity || typeof p.birthCity !== "string") {
    return { valid: false, error: `${label}.birthCity is required` };
  }

  if (!p.birthCountry || typeof p.birthCountry !== "string") {
    return { valid: false, error: `${label}.birthCountry is required` };
  }

  // latitude, longitude, timezone are optional — will be geocoded if missing
  if (
    p.latitude !== undefined &&
    p.latitude !== null &&
    (typeof p.latitude !== "number" || p.latitude < -90 || p.latitude > 90)
  ) {
    return {
      valid: false,
      error: `${label}.latitude must be a number between -90 and 90`,
    };
  }

  if (
    p.longitude !== undefined &&
    p.longitude !== null &&
    (typeof p.longitude !== "number" || p.longitude < -180 || p.longitude > 180)
  ) {
    return {
      valid: false,
      error: `${label}.longitude must be a number between -180 and 180`,
    };
  }

  return {
    valid: true,
    data: {
      name: (p.name as string).trim(),
      birthDate: p.birthDate as string,
      birthTime: p.birthTime as string | undefined,
      birthCity: p.birthCity as string,
      birthCountry: p.birthCountry as string,
      latitude: (p.latitude as number) ?? 0,
      longitude: (p.longitude as number) ?? 0,
      timezone: (p.timezone as string) ?? "",
    },
  };
}

/**
 * Convert PersonInput to the format expected by the Python microservice.
 */
function toNatalChartInput(person: PersonInput): NatalChartInput {
  return {
    birthDate: person.birthDate,
    birthTime: person.birthTime,
    latitude: person.latitude,
    longitude: person.longitude,
    timezone: person.timezone,
  };
}

// ============================================================
// Route handler
// ============================================================

export async function POST(request: Request) {
  try {
    // --- Auth check (optional — determines rate limiting) ---
    const session = await getServerSession(authOptions);
    const isPremium =
      session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";

    // --- Rate limiting for unauthenticated / free users ---
    // For free users this will be set to the number of checks left after this
    // request. Premium/annual users get `null` (unlimited).
    let remainingChecks: number | null = isPremium ? null : null;

    if (!isPremium) {
      const ip = getClientIp(request);
      const rateLimitResult = await checkRateLimit(ip);

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message:
              "You have used all 3 free compatibility checks for today. Sign up for Premium for unlimited access.",
            resetAt: new Date(rateLimitResult.resetAt).toISOString(),
            remainingChecks: 0,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(
                Math.ceil(
                  (rateLimitResult.resetAt - Date.now()) / 1000
                )
              ),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }

      // Rate limit passed — capture how many checks the user has left.
      // Prefer the value returned by checkRateLimit (works for both Upstash
      // and in-memory). Fall back to getRemainingChecks for safety.
      remainingChecks = rateLimitResult.remaining ?? getRemainingChecks(ip);
    }

    // --- Parse + validate body ---
    let body: CompatibilityRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const v1 = validatePersonInput(body.person1, "person1");
    if (!v1.valid) {
      return NextResponse.json({ error: v1.error }, { status: 400 });
    }

    const v2 = validatePersonInput(body.person2, "person2");
    if (!v2.valid) {
      return NextResponse.json({ error: v2.error }, { status: 400 });
    }

    const person1 = v1.data;
    const person2 = v2.data;

    // --- Sanitize person names ---
    person1.name = sanitizeInput(person1.name);
    person2.name = sanitizeInput(person2.name);
    if (person1.name.length > 100) person1.name = person1.name.substring(0, 100);
    if (person2.name.length > 100) person2.name = person2.name.substring(0, 100);

    // --- Check that person1 and person2 are not the same person ---
    if (person1.name === person2.name && person1.birthDate === person2.birthDate && person1.birthCity === person2.birthCity) {
      return NextResponse.json(
        { error: "Person 1 and Person 2 appear to be the same person. Please enter different birth details." },
        { status: 400 }
      );
    }

    // --- Geocode / resolve timezone ---
    // If the form already provided lat/lon (from city autocomplete), we only
    // need the timezone — derive it locally with geo-tz instead of hitting
    // Nominatim again. When lat/lon are missing, geocode sequentially to
    // respect Nominatim's 1-request-per-second rate limit.
    try {
      for (const person of [person1, person2]) {
        if (person.latitude && person.longitude) {
          // Coords available — just derive timezone locally
          if (!person.timezone) {
            const tzs = findTimezone(person.latitude, person.longitude);
            person.timezone = tzs[0] || "UTC";
          }
        } else {
          // No coords — geocode via Nominatim (sequential to avoid rate limit)
          const geo = await geocodeCity(person.birthCity, person.birthCountry);
          person.latitude = geo.latitude;
          person.longitude = geo.longitude;
          person.timezone = geo.timezone;
        }
      }
    } catch (geoError) {
      return NextResponse.json(
        {
          error: "Geocoding failed",
          message:
            geoError instanceof Error
              ? geoError.message
              : "Could not determine coordinates for the provided city. Please check the city name.",
        },
        { status: 400 }
      );
    }

    // --- Step 1+2: Calculate natal charts in parallel ---
    const input1 = toNatalChartInput(person1);
    const input2 = toNatalChartInput(person2);

    const [person1Chart, person2Chart] = await Promise.all([
      calculateNatalChart(input1),
      calculateNatalChart(input2),
    ]);

    // --- Step 3: Calculate synastry ---
    const synastryResult = await calculateSynastry(input1, input2);

    // --- Step 4: Generate AI narrative ---
    const { narrative } = await generateFreeReport(
      synastryResult,
      person1.name,
      person2.name,
      person1Chart,
      person2Chart
    );

    // --- Step 5: Extract highlights ---
    const synastryHighlights = extractSynastryHighlights(synastryResult);

    // --- Return response ---
    return NextResponse.json({
      scores: synastryResult.scores,
      synastryHighlights,
      narrative,
      person1Chart,
      person2Chart,
      remainingChecks,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("[POST /api/compatibility] Error:", error);

    // Distinguish between upstream service errors and internal errors
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("Astro service")) {
      return NextResponse.json(
        {
          error: "Calculation service unavailable",
          message:
            "Our astrology calculation service is temporarily unavailable. Please try again in a moment.",
          retryable: true,
          code: "ASTRO_SERVICE_DOWN",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong on our end. Please try again.",
        retryable: true,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET — Check remaining compatibility checks
// ============================================================

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const isPremium =
    session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";

  if (isPremium) {
    return NextResponse.json({ remainingChecks: null });
  }

  const ip = getClientIp(request);
  const remaining = getRemainingChecks(ip);
  return NextResponse.json({ remainingChecks: remaining });
}
