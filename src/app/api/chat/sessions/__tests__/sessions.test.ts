import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ============================================================
// Mocks
// ============================================================

vi.mock("@/lib/prisma", () => ({
  prisma: {
    chatSession: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GET, DELETE } from "../route";

const mockGetServerSession = vi.mocked(getServerSession);
const mockFindMany = vi.mocked(prisma.chatSession.findMany);
const mockUpdateMany = vi.mocked(prisma.chatSession.updateMany);

// ============================================================
// Helpers
// ============================================================

function makeRequest(url = "http://localhost:3000/api/chat/sessions") {
  return new NextRequest(url);
}

function makePremiumSession(plan: "PREMIUM" | "ANNUAL" = "PREMIUM") {
  return {
    user: {
      id: "user-123",
      email: "test@example.com",
      plan,
    },
  };
}

function makeFreeSession() {
  return {
    user: {
      id: "user-456",
      email: "free@example.com",
      plan: "FREE",
    },
  };
}

function makeChatSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    userId: "user-123",
    title: "Chat about Aries",
    pinned: false,
    archived: false,
    deletedAt: null,
    messages: [
      { role: "user", content: "Tell me about Aries" },
      { role: "assistant", content: "Aries is a fire sign..." },
    ],
    createdAt: new Date("2026-03-01T00:00:00Z"),
    updatedAt: new Date("2026-03-15T00:00:00Z"),
    ...overrides,
  };
}

// ============================================================
// Tests
// ============================================================

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/chat/sessions", () => {
  it("returns 401 for unauthenticated request", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns 403 for free plan user", async () => {
    mockGetServerSession.mockResolvedValue(makeFreeSession());

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("Premium plan required");
  });

  it("returns empty array for user with no sessions", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sessions).toEqual([]);
  });

  it("returns sessions sorted by pinned desc, updatedAt desc", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());

    const sessions = [
      makeChatSession({ id: "pinned-1", pinned: true, title: "Pinned Chat" }),
      makeChatSession({ id: "recent-1", title: "Recent Chat" }),
    ];
    mockFindMany.mockResolvedValue(sessions as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sessions).toHaveLength(2);
    expect(body.sessions[0].id).toBe("pinned-1");
    expect(body.sessions[1].id).toBe("recent-1");

    // Verify Prisma was called with correct orderBy
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      })
    );
  });

  it("filters pinned sessions when filter=pinned", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());
    mockFindMany.mockResolvedValue([]);

    const url = "http://localhost:3000/api/chat/sessions?filter=pinned";
    await GET(makeRequest(url));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          pinned: true,
          archived: false,
          deletedAt: null,
          userId: "user-123",
        }),
      })
    );
  });

  it("filters archived sessions when filter=archived", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());
    mockFindMany.mockResolvedValue([]);

    const url = "http://localhost:3000/api/chat/sessions?filter=archived";
    await GET(makeRequest(url));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          archived: true,
          deletedAt: null,
          userId: "user-123",
        }),
      })
    );
  });

  it("excludes archived sessions by default (filter=all)", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());
    mockFindMany.mockResolvedValue([]);

    await GET(makeRequest());

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          archived: false,
          deletedAt: null,
        }),
      })
    );
  });

  it("builds session summaries with correct messageCount and lastMessage", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());

    const sessionData = makeChatSession({
      messages: [
        { role: "user", content: "First question" },
        { role: "assistant", content: "First answer" },
        { role: "user", content: "Second question" },
        { role: "assistant", content: "Second answer" },
      ],
    });
    mockFindMany.mockResolvedValue([sessionData] as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.sessions[0].messageCount).toBe(4);
    expect(body.sessions[0].lastMessage).toBe("Second question");
  });

  it("truncates long lastMessage to 80 characters", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());

    const longMessage = "A".repeat(120);
    const sessionData = makeChatSession({
      messages: [{ role: "user", content: longMessage }],
    });
    mockFindMany.mockResolvedValue([sessionData] as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.sessions[0].lastMessage).toBe("A".repeat(80) + "...");
  });

  it("filters context_summary entries from message count", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());

    const sessionData = makeChatSession({
      messages: [
        { role: "user", content: "Hello" },
        { role: "system", content: "Summary of context", timestamp: "2026-03-01", _type: "context_summary" },
        { role: "assistant", content: "Hi there!" },
      ],
    });
    mockFindMany.mockResolvedValue([sessionData] as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    // context_summary should be excluded from count
    expect(body.sessions[0].messageCount).toBe(2);
  });

  it("works with ANNUAL plan users", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession("ANNUAL"));
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sessions).toEqual([]);
  });
});

describe("DELETE /api/chat/sessions", () => {
  it("returns 401 for unauthenticated request", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const res = await DELETE();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns 403 for free plan user", async () => {
    mockGetServerSession.mockResolvedValue(makeFreeSession());

    const res = await DELETE();
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("Premium plan required");
  });

  it("soft deletes all user sessions and returns count", async () => {
    mockGetServerSession.mockResolvedValue(makePremiumSession());
    mockUpdateMany.mockResolvedValue({ count: 5 } as never);

    const res = await DELETE();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(5);

    // Verify Prisma was called with correct where + data
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        deletedAt: null,
      },
      data: {
        deletedAt: expect.any(Date),
      },
    });
  });
});
