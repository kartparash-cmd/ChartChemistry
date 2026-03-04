/**
 * GET /api/geocode?city=<city>&country=<country>
 *
 * Returns latitude, longitude, and IANA timezone for a city.
 * Used by the premium report flow to geocode birth data before saving profiles.
 */

import { NextRequest, NextResponse } from "next/server";
import { geocodeCity } from "@/lib/geocode";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim();
  const country = req.nextUrl.searchParams.get("country")?.trim();

  if (!city || !country) {
    return NextResponse.json(
      { error: "city and country query parameters are required" },
      { status: 400 }
    );
  }

  try {
    const result = await geocodeCity(city, country);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Geocoding failed" },
      { status: 400 }
    );
  }
}
