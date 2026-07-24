import { Hono } from "hono";
import { canCreateSite, formatBytes, getPlan, mediaLimitBytes, type PlanId } from "@kumooo/plans";
import type { SiteRow } from "../env";
import type { AppEnv } from "../middleware/session";
import { requireUser } from "../middleware/session";
import { isValidSlug, newId, siteUrl } from "../lib/crypto";
import {
  ALLOWED_MEDIA_TYPES,
  MAX_SITE_MEDIA_BYTES,
  deleteSiteMedia,
  extFor,
  mediaPublicUrl,
} from "./media";

export const sitesRoutes = new Hono<AppEnv>();

type MediaRow = {
  id: string;
  key: string;
  bytes: number;
  content_type: string;
  filename: string | null;
  created_at: string;
};

function mapMedia(row: MediaRow, apiOrigin: string | undefined) {
  return {
    id: row.id,
    key: row.key,
    url: mediaPublicUrl(apiOrigin, row.key),
    bytes: row.bytes,
    contentType: row.content_type,
    filename: row.filename,
    createdAt: row.created_at,
  };
}

const SKINS = new Set(["y2k", "kumooo", "glass"]);

function isSkin(value: string): boolean {
  return SKINS.has(value);
}

function mapSite(s: SiteRow) {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    status: s.status,
    skin: isSkin(s.skin) ? s.skin : "kumooo",
    url: siteUrl(s.slug),
    lastDeployAt: s.last_deploy_at,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

sitesRoutes.get("/", async (c) => {
  const user = requireUser(c);
  const { results } = await c.env.DB.prepare(
    `SELECT id, user_id, name, slug, status, skin, last_deploy_at, created_at, updated_at
     FROM sites WHERE user_id = ? ORDER BY created_at DESC`,
  )
    .bind(user.id)
    .all<SiteRow>();

  const media = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(bytes), 0) AS used FROM media_objects WHERE user_id = ?`,
  )
    .bind(user.id)
    .first<{ used: number }>();

  const plan = getPlan(user.plan_id as PlanId);
  const mediaLimit = mediaLimitBytes(user.plan_id as PlanId);

  return c.json({
    sites: (results ?? []).map(mapSite),
    quota: {
      planId: plan.id,
      planName: plan.name,
      sitesUsed: results?.length ?? 0,
      sitesLimit: plan.sites,
      mediaUsedBytes: media?.used ?? 0,
      mediaLimitBytes: mediaLimit,
      mediaUsedLabel: formatBytes(media?.used ?? 0),
      mediaLimitLabel: mediaLimit == null ? "Custom" : formatBytes(mediaLimit),
    },
  });
});

sitesRoutes.post("/", async (c) => {
  const user = requireUser(c);
  const body = (await c.req.json().catch(() => ({}))) as {
    name?: string;
    slug?: string;
    skin?: string;
  };
  const name = String(body.name ?? "").trim().slice(0, 80);
  const slug = String(body.slug ?? "")
    .trim()
    .toLowerCase();
  const skin = isSkin(String(body.skin ?? "kumooo")) ? String(body.skin ?? "kumooo") : "kumooo";

  if (!name) return c.json({ error: "name_required" }, 400);
  if (!isValidSlug(slug)) return c.json({ error: "invalid_slug" }, 400);

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM sites WHERE user_id = ?`)
    .bind(user.id)
    .first<{ n: number }>();
  if (!canCreateSite(user.plan_id as PlanId, countRow?.n ?? 0)) {
    return c.json({ error: "site_limit" }, 403);
  }

  const existing = await c.env.DB.prepare(`SELECT id FROM sites WHERE slug = ?`).bind(slug).first();
  if (existing) return c.json({ error: "slug_taken" }, 409);

  const id = newId("site");
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO sites (id, user_id, name, slug, status, skin, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)`,
  )
    .bind(id, user.id, name, slug, skin, now, now)
    .run();

  return c.json(
    {
      id,
      name,
      slug,
      status: "draft",
      skin,
      url: siteUrl(slug),
      lastDeployAt: null,
      createdAt: now,
      updatedAt: now,
    },
    201,
  );
});

sitesRoutes.get("/:id", async (c) => {
  const user = requireUser(c);
  const id = c.req.param("id");
  const site = await c.env.DB.prepare(
    `SELECT id, user_id, name, slug, status, skin, last_deploy_at, created_at, updated_at
     FROM sites WHERE id = ? AND user_id = ?`,
  )
    .bind(id, user.id)
    .first<SiteRow>();
  if (!site) return c.json({ error: "not_found" }, 404);

  return c.json({
    ...mapSite(site),
    deployHint:
      "Set your visual skin here. Deployed blog/shop starters read it from the public site API (or NEXT_PUBLIC_SITE_SKIN at build time).",
  });
});

sitesRoutes.patch("/:id", async (c) => {
  const user = requireUser(c);
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(
    `SELECT id, user_id, name, slug, status, skin, last_deploy_at, created_at, updated_at
     FROM sites WHERE id = ? AND user_id = ?`,
  )
    .bind(id, user.id)
    .first<SiteRow>();
  if (!existing) return c.json({ error: "not_found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as {
    name?: string;
    skin?: string;
    status?: string;
  };

  const name =
    body.name !== undefined ? String(body.name).trim().slice(0, 80) : existing.name;
  if (!name) return c.json({ error: "name_required" }, 400);

  let skin = existing.skin;
  if (body.skin !== undefined) {
    const next = String(body.skin);
    if (!isSkin(next)) return c.json({ error: "invalid_skin" }, 400);
    skin = next;
  }

  let status = existing.status;
  if (body.status === "draft" || body.status === "live" || body.status === "published") {
    status = body.status === "published" ? "live" : body.status;
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE sites SET name = ?, skin = ?, status = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
  )
    .bind(name, skin, status, now, id, user.id)
    .run();

  const site = await c.env.DB.prepare(
    `SELECT id, user_id, name, slug, status, skin, last_deploy_at, created_at, updated_at
     FROM sites WHERE id = ?`,
  )
    .bind(id)
    .first<SiteRow>();

  return c.json(mapSite(site!));
});

sitesRoutes.get("/:id/media", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("id");
  const site = await c.env.DB.prepare(`SELECT id FROM sites WHERE id = ? AND user_id = ?`)
    .bind(siteId, user.id)
    .first<{ id: string }>();
  if (!site) return c.json({ error: "not_found" }, 404);

  const { results } = await c.env.DB.prepare(
    `SELECT id, key, bytes, content_type, filename, created_at
     FROM media_objects WHERE site_id = ? AND user_id = ?
     ORDER BY created_at DESC`,
  )
    .bind(siteId, user.id)
    .all<MediaRow>();

  const mediaUsed = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(bytes), 0) AS used FROM media_objects WHERE user_id = ?`,
  )
    .bind(user.id)
    .first<{ used: number }>();

  const quotaBytes = mediaLimitBytes(user.plan_id as PlanId);
  return c.json({
    media: (results ?? []).map((r) => mapMedia(r, c.env.API_ORIGIN)),
    usedBytes: mediaUsed?.used ?? 0,
    quotaBytes,
    usedLabel: formatBytes(mediaUsed?.used ?? 0),
    quotaLabel: quotaBytes == null ? "Custom" : formatBytes(quotaBytes),
  });
});

sitesRoutes.post("/:id/media", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("id");
  const site = await c.env.DB.prepare(`SELECT id FROM sites WHERE id = ? AND user_id = ?`)
    .bind(siteId, user.id)
    .first<{ id: string }>();
  if (!site) return c.json({ error: "not_found" }, 404);
  if (!c.env.MEDIA) return c.json({ error: "media_unavailable" }, 503);

  const form = await c.req.parseBody();
  const file = form.file;
  if (!file || typeof file === "string") return c.json({ error: "file_required" }, 400);

  const blob = file as File;
  const type = blob.type || "application/octet-stream";
  if (!ALLOWED_MEDIA_TYPES.has(type)) return c.json({ error: "invalid_type" }, 400);
  if (blob.size <= 0 || blob.size > MAX_SITE_MEDIA_BYTES) {
    return c.json({ error: "invalid_size" }, 400);
  }

  const usedRow = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(bytes), 0) AS used FROM media_objects WHERE user_id = ?`,
  )
    .bind(user.id)
    .first<{ used: number }>();
  const used = usedRow?.used ?? 0;
  const limit = mediaLimitBytes(user.plan_id as PlanId);
  if (limit != null && used + blob.size > limit) {
    return c.json({ error: "quota_exceeded" }, 413);
  }

  const id = newId("media");
  const key = `sites/${siteId}/${id}.${extFor(type)}`;
  const bytes = await blob.arrayBuffer();
  const filename = (blob.name || "").slice(0, 200) || null;
  const now = new Date().toISOString();

  await c.env.MEDIA.put(key, bytes, {
    httpMetadata: {
      contentType: type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  await c.env.DB.prepare(
    `INSERT INTO media_objects (id, user_id, site_id, key, bytes, content_type, filename, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, user.id, siteId, key, blob.size, type, filename, now)
    .run();

  return c.json(
    {
      ok: true,
      ...mapMedia(
        {
          id,
          key,
          bytes: blob.size,
          content_type: type,
          filename,
          created_at: now,
        },
        c.env.API_ORIGIN,
      ),
    },
    201,
  );
});

sitesRoutes.delete("/:id/media/:mediaId", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("id");
  const mediaId = c.req.param("mediaId");
  const row = await c.env.DB.prepare(
    `SELECT id, key FROM media_objects WHERE id = ? AND site_id = ? AND user_id = ?`,
  )
    .bind(mediaId, siteId, user.id)
    .first<{ id: string; key: string }>();
  if (!row) return c.json({ error: "not_found" }, 404);

  if (c.env.MEDIA) await c.env.MEDIA.delete(row.key).catch(() => undefined);
  await c.env.DB.prepare(`DELETE FROM media_objects WHERE id = ?`).bind(row.id).run();
  return c.json({ ok: true });
});

sitesRoutes.delete("/:id", async (c) => {
  const user = requireUser(c);
  const id = c.req.param("id");
  const site = await c.env.DB.prepare(`SELECT id FROM sites WHERE id = ? AND user_id = ?`)
    .bind(id, user.id)
    .first<{ id: string }>();
  if (!site) return c.json({ error: "not_found" }, 404);

  await deleteSiteMedia(c.env.DB, c.env.MEDIA, id);
  await c.env.DB.prepare(`DELETE FROM sites WHERE id = ? AND user_id = ?`).bind(id, user.id).run();
  return c.json({ ok: true });
});
