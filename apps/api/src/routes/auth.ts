import { Hono } from "hono";
import {
  hashPassword,
  newId,
  slugify,
  signupSchema,
  loginSchema,
  verifyPassword,
} from "@kumooo/core";
import { organizations, orgMembers, users } from "@kumooo/db";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import {
  clearSessionCookie,
  createSession,
  destroySession,
  sessionCookie,
} from "../lib/sessions.js";
import { requireUser } from "../middleware/auth.js";

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/signup", async (c) => {
  const body = signupSchema.parse(await c.req.json());
  const existing = (await c.get("db").select().from(users).where(eq(users.email, body.email.toLowerCase())))[0];
  if (existing) throw ApiError.conflict("An account with that email already exists. Try signing in.");

  const userId = newId("usr");
  const orgId = newId("org");
  const passwordHash = await hashPassword(body.password);
  const email = body.email.toLowerCase();
  const orgSlug = uniqueOrgSlug(slugify(body.name));

  const db = c.get("db");
  await db.insert(users).values({
    id: userId,
    email,
    name: body.name,
    passwordHash,
  });
  await db.insert(organizations).values({
    id: orgId,
    name: `${body.name}'s workspace`,
    slug: orgSlug,
  });
  await db.insert(orgMembers).values({ orgId, userId, role: "owner" });

  const token = await createSession(db, userId, {
    ip: c.req.header("CF-Connecting-IP") ?? undefined,
    userAgent: c.req.header("User-Agent") ?? undefined,
  });
  const secure = c.env.ENVIRONMENT !== "development";
  c.header("Set-Cookie", sessionCookie(token, secure));

  return c.json({
    user: { id: userId, email, name: body.name },
    organization: { id: orgId, slug: orgSlug },
  }, 201);
});

authRoutes.post("/login", async (c) => {
  const body = loginSchema.parse(await c.req.json());
  const row = (
    await c.get("db").select().from(users).where(eq(users.email, body.email.toLowerCase()))
  )[0];
  if (!row || !(await verifyPassword(body.password, row.passwordHash))) {
    throw ApiError.invalidCredentials();
  }
  const token = await createSession(c.get("db"), row.id, {
    ip: c.req.header("CF-Connecting-IP") ?? undefined,
    userAgent: c.req.header("User-Agent") ?? undefined,
  });
  const secure = c.env.ENVIRONMENT !== "development";
  c.header("Set-Cookie", sessionCookie(token, secure));
  return c.json({ user: { id: row.id, email: row.email, name: row.name } });
});

authRoutes.post("/logout", async (c) => {
  const token = c.get("sessionToken");
  if (token) await destroySession(c.get("db"), token);
  const secure = c.env.ENVIRONMENT !== "development";
  c.header("Set-Cookie", clearSessionCookie(secure));
  return c.json({ ok: true });
});

authRoutes.get("/me", async (c) => {
  const user = requireUser(c);
  return c.json({ user });
});

function uniqueOrgSlug(base: string): string {
  // Collision handled at insert time in a follow-up; for MVP append short random.
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}
