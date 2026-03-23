import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// 5 requests per hour per IP
const resetLimiter = createRateLimiter(5, 60 * 60 * 1000, "reset-password");

export async function POST(request: Request) {
  try {
    // --- Rate limiting ---
    const ip = getClientIp(request);
    const rl = await resetLimiter.check(ip);

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing token." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Hash new password with bcryptjs (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Use a transaction to prevent race conditions:
    // Find token, update password, and delete token atomically.
    const result = await prisma.$transaction(async (tx) => {
      // Find the token that hasn't expired
      const resetToken = await tx.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken || resetToken.expires < new Date()) {
        return null;
      }

      // Update user's password
      await tx.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      });

      // Delete the used token
      await tx.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return { success: true };
    });

    if (!result) {
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please request a new one." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Password has been reset successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
