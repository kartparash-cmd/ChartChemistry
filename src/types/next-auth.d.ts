import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan: string;
      role: string;
      realId?: string;
    };
  }

  interface User {
    plan?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: string;
    role?: string;
    impersonatingId?: string;
  }
}
