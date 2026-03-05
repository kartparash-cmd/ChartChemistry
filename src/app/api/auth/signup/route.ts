import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { getClientIp } from "@/lib/rate-limit";

// ============================================================
// Signup-specific rate limiter (in-memory, per-IP)
// ============================================================

const signupLimiter = new Map<string, { count: number; resetAt: number }>();
const SIGNUP_LIMIT = 5; // 5 signups per hour per IP
const SIGNUP_WINDOW = 60 * 60 * 1000; // 1 hour

function checkSignupRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = signupLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    signupLimiter.set(ip, { count: 1, resetAt: now + SIGNUP_WINDOW });
    return true;
  }
  if (entry.count >= SIGNUP_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP before doing any work
    const ip = getClientIp(request);
    if (!checkSignupRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Generate verification token and send email
    const verificationToken = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    const emailResult = await sendVerificationEmail(normalizedEmail, verificationToken);
    if (!emailResult.success) {
      console.warn("Verification email was not sent for user:", user.id);
    }

    return NextResponse.json(
      {
        message: emailResult.success
          ? "Account created! Please check your email to verify your account."
          : "Account created successfully!",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
