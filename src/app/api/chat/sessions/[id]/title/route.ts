/**
 * POST /api/chat/sessions/[id]/title — Generate an AI title for a chat session
 *
 * Requires authenticated user with PREMIUM plan.
 * Verifies session ownership before generating title.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateChatTitle } from "@/lib/claude";
import type { ChatMessage } from "@/types/astrology";

interface StoredEntry {
  role: string;
  content: string;
  timestamp?: string;
  _type?: string;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // --- 1. Auth + premium check ---
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

    // --- 2. Get session ID from params ---
    const { id } = await params;

    // --- 3. Ownership check ---
    const chatSession = await prisma.chatSession.findUnique({
      where: { id },
    });

    if (!chatSession || chatSession.deletedAt !== null) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    if (chatSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this chat session" },
        { status: 403 }
      );
    }

    // --- 4. Extract messages, skip context summaries ---
    const storedEntries = (chatSession.messages as unknown as StoredEntry[]) || [];
    const messages: ChatMessage[] = storedEntries
      .filter((entry) => entry._type !== "context_summary")
      .map((entry) => ({
        role: entry.role as "user" | "assistant",
        content: entry.content,
        timestamp: entry.timestamp || new Date().toISOString(),
      }));

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No messages in session to generate title from" },
        { status: 400 }
      );
    }

    // --- 5. Generate title ---
    const title = await generateChatTitle(messages);

    // --- 6. Update session title ---
    await prisma.chatSession.update({
      where: { id },
      data: { title },
    });

    return NextResponse.json({ title });
  } catch (error) {
    console.error("[POST /api/chat/sessions/[id]/title] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
