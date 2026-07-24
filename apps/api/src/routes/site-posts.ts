import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "../middleware/session";
import { requireUser } from "../middleware/session";
import { newId } from "../lib/crypto";

export const sitePostsRoutes = new Hono<AppEnv>();

type PostRow = {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base || `post-${Date.now().toString(36)}`;
}

function mapPost(row: PostRow) {
  return {
    id: row.id,
    siteId: row.site_id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ownedSite(c: Context<AppEnv>, siteId: string) {
  const user = requireUser(c);
  const site = await c.env.DB.prepare(`SELECT id FROM sites WHERE id = ? AND user_id = ?`)
    .bind(siteId, user.id)
    .first<{ id: string }>();
  return site ? user : null;
}

sitePostsRoutes.get("/", async (c) => {
  const siteId = c.req.param("id")!;
  if (!(await ownedSite(c, siteId))) return c.json({ error: "not_found" }, 404);

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM posts WHERE site_id = ? ORDER BY updated_at DESC`,
  )
    .bind(siteId)
    .all<PostRow>();

  return c.json({ posts: (results ?? []).map(mapPost) });
});

sitePostsRoutes.post("/", async (c) => {
  const siteId = c.req.param("id")!;
  if (!(await ownedSite(c, siteId))) return c.json({ error: "not_found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as {
    title?: string;
    slug?: string;
    excerpt?: string;
    body?: string;
    status?: string;
  };
  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!title) return c.json({ error: "title_required" }, 400);
  const text = String(body.body ?? "");
  if (!text.trim()) return c.json({ error: "body_required" }, 400);
  const excerpt = String(body.excerpt ?? "").trim().slice(0, 500);
  let slug = String(body.slug ?? slugify(title))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  if (!slug) slug = slugify(title);
  const status = body.status === "published" ? "published" : "draft";
  const now = new Date().toISOString();
  const publishedAt = status === "published" ? now : null;
  const id = newId("post");

  try {
    await c.env.DB.prepare(
      `INSERT INTO posts (id, site_id, slug, title, excerpt, body, status, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, siteId, slug, title, excerpt, text, status, publishedAt, now, now)
      .run();
  } catch {
    return c.json({ error: "slug_taken" }, 409);
  }

  const row = await c.env.DB.prepare(`SELECT * FROM posts WHERE id = ?`).bind(id).first<PostRow>();
  return c.json(mapPost(row!), 201);
});

sitePostsRoutes.patch("/:postId", async (c) => {
  const siteId = c.req.param("id")!;
  const postId = c.req.param("postId")!;
  if (!(await ownedSite(c, siteId))) return c.json({ error: "not_found" }, 404);

  const existing = await c.env.DB.prepare(`SELECT * FROM posts WHERE id = ? AND site_id = ?`)
    .bind(postId, siteId)
    .first<PostRow>();
  if (!existing) return c.json({ error: "not_found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as {
    title?: string;
    slug?: string;
    excerpt?: string;
    body?: string;
    status?: string;
  };

  const title =
    body.title !== undefined ? String(body.title).trim().slice(0, 200) : existing.title;
  if (!title) return c.json({ error: "title_required" }, 400);
  const text = body.body !== undefined ? String(body.body) : existing.body;
  if (!text.trim()) return c.json({ error: "body_required" }, 400);
  const excerpt =
    body.excerpt !== undefined
      ? String(body.excerpt).trim().slice(0, 500)
      : existing.excerpt;
  let slug =
    body.slug !== undefined
      ? String(body.slug)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80)
      : existing.slug;
  if (!slug) slug = existing.slug;
  const status =
    body.status === "published" || body.status === "draft" ? body.status : existing.status;
  const now = new Date().toISOString();
  let publishedAt = existing.published_at;
  if (status === "published" && !publishedAt) publishedAt = now;
  if (status === "draft") publishedAt = null;

  try {
    await c.env.DB.prepare(
      `UPDATE posts SET slug = ?, title = ?, excerpt = ?, body = ?, status = ?,
       published_at = ?, updated_at = ? WHERE id = ? AND site_id = ?`,
    )
      .bind(slug, title, excerpt, text, status, publishedAt, now, postId, siteId)
      .run();
  } catch {
    return c.json({ error: "slug_taken" }, 409);
  }

  const row = await c.env.DB.prepare(`SELECT * FROM posts WHERE id = ?`).bind(postId).first<PostRow>();
  return c.json(mapPost(row!));
});

sitePostsRoutes.delete("/:postId", async (c) => {
  const siteId = c.req.param("id")!;
  const postId = c.req.param("postId")!;
  if (!(await ownedSite(c, siteId))) return c.json({ error: "not_found" }, 404);

  const result = await c.env.DB.prepare(`DELETE FROM posts WHERE id = ? AND site_id = ?`)
    .bind(postId, siteId)
    .run();
  if (!result.meta.changes) return c.json({ error: "not_found" }, 404);
  return c.json({ ok: true });
});
