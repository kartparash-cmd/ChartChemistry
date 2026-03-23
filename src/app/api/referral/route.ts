import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REFERRAL_THRESHOLD = 3;

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCount: true,
        referralRewardClaimed: true,
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.referralRewardClaimed) {
      return NextResponse.json(
        { error: "Reward has already been claimed." },
        { status: 400 }
      );
    }

    if (user.referralCount < REFERRAL_THRESHOLD) {
      return NextResponse.json(
        { error: `You need at least ${REFERRAL_THRESHOLD} referrals to claim the reward.` },
        { status: 400 }
      );
    }

    if (user.plan !== "FREE") {
      return NextResponse.json(
        { error: "This reward is only available for free-plan users." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { referralRewardClaimed: true },
    });

    return NextResponse.json({
      success: true,
      message:
        "Reward claimed! Your free month of Premium has been noted. Our team will apply the credit to your account within 24 hours. Check your email for confirmation.",
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCode: true,
        referralCount: true,
        referralRewardClaimed: true,
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If the user doesn't have a referral code yet (e.g., they signed up
    // before the feature was added), generate one now.
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = "cc_" + crypto.randomBytes(4).toString("hex");
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode },
      });
    }

    const eligible = user.referralCount >= REFERRAL_THRESHOLD && user.plan === "FREE";
    const rewardClaimed = user.referralRewardClaimed;

    return NextResponse.json({
      referralCode,
      referralCount: user.referralCount,
      referralsNeeded: Math.max(0, REFERRAL_THRESHOLD - user.referralCount),
      threshold: REFERRAL_THRESHOLD,
      eligible,
      rewardClaimed,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
