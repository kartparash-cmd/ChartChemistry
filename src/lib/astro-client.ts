/**
 * Typed HTTP client for the ChartChemistry Python astro-service.
 *
 * Each public function maps 1-to-1 with a FastAPI endpoint and uses
 * the TypeScript types defined in @/types/astrology.ts.
 */

import type {
  NatalChartInput,
  NatalChart,
  SynastryResult,
  CompositeChart,
  TransitResult,
  HouseSystem,
} from "@/types/astrology";
import { HOUSE_SYSTEM_TO_API } from "@/types/astrology";

const ASTRO_URL = process.env.ASTRO_SERVICE_URL || "http://localhost:8000";

interface AstroServiceError {
  detail: string;
}

/**
 * Low-level fetch wrapper with error handling.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ASTRO_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Astro service unreachable at ${url}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!response.ok) {
    let detail = `Astro service error: ${response.status}`;
    try {
      const body: AstroServiceError = await response.json();
      if (body.detail) detail = body.detail;
    } catch {
      // Response body wasn't JSON; keep the generic message.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

/**
 * Calculate a full natal chart for the given birth data.
 *
 * POST /api/natal-chart
 *
 * If `houseSystem` is provided as a frontend-style key (e.g. "whole-sign"),
 * it is mapped to the Python service's expected value (e.g. "whole_sign").
 * Defaults to "placidus" if not specified.
 */
export async function calculateNatalChart(
  input: NatalChartInput,
  houseSystem?: HouseSystem
): Promise<NatalChart> {
  const payload = { ...input };

  if (houseSystem) {
    payload.houseSystem = HOUSE_SYSTEM_TO_API[houseSystem] ?? houseSystem;
  } else if (!payload.houseSystem) {
    payload.houseSystem = "placidus";
  }

  return request<NatalChart>("/api/natal-chart", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Calculate synastry (relationship compatibility) between two people.
 *
 * POST /api/synastry
 *
 * The Python endpoint expects `chart1` and `chart2` — each being the
 * same shape as a NatalChartRequest (birth data fields). So we pass
 * the original NatalChartInput objects, not the computed NatalChart.
 */
export async function calculateSynastry(
  person1Input: NatalChartInput,
  person2Input: NatalChartInput
): Promise<SynastryResult> {
  return request<SynastryResult>("/api/synastry", {
    method: "POST",
    body: JSON.stringify({
      chart1: person1Input,
      chart2: person2Input,
    }),
  });
}

/**
 * Calculate a composite chart using the midpoint method.
 *
 * POST /api/composite
 */
export async function calculateComposite(
  person1Input: NatalChartInput,
  person2Input: NatalChartInput
): Promise<CompositeChart> {
  return request<CompositeChart>("/api/composite", {
    method: "POST",
    body: JSON.stringify({
      chart1: person1Input,
      chart2: person2Input,
    }),
  });
}

/**
 * Calculate current transits to a natal chart for a given date.
 *
 * POST /api/transits
 */
export async function calculateTransits(
  natalChartInput: NatalChartInput,
  date: string
): Promise<TransitResult> {
  return request<TransitResult>("/api/transits", {
    method: "POST",
    body: JSON.stringify({
      natalChart: natalChartInput,
      date,
    }),
  });
}

/**
 * Quick health check — useful during startup.
 */
export async function healthCheck(): Promise<{
  status: string;
  service: string;
  version: string;
}> {
  return request("/health");
}
