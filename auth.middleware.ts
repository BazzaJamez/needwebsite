// Separate auth config for middleware (Edge Runtime compatible)
// Uses JWT sessions to avoid Prisma Client dependency in Edge Runtime
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

// Middleware-specific auth config using JWT sessions (no Prisma/DB access)
// This avoids Prisma Client dependency since middleware runs in Edge Runtime
export const { auth: authMiddleware } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    // Only GitHub provider - EmailProvider excluded to avoid nodemailer bundling
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Store user id and role in token when user signs in
      if (user) {
        token.id = user.id;
        token.role = user.role || "buyer";
      }
      return token;
    },
    async session({ session, token }) {
      // Extract user id and role from token (no DB access needed)
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "buyer";
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin",
  },
  session: {
    strategy: "jwt",
  },
});

