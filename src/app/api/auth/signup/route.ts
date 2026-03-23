import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendExistingAccountNotification } from "@/lib/email";
import { sendWelcomeEmail } from "@/lib/emails";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { sanitizeName, sanitizeEmail } from "@/lib/sanitize";
import { checkReferralAchievements } from "@/lib/achievements";
import { logServerEvent } from "@/lib/server-analytics";

// ============================================================
// Signup rate limiter: 5 signups per hour per IP
// Redis-backed (Upstash) with in-memory fallback
// ============================================================

const signupLimiter = createRateLimiter(5, 60 * 60 * 1000, "signup");

export async function POST(request: Request) {
  try {
    // Rate limit by IP before doing any work
    const ip = getClientIp(request);
    const { allowed } = await signupLimiter.check(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    const { name, email, password, referralCode: bodyRefCode, ageConfirmed } = body;

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

    if (!ageConfirmed) {
      return NextResponse.json(
        { error: "You must confirm that you are at least 13 years of age" },
        { status: 400 }
      );
    }

    const normalizedEmail = sanitizeEmail(email);

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Return identical response to prevent email enumeration.
      // Notify the existing account owner via email instead.
      sendExistingAccountNotification(normalizedEmail).catch(() => {
        // Swallow — sendExistingAccountNotification already logs on failure.
      });
      return NextResponse.json(
        {
          message: "Account created! Please check your email to verify your account.",
        },
        { status: 201 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate a unique referral code for this new user
    const referralCode = "cc_" + crypto.randomBytes(4).toString("hex");

    // Check if a referral code was provided (via body field or query param)
    const url = new URL(request.url);
    const refCode = bodyRefCode || url.searchParams.get("ref");
    let referredByUserId: string | null = null;

    if (refCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: refCode },
        select: { id: true },
      });
      if (referrer) {
        referredByUserId = referrer.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        name: name ? sanitizeName(name) : null,
        email: normalizedEmail,
        password: hashedPassword,
        referralCode,
        referredBy: referredByUserId,
      },
    });

    // Increment the referrer's referral count if applicable
    if (referredByUserId) {
      const updatedReferrer = await prisma.user.update({
        where: { id: referredByUserId },
        data: { referralCount: { increment: 1 } },
        select: { referralCount: true },
      });

      // Fire-and-forget: check referral achievements (REFERRED_FRIEND / THREE_REFERRALS)
      checkReferralAchievements(referredByUserId, updatedReferrer.referralCount).catch((err) =>
        console.warn("[POST /api/auth/signup] Referral achievement check failed:", err)
      );
    }

    // Log server-side signup event
    logServerEvent("user_signup", { userId: user.id, hasReferral: !!referredByUserId });

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

    // Fire-and-forget: send the welcome email without blocking the signup response.
    // Errors are logged internally by sendWelcomeEmail; we intentionally do not await.
    sendWelcomeEmail(normalizedEmail, name || "").catch(() => {
      // Swallow — sendWelcomeEmail already logs on failure.
    });

    return NextResponse.json(
      {
        message: "Account created! Please check your email to verify your account.",
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
