import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getImpersonation } from "@/lib/impersonation";
import { createRateLimiter } from "@/lib/rate-limit";

// Signin rate limiter: 5 attempts per 15 minutes per email
// Redis-backed (Upstash) with in-memory fallback
const signinLimiter = createRateLimiter(5, 15 * 60 * 1000, "signin");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { allowed } = await signinLimiter.check(credentials.email.toLowerCase());
        if (!allowed) {
          throw new Error("Too many sign-in attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email address before signing in. Check your inbox for the verification link.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          plan: user.plan,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        const adminId = token.sub;
        const impersonatedId = getImpersonation(adminId);

        if (impersonatedId) {
          session.user.id = impersonatedId;
          session.user.realId = adminId;
          // Fetch impersonated user's plan and role from DB
          try {
            const impersonatedUser = await prisma.user.findUnique({
              where: { id: impersonatedId },
              select: { plan: true, role: true },
            });
            if (impersonatedUser) {
              session.user.plan = impersonatedUser.plan;
              session.user.role = impersonatedUser.role;
            } else {
              session.user.plan = token.plan as string;
              session.user.role = token.role as string;
            }
          } catch {
            // Fall back to admin's token values on DB error
            session.user.plan = token.plan as string;
            session.user.role = token.role as string;
          }
        } else {
          session.user.id = token.sub;
          session.user.plan = token.plan as string;
          session.user.role = token.role as string;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.plan = (user as { plan?: string }).plan ?? "FREE";
        token.role = (user as { role?: string }).role ?? "USER";
      }
      // Only refresh from DB every 5 minutes (not every request)
      const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();
      const lastRefresh = (token.lastRefresh as number) || 0;

      if (trigger === "update" || (token.sub && !user && now - lastRefresh > REFRESH_INTERVAL)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { plan: true, role: true },
          });
          if (dbUser) {
            token.plan = dbUser.plan;
            token.role = dbUser.role;
          }
          token.lastRefresh = now;
        } catch {
          // Keep existing values on DB error
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
