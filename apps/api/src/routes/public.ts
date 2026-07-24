import { Hono } from "hono";
import type { SiteRow } from "../env";
import type { AppEnv } from "../middleware/session";

/** Unauthenticated site metadata for starters (skin, etc.). */
export const publicRoutes = new Hono<AppEnv>();

const SKINS = new Set(["y2k", "kumooo", "glass"]);

publicRoutes.get("/sites/:slug", async (c) => {
  const slug = c.req.param("slug").trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
    return c.json({ error: "invalid_slug" }, 400);
  }
  const site = await c.env.DB.prepare(
    `SELECT slug, skin, status FROM sites WHERE slug = ?`,
  )
    .bind(slug)
    .first<Pick<SiteRow, "slug" | "skin" | "status">>();
  if (!site) return c.json({ error: "not_found" }, 404);
  const skin = SKINS.has(site.skin) ? site.skin : "kumooo";
  return c.json({
    slug: site.slug,
    skin,
    status: site.status,
  });
});
