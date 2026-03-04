import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Require admin role. Returns the session if authorized,
 * or a NextResponse error (401/403) to return from the route handler.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Use realId (if impersonating) to check admin role, otherwise use id
  const role = session.user.role;
  if (role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { session };
}
