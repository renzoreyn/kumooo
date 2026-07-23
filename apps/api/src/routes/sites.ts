import { Hono } from "hono";
import { canCreateSite, formatBytes, getPlan, mediaLimitBytes, type PlanId } from "@kumooo/plans";
import type { SiteRow } from "../env";
import type { AppEnv } from "../middleware/session";
import { requireUser } from "../middleware/session";
import { isValidSlug, newId, siteUrl } from "../lib/crypto";

export const sitesRoutes = new Hono<AppEnv>();

sitesRoutes.get("/", async (c) => {
  const user = requireUser(c);
  const { results } = await c.env.DB.prepare(
    `SELECT id, user_id, name, slug, status, last_deploy_at, created_at, updated_at
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
    sites: (results ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      status: s.status,
      url: siteUrl(s.slug),
      lastDeployAt: s.last_deploy_at,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    })),
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
  const body = (await c.req.json().catch(() => ({}))) as { name?: string; slug?: string };
  const name = String(body.name ?? "").trim().slice(0, 80);
  const slug = String(body.slug ?? "")
    .trim()
    .toLowerCase();

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
  await c.env.DB.prepare(
    `INSERT INTO sites (id, user_id, name, slug, status) VALUES (?, ?, ?, ?, 'draft')`,
  )
    .bind(id, user.id, name, slug)
    .run();

  return c.json(
    {
      id,
      name,
      slug,
      status: "draft",
      url: siteUrl(slug),
      lastDeployAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    201,
  );
});

sitesRoutes.get("/:id", async (c) => {
  const user = requireUser(c);
  const id = c.req.param("id");
  const site = await c.env.DB.prepare(
    `SELECT id, user_id, name, slug, status, last_deploy_at, created_at, updated_at
     FROM sites WHERE id = ? AND user_id = ?`,
  )
    .bind(id, user.id)
    .first<SiteRow>();
  if (!site) return c.json({ error: "not_found" }, 404);

  return c.json({
    id: site.id,
    name: site.name,
    slug: site.slug,
    status: site.status,
    url: siteUrl(site.slug),
    lastDeployAt: site.last_deploy_at,
    createdAt: site.created_at,
    updatedAt: site.updated_at,
    deployHint:
      "Deploy uploads land next. For now, reserve your slug and self-host, or wait for the dashboard deploy token flow.",
  });
});

sitesRoutes.delete("/:id", async (c) => {
  const user = requireUser(c);
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`DELETE FROM sites WHERE id = ? AND user_id = ?`)
    .bind(id, user.id)
    .run();
  if (!result.meta.changes) return c.json({ error: "not_found" }, 404);
  return c.json({ ok: true });
});
