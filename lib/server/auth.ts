import { auth } from "@/auth";
import { db } from "./db";
import { AuthError, ForbiddenError } from "@/lib/errors";

/**
 * Get the current authenticated user with id and role
 * Returns null if not authenticated
 * 
 * This is a lightweight version that only fetches id and role.
 * Use requireAuth() if you need the full user object with relations.
 */
export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
    },
  });

  return user;
}

/**
 * Get the current authenticated user with full details
 * Returns null if not authenticated
 */
export async function getCurrentUserFull() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      reputation: true,
    },
  });

  return user;
}

/**
 * Require authentication - throws AuthError if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUserFull();

  if (!user) {
    throw new AuthError("Unauthorized");
  }

  return user;
}

/**
 * Require specific role - throws ForbiddenError if user doesn't have role
 */
export async function requireRole(role: "buyer" | "seller" | "admin") {
  const user = await requireAuth();

  if (user.role !== role && user.role !== "admin") {
    throw new ForbiddenError(`Requires ${role} role`);
  }

  return user;
}

