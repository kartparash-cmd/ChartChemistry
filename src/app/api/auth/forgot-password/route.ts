import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// ============================================================
// Rate limiter: 5 requests per hour per IP
// ============================================================

const forgotPasswordLimiter = createRateLimiter(5, 60 * 60 * 1000, "forgot-password");

export async function POST(request: Request) {
  try {
    // --- Rate limiting: 5 requests per hour per IP ---
    const ip = getClientIp(request);
    const rateLimitResult = forgotPasswordLimiter.check(ip);

    if (!rateLimitResult.allowed) {
      // Return a generic message to prevent enumeration, but with 429 status
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.password) {
      // User not found or uses OAuth — still return 200 to prevent email enumeration
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Generate a random token
    const token = crypto.randomUUID();

    // Create a PasswordResetToken with 1-hour expiry
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send the reset email (gracefully degrades if email is not configured)
    const emailResult = await sendPasswordResetEmail(user.email, token);
    if (!emailResult.success) {
      console.warn("Password reset email was not sent — token still created in DB");
    }

    return NextResponse.json(
      { message: "If that email exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
