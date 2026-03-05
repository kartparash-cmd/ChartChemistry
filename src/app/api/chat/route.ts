/**
 * POST /api/chat
 *
 * AI astrologer chat endpoint.
 * Requires authenticated user with PREMIUM plan.
 *
 * Optionally accepts a reportId for chart-aware conversation
 * and a sessionId to continue an existing conversation.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatWithAstrologer, buildChatContext } from "@/lib/claude";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import type { ChatMessage, ChatRequest } from "@/types/astrology";
import type { Prisma } from "@/generated/prisma/client";

// ============================================================
// Rate limiter: 20 requests per hour per user
// ============================================================

const chatRateLimiter = createRateLimiter(20, 60 * 60 * 1000, "chat");

// ============================================================
// Route handler
// ============================================================

export async function POST(request: Request) {
  try {
    // --- 1. Verify auth + premium plan ---
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isPremium =
      session.user.plan === "PREMIUM" || session.user.plan === "ANNUAL";

    if (!isPremium) {
      return NextResponse.json(
        {
          error: "Premium plan required",
          message:
            "Chat with our AI astrologer is available to Premium and Annual subscribers.",
        },
        { status: 403 }
      );
    }

    // --- Rate limiting: 20 requests per hour per user ---
    const rateLimitKey = session.user.id || getClientIp(request);
    const rateLimitResult = chatRateLimiter.check(rateLimitKey);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "You have reached the maximum of 20 chat messages per hour. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // --- 2. Parse + validate body ---
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: "message is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const userMessage = body.message.trim();

    // Limit message length to prevent abuse
    if (userMessage.length > 2000) {
      return NextResponse.json(
        { error: "Message too long. Maximum 2000 characters." },
        { status: 400 }
      );
    }

    // --- 3. Build chart context from report (if provided) ---
    let chartContext: string | undefined;

    if (body.reportId) {
      const report = await prisma.compatibilityReport.findUnique({
        where: { id: body.reportId },
        include: {
          person1: true,
          person2: true,
        },
      });

      if (!report) {
        return NextResponse.json(
          { error: `Report not found: ${body.reportId}` },
          { status: 404 }
        );
      }

      // Verify the user owns this report
      if (report.userId !== session.user.id) {
        return NextResponse.json(
          { error: "You do not own this report" },
          { status: 403 }
        );
      }

      chartContext = buildChatContext(
        {
          synastryData: report.synastryData,
          compositeData: report.compositeData,
          summaryNarrative: report.summaryNarrative,
          overallScore: report.overallScore,
          communicationScore: report.communicationScore,
          emotionalScore: report.emotionalScore,
          chemistryScore: report.chemistryScore,
          stabilityScore: report.stabilityScore,
          conflictScore: report.conflictScore,
        },
        {
          name: report.person1.name,
          chartData: report.person1.chartData,
        },
        {
          name: report.person2.name,
          chartData: report.person2.chartData,
        }
      );
    }

    // --- 4. Load or create chat session ---
    let conversationHistory: ChatMessage[] = [];
    let chatSessionId = body.sessionId;

    if (chatSessionId) {
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: chatSessionId },
      });

      if (!existingSession) {
        return NextResponse.json(
          { error: `Chat session not found: ${chatSessionId}` },
          { status: 404 }
        );
      }

      if (existingSession.userId !== session.user.id) {
        return NextResponse.json(
          { error: "You do not own this chat session" },
          { status: 403 }
        );
      }

      conversationHistory = (existingSession.messages as unknown as ChatMessage[]) || [];
    }

    // --- 5. Build messages array ---
    const newUserMessage: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    conversationHistory.push(newUserMessage);

    // Limit conversation history to last 20 messages to control token usage
    const messagesToSend =
      conversationHistory.length > 20
        ? conversationHistory.slice(-20)
        : conversationHistory;

    // --- 6. Call Claude API ---
    const aiReply = await chatWithAstrologer(messagesToSend, chartContext);

    // --- 7. Save conversation ---
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: aiReply,
      timestamp: new Date().toISOString(),
    };

    conversationHistory.push(assistantMessage);

    if (chatSessionId) {
      // Update existing session
      await prisma.chatSession.update({
        where: { id: chatSessionId },
        data: {
          messages: JSON.parse(JSON.stringify(conversationHistory)) as Prisma.InputJsonValue,
        },
      });
    } else {
      // Create new session
      const newSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          reportId: body.reportId || null,
          messages: JSON.parse(JSON.stringify(conversationHistory)) as Prisma.InputJsonValue,
        },
      });
      chatSessionId = newSession.id;
    }

    // --- 8. Return response ---
    return NextResponse.json({
      reply: aiReply,
      sessionId: chatSessionId,
    });
  } catch (error) {
    console.error("[POST /api/chat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
