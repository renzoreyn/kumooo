import { Hono } from "hono";
import { newId } from "@kumooo/core";
import { media } from "@kumooo/db";
import { and, desc, eq } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireSiteAccess } from "../lib/authz.js";
import { requireUser } from "../middleware/auth.js";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "audio/mpeg",
  "application/pdf",
]);

export const mediaRoutes = new Hono<AppEnv>();

mediaRoutes.get("/sites/:siteId/media", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");
  const rows = await c
    .get("db")
    .select()
    .from(media)
    .where(eq(media.siteId, siteId))
    .orderBy(desc(media.createdAt))
    .limit(100);
  return c.json({
    media: rows.map((m) => ({
      ...m,
      url: `/media/${m.id}/${m.filename}`,
    })),
  });
});

mediaRoutes.post("/sites/:siteId/media", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "author");

  const form = await c.req.parseBody();
  const file = form.file;
  if (!file || !(file instanceof File)) {
    throw ApiError.badRequest("Attach a file field named `file`.");
  }
  if (file.size > MAX_BYTES) {
    throw ApiError.badRequest("Max upload size is 25 MB.");
  }
  if (!ALLOWED.has(file.type)) {
    throw ApiError.badRequest(`That file type (${file.type || "unknown"}) isn't allowed.`);
  }

  const id = newId("med");
  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const r2Key = `${siteId}/${id}/${filename}`;
  await c.env.MEDIA.put(r2Key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  await c.get("db").insert(media).values({
    id,
    siteId,
    r2Key,
    filename,
    mime: file.type,
    size: file.size,
    alt: typeof form.alt === "string" ? form.alt : "",
    createdBy: user.id,
  });

  return c.json(
    {
      media: {
        id,
        filename,
        mime: file.type,
        size: file.size,
        url: `/media/${id}/${filename}`,
      },
    },
    201,
  );
});

mediaRoutes.delete("/sites/:siteId/media/:id", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "editor");
  const id = c.req.param("id");
  const row = (
    await c
      .get("db")
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Media not found.");
  await c.env.MEDIA.delete(row.r2Key);
  await c.get("db").delete(media).where(eq(media.id, id));
  return c.json({ ok: true });
});
