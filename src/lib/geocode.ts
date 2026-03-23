/**
 * Server-side geocoding using OpenStreetMap Nominatim (free, no API key).
 * Converts city + country into latitude, longitude, and IANA timezone.
 *
 * Includes a 5-second fetch timeout and an in-memory cache (max 1000 entries,
 * 24-hour TTL) to reduce redundant Nominatim calls.
 */

import { find as findTimezone } from "geo-tz";

interface GeocodingResult {
  latitude: number;
  longitude: number;
  timezone: string;
}

/* -------------------------------------------------------------------------- */
/*  In-memory geocoding cache                                                 */
/* -------------------------------------------------------------------------- */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_MAX_SIZE = 1000;

interface CacheEntry {
  result: GeocodingResult;
  createdAt: number;
}

const geocodeCache = new Map<string, CacheEntry>();

function cacheKey(city: string, country: string): string {
  return `${city.toLowerCase().trim()}|${country.toLowerCase().trim()}`;
}

function getCached(key: string): GeocodingResult | null {
  const entry = geocodeCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.createdAt >= CACHE_TTL_MS) {
    geocodeCache.delete(key);
    return null;
  }

  return entry.result;
}

function setCache(key: string, result: GeocodingResult): void {
  // Evict oldest entry when cache is full
  if (geocodeCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = geocodeCache.keys().next().value;
    if (oldestKey !== undefined) {
      geocodeCache.delete(oldestKey);
    }
  }

  geocodeCache.set(key, { result, createdAt: Date.now() });
}

/* -------------------------------------------------------------------------- */
/*  Geocode function                                                          */
/* -------------------------------------------------------------------------- */

const FETCH_TIMEOUT_MS = 5000;

/**
 * Geocode a city + country into coordinates and timezone.
 * Uses Nominatim (OpenStreetMap) for geocoding and geo-tz for timezone lookup.
 *
 * Results are cached in memory (up to 1000 entries, 24-hour TTL).
 * Fetch calls have a 5-second timeout.
 */
export async function geocodeCity(
  city: string,
  country: string
): Promise<GeocodingResult> {
  // Check cache first
  const key = cacheKey(city, country);
  const cached = getCached(key);
  if (cached) return cached;

  const query = encodeURIComponent(`${city}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  // 5-second timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "ChartChemistry/1.0 (astrology-app)",
      },
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Geocoding request timed out after 5 seconds");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Geocoding service error: ${response.status}`);
  }

  const results = await response.json();

  if (!results || results.length === 0) {
    throw new Error(
      `Could not find coordinates for "${city}, ${country}". Please check the city name and try again.`
    );
  }

  const { lat, lon } = results[0];
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  // Use geo-tz to determine IANA timezone from coordinates
  const timezones = findTimezone(latitude, longitude);
  const timezone = timezones[0] || "UTC";

  const result: GeocodingResult = { latitude, longitude, timezone };

  // Store in cache
  setCache(key, result);

  return result;
}
