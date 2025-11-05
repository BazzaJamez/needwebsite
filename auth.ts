import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/lib/server/db";
import type { DefaultSession } from "next-auth";
import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";

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

// Custom adapter that handles verification tokens and accounts, but uses JWT sessions
const customAdapter: Adapter = {
  async createUser(user: Omit<AdapterUser, "id">) {
    // Create user in database
    const created = await db.user.create({
      data: {
        email: user.email!,
        name: user.name || null,
        avatarUrl: user.image || null,
        role: "buyer", // Set default role
        emailVerified: user.emailVerified || null,
        reputation: {
          create: {
            ratingAvg: 0,
            ratingCount: 0,
            badges: [],
          },
        },
      },
    });
    return {
      id: created.id,
      email: created.email,
      emailVerified: created.emailVerified,
      name: created.name,
      image: created.avatarUrl,
    } as AdapterUser;
  },
  async getUser(id: string) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.avatarUrl,
    } as AdapterUser;
  },
  async getUserByEmail(email: string) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.avatarUrl,
    } as AdapterUser;
  },
  async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
    const account = await db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    });
    if (!account) return null;
    return {
      id: account.user.id,
      email: account.user.email,
      emailVerified: account.user.emailVerified,
      name: account.user.name,
      image: account.user.avatarUrl,
    } as AdapterUser;
  },
  async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
    const updateData: {
      email?: string;
      emailVerified?: Date | null;
      name?: string | null;
      avatarUrl?: string | null;
    } = {};
    
    if (user.email !== undefined) updateData.email = user.email;
    if (user.emailVerified !== undefined) updateData.emailVerified = user.emailVerified;
    if (user.name !== undefined) updateData.name = user.name;
    if (user.image !== undefined) updateData.avatarUrl = user.image;
    
    const updated = await db.user.update({
      where: { id: user.id },
      data: updateData,
    });
    return {
      id: updated.id,
      email: updated.email,
      emailVerified: updated.emailVerified,
      name: updated.name,
      image: updated.avatarUrl,
    } as AdapterUser;
  },
  async linkAccount(account: AdapterAccount) {
    await db.account.create({
      data: {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      },
    });
  },
  async createVerificationToken({ identifier, token, expires }) {
    const verificationToken = await db.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });
    return verificationToken;
  },
  async useVerificationToken({ identifier, token }) {
    try {
      const verificationToken = await db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier,
            token,
          },
        },
      });
      
      // Update emailVerified when token is used
      if (verificationToken) {
        await db.user.updateMany({
          where: { email: identifier },
          data: { emailVerified: new Date() },
        });
      }
      
      return verificationToken;
    } catch {
      return null;
    }
  },
  async deleteUser(userId) {
    await db.user.delete({ where: { id: userId } });
  },
  async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
    await db.account.delete({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
  },
};

// Full auth config with all providers (for API routes and server components)
// Uses JWT sessions to be compatible with Edge Runtime (middleware)
// Custom adapter handles Account/VerificationToken storage, but sessions are JWT
// Note: This file imports EmailProvider, so it should NOT be imported in middleware
// Use auth.middleware.ts for middleware instead
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: customAdapter,
  providers: [
    EmailProvider({
      // Dummy server config required by EmailProvider (we use custom sendVerificationRequest instead)
      // Provide minimal config to satisfy the requirement, but it won't be used
      server: {
        host: process.env.EMAIL_SERVER_HOST || "localhost",
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: process.env.EMAIL_SERVER_USER
          ? {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            }
          : undefined,
      },
      from: process.env.EMAIL_FROM || "noreply@localhost",
      // For development, log to console instead of sending emails
      sendVerificationRequest: async ({ identifier, url }) => {
        if (process.env.NODE_ENV === "development") {
          console.log("\n🔐 Magic Link Email (Dev Mode):");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.log("To:", identifier);
          console.log("URL:", url);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
          return;
        }
        // In production, use Resend or another email service
        const { host } = new URL(url);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: identifier,
            subject: `Sign in to ${host}`,
            html: `
              <html>
                <body>
                  <p>Click the link below to sign in:</p>
                  <p><a href="${url}">Sign in</a></p>
                  <p>If you didn't request this, you can safely ignore this email.</p>
                </body>
              </html>
            `,
          }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(`Failed to send email: ${error.message}`);
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // When user signs in, custom adapter creates/finds the User record
      // Store user id and fetch role from database
      if (user) {
        token.id = user.id;
        
        // Fetch user role from database (custom adapter already created the user)
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        token.role = dbUser?.role || "buyer";
      }
      
      // Refresh role on session update
      if (trigger === "update" && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role || "buyer";
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "buyer";
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Custom adapter handles user creation with default role and reputation
      // This callback is mainly for OAuth providers to sync additional profile data
      if (user.id && account?.provider === "github" && user.email) {
        // Update user with OAuth profile data if needed
        await db.user.update({
          where: { id: user.id },
          data: {
            name: user.name || undefined,
            avatarUrl: user.image || undefined,
          },
        });
      }
      return true;
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


