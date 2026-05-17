import type { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";

export interface AuthedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

type SessionClaims = {
  userId?: string;
  email?: string;
  email_address?: string;
  primaryEmailAddress?: string;
};

function extractUserEmail(claims: SessionClaims | undefined): string | null {
  const rawEmail =
    claims?.email ??
    claims?.email_address ??
    claims?.primaryEmailAddress ??
    null;

  if (!rawEmail) {
    return null;
  }

  return rawEmail.toLowerCase().trim();
}

function parseAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.toLowerCase().trim())
      .filter(Boolean),
  );
}

export async function getUserEmailFromClerk(userId: string): Promise<string | null> {
  const user = await clerkClient.users.getUser(userId);
  return user.emailAddresses[0]?.emailAddress?.toLowerCase().trim() ?? null;
}

export async function getAdminContext(userId: string): Promise<{
  userEmail: string | null;
  isAdmin: boolean;
}> {
  const adminEmails = parseAdminEmails();

  if (adminEmails.size === 0) {
    throw new Error("ADMIN_EMAILS is not configured");
  }

  const userEmail = await getUserEmailFromClerk(userId);

  return {
    userEmail,
    isAdmin: Boolean(userEmail && adminEmails.has(userEmail)),
  };
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  const sessionClaims = auth?.sessionClaims as SessionClaims | undefined;
  const userId =
    sessionClaims?.userId || auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.userId = userId;
  req.userEmail = extractUserEmail(sessionClaims) ?? undefined;
  next();
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  requireAuth(req, res, async () => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const { userEmail, isAdmin } = await getAdminContext(userId);

      req.userEmail = userEmail ?? undefined;

      if (!isAdmin) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      next();
    } catch (error) {
      if (error instanceof Error && error.message === "ADMIN_EMAILS is not configured") {
        res.status(500).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Failed to load user from Clerk" });
    }
  });
}
