/**
 * GET /api/city-search?q=<query>&country=<optional>
 *
 * Lightweight proxy for OpenStreetMap Nominatim city search.
 * Returns matching cities with display name and coordinates.
 * Rate limited to 30 requests per minute per IP.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

interface NominatimResult {
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
    state?: string;
  };
}

const citySearchLimiter = createRateLimiter(30, 60 * 1000, "city-search");

export async function GET(req: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(req);
  const { allowed, resetAt } = await citySearchLimiter.check(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const country = req.nextUrl.searchParams.get("country")?.trim();
  const query = country ? `${q}, ${country}` : q;

  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: "json",
    limit: "6",
    addressdetails: "1",
  })}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "ChartChemistry/1.0 (astrology-app)" },
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    return NextResponse.json([], { status: 200 });
  }

  const data: NominatimResult[] = await res.json();

  const results = data.map((r) => ({
    display: r.display_name,
    city:
      r.address?.city ||
      r.address?.town ||
      r.address?.village ||
      r.address?.municipality ||
      r.name,
    state: r.address?.state || "",
    country: r.address?.country || "",
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }));

  return NextResponse.json(results);
}
