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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateNatalChart, calculateSynastry } from "@/lib/astro-client";
import { generateFreeReport, extractSynastryHighlights } from "@/lib/claude";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { geocodeCity } from "@/lib/geocode";
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
      latitude: (p.latitude as number) || 0,
      longitude: (p.longitude as number) || 0,
      timezone: (p.timezone as string) || "",
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

    // --- Geocode if coordinates are missing ---
    const geocodePromises: Promise<void>[] = [];

    if (!person1.latitude || !person1.longitude || !person1.timezone) {
      geocodePromises.push(
        geocodeCity(person1.birthCity, person1.birthCountry).then((geo) => {
          person1.latitude = geo.latitude;
          person1.longitude = geo.longitude;
          person1.timezone = geo.timezone;
        })
      );
    }

    if (!person2.latitude || !person2.longitude || !person2.timezone) {
      geocodePromises.push(
        geocodeCity(person2.birthCity, person2.birthCountry).then((geo) => {
          person2.latitude = geo.latitude;
          person2.longitude = geo.longitude;
          person2.timezone = geo.timezone;
        })
      );
    }

    if (geocodePromises.length > 0) {
      try {
        await Promise.all(geocodePromises);
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
    });
  } catch (error) {
    console.error("[POST /api/compatibility] Error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    // Distinguish between upstream service errors and internal errors
    if (message.includes("Astro service")) {
      return NextResponse.json(
        {
          error: "Calculation service unavailable",
          message:
            "Our astrology calculation service is temporarily unavailable. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message },
      { status: 500 }
    );
  }
}
