import { Hono } from "hono";
import type { AppEnv } from "../middleware/session";

export const MAX_SITE_MEDIA_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const mediaRoutes = new Hono<AppEnv>();

export function extFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export function mediaPublicUrl(apiOrigin: string | undefined, key: string): string {
  const base = (apiOrigin || "https://api.kumooo.dev").replace(/\/$/, "");
  return `${base}/media/${key}`;
}

/** Delete R2 objects + D1 rows for a site. Call before deleting the site row. */
export async function deleteSiteMedia(
  db: D1Database,
  bucket: R2Bucket | undefined,
  siteId: string,
): Promise<void> {
  const { results } = await db
    .prepare(`SELECT id, key FROM media_objects WHERE site_id = ?`)
    .bind(siteId)
    .all<{ id: string; key: string }>();
  const rows = results ?? [];
  if (bucket) {
    await Promise.all(rows.map((r) => bucket.delete(r.key).catch(() => undefined)));
  }
  if (rows.length) {
    await db.prepare(`DELETE FROM media_objects WHERE site_id = ?`).bind(siteId).run();
  }
}

mediaRoutes.get("/*", async (c) => {
  if (!c.env.MEDIA) return c.json({ error: "media_unavailable" }, 503);
  let key = c.req.path.replace(/^\/media\/?/, "");
  if (key.startsWith("/")) key = key.slice(1);
  if (!key || key.includes("..") || !key.startsWith("sites/")) {
    return c.json({ error: "not_found" }, 404);
  }
  const obj = await c.env.MEDIA.get(key);
  if (!obj) return c.json({ error: "not_found" }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set(
    "cache-control",
    obj.httpMetadata?.cacheControl || "public, max-age=31536000, immutable",
  );
  // Cloudflare edge: honor long TTL; URL is immutable (id in key).
  headers.set("cdn-cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
});
