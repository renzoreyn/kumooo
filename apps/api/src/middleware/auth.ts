import { getCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { resolveSession, SESSION_COOKIE } from "../lib/sessions.js";

export const authenticate: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE) ?? null;
  const user = await resolveSession(c.get("db"), token);
  c.set("user", user);
  c.set("sessionToken", token);
  await next();
};

export function requireUser(c: { get: (k: "user") => AppEnv["Variables"]["user"] }) {
  const user = c.get("user");
  if (!user) throw ApiError.unauthorized();
  return user;
}
