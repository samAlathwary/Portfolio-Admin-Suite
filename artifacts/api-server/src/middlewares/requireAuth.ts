import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

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
  requireAuth(req, res, () => {
    const adminEmails = parseAdminEmails();

    if (adminEmails.size === 0) {
      res.status(500).json({ error: "ADMIN_EMAILS is not configured" });
      return;
    }

    const userEmail = req.userEmail;
    if (!userEmail || !adminEmails.has(userEmail)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  });
}
