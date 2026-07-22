import { sha256Hex, randomToken } from "@kumooo/core";
import { sessions, users, type Db } from "@kumooo/db";
import { eq } from "drizzle-orm";

const SESSION_DAYS = 30;
export const SESSION_COOKIE = "kumooo_session";

export async function createSession(
  db: Db,
  userId: string,
  meta?: { ip?: string; userAgent?: string },
): Promise<string> {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    tokenHash,
    userId,
    expiresAt,
    ip: meta?.ip,
    userAgent: meta?.userAgent,
    createdAt: new Date(),
  });
  return token;
}

export async function destroySession(db: Db, token: string): Promise<void> {
  const tokenHash = await sha256Hex(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function resolveSession(db: Db, token: string | undefined | null) {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = (
    await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
        email: users.email,
        name: users.name,
        id: users.id,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.tokenHash, tokenHash))
  )[0];
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    return null;
  }
  return { id: row.id, email: row.email, name: row.name };
}

export function sessionCookie(token: string, secure: boolean): string {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  // Lax is enough when dashboard + API share *.kumooo.dev (same site).
  // None kept for the pages.dev fallback origin (cross-site).
  const sameSite = secure ? "None" : "Lax";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie(secure: boolean): string {
  const sameSite = secure ? "None" : "Lax";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secure ? "; Secure" : ""}`;
}
