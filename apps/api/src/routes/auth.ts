import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "../middleware/session";
import {
  OTP_MAX_ATTEMPTS,
  OTP_REQUEST_LIMIT,
  OTP_TTL_MS,
  SESSION_COOKIE,
  SESSION_SHORT_TTL_MS,
  SESSION_TTL_MS,
  clearCookieHeader,
  cookieHeader,
  generateOtpCode,
  hashPassword,
  isValidEmail,
  isValidOtpCode,
  isValidPassword,
  newId,
  randomToken,
  sha256Hex,
  verifyPassword,
} from "../lib/crypto";
import { requireUser } from "../middleware/session";
import { otpEmail } from "../lib/email-templates";
import { sendTransactionalEmail } from "../lib/resend";

export const authRoutes = new Hono<AppEnv>();

function cookieDomainFor(env: { APP_ORIGIN: string; API_ORIGIN: string }): string | undefined {
  return env.APP_ORIGIN.includes("kumooo.dev") && env.API_ORIGIN.includes("kumooo.dev")
    ? ".kumooo.dev"
    : undefined;
}

async function issueOtp(c: Context<AppEnv>, email: string) {
  const recent = await c.env.DB.prepare(
    `SELECT COUNT(*) AS n FROM otp_codes
     WHERE email = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 hour')`,
  )
    .bind(email)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= OTP_REQUEST_LIMIT) {
    return { error: "rate_limited" as const };
  }

  await c.env.DB.prepare(
    `UPDATE otp_codes SET consumed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE email = ? AND consumed_at IS NULL`,
  )
    .bind(email)
    .run();

  const code = generateOtpCode();
  const codeHash = await sha256Hex(code);
  const id = newId("otp");
  const expires = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await c.env.DB.prepare(
    `INSERT INTO otp_codes (id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)`,
  )
    .bind(id, email, codeHash, expires)
    .run();

  const { subject, text, html } = otpEmail({
    code,
    appOrigin: c.env.APP_ORIGIN,
  });

  const send = await sendTransactionalEmail(c.env, { to: email, subject, text, html });
  const emailed = send.ok;
  const payload: { ok: true; emailed: boolean; devCode?: string } = { ok: true, emailed };
  if (!emailed && c.env.ALLOW_DEV_LINK === "1") {
    payload.devCode = code;
  }
  return payload;
}

async function createSession(c: Context<AppEnv>, userId: string, remember: boolean) {
  const ttlMs = remember ? SESSION_TTL_MS : SESSION_SHORT_TTL_MS;
  const sessionToken = randomToken(32);
  const sessionHash = await sha256Hex(sessionToken);
  const sessionId = newId("ses");
  const expires = new Date(Date.now() + ttlMs).toISOString();
  await c.env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
  )
    .bind(sessionId, userId, sessionHash, expires)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "Set-Cookie": cookieHeader(
        SESSION_COOKIE,
        sessionToken,
        Math.floor(ttlMs / 1000),
        cookieDomainFor(c.env),
      ),
    },
  });
}

authRoutes.post("/otp/request", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { email?: string };
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!isValidEmail(email)) {
    return c.json({ error: "invalid_email" }, 400);
  }

  const result = await issueOtp(c, email);
  if ("error" in result) return c.json({ error: result.error }, 429);
  return c.json(result);
});

authRoutes.post("/signup", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");

  if (!isValidEmail(email)) return c.json({ error: "invalid_email" }, 400);
  if (!isValidPassword(password)) return c.json({ error: "invalid_password" }, 400);

  const existing = await c.env.DB.prepare(
    `SELECT id, password_hash, email_verified_at FROM users WHERE email = ?`,
  )
    .bind(email)
    .first<{ id: string; password_hash: string | null; email_verified_at: string | null }>();

  const hash = await hashPassword(password);

  if (existing) {
    if (existing.password_hash && existing.email_verified_at) {
      return c.json({ error: "email_taken" }, 409);
    }
    await c.env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
      .bind(hash, existing.id)
      .run();
  } else {
    const id = newId("usr");
    await c.env.DB.prepare(
      `INSERT INTO users (id, email, plan_id, password_hash) VALUES (?, ?, 'free', ?)`,
    )
      .bind(id, email, hash)
      .run();
  }

  const result = await issueOtp(c, email);
  if ("error" in result) return c.json({ error: result.error }, 429);
  return c.json({ ...result, needsVerification: true }, 201);
});

authRoutes.post("/login", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    remember?: boolean;
  };
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const remember = body.remember !== false;

  if (!isValidEmail(email)) return c.json({ error: "invalid_email" }, 400);
  if (!password) return c.json({ error: "invalid_password" }, 400);

  const user = await c.env.DB.prepare(
    `SELECT id, password_hash, email_verified_at FROM users WHERE email = ?`,
  )
    .bind(email)
    .first<{ id: string; password_hash: string | null; email_verified_at: string | null }>();

  if (!user?.password_hash) {
    return c.json({ error: "no_password" }, 401);
  }
  if (!user.email_verified_at) {
    return c.json({ error: "email_unverified" }, 401);
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return c.json({ error: "invalid_credentials" }, 401);

  return createSession(c, user.id, remember);
});

authRoutes.post("/otp/verify", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    email?: string;
    code?: string;
    remember?: boolean;
  };
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const code = String(body.code ?? "")
    .trim()
    .replace(/\s+/g, "");
  const remember = body.remember !== false;

  if (!isValidEmail(email)) {
    return c.json({ error: "invalid_email" }, 400);
  }
  if (!isValidOtpCode(code)) {
    return c.json({ error: "invalid_code" }, 400);
  }

  const row = await c.env.DB.prepare(
    `SELECT id, code_hash, expires_at, consumed_at, attempts FROM otp_codes
     WHERE email = ? AND consumed_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(email)
    .first<{
      id: string;
      code_hash: string;
      expires_at: string;
      consumed_at: string | null;
      attempts: number;
    }>();

  if (!row || row.expires_at < new Date().toISOString()) {
    return c.json({ error: "expired_code" }, 400);
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await c.env.DB.prepare(
      `UPDATE otp_codes SET consumed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
    )
      .bind(row.id)
      .run();
    return c.json({ error: "too_many_attempts" }, 429);
  }

  const codeHash = await sha256Hex(code);
  if (codeHash !== row.code_hash) {
    const next = row.attempts + 1;
    await c.env.DB.prepare(`UPDATE otp_codes SET attempts = ? WHERE id = ?`).bind(next, row.id).run();
    if (next >= OTP_MAX_ATTEMPTS) {
      await c.env.DB.prepare(
        `UPDATE otp_codes SET consumed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      )
        .bind(row.id)
        .run();
      return c.json({ error: "too_many_attempts" }, 429);
    }
    return c.json({ error: "invalid_code" }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE otp_codes SET consumed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
  )
    .bind(row.id)
    .run();

  let user = await c.env.DB.prepare(`SELECT id, email, plan_id, created_at FROM users WHERE email = ?`)
    .bind(email)
    .first<{ id: string; email: string; plan_id: string; created_at: string }>();

  const now = new Date().toISOString();
  if (!user) {
    const id = newId("usr");
    await c.env.DB.prepare(
      `INSERT INTO users (id, email, plan_id, email_verified_at) VALUES (?, ?, 'free', ?)`,
    )
      .bind(id, email, now)
      .run();
    user = { id, email, plan_id: "free", created_at: now };
  } else {
    await c.env.DB.prepare(
      `UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?`,
    )
      .bind(now, user.id)
      .run();
  }

  return createSession(c, user.id, remember);
});

authRoutes.post("/password", async (c) => {
  const user = requireUser(c);
  const body = (await c.req.json().catch(() => ({}))) as { password?: string };
  const password = String(body.password ?? "");
  if (!isValidPassword(password)) return c.json({ error: "invalid_password" }, 400);

  const hash = await hashPassword(password);
  await c.env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
    .bind(hash, user.id)
    .run();
  return c.json({ ok: true });
});

authRoutes.post("/logout", async (c) => {
  const raw = (() => {
    const header = c.req.header("cookie");
    if (!header) return null;
    for (const part of header.split(";")) {
      const [k, ...rest] = part.trim().split("=");
      if (k === SESSION_COOKIE) return rest.join("=") || null;
    }
    return null;
  })();
  if (raw) {
    const hash = await sha256Hex(raw);
    await c.env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(hash).run();
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "Set-Cookie": clearCookieHeader(SESSION_COOKIE, cookieDomainFor(c.env)),
    },
  });
});

authRoutes.get("/me", async (c) => {
  const user = requireUser(c);
  return c.json({
    id: user.id,
    email: user.email,
    planId: user.plan_id,
    createdAt: user.created_at,
    hasPassword: Boolean(user.password_hash),
    emailVerified: Boolean(user.email_verified_at),
  });
});
