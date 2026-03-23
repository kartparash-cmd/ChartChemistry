/**
 * GET /api/daily-cosmic
 *
 * Returns a free daily "cosmic weather" snippet for ALL users (no auth required).
 * Combines moon phase calculation + cosmic events data into a short template-based
 * message. Cached for the entire day since the content is the same for everyone.
 */

import { NextResponse } from "next/server";
import { getCurrentCosmicEvents } from "@/lib/cosmic-events";

// In-memory cache — same response for all users for the whole day
let cachedResponse: { data: DailyCosmicResponse; date: string } | null = null;

interface DailyCosmicResponse {
  date: string;
  moonPhase: {
    name: string;
    emoji: string;
    illumination: number;
  };
  zodiacSeason: string | null;
  cosmicWeather: string;
  events: Array<{
    name: string;
    icon: string;
    description: string;
    type: string;
  }>;
}

/**
 * Calculate the moon phase for a given date using a simplified algorithm.
 * Based on the synodic month (29.53059 days) from a known new moon reference.
 */
function getMoonPhase(date: Date): { name: string; emoji: string; illumination: number } {
  // Reference new moon: January 6, 2000 at 18:14 UTC
  const referenceNewMoon = new Date("2000-01-06T18:14:00Z");
  const synodicMonth = 29.53059;

  const daysSinceRef = (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = ((daysSinceRef % synodicMonth) + synodicMonth) % synodicMonth;

  // Approximate illumination (0-100%)
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * moonAge) / synodicMonth)) / 2 * 100);

  // Determine phase name and emoji
  if (moonAge < 1.85) return { name: "New Moon", emoji: "\uD83C\uDF11", illumination };
  if (moonAge < 7.38) return { name: "Waxing Crescent", emoji: "\uD83C\uDF12", illumination };
  if (moonAge < 9.23) return { name: "First Quarter", emoji: "\uD83C\uDF13", illumination };
  if (moonAge < 14.77) return { name: "Waxing Gibbous", emoji: "\uD83C\uDF14", illumination };
  if (moonAge < 16.61) return { name: "Full Moon", emoji: "\uD83C\uDF15", illumination };
  if (moonAge < 22.15) return { name: "Waning Gibbous", emoji: "\uD83C\uDF16", illumination };
  if (moonAge < 24.0) return { name: "Last Quarter", emoji: "\uD83C\uDF17", illumination };
  if (moonAge < 27.68) return { name: "Waning Crescent", emoji: "\uD83C\uDF18", illumination };
  return { name: "New Moon", emoji: "\uD83C\uDF11", illumination };
}

/**
 * Build the cosmic weather text from moon phase + active cosmic events.
 */
function buildCosmicWeather(
  moonPhase: { name: string; emoji: string },
  events: Array<{ name: string; type: string; description: string }>,
  zodiacSeason: string | null,
): string {
  const parts: string[] = [];

  // Moon phase sentence
  parts.push(`The Moon is in ${moonPhase.name} today ${moonPhase.emoji}.`);

  // Add the most notable cosmic event (eclipses > retrogrades > moons)
  const notableEvent = events.find(
    (e) =>
      e.type === "solar-eclipse" ||
      e.type === "lunar-eclipse" ||
      e.type === "mercury-retrograde" ||
      e.type === "full-moon" ||
      e.type === "new-moon"
  );

  if (notableEvent) {
    if (notableEvent.type === "mercury-retrograde") {
      parts.push(`${notableEvent.name} is in effect \u2014 double-check your messages and travel plans.`);
    } else if (notableEvent.type === "full-moon") {
      parts.push(`${notableEvent.name} brings illumination and culmination energy.`);
    } else if (notableEvent.type === "new-moon") {
      parts.push(`${notableEvent.name} invites fresh starts and new intentions.`);
    } else if (notableEvent.type.includes("eclipse")) {
      parts.push(`${notableEvent.name} is shaking up the cosmos \u2014 expect powerful shifts.`);
    }
  } else if (zodiacSeason) {
    // Fallback to zodiac season flavor
    const seasonMessages: Record<string, string> = {
      Aries: "Aries Season fires up your courage \u2014 great energy for bold moves.",
      Taurus: "Taurus Season grounds you \u2014 slow down and savor the moment.",
      Gemini: "Gemini Season sparks curiosity \u2014 great for conversations and learning.",
      Cancer: "Cancer Season nurtures your emotional world \u2014 connect with loved ones.",
      Leo: "Leo Season ignites your creativity \u2014 time to shine and express yourself.",
      Virgo: "Virgo Season sharpens your focus \u2014 perfect for refining your routines.",
      Libra: "Libra Season seeks harmony \u2014 balance your relationships and aesthetics.",
      Scorpio: "Scorpio Season deepens your intensity \u2014 lean into transformation.",
      Sagittarius: "Sagittarius Season expands your horizons \u2014 adventure awaits.",
      Capricorn: "Capricorn Season builds ambition \u2014 set your sights on big goals.",
      Aquarius: "Aquarius Season sparks innovation \u2014 embrace your unique vision.",
      Pisces: "Pisces Season heightens intuition \u2014 trust your inner wisdom.",
    };
    parts.push(seasonMessages[zodiacSeason] || `${zodiacSeason} Season energy is guiding the cosmos.`);
  }

  return parts.join(" ");
}

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Return cached response if still valid for today
    if (cachedResponse && cachedResponse.date === today) {
      return NextResponse.json(cachedResponse.data, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      });
    }

    const now = new Date();
    const moonPhase = getMoonPhase(now);
    const cosmicEvents = getCurrentCosmicEvents(now);

    // Extract zodiac season
    const seasonEvent = cosmicEvents.find((e) => e.type === "zodiac-season");
    const zodiacSeason = seasonEvent?.sign || null;

    // Map events for the response (exclude zodiac season from the event list)
    const eventList = cosmicEvents
      .filter((e) => e.type !== "zodiac-season")
      .map((e) => ({
        name: e.name,
        icon: e.icon,
        description: e.description,
        type: e.type,
      }));

    const cosmicWeather = buildCosmicWeather(
      moonPhase,
      eventList,
      zodiacSeason,
    );

    const data: DailyCosmicResponse = {
      date: today,
      moonPhase,
      zodiacSeason,
      cosmicWeather,
      events: eventList,
    };

    // Cache for the rest of the day
    cachedResponse = { data, date: today };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("[GET /api/daily-cosmic] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate cosmic weather" },
      { status: 500 }
    );
  }
}
