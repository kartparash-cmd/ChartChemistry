import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedPages = [
  "/dashboard",
  "/chat",
  "/chart",
  "/report",
  "/relationship",
  "/transits",
  "/cosmic-identity",
  "/wellness",
  "/horoscope",
  "/support",
];

// API routes that require authentication (subset — some have their own checks)
const protectedApi = [
  "/api/profile",
  "/api/chat",
  "/api/compatibility/full",
  "/api/stripe/checkout",
  "/api/stripe/portal",
  "/api/user",
  "/api/push/subscribe",
  "/api/dashboard",
  "/api/streak",
  "/api/referral",
  "/api/relationship",
  "/api/natal-chart",
  "/api/transits/personal",
  "/api/chart/explain",
  "/api/report",
  "/api/support",
];

// Admin-only routes
const adminRoutes = ["/admin"];

function isProtectedPage(pathname: string): boolean {
  return protectedPages.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isProtectedApi(pathname: string): boolean {
  return protectedApi.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes, static files, and auth endpoints
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/compatibility") && !pathname.includes("/full") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPage = isProtectedPage(pathname);
  const isApi = isProtectedApi(pathname);
  const isAdmin = isAdminRoute(pathname);

  if (!isPage && !isApi && !isAdmin) {
    // Redirect logged-in users from landing page to dashboard
    if (pathname === "/") {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated
  if (!token) {
    if (isApi) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin check
  if (isAdmin && token.role !== "ADMIN") {
    if (isApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (static files)
     * - favicon.ico, icon.svg, manifest.json, sw.js (public files)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|manifest\\.json|sw\\.js|opengraph-image).*)",
  ],
};
