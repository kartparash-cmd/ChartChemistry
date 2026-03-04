import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getImpersonation } from "@/lib/impersonation";

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
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
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        const adminId = token.sub;
        const impersonatedId = getImpersonation(adminId);

        if (impersonatedId) {
          session.user.id = impersonatedId;
          session.user.realId = adminId;
        } else {
          session.user.id = token.sub;
        }

        session.user.plan = token.plan as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.plan = (user as { plan?: string }).plan ?? "FREE";
        token.role = (user as { role?: string }).role ?? "USER";
      }
      // Refresh plan and role from DB on session update or periodically
      if (trigger === "update" || (token.sub && !user)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { plan: true, role: true },
          });
          if (dbUser) {
            token.plan = dbUser.plan;
            token.role = dbUser.role;
          }
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
