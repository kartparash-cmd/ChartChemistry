import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { healthCheck, getAstroServiceStatus } from "@/lib/astro-client";

interface ServiceStatusWithLatency {
  status: "ok" | "error" | "circuit_open";
  latency_ms: number;
}

interface ServiceConfigStatus {
  status: "configured" | "missing";
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: ServiceStatusWithLatency;
    astro_service: ServiceStatusWithLatency | { status: "circuit_open" };
    anthropic: ServiceConfigStatus;
    openai: ServiceConfigStatus;
    stripe: ServiceConfigStatus;
    resend: ServiceConfigStatus;
    redis: ServiceConfigStatus;
  };
}

/**
 * Check astro-service health with a dedicated 5-second timeout,
 * also considering the circuit breaker state.
 */
async function checkAstroService(): Promise<
  ServiceStatusWithLatency | { status: "circuit_open" }
> {
  const circuitStatus = getAstroServiceStatus();

  // If the circuit is open, report immediately without making a call.
  if (circuitStatus.circuitState === "open") {
    return { status: "circuit_open" };
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5_000);

  try {
    await Promise.race([
      healthCheck(),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error("Health check timed out"))
        );
      }),
    ]);
    clearTimeout(timeoutId);
    return { status: "ok", latency_ms: Date.now() - start };
  } catch {
    clearTimeout(timeoutId);
    return { status: "error", latency_ms: Date.now() - start };
  }
}

/**
 * Check database connectivity by running a trivial query.
 */
async function checkDatabase(): Promise<ServiceStatusWithLatency> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", latency_ms: Date.now() - start };
  } catch {
    return { status: "error", latency_ms: Date.now() - start };
  }
}

function checkEnvVar(name: string): ServiceConfigStatus {
  return { status: process.env[name] ? "configured" : "missing" };
}

/**
 * GET /api/health
 *
 * Public endpoint (no auth required) that reports on all external
 * service dependencies. Intended for uptime monitors and load balancers.
 */
export async function GET() {
  const [database, astro_service] = await Promise.all([
    checkDatabase(),
    checkAstroService(),
  ]);

  const anthropic = checkEnvVar("ANTHROPIC_API_KEY");
  const openai = checkEnvVar("OPENAI_API_KEY");
  const stripe = checkEnvVar("STRIPE_SECRET_KEY");
  const resend = checkEnvVar("RESEND_API_KEY");
  const redis = checkEnvVar("UPSTASH_REDIS_REST_URL");

  // Determine overall status:
  // - "unhealthy" if DB or astro-service is down/errored
  // - "degraded"  if any optional service (API keys) is missing
  // - "healthy"   if all services are ok/configured
  const dbDown = database.status === "error";
  const astroDown =
    astro_service.status === "error" || astro_service.status === "circuit_open";

  let status: HealthResponse["status"];
  if (dbDown || astroDown) {
    status = "unhealthy";
  } else if (
    anthropic.status === "missing" ||
    openai.status === "missing" ||
    stripe.status === "missing" ||
    resend.status === "missing" ||
    redis.status === "missing"
  ) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  const body: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    services: {
      database,
      astro_service,
      anthropic,
      openai,
      stripe,
      resend,
      redis,
    },
  };

  // 200 for healthy/degraded, 503 for unhealthy.
  const httpStatus = status === "unhealthy" ? 503 : 200;

  return NextResponse.json(body, { status: httpStatus });
}
