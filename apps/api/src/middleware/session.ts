import type { Context, Next } from "hono";
import type { Env, UserRow } from "../env";
import { SESSION_COOKIE, sha256Hex } from "../lib/crypto";

export type AppVars = {
  user: UserRow | null;
};

export type AppEnv = { Bindings: Env; Variables: AppVars };

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=") || null;
  }
  return null;
}

export async function loadSession(c: Context<AppEnv>, next: Next) {
  c.set("user", null);
  const raw = readCookie(c.req.header("cookie"), SESSION_COOKIE);
  if (!raw) {
    await next();
    return;
  }
  const hash = await sha256Hex(raw);
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.plan_id, u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
  )
    .bind(hash)
    .first<UserRow>();
  if (row) c.set("user", row);
  await next();
}

export function requireUser(c: Context<AppEnv>): UserRow {
  const user = c.get("user");
  if (!user) {
    throw new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return user;
}
