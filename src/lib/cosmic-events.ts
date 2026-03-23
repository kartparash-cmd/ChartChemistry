/**
 * Cosmic Events System
 *
 * Provides current and upcoming cosmic events (Mercury retrograde, full/new moons,
 * eclipses, zodiac season changes) based on astronomical data for 2025-2026.
 *
 * Used to create urgency/FOMO banners on the dashboard and elsewhere.
 */

export type CosmicEventType =
  | "mercury-retrograde"
  | "full-moon"
  | "new-moon"
  | "solar-eclipse"
  | "lunar-eclipse"
  | "zodiac-season";

export interface CosmicEvent {
  name: string;
  type: CosmicEventType;
  startDate: Date;
  endDate: Date;
  description: string;
  icon: string;
  isActive: boolean;
  /** Zodiac sign associated with this event (e.g. moon sign, season sign) */
  sign?: string;
}

// ============================================================
// 2025-2026 Cosmic Event Schedule
// ============================================================

/**
 * Mercury retrograde periods (~3 weeks each, ~3x per year).
 * Dates are approximate based on astronomical predictions.
 */
const MERCURY_RETROGRADES: Array<{ start: string; end: string; sign: string }> = [
  // 2025
  { start: "2025-03-15", end: "2025-04-07", sign: "Aries" },
  { start: "2025-07-18", end: "2025-08-11", sign: "Leo" },
  { start: "2025-11-09", end: "2025-11-29", sign: "Sagittarius" },
  // 2026
  { start: "2026-02-26", end: "2026-03-20", sign: "Pisces" },
  { start: "2026-06-29", end: "2026-07-23", sign: "Cancer" },
  { start: "2026-10-24", end: "2026-11-13", sign: "Scorpio" },
];

/**
 * Full moons (approximate dates, with zodiac sign the moon is in).
 */
const FULL_MOONS: Array<{ date: string; sign: string }> = [
  // 2025
  { date: "2025-01-13", sign: "Cancer" },
  { date: "2025-02-12", sign: "Leo" },
  { date: "2025-03-14", sign: "Virgo" },
  { date: "2025-04-13", sign: "Libra" },
  { date: "2025-05-12", sign: "Scorpio" },
  { date: "2025-06-11", sign: "Sagittarius" },
  { date: "2025-07-10", sign: "Capricorn" },
  { date: "2025-08-09", sign: "Aquarius" },
  { date: "2025-09-07", sign: "Pisces" },
  { date: "2025-10-07", sign: "Aries" },
  { date: "2025-11-05", sign: "Taurus" },
  { date: "2025-12-04", sign: "Gemini" },
  // 2026
  { date: "2026-01-03", sign: "Cancer" },
  { date: "2026-02-01", sign: "Leo" },
  { date: "2026-03-03", sign: "Virgo" },
  { date: "2026-04-01", sign: "Libra" },
  { date: "2026-05-01", sign: "Scorpio" },
  { date: "2026-05-31", sign: "Sagittarius" },
  { date: "2026-06-29", sign: "Capricorn" },
  { date: "2026-07-29", sign: "Aquarius" },
  { date: "2026-08-28", sign: "Pisces" },
  { date: "2026-09-26", sign: "Aries" },
  { date: "2026-10-26", sign: "Taurus" },
  { date: "2026-11-24", sign: "Gemini" },
  { date: "2026-12-24", sign: "Cancer" },
];

/**
 * New moons (approximate dates, with zodiac sign).
 */
const NEW_MOONS: Array<{ date: string; sign: string }> = [
  // 2025
  { date: "2025-01-29", sign: "Aquarius" },
  { date: "2025-02-28", sign: "Pisces" },
  { date: "2025-03-29", sign: "Aries" },
  { date: "2025-04-27", sign: "Taurus" },
  { date: "2025-05-27", sign: "Gemini" },
  { date: "2025-06-25", sign: "Cancer" },
  { date: "2025-07-24", sign: "Leo" },
  { date: "2025-08-23", sign: "Virgo" },
  { date: "2025-09-21", sign: "Libra" },
  { date: "2025-10-21", sign: "Scorpio" },
  { date: "2025-11-20", sign: "Sagittarius" },
  { date: "2025-12-20", sign: "Capricorn" },
  // 2026
  { date: "2026-01-18", sign: "Capricorn" },
  { date: "2026-02-17", sign: "Aquarius" },
  { date: "2026-03-19", sign: "Pisces" },
  { date: "2026-04-17", sign: "Aries" },
  { date: "2026-05-16", sign: "Taurus" },
  { date: "2026-06-15", sign: "Gemini" },
  { date: "2026-07-14", sign: "Cancer" },
  { date: "2026-08-13", sign: "Leo" },
  { date: "2026-09-11", sign: "Virgo" },
  { date: "2026-10-10", sign: "Libra" },
  { date: "2026-11-09", sign: "Scorpio" },
  { date: "2026-12-09", sign: "Sagittarius" },
];

/**
 * Eclipse seasons (solar and lunar eclipses).
 */
const ECLIPSES: Array<{ date: string; type: "solar-eclipse" | "lunar-eclipse"; sign: string; name: string }> = [
  // 2025
  { date: "2025-03-14", type: "lunar-eclipse", sign: "Virgo", name: "Lunar Eclipse in Virgo" },
  { date: "2025-03-29", type: "solar-eclipse", sign: "Aries", name: "Solar Eclipse in Aries" },
  { date: "2025-09-07", type: "lunar-eclipse", sign: "Pisces", name: "Lunar Eclipse in Pisces" },
  { date: "2025-09-21", type: "solar-eclipse", sign: "Libra", name: "Solar Eclipse in Libra" },
  // 2026
  { date: "2026-02-17", type: "solar-eclipse", sign: "Aquarius", name: "Solar Eclipse in Aquarius" },
  { date: "2026-03-03", type: "lunar-eclipse", sign: "Virgo", name: "Lunar Eclipse in Virgo" },
  { date: "2026-08-12", type: "solar-eclipse", sign: "Leo", name: "Solar Eclipse in Leo" },
  { date: "2026-08-28", type: "lunar-eclipse", sign: "Pisces", name: "Lunar Eclipse in Pisces" },
];

/**
 * Zodiac season dates (approximate Sun ingress dates).
 */
const ZODIAC_SEASONS: Array<{ start: string; end: string; sign: string }> = [
  // 2025
  { start: "2025-01-19", end: "2025-02-18", sign: "Aquarius" },
  { start: "2025-02-18", end: "2025-03-20", sign: "Pisces" },
  { start: "2025-03-20", end: "2025-04-19", sign: "Aries" },
  { start: "2025-04-19", end: "2025-05-20", sign: "Taurus" },
  { start: "2025-05-20", end: "2025-06-20", sign: "Gemini" },
  { start: "2025-06-20", end: "2025-07-22", sign: "Cancer" },
  { start: "2025-07-22", end: "2025-08-22", sign: "Leo" },
  { start: "2025-08-22", end: "2025-09-22", sign: "Virgo" },
  { start: "2025-09-22", end: "2025-10-22", sign: "Libra" },
  { start: "2025-10-22", end: "2025-11-21", sign: "Scorpio" },
  { start: "2025-11-21", end: "2025-12-21", sign: "Sagittarius" },
  { start: "2025-12-21", end: "2026-01-19", sign: "Capricorn" },
  // 2026
  { start: "2026-01-19", end: "2026-02-18", sign: "Aquarius" },
  { start: "2026-02-18", end: "2026-03-20", sign: "Pisces" },
  { start: "2026-03-20", end: "2026-04-19", sign: "Aries" },
  { start: "2026-04-19", end: "2026-05-20", sign: "Taurus" },
  { start: "2026-05-20", end: "2026-06-20", sign: "Gemini" },
  { start: "2026-06-20", end: "2026-07-22", sign: "Cancer" },
  { start: "2026-07-22", end: "2026-08-22", sign: "Leo" },
  { start: "2026-08-22", end: "2026-09-22", sign: "Virgo" },
  { start: "2026-09-22", end: "2026-10-22", sign: "Libra" },
  { start: "2026-10-22", end: "2026-11-21", sign: "Scorpio" },
  { start: "2026-11-21", end: "2026-12-21", sign: "Sagittarius" },
  { start: "2026-12-21", end: "2027-01-19", sign: "Capricorn" },
];

// ============================================================
// Helper utilities
// ============================================================

/** Parse "YYYY-MM-DD" into a Date at midnight UTC. */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

/** End of day for a given date string. */
function endOfDay(dateStr: string): Date {
  return new Date(dateStr + "T23:59:59");
}

/** Check if a date is within a window (inclusive). */
function isInWindow(now: Date, start: Date, end: Date): boolean {
  return now >= start && now <= end;
}

/** Format a date as "Month Day" (e.g. "Mar 20"). */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============================================================
// Descriptions
// ============================================================

const RETROGRADE_DESCRIPTIONS: Record<string, string> = {
  Aries: "Impulsive decisions and miscommunications are amplified. Slow down before acting.",
  Taurus: "Financial plans and material matters may need revisiting. Practice patience.",
  Gemini: "Watch for mixed signals and document misunderstandings. Think before you speak.",
  Cancer: "Family communications and emotional expression may feel tangled. Be gentle.",
  Leo: "Creative projects and self-expression may stall. Revisit rather than start fresh.",
  Virgo: "Health routines and work processes deserve a second look. Double-check details.",
  Libra: "Relationship dynamics and partnerships may need renegotiation. Seek balance.",
  Scorpio: "Hidden truths may surface. Excellent for research, challenging for secrets.",
  Sagittarius: "Travel plans and educational pursuits may hit snags. Stay flexible.",
  Capricorn: "Career plans and authority structures deserve reflection. Revise your strategy.",
  Aquarius: "Technology and social networks may glitch. Back up your data and be patient.",
  Pisces: "Spiritual practices and creative visions benefit from review. Trust your intuition.",
};

const FULL_MOON_DESCRIPTIONS: Record<string, string> = {
  Aries: "A time of bold revelations and culmination of personal goals. Channel your fire wisely.",
  Taurus: "Material and financial matters reach a peak. Ground yourself in what truly has value.",
  Gemini: "Communications and ideas come to fruition. Share your voice and connect.",
  Cancer: "Emotional insights and family matters reach clarity. Nurture what you love.",
  Leo: "Creative achievements and romance are illuminated. Let your light shine.",
  Virgo: "Health and daily routines reach a turning point. Great for reflection and completion.",
  Libra: "Partnerships and justice are spotlighted. Seek harmony in your relationships.",
  Scorpio: "Deep emotions and transformations come to the surface. Release what no longer serves you.",
  Sagittarius: "Wisdom, travel, and higher learning are highlighted. Expand your horizons.",
  Capricorn: "Career milestones and ambitions are illuminated. Celebrate your progress.",
  Aquarius: "Community connections and innovation come into focus. Embrace your uniqueness.",
  Pisces: "Spiritual awareness and creative dreams are heightened. Trust the flow.",
};

const NEW_MOON_DESCRIPTIONS: Record<string, string> = {
  Aries: "Plant seeds of new beginnings and personal initiatives. A fresh start awaits.",
  Taurus: "Set intentions around finances, comfort, and self-worth. Build something lasting.",
  Gemini: "New ideas and communication paths open up. Start that conversation or project.",
  Cancer: "Set intentions for home, family, and emotional well-being. Create your sanctuary.",
  Leo: "New creative and romantic opportunities emerge. Express yourself boldly.",
  Virgo: "Begin new health routines and refine your daily practice. The details matter.",
  Libra: "New partnerships and creative collaborations are favored. Seek balance.",
  Scorpio: "Deep transformation begins. Set powerful intentions for change.",
  Sagittarius: "Adventure and learning opportunities arise. Aim for something bigger.",
  Capricorn: "Career intentions and long-term goals get a fresh start. Build your legacy.",
  Aquarius: "Innovation and community involvement are seeded. Dream of a better future.",
  Pisces: "Spiritual and creative intentions are amplified. Let your imagination lead.",
};

// ============================================================
// Main function
// ============================================================

/**
 * Returns all currently active or very near cosmic events.
 *
 * "Active" logic:
 *  - Mercury retrogrades: active if within start-end window
 *  - Full / New moons: active on the day of, and 1 day before/after
 *  - Eclipses: active on the day of, and 2 days before/after
 *  - Zodiac seasons: active if within start-end window
 *
 * Results are sorted: higher-priority event types first, then by start date.
 */
export function getCurrentCosmicEvents(now: Date = new Date()): CosmicEvent[] {
  const events: CosmicEvent[] = [];

  // --- Mercury Retrogrades ---
  for (const retro of MERCURY_RETROGRADES) {
    const start = parseDate(retro.start);
    const end = endOfDay(retro.end);
    const active = isInWindow(now, start, end);
    if (active) {
      events.push({
        name: `Mercury Retrograde in ${retro.sign}`,
        type: "mercury-retrograde",
        startDate: start,
        endDate: end,
        description:
          RETROGRADE_DESCRIPTIONS[retro.sign] ||
          "Communication and technology may be disrupted. Double-check everything.",
        icon: "\u263F", // Mercury symbol
        isActive: true,
        sign: retro.sign,
      });
    }
  }

  // --- Full Moons (active day-of +/- 1 day) ---
  for (const fm of FULL_MOONS) {
    const moonDate = parseDate(fm.date);
    const windowStart = new Date(moonDate);
    windowStart.setDate(windowStart.getDate() - 1);
    const windowEnd = new Date(moonDate);
    windowEnd.setDate(windowEnd.getDate() + 1);
    windowEnd.setHours(23, 59, 59);

    const active = isInWindow(now, windowStart, windowEnd);
    if (active) {
      const isToday = now.toDateString() === moonDate.toDateString();
      events.push({
        name: `Full Moon in ${fm.sign}`,
        type: "full-moon",
        startDate: moonDate,
        endDate: moonDate,
        description:
          (isToday ? "Tonight! " : "") +
          (FULL_MOON_DESCRIPTIONS[fm.sign] || "A time of culmination and illumination."),
        icon: "\uD83C\uDF15", // Full moon emoji
        isActive: true,
        sign: fm.sign,
      });
    }
  }

  // --- New Moons (active day-of +/- 1 day) ---
  for (const nm of NEW_MOONS) {
    const moonDate = parseDate(nm.date);
    const windowStart = new Date(moonDate);
    windowStart.setDate(windowStart.getDate() - 1);
    const windowEnd = new Date(moonDate);
    windowEnd.setDate(windowEnd.getDate() + 1);
    windowEnd.setHours(23, 59, 59);

    const active = isInWindow(now, windowStart, windowEnd);
    if (active) {
      const isToday = now.toDateString() === moonDate.toDateString();
      events.push({
        name: `New Moon in ${nm.sign}`,
        type: "new-moon",
        startDate: moonDate,
        endDate: moonDate,
        description:
          (isToday ? "Today! " : "") +
          (NEW_MOON_DESCRIPTIONS[nm.sign] || "A time for new beginnings and setting intentions."),
        icon: "\uD83C\uDF11", // New moon emoji
        isActive: true,
        sign: nm.sign,
      });
    }
  }

  // --- Eclipses (active day-of +/- 2 days) ---
  for (const eclipse of ECLIPSES) {
    const eclipseDate = parseDate(eclipse.date);
    const windowStart = new Date(eclipseDate);
    windowStart.setDate(windowStart.getDate() - 2);
    const windowEnd = new Date(eclipseDate);
    windowEnd.setDate(windowEnd.getDate() + 2);
    windowEnd.setHours(23, 59, 59);

    const active = isInWindow(now, windowStart, windowEnd);
    if (active) {
      const isToday = now.toDateString() === eclipseDate.toDateString();
      const eclipseType = eclipse.type === "solar-eclipse" ? "Solar" : "Lunar";
      events.push({
        name: eclipse.name,
        type: eclipse.type,
        startDate: eclipseDate,
        endDate: eclipseDate,
        description: isToday
          ? `${eclipseType} Eclipse happening today! A powerful cosmic reset in ${eclipse.sign} energy. Major life shifts are possible.`
          : `${eclipseType} Eclipse approaching in ${eclipse.sign}. Prepare for accelerated change and karmic turning points.`,
        icon: eclipse.type === "solar-eclipse" ? "\uD83C\uDF1E" : "\uD83C\uDF16",
        isActive: true,
        sign: eclipse.sign,
      });
    }
  }

  // --- Zodiac Seasons ---
  for (const season of ZODIAC_SEASONS) {
    const start = parseDate(season.start);
    const end = endOfDay(season.end);
    const active = isInWindow(now, start, end);
    if (active) {
      // Check if the season just started (within first 2 days)
      const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const justStarted = daysSinceStart <= 2;
      events.push({
        name: `${season.sign} Season`,
        type: "zodiac-season",
        startDate: start,
        endDate: end,
        description: justStarted
          ? `The Sun has just entered ${season.sign}! A new cosmic chapter begins. Align with ${season.sign} energy.`
          : `We're in ${season.sign} Season. Embrace ${season.sign} themes in your daily life.`,
        icon: getZodiacIcon(season.sign),
        isActive: true,
        sign: season.sign,
      });
    }
  }

  // Sort: eclipses and retrogrades first, then moons, then seasons
  const priority: Record<CosmicEventType, number> = {
    "solar-eclipse": 0,
    "lunar-eclipse": 1,
    "mercury-retrograde": 2,
    "full-moon": 3,
    "new-moon": 4,
    "zodiac-season": 5,
  };

  events.sort((a, b) => priority[a.type] - priority[b.type]);

  return events;
}

/**
 * Returns only the most important active events for banner display
 * (excludes zodiac season unless it just started, limits to top 2).
 */
export function getBannerEvents(now: Date = new Date()): CosmicEvent[] {
  const all = getCurrentCosmicEvents(now);

  // For the banner, filter out zodiac season unless it started in the last 2 days
  const bannerWorthy = all.filter((e) => {
    if (e.type === "zodiac-season") {
      const daysSinceStart = Math.floor(
        (now.getTime() - e.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceStart <= 2;
    }
    return true;
  });

  return bannerWorthy.slice(0, 2);
}

// ============================================================
// Calendar: all events for a given month
// ============================================================

/**
 * Returns all cosmic events that fall within a given month (year/month).
 * Unlike getCurrentCosmicEvents which only returns "active" events for today,
 * this returns every event whose date range overlaps the specified month.
 */
export function getEventsForMonth(year: number, month: number): CosmicEvent[] {
  const events: CosmicEvent[] = [];
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  // --- Mercury Retrogrades ---
  for (const retro of MERCURY_RETROGRADES) {
    const start = parseDate(retro.start);
    const end = endOfDay(retro.end);
    if (start <= monthEnd && end >= monthStart) {
      events.push({
        name: `Mercury Retrograde in ${retro.sign}`,
        type: "mercury-retrograde",
        startDate: start,
        endDate: end,
        description:
          RETROGRADE_DESCRIPTIONS[retro.sign] ||
          "Communication and technology may be disrupted. Double-check everything.",
        icon: "\u263F",
        isActive: false,
        sign: retro.sign,
      });
    }
  }

  // --- Full Moons ---
  for (const fm of FULL_MOONS) {
    const moonDate = parseDate(fm.date);
    if (moonDate >= monthStart && moonDate <= monthEnd) {
      events.push({
        name: `Full Moon in ${fm.sign}`,
        type: "full-moon",
        startDate: moonDate,
        endDate: moonDate,
        description:
          FULL_MOON_DESCRIPTIONS[fm.sign] || "A time of culmination and illumination.",
        icon: "\uD83C\uDF15",
        isActive: false,
        sign: fm.sign,
      });
    }
  }

  // --- New Moons ---
  for (const nm of NEW_MOONS) {
    const moonDate = parseDate(nm.date);
    if (moonDate >= monthStart && moonDate <= monthEnd) {
      events.push({
        name: `New Moon in ${nm.sign}`,
        type: "new-moon",
        startDate: moonDate,
        endDate: moonDate,
        description:
          NEW_MOON_DESCRIPTIONS[nm.sign] || "A time for new beginnings and setting intentions.",
        icon: "\uD83C\uDF11",
        isActive: false,
        sign: nm.sign,
      });
    }
  }

  // --- Eclipses ---
  for (const eclipse of ECLIPSES) {
    const eclipseDate = parseDate(eclipse.date);
    if (eclipseDate >= monthStart && eclipseDate <= monthEnd) {
      const eclipseType = eclipse.type === "solar-eclipse" ? "Solar" : "Lunar";
      events.push({
        name: eclipse.name,
        type: eclipse.type,
        startDate: eclipseDate,
        endDate: eclipseDate,
        description: `${eclipseType} Eclipse in ${eclipse.sign}. Prepare for accelerated change and karmic turning points.`,
        icon: eclipse.type === "solar-eclipse" ? "\uD83C\uDF1E" : "\uD83C\uDF16",
        isActive: false,
        sign: eclipse.sign,
      });
    }
  }

  // --- Zodiac Seasons ---
  for (const season of ZODIAC_SEASONS) {
    const start = parseDate(season.start);
    const end = endOfDay(season.end);
    if (start <= monthEnd && end >= monthStart) {
      events.push({
        name: `${season.sign} Season Begins`,
        type: "zodiac-season",
        startDate: start,
        endDate: end,
        description: `The Sun enters ${season.sign}. A new cosmic chapter begins.`,
        icon: getZodiacIcon(season.sign),
        isActive: false,
        sign: season.sign,
      });
    }
  }

  return events;
}

/**
 * Calculate moon phase for any given date.
 * Based on the synodic month (29.53059 days) from a known new moon reference.
 */
export function getMoonPhaseForDate(date: Date): { name: string; emoji: string; illumination: number } {
  const referenceNewMoon = new Date("2000-01-06T18:14:00Z");
  const synodicMonth = 29.53059;

  const daysSinceRef = (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = ((daysSinceRef % synodicMonth) + synodicMonth) % synodicMonth;

  const illumination = Math.round((1 - Math.cos((2 * Math.PI * moonAge) / synodicMonth)) / 2 * 100);

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

// ============================================================
// Zodiac icon helper
// ============================================================

function getZodiacIcon(sign: string): string {
  const icons: Record<string, string> = {
    Aries: "\u2648",
    Taurus: "\u2649",
    Gemini: "\u264A",
    Cancer: "\u264B",
    Leo: "\u264C",
    Virgo: "\u264D",
    Libra: "\u264E",
    Scorpio: "\u264F",
    Sagittarius: "\u2650",
    Capricorn: "\u2651",
    Aquarius: "\u2652",
    Pisces: "\u2653",
  };
  return icons[sign] || "\u2728";
}
