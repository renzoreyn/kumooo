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

type PublicPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapPublicPost(row: PublicPostRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

publicRoutes.get("/sites/:slug/posts", async (c) => {
  const slug = c.req.param("slug").trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
    return c.json({ error: "invalid_slug" }, 400);
  }
  const site = await c.env.DB.prepare(`SELECT id, status FROM sites WHERE slug = ?`)
    .bind(slug)
    .first<{ id: string; status: string }>();
  if (!site) return c.json({ error: "not_found" }, 404);

  const { results } = await c.env.DB.prepare(
    `SELECT id, slug, title, excerpt, body, published_at, created_at, updated_at
     FROM posts WHERE site_id = ? AND status = 'published'
     ORDER BY COALESCE(published_at, created_at) DESC`,
  )
    .bind(site.id)
    .all<PublicPostRow>();

  return c.json({ posts: (results ?? []).map(mapPublicPost) });
});

publicRoutes.get("/sites/:slug/posts/:postSlug", async (c) => {
  const slug = c.req.param("slug").trim().toLowerCase();
  const postSlug = c.req.param("postSlug").trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
    return c.json({ error: "invalid_slug" }, 400);
  }
  const site = await c.env.DB.prepare(`SELECT id FROM sites WHERE slug = ?`)
    .bind(slug)
    .first<{ id: string }>();
  if (!site) return c.json({ error: "not_found" }, 404);

  const row = await c.env.DB.prepare(
    `SELECT id, slug, title, excerpt, body, published_at, created_at, updated_at
     FROM posts WHERE site_id = ? AND slug = ? AND status = 'published'`,
  )
    .bind(site.id, postSlug)
    .first<PublicPostRow>();
  if (!row) return c.json({ error: "not_found" }, 404);
  return c.json({ post: mapPublicPost(row) });
});
