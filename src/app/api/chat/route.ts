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
import * as Sentry from "@sentry/nextjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatWithAstrologer, chatWithAstrologerStreaming, buildChatContext, generateChatTitle, extractMemories, classifyConversation } from "@/lib/claude";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import { awardAchievement } from "@/lib/achievements";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { moderateContent, moderateOutput, MODERATION_RESPONSE } from "@/lib/moderation";
import type { ChatMessage, ChatRequest } from "@/types/astrology";
import type { Prisma } from "@/generated/prisma/client";

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
  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "Astrologer"}: ${m.content}`)
    .join("\n\n");

  const response = await getOpenAIClient().chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 512,
    temperature: 0.5,
    messages: [
      { role: "system", content: "You are a helpful assistant. Summarize the following astrology chat conversation into a brief paragraph (3-5 sentences). Capture the key topics discussed, any specific astrological aspects mentioned, and the main advice or insights given. This summary will be used to maintain context in future conversations." },
      { role: "user", content: transcript },
    ],
  });
  return response.choices[0]?.message?.content?.trim() || "";
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
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    // If a specific sessionId is provided, load that session directly
    // Otherwise, find the most recent chat session for this user
    const chatSession = sessionId
      ? await prisma.chatSession.findUnique({
          where: {
            id: sessionId,
            userId: session.user.id,
            deletedAt: null,
          },
        })
      : await prisma.chatSession.findFirst({
          where: {
            userId: session.user.id,
            reportId: reportId ?? null,
            deletedAt: null,
            archived: false,
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
    const rateLimitResult = await chatRateLimiter.check(rateLimitKey);

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

    // --- 1b. Load Marie's long-term memories for this user ---
    const memories = await prisma.marieMemory.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

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

    const userMessage = sanitizeInput(body.message.trim());

    // Limit message length to prevent abuse
    if (userMessage.length > 2000) {
      return NextResponse.json(
        { error: "Message too long. Maximum 2000 characters." },
        { status: 400 }
      );
    }

    // --- 2b. Content moderation (input) ---
    const inputModeration = moderateContent(userMessage);
    if (!inputModeration.safe) {
      console.warn(
        `[POST /api/chat] Message moderated | user=${session.user.id} category=${inputModeration.reason}`
      );
      return NextResponse.json({
        reply: MODERATION_RESPONSE,
        sessionId: body.sessionId || null,
        hasHistory: false,
        moderated: true,
      });
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
    const chatSessionId = body.sessionId;
    let existingSummary: string | null = null;

    if (chatSessionId) {
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: chatSessionId, deletedAt: null },
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

    // --- 5c. Inject long-term memories into context ---
    if (memories.length > 0) {
      const memoryBlock =
        "\n\nMARIE'S MEMORY (facts you remember about this user from past sessions — reference these naturally):\n" +
        memories.map((m) => `- ${m.key}: ${m.value}`).join("\n");
      enhancedChartContext = enhancedChartContext
        ? enhancedChartContext + memoryBlock
        : memoryBlock;
    }

    // --- 5d. Check if user has been away (7+ days since last chat) ---
    if (conversationHistory.length <= 1) {
      const lastSession = await prisma.chatSession.findFirst({
        where: { userId: session.user.id, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      });
      if (lastSession) {
        const daysSinceLastChat = Math.floor((Date.now() - lastSession.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastChat >= 7) {
          const returnBlock = `\n\nUSER RETURN CONTEXT: This user hasn't chatted in ${daysSinceLastChat} days. Proactively check in with them — ask how things have been, reference their transits and any memories you have. Be warm and show you noticed they've been away.`;
          enhancedChartContext = enhancedChartContext
            ? enhancedChartContext + returnBlock
            : returnBlock;
        }
      }
    }

    // --- 5e. Fetch current transits for first message in a session ---
    // Gives Marie context to proactively mention relevant cosmic events
    if (conversationHistory.length <= 1) {
      try {
        const userProfile = await prisma.birthProfile.findFirst({
          where: { userId: session.user.id },
          orderBy: { createdAt: "asc" },
        });
        if (userProfile && userProfile.chartData) {
          const { calculateTransits } = await import("@/lib/astro-client");
          const today = new Date().toISOString().split("T")[0];
          const transitData = await calculateTransits(
            {
              birthDate: userProfile.birthDate.toISOString().split("T")[0],
              birthTime: userProfile.birthTime || undefined,
              latitude: userProfile.latitude,
              longitude: userProfile.longitude,
              timezone: userProfile.timezone,
            },
            today
          );

          if (
            transitData &&
            transitData.aspectsToNatal &&
            transitData.aspectsToNatal.length > 0
          ) {
            const transitBlock =
              "\n\nCURRENT TRANSITS (mention 1-2 of these naturally if relevant to the user's question):\n" +
              transitData.aspectsToNatal
                .slice(0, 5)
                .map(
                  (t) =>
                    `Transit ${t.transitingPlanet} ${t.aspect} Natal ${t.natalPlanet} (${t.orb.toFixed(1)}° orb) — ${t.keywords}`
                )
                .join("\n");
            enhancedChartContext = enhancedChartContext
              ? enhancedChartContext + transitBlock
              : transitBlock;
          }
        }
      } catch (err) {
        console.error(
          "[POST /api/chat] Transit fetch failed (non-blocking):",
          err
        );
      }
    }

    // --- 6. Determine if client wants streaming ---
    const wantsStream =
      request.headers.get("accept") === "text/event-stream" ||
      body.stream === true;

    // --- Helper: run all background tasks after AI reply is complete ---
    const runBackgroundTasks = async (aiReply: string, resolvedSessionId: string | undefined) => {
      // Content moderation (output — defense-in-depth)
      const outputModeration = moderateOutput(aiReply);
      if (!outputModeration.safe) {
        console.warn(
          `[POST /api/chat] AI output moderated | user=${session.user.id} category=${outputModeration.reason}`
        );
        // For streaming, moderation happens after the fact — log but cannot retract
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiReply,
        timestamp: new Date().toISOString(),
      };

      conversationHistory.push(assistantMessage);

      // Build the entries to store (messages + optional summary metadata)
      const entriesToStore: StoredEntry[] = [...conversationHistory];

      if (existingSummary) {
        entriesToStore.unshift({
          role: "system",
          content: existingSummary,
          timestamp: new Date().toISOString(),
          _type: "context_summary",
        });
      }

      let finalSessionId = resolvedSessionId;

      if (finalSessionId) {
        await prisma.chatSession.update({
          where: { id: finalSessionId },
          data: {
            messages: JSON.parse(JSON.stringify(entriesToStore)) as Prisma.InputJsonValue,
          },
        });
      } else {
        const newSession = await prisma.chatSession.create({
          data: {
            userId: session.user.id,
            reportId: body.reportId || null,
            messages: JSON.parse(JSON.stringify(entriesToStore)) as Prisma.InputJsonValue,
          },
        });
        finalSessionId = newSession.id;
      }

      // Generate summary if conversation has reached 20+ messages
      const totalMessages = conversationHistory.length;
      if (totalMessages >= 20 && totalMessages % 10 === 0) {
        const summarySessionId = finalSessionId;
        generateConversationSummary(conversationHistory)
          .then(async (summary) => {
            if (!summary || !summarySessionId) return;
            await prisma.$transaction(async (tx) => {
              const currentSession = await tx.chatSession.findUnique({
                where: { id: summarySessionId },
              });
              if (!currentSession) return;
              const currentEntries = (currentSession.messages as unknown as StoredEntry[]) || [];
              const entriesWithoutSummary = currentEntries.filter((e) => !isContextSummary(e));
              const updatedEntries: StoredEntry[] = [
                {
                  role: "system",
                  content: summary,
                  timestamp: new Date().toISOString(),
                  _type: "context_summary",
                },
                ...entriesWithoutSummary,
              ];
              await tx.chatSession.update({
                where: { id: summarySessionId },
                data: {
                  messages: JSON.parse(JSON.stringify(updatedEntries)) as Prisma.InputJsonValue,
                },
              });
            });
          })
          .catch((err) => {
            console.error("[POST /api/chat] Summary generation failed:", err);
          });
      }

      // Auto-generate title after first exchange
      if (finalSessionId && conversationHistory.length <= 3) {
        const chatMessages = conversationHistory.filter((e: any) => !e._type) as ChatMessage[];
        if (chatMessages.length >= 2) {
          generateChatTitle(chatMessages)
            .then(async (title) => {
              if (!title || !finalSessionId) return;
              await prisma.chatSession.update({
                where: { id: finalSessionId, title: null },
                data: { title },
              });
            })
            .catch((err) => {
              console.error("[POST /api/chat] Title generation failed:", err);
            });
        }
      }

      // Anonymized analytics
      try {
        const analytics = classifyConversation(
          userMessage,
          aiReply,
          !!enhancedChartContext,
          memories.length > 0
        );
        prisma.marieAnalytics.create({ data: analytics }).catch((err) => console.warn("[chat] Analytics save failed:", err instanceof Error ? err.message : "unknown"));
      } catch {
        // Non-blocking
      }

      // Extract long-term memories
      extractMemories(
        conversationHistory.slice(-4),
        memories.map((m) => ({ key: m.key, value: m.value }))
      )
        .then(async (newMemories) => {
          for (const mem of newMemories) {
            await prisma.marieMemory.upsert({
              where: {
                userId_key: { userId: session.user.id, key: mem.key },
              },
              create: {
                userId: session.user.id,
                key: mem.key,
                value: mem.value,
              },
              update: { value: mem.value },
            });
          }
        })
        .catch((err) =>
          console.error("[Marie Memory] Extraction failed:", err)
        );

      // Award FIRST_CHAT achievement
      awardAchievement(session.user.id, "FIRST_CHAT").catch((err) =>
        console.warn("[POST /api/chat] Achievement award failed:", err)
      );

      return finalSessionId;
    };

    // --- 6a. Streaming path ---
    if (wantsStream) {
      const stream = chatWithAstrologerStreaming(
        messagesToSend,
        enhancedChartContext,
        (fullText: string) => {
          // This callback fires after the stream completes.
          // Run all background tasks (save, summary, memories, etc.)
          runBackgroundTasks(fullText, chatSessionId).catch((err) => {
            console.error("[POST /api/chat] Streaming background tasks failed:", err);
          });
        }
      );

      // Send the sessionId in the first SSE event so the client can track it
      const encoder = new TextEncoder();
      const sessionIdStream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ sessionId: chatSessionId || null })}\n\n`)
          );
          controller.close();
        },
      });

      // Concatenate the sessionId event + the AI text stream
      const combinedStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          // First: send sessionId
          const sessionReader = sessionIdStream.getReader();
          while (true) {
            const { done, value } = await sessionReader.read();
            if (done) break;
            controller.enqueue(value);
          }

          // Then: pipe the AI stream
          const aiReader = stream.getReader();
          while (true) {
            const { done, value } = await aiReader.read();
            if (done) break;
            controller.enqueue(value);
          }

          controller.close();
        },
      });

      return new Response(combinedStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // --- 6b. Non-streaming path (backward compatible) ---
    let aiReply = await chatWithAstrologer(messagesToSend, enhancedChartContext);

    // Content moderation (output — defense-in-depth)
    const outputModeration = moderateOutput(aiReply);
    if (!outputModeration.safe) {
      console.warn(
        `[POST /api/chat] AI output moderated | user=${session.user.id} category=${outputModeration.reason}`
      );
      aiReply =
        "I'd love to help you explore your astrological chart! " +
        "Could you rephrase your question? I'm best at topics like compatibility, " +
        "transits, birth charts, and relationship insights.";
    }

    const finalSessionId = await runBackgroundTasks(aiReply, chatSessionId);
    const totalMessages = conversationHistory.length;

    // --- 10. Return response ---
    return NextResponse.json({
      reply: aiReply,
      sessionId: finalSessionId,
      hasHistory: totalMessages > 1,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("[POST /api/chat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
