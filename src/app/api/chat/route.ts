/**
 * GET  /api/chat  — Load the most recent chat session (optionally by reportId)
 * POST /api/chat  — Send a message to Marie
 *
 * Requires authenticated user with PREMIUM plan.
 *
 * POST optionally accepts a reportId for chart-aware conversation
 * and a sessionId to continue an existing conversation.
 *
 * AI Memory: When a sessionId is provided, loads previous messages
 * and includes them as conversation history. For long conversations
 * (20+ messages), generates a summary and uses summary + last 5
 * messages instead of all messages.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatWithAstrologer, buildChatContext } from "@/lib/claude";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import type { ChatMessage, ChatRequest } from "@/types/astrology";
import type { Prisma } from "@/generated/prisma/client";
import Anthropic from "@anthropic-ai/sdk";

// ============================================================
// Rate limiter: 20 requests per hour per user
// ============================================================

const chatRateLimiter = createRateLimiter(20, 60 * 60 * 1000, "chat");

// ============================================================
// Conversation summary helpers
// ============================================================

/** Metadata entry stored alongside messages in the JSON array. */
interface ConversationSummaryMeta {
  role: "system";
  content: string;
  timestamp: string;
  _type: "context_summary";
}

type StoredEntry = ChatMessage | ConversationSummaryMeta;

function isContextSummary(entry: StoredEntry): entry is ConversationSummaryMeta {
  return (entry as ConversationSummaryMeta)._type === "context_summary";
}

/**
 * Generate a brief summary of the conversation so far using Claude.
 * This runs in the background after a response is sent to avoid
 * blocking the user.
 */
async function generateConversationSummary(
  messages: ChatMessage[]
): Promise<string> {
  let _claude: Anthropic | null = null;
  if (!process.env.ANTHROPIC_API_KEY) {
    return "";
  }
  _claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "Astrologer"}: ${m.content}`)
    .join("\n\n");

  const response = await _claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system:
      "You are a helpful assistant. Summarize the following astrology chat conversation into a brief paragraph (3-5 sentences). " +
      "Capture the key topics discussed, any specific astrological aspects or placements mentioned, the user's main concerns or questions, " +
      "and any advice given. This summary will be used as context for future conversations.",
    messages: [
      {
        role: "user",
        content: `Please summarize this conversation:\n\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text.trim() : "";
}

/**
 * Extract the existing summary from stored entries (if any).
 */
function extractExistingSummary(
  entries: StoredEntry[]
): string | null {
  const summaryEntry = entries.find(isContextSummary);
  return summaryEntry ? summaryEntry.content : null;
}

/**
 * Extract only ChatMessage entries (excluding metadata).
 */
function extractMessages(entries: StoredEntry[]): ChatMessage[] {
  return entries.filter((e) => !isContextSummary(e)) as ChatMessage[];
}

// ============================================================
// GET — Load existing chat session
// ============================================================

export async function GET(request: NextRequest) {
  try {
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
        { error: "Premium plan required" },
        { status: 403 }
      );
    }

    const reportId = request.nextUrl.searchParams.get("reportId") || undefined;

    // Find the most recent chat session for this user, optionally scoped to a report
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        userId: session.user.id,
        reportId: reportId ?? null,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!chatSession) {
      return NextResponse.json({ messages: [], sessionId: null, sessionDate: null });
    }

    // Extract only actual messages (not metadata) for the frontend
    const storedEntries = chatSession.messages as unknown as StoredEntry[];
    const messages = extractMessages(storedEntries);

    return NextResponse.json({
      messages,
      sessionId: chatSession.id,
      sessionDate: chatSession.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[GET /api/chat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — Send message
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
            "Chat with Marie is available to Premium and Annual subscribers.",
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
    let storedEntries: StoredEntry[] = [];
    let chatSessionId = body.sessionId;
    let existingSummary: string | null = null;

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

      storedEntries = (existingSession.messages as unknown as StoredEntry[]) || [];
      existingSummary = extractExistingSummary(storedEntries);
    }

    // Get only the actual chat messages (no metadata)
    const conversationHistory = extractMessages(storedEntries);

    // --- 5. Build messages array for Claude ---
    const newUserMessage: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    conversationHistory.push(newUserMessage);

    // --- 5b. Build context-aware message list ---
    // For long conversations (20+ messages), use summary + last 5 messages
    // Otherwise, use last 10 messages from history
    let messagesToSend: ChatMessage[];
    let contextSummaryForPrompt: string | undefined;

    if (conversationHistory.length > 20 && existingSummary) {
      // Use summary + last 5 messages for token efficiency
      contextSummaryForPrompt = existingSummary;
      messagesToSend = conversationHistory.slice(-5);
    } else if (conversationHistory.length > 10) {
      // Use last 10 messages
      messagesToSend = conversationHistory.slice(-10);
    } else {
      messagesToSend = conversationHistory;
    }

    // Build enhanced chart context with conversation summary if available
    let enhancedChartContext = chartContext;
    if (contextSummaryForPrompt) {
      const summaryBlock = `\n\nPREVIOUS CONVERSATION SUMMARY (use this to maintain continuity with earlier discussion):\n${contextSummaryForPrompt}`;
      enhancedChartContext = enhancedChartContext
        ? enhancedChartContext + summaryBlock
        : summaryBlock;
    }

    // --- 6. Call Claude API ---
    const aiReply = await chatWithAstrologer(messagesToSend, enhancedChartContext);

    // --- 7. Save conversation ---
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: aiReply,
      timestamp: new Date().toISOString(),
    };

    conversationHistory.push(assistantMessage);

    // Build the entries to store (messages + optional summary metadata)
    const entriesToStore: StoredEntry[] = [...conversationHistory];

    // Preserve existing summary in stored entries
    if (existingSummary) {
      entriesToStore.unshift({
        role: "system",
        content: existingSummary,
        timestamp: new Date().toISOString(),
        _type: "context_summary",
      });
    }

    if (chatSessionId) {
      // Update existing session
      await prisma.chatSession.update({
        where: { id: chatSessionId },
        data: {
          messages: JSON.parse(JSON.stringify(entriesToStore)) as Prisma.InputJsonValue,
        },
      });
    } else {
      // Create new session
      const newSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          reportId: body.reportId || null,
          messages: JSON.parse(JSON.stringify(entriesToStore)) as Prisma.InputJsonValue,
        },
      });
      chatSessionId = newSession.id;
    }

    // --- 8. Generate summary if conversation has reached 20+ messages ---
    // This runs asynchronously after the response is sent
    const totalMessages = conversationHistory.length;
    if (
      totalMessages >= 20 &&
      totalMessages % 10 === 0 // Re-summarize every 10 messages after 20
    ) {
      // Fire-and-forget: generate summary in the background
      generateConversationSummary(conversationHistory)
        .then(async (summary) => {
          if (!summary || !chatSessionId) return;

          // Update the stored entries with the new summary
          const updatedEntries: StoredEntry[] = [
            {
              role: "system",
              content: summary,
              timestamp: new Date().toISOString(),
              _type: "context_summary",
            },
            ...conversationHistory,
          ];

          await prisma.chatSession.update({
            where: { id: chatSessionId },
            data: {
              messages: JSON.parse(JSON.stringify(updatedEntries)) as Prisma.InputJsonValue,
            },
          });
        })
        .catch((err) => {
          console.error("[POST /api/chat] Summary generation failed:", err);
        });
    }

    // --- 9. Return response ---
    return NextResponse.json({
      reply: aiReply,
      sessionId: chatSessionId,
      hasHistory: totalMessages > 1,
    });
  } catch (error) {
    console.error("[POST /api/chat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
