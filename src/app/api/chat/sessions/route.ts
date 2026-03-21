/**
 * GET    /api/chat/sessions — List all chat sessions for the authenticated user
 * DELETE /api/chat/sessions — Soft-delete all chat sessions for the authenticated user
 *
 * Requires authenticated user with PREMIUM or ANNUAL plan.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ============================================================
// Types
// ============================================================

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ContextSummaryMeta {
  role: "system";
  content: string;
  timestamp: string;
  _type: "context_summary";
}

type StoredEntry = ChatMessage | ContextSummaryMeta;

function isContextSummary(entry: StoredEntry): entry is ContextSummaryMeta {
  return (entry as ContextSummaryMeta)._type === "context_summary";
}

interface SessionSummary {
  id: string;
  title: string | null;
  pinned: boolean;
  archived: boolean;
  messageCount: number;
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// GET — List sessions
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

    // Parse query params
    const filter = request.nextUrl.searchParams.get("filter") || "all";
    const search = request.nextUrl.searchParams.get("search") || undefined;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      userId: session.user.id,
      deletedAt: null,
    };

    if (filter === "pinned") {
      where.pinned = true;
      where.archived = false;
    } else if (filter === "archived") {
      where.archived = true;
    } else {
      // "all" — show non-archived
      where.archived = false;
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const chatSessions = await prisma.chatSession.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });

    // Build session summaries
    const sessions: SessionSummary[] = chatSessions.map((cs) => {
      const entries = (cs.messages as unknown as StoredEntry[]) || [];
      const messages = entries.filter((e) => !isContextSummary(e)) as ChatMessage[];

      // Find last user message
      let lastMessage: string | null = null;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          const content = messages[i].content;
          lastMessage =
            content.length > 80 ? content.substring(0, 80) + "..." : content;
          break;
        }
      }

      return {
        id: cs.id,
        title: cs.title,
        pinned: cs.pinned,
        archived: cs.archived,
        messageCount: messages.length,
        lastMessage,
        createdAt: cs.createdAt.toISOString(),
        updatedAt: cs.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[GET /api/chat/sessions] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE — Soft-delete all sessions
// ============================================================

export async function DELETE() {
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

    const result = await prisma.chatSession.updateMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("[DELETE /api/chat/sessions] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
