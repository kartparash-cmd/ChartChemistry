import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { healthCheck, getAstroServiceStatus } from "@/lib/astro-client";

interface ServiceStatus {
  status: "ok" | "error" | "unconfigured";
  latencyMs?: number;
}

interface HealthResponse {
  status: "ok" | "degraded" | "down";
  services: {
    database: ServiceStatus;
    astroService: ServiceStatus;
    email: ServiceStatus;
    redis: ServiceStatus;
    claude: ServiceStatus;
  };
  timestamp: string;
}

/**
 * Check astro-service health with a dedicated 5-second timeout,
 * also considering the circuit breaker state.
 */
async function checkAstroService(): Promise<ServiceStatus> {
  const circuitStatus = getAstroServiceStatus();

  // If the circuit is open, report error immediately without making a call.
  if (circuitStatus.circuitState === "open") {
    return { status: "error", latencyMs: 0 };
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5_000);

  try {
    // healthCheck() uses the module-level request() which already has
    // circuit breaker logic, but we add an extra 5s race here for the
    // health endpoint specifically.
    await Promise.race([
      healthCheck(),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error("Health check timed out"))
        );
      }),
    ]);
    clearTimeout(timeoutId);
    return { status: "ok", latencyMs: Date.now() - start };
  } catch {
    clearTimeout(timeoutId);
    return { status: "error", latencyMs: Date.now() - start };
  }
}

/**
 * Check database connectivity by running a trivial query.
 */
async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", latencyMs: Date.now() - start };
  } catch {
    return { status: "error", latencyMs: Date.now() - start };
  }
}

/**
 * GET /api/health
 *
 * Public endpoint (no auth required) that reports on all service
 * dependencies. Intended for uptime monitors and load balancers.
 */
export async function GET() {
  const [database, astroService] = await Promise.all([
    checkDatabase(),
    checkAstroService(),
  ]);

  const email: ServiceStatus = {
    status: process.env.RESEND_API_KEY ? "ok" : "unconfigured",
  };

  const redis: ServiceStatus = {
    status: process.env.UPSTASH_REDIS_REST_URL ? "ok" : "unconfigured",
  };

  const claude: ServiceStatus = {
    status: process.env.ANTHROPIC_API_KEY ? "ok" : "unconfigured",
  };

  // Determine overall status:
  // - "down"     if the database is unreachable
  // - "degraded" if the database is fine but astro-service is not
  // - "ok"       if both critical services are healthy
  let overallStatus: HealthResponse["status"];
  if (database.status === "error") {
    overallStatus = "down";
  } else if (astroService.status === "error") {
    overallStatus = "degraded";
  } else {
    overallStatus = "ok";
  }

  const body: HealthResponse = {
    status: overallStatus,
    services: {
      database,
      astroService,
      email,
      redis,
      claude,
    },
    timestamp: new Date().toISOString(),
  };

  // Use 200 for ok/degraded, 503 for down.
  const httpStatus = overallStatus === "down" ? 503 : 200;

  return NextResponse.json(body, { status: httpStatus });
}
