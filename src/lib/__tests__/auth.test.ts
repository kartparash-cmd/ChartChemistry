import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all heavy dependencies so we only test the config shape
vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/impersonation", () => ({
  getImpersonation: vi.fn(() => undefined),
}));

vi.mock("next-auth/providers/google", () => ({
  default: vi.fn((config: Record<string, unknown>) => ({
    id: "google",
    name: "Google",
    type: "oauth",
    ...config,
  })),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config: Record<string, unknown>) => ({
    id: "credentials",
    name: config.name ?? "credentials",
    type: "credentials",
    ...config,
  })),
}));

let authOptions: typeof import("@/lib/auth").authOptions;

beforeEach(async () => {
  vi.resetModules();

  // Re-apply mocks after reset
  vi.doMock("@auth/prisma-adapter", () => ({
    PrismaAdapter: vi.fn(() => ({})),
  }));
  vi.doMock("bcryptjs", () => ({
    default: { compare: vi.fn(), hash: vi.fn() },
  }));
  vi.doMock("@/lib/prisma", () => ({
    prisma: { user: { findUnique: vi.fn() } },
  }));
  vi.doMock("@/lib/impersonation", () => ({
    getImpersonation: vi.fn(() => undefined),
  }));
  vi.doMock("next-auth/providers/google", () => ({
    default: vi.fn((config: Record<string, unknown>) => ({
      id: "google",
      name: "Google",
      type: "oauth",
      ...config,
    })),
  }));
  vi.doMock("next-auth/providers/credentials", () => ({
    default: vi.fn((config: Record<string, unknown>) => ({
      id: "credentials",
      name: config.name ?? "credentials",
      type: "credentials",
      ...config,
    })),
  }));

  const mod = await import("@/lib/auth");
  authOptions = mod.authOptions;
});

describe("authOptions configuration", () => {
  it("exports authOptions object", () => {
    expect(authOptions).toBeDefined();
    expect(typeof authOptions).toBe("object");
  });

  it("has exactly 2 providers", () => {
    expect(authOptions.providers).toHaveLength(2);
  });

  it("includes a Google provider", () => {
    const google = authOptions.providers.find(
      (p: { id?: string }) => p.id === "google"
    );
    expect(google).toBeDefined();
  });

  it("includes a Credentials provider", () => {
    const creds = authOptions.providers.find(
      (p: { id?: string }) => p.id === "credentials"
    );
    expect(creds).toBeDefined();
  });

  it('uses JWT session strategy', () => {
    expect(authOptions.session).toBeDefined();
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("sets session maxAge to 7 days (604800 seconds)", () => {
    expect(authOptions.session?.maxAge).toBe(7 * 24 * 60 * 60);
  });

  it("has jwt and session callbacks defined", () => {
    expect(authOptions.callbacks).toBeDefined();
    expect(typeof authOptions.callbacks?.jwt).toBe("function");
    expect(typeof authOptions.callbacks?.session).toBe("function");
  });

  it("configures custom signIn page", () => {
    expect(authOptions.pages).toBeDefined();
    expect(authOptions.pages?.signIn).toBe("/auth/signin");
  });

  it("configures custom error page", () => {
    expect(authOptions.pages?.error).toBe("/auth/error");
  });

  it("has an adapter configured", () => {
    expect(authOptions.adapter).toBeDefined();
  });
});
