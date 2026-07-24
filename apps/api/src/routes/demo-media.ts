import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "../middleware/session";
import { newId, sha256Hex } from "../lib/crypto";
import { DEMO_BLOG_COOKIE } from "./demo-blog";
import { DEMO_SHOP_COOKIE } from "./demo-shop";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const demoMediaRoutes = new Hono<AppEnv>();

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=") || null;
  }
  return null;
}

async function requireDemoEditor(c: Context<AppEnv>): Promise<boolean> {
  const auth = c.req.header("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  const cookie = c.req.header("cookie");
  const token =
    bearer ||
    readCookie(cookie, DEMO_SHOP_COOKIE) ||
    readCookie(cookie, DEMO_BLOG_COOKIE);
  if (!token) return false;
  const hash = await sha256Hex(token);
  const shop = await c.env.DB.prepare(
    `SELECT id FROM demo_shop_sessions
     WHERE token_hash = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
  )
    .bind(hash)
    .first<{ id: string }>();
  if (shop) return true;
  const blog = await c.env.DB.prepare(
    `SELECT id FROM demo_blog_sessions
     WHERE token_hash = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
  )
    .bind(hash)
    .first<{ id: string }>();
  return Boolean(blog);
}

function extFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function wipeDemoMedia(bucket: R2Bucket | undefined): Promise<void> {
  if (!bucket) return;
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ prefix: "demo/", cursor, limit: 100 });
    await Promise.all(listed.objects.map((o) => bucket.delete(o.key)));
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

demoMediaRoutes.post("/upload", async (c) => {
  if (!(await requireDemoEditor(c))) return c.json({ error: "unauthorized" }, 401);
  if (!c.env.MEDIA) return c.json({ error: "media_unavailable" }, 503);

  const form = await c.req.parseBody();
  const file = form.file;
  if (!file || typeof file === "string") return c.json({ error: "file_required" }, 400);

  const blob = file as File;
  const type = blob.type || "application/octet-stream";
  if (!ALLOWED.has(type)) return c.json({ error: "invalid_type" }, 400);
  if (blob.size <= 0 || blob.size > MAX_BYTES) return c.json({ error: "invalid_size" }, 400);

  const scope = String(form.scope ?? "shop").replace(/[^a-z]/g, "") || "shop";
  const id = newId("media");
  const key = `demo/${scope}/${id}.${extFor(type)}`;
  const bytes = await blob.arrayBuffer();

  await c.env.MEDIA.put(key, bytes, {
    httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" },
  });

  const base = (c.env.API_ORIGIN || "https://api.kumooo.dev").replace(/\/$/, "");
  const url = `${base}/demo/media/${key}`;
  return c.json({ ok: true, key, url, bytes: blob.size, contentType: type }, 201);
});

demoMediaRoutes.get("/*", async (c) => {
  if (!c.env.MEDIA) return c.json({ error: "media_unavailable" }, 503);
  let key = c.req.path.replace(/^\/demo\/media\/?/, "");
  if (key.startsWith("/")) key = key.slice(1);
  if (!key || key.includes("..") || !key.startsWith("demo/")) {
    return c.json({ error: "not_found" }, 404);
  }
  const obj = await c.env.MEDIA.get(key);
  if (!obj) return c.json({ error: "not_found" }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", obj.httpMetadata?.cacheControl || "public, max-age=86400");
  return new Response(obj.body, { headers });
});
