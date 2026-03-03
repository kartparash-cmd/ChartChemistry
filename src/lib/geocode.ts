/**
 * Server-side geocoding using OpenStreetMap Nominatim (free, no API key).
 * Converts city + country into latitude, longitude, and IANA timezone.
 */

import { find as findTimezone } from "geo-tz";

interface GeocodingResult {
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Geocode a city + country into coordinates and timezone.
 * Uses Nominatim (OpenStreetMap) for geocoding and geo-tz for timezone lookup.
 */
export async function geocodeCity(
  city: string,
  country: string
): Promise<GeocodingResult> {
  const query = encodeURIComponent(`${city}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ChartChemistry/1.0 (astrology-app)",
    },
  });

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

  return { latitude, longitude, timezone };
}
