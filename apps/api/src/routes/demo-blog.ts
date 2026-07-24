import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "../middleware/session";
import {
  clearCookieHeader,
  cookieHeader,
  isValidEmail,
  newId,
  randomToken,
  sha256Hex,
} from "../lib/crypto";

export const DEMO_BLOG_COOKIE = "kumooo_blog_demo";
const ADMIN_TTL_SEC = 12 * 60 * 60;
const COMMENT_LIMIT = 10;
const POST_BODY_MAX = 20000;

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type CommentRow = {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  body: string;
  created_at: string;
};

export const demoBlogRoutes = new Hono<AppEnv>();

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=") || null;
  }
  return null;
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base || `post-${Date.now().toString(36)}`;
}

function adminUser(env: AppEnv["Bindings"]): string {
  return env.BLOG_DEMO_USER || "admin";
}

function adminPass(env: AppEnv["Bindings"]): string {
  return env.BLOG_DEMO_PASS || "admin";
}

async function rateLimit(db: D1Database, key: string, limit: number): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setMinutes(0, 0, 0);
  const ws = windowStart.toISOString();
  const row = await db
    .prepare(`SELECT count, window_start FROM demo_blog_rate WHERE key = ?`)
    .bind(key)
    .first<{ count: number; window_start: string }>();
  if (!row || row.window_start !== ws) {
    await db
      .prepare(
        `INSERT INTO demo_blog_rate (key, count, window_start) VALUES (?, 1, ?)
         ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start`,
      )
      .bind(key, ws)
      .run();
    return true;
  }
  if (row.count >= limit) return false;
  await db.prepare(`UPDATE demo_blog_rate SET count = count + 1 WHERE key = ?`).bind(key).run();
  return true;
}

async function requireDemoAdmin(c: Context<AppEnv>): Promise<boolean> {
  const auth = c.req.header("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  const token = bearer || readCookie(c.req.header("cookie"), DEMO_BLOG_COOKIE);
  if (!token) return false;
  const hash = await sha256Hex(token);
  const row = await c.env.DB.prepare(
    `SELECT id FROM demo_blog_sessions
     WHERE token_hash = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
  )
    .bind(hash)
    .first<{ id: string }>();
  return Boolean(row);
}

export const SEED_POSTS = [
  {
    slug: "hello-kumooo",
    title: "Hello from kumooo.js",
    excerpt: "Next.js starters, @kumooo/ui, and a place to publish.",
    body: `kumooo.js sits on Next.js App Router with shared UI and starters for blank, blog, and shop.

## Try the editor

Sign into **Admin** with \`admin\` / \`admin\`, publish a post, leave a comment. Body text supports Markdown - headings, lists, links, and image URLs.

Content resets every day at 00:00 UTC.`,
  },
  {
    slug: "why-not-wordpress",
    title: "Why not WordPress",
    excerpt: "A small stack when you want pages you own.",
    body: `Use this starter when you want a blog without a full CMS install.

- Write posts in Admin
- Comment as a guest
- Ship the same theme from \`create-kumooo\`

The demo database clears nightly so you can experiment freely.`,
  },
] as const;

export async function wipeAndSeedDemoBlog(db: D1Database): Promise<void> {
  await db.prepare(`DELETE FROM demo_comments`).run();
  await db.prepare(`DELETE FROM demo_posts`).run();
  await db.prepare(`DELETE FROM demo_blog_sessions`).run();
  await db.prepare(`DELETE FROM demo_blog_rate`).run();
  const now = new Date().toISOString();
  for (const p of SEED_POSTS) {
    const id = newId("dpost");
    await db
      .prepare(
        `INSERT INTO demo_posts (id, slug, title, excerpt, body, status, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?)`,
      )
      .bind(id, p.slug, p.title, p.excerpt, p.body, now, now, now)
      .run();
  }
}

function mapPost(p: PostRow) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    status: p.status,
    publishedAt: p.published_at,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// --- Public --- 

demoBlogRoutes.get("/posts", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT * FROM demo_posts WHERE status = 'published'
     ORDER BY COALESCE(published_at, created_at) DESC`,
  ).all<PostRow>();
  return c.json({ posts: (rows.results ?? []).map(mapPost) });
});

demoBlogRoutes.get("/posts/:slug", async (c) => {
  const slug = c.req.param("slug");
  const row = await c.env.DB.prepare(
    `SELECT * FROM demo_posts WHERE slug = ? AND status = 'published'`,
  )
    .bind(slug)
    .first<PostRow>();
  if (!row) return c.json({ error: "not_found" }, 404);
  return c.json({ post: mapPost(row) });
});

demoBlogRoutes.get("/posts/:slug/comments", async (c) => {
  const slug = c.req.param("slug");
  const post = await c.env.DB.prepare(
    `SELECT id FROM demo_posts WHERE slug = ? AND status = 'published'`,
  )
    .bind(slug)
    .first<{ id: string }>();
  if (!post) return c.json({ error: "not_found" }, 404);
  const rows = await c.env.DB.prepare(
    `SELECT id, author_name, body, created_at FROM demo_comments
     WHERE post_id = ? ORDER BY created_at ASC`,
  )
    .bind(post.id)
    .all<{ id: string; author_name: string; body: string; created_at: string }>();
  return c.json({
    comments: (rows.results ?? []).map((r) => ({
      id: r.id,
      authorName: r.author_name,
      body: r.body,
      createdAt: r.created_at,
    })),
  });
});

demoBlogRoutes.post("/posts/:slug/comments", async (c) => {
  const slug = c.req.param("slug");
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  if (!(await rateLimit(c.env.DB, `comment:${ip}`, COMMENT_LIMIT))) {
    return c.json({ error: "rate_limited" }, 429);
  }
  const post = await c.env.DB.prepare(
    `SELECT id FROM demo_posts WHERE slug = ? AND status = 'published'`,
  )
    .bind(slug)
    .first<{ id: string }>();
  if (!post) return c.json({ error: "not_found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    body?: string;
  };
  const name = String(body.name ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
  const text = String(body.body ?? "").trim().slice(0, 2000);
  if (!name || !isValidEmail(email) || !text) {
    return c.json({ error: "invalid" }, 400);
  }
  const id = newId("dcom");
  await c.env.DB.prepare(
    `INSERT INTO demo_comments (id, post_id, author_name, author_email, body) VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(id, post.id, name, email, text)
    .run();
  return c.json({
    ok: true,
    comment: { id, authorName: name, body: text, createdAt: new Date().toISOString() },
  });
});

// --- Admin auth --- 

demoBlogRoutes.post("/admin/login", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  if (username !== adminUser(c.env) || password !== adminPass(c.env)) {
    return c.json({ error: "invalid_credentials" }, 401);
  }
  const token = randomToken(32);
  const hash = await sha256Hex(token);
  const id = newId("dbsess");
  const expires = new Date(Date.now() + ADMIN_TTL_SEC * 1000).toISOString();
  await c.env.DB.prepare(
    `INSERT INTO demo_blog_sessions (id, token_hash, expires_at) VALUES (?, ?, ?)`,
  )
    .bind(id, hash, expires)
    .run();

  c.header(
    "Set-Cookie",
    cookieHeader(DEMO_BLOG_COOKIE, token, ADMIN_TTL_SEC, undefined, "None"),
  );
  // Token in body: browsers often block cross-site cookies (blog.kumooo.site → api.kumooo.dev).
  return c.json({ ok: true, token });
});

demoBlogRoutes.post("/admin/logout", async (c) => {
  const auth = c.req.header("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  const token = bearer || readCookie(c.req.header("cookie"), DEMO_BLOG_COOKIE);
  if (token) {
    const hash = await sha256Hex(token);
    await c.env.DB.prepare(`DELETE FROM demo_blog_sessions WHERE token_hash = ?`)
      .bind(hash)
      .run();
  }
  c.header("Set-Cookie", clearCookieHeader(DEMO_BLOG_COOKIE, undefined, "None"));
  return c.json({ ok: true });
});

demoBlogRoutes.get("/admin/me", async (c) => {
  const ok = await requireDemoAdmin(c);
  if (!ok) return c.json({ error: "unauthorized" }, 401);
  return c.json({ ok: true, user: "admin" });
});

demoBlogRoutes.get("/admin/posts", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    `SELECT * FROM demo_posts ORDER BY updated_at DESC`,
  ).all<PostRow>();
  return c.json({ posts: (rows.results ?? []).map(mapPost) });
});

demoBlogRoutes.post("/admin/posts", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as {
    title?: string;
    slug?: string;
    excerpt?: string;
    body?: string;
    status?: string;
  };
  const title = String(body.title ?? "").trim().slice(0, 120);
  const text = String(body.body ?? "").trim().slice(0, POST_BODY_MAX);
  if (!title || !text) return c.json({ error: "invalid" }, 400);
  let slug = String(body.slug ?? slugify(title))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
  if (!slug) slug = slugify(title);
  const excerpt = String(body.excerpt ?? "").trim().slice(0, 280);
  const status = body.status === "draft" ? "draft" : "published";
  const now = new Date().toISOString();
  const id = newId("dpost");
  try {
    await c.env.DB.prepare(
      `INSERT INTO demo_posts (id, slug, title, excerpt, body, status, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        slug,
        title,
        excerpt,
        text,
        status,
        status === "published" ? now : null,
        now,
        now,
      )
      .run();
  } catch {
    return c.json({ error: "slug_taken" }, 409);
  }
  const row = await c.env.DB.prepare(`SELECT * FROM demo_posts WHERE id = ?`)
    .bind(id)
    .first<PostRow>();
  return c.json({ post: mapPost(row!) }, 201);
});

demoBlogRoutes.patch("/admin/posts/:id", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(`SELECT * FROM demo_posts WHERE id = ?`)
    .bind(id)
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
    body.title !== undefined ? String(body.title).trim().slice(0, 120) : existing.title;
  const text =
    body.body !== undefined ? String(body.body).trim().slice(0, POST_BODY_MAX) : existing.body;
  const excerpt =
    body.excerpt !== undefined
      ? String(body.excerpt).trim().slice(0, 280)
      : existing.excerpt;
  let slug =
    body.slug !== undefined
      ? String(body.slug)
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")
          .slice(0, 80)
      : existing.slug;
  if (!slug) slug = existing.slug;
  const status =
    body.status === "draft" || body.status === "published" ? body.status : existing.status;
  if (!title || !text) return c.json({ error: "invalid" }, 400);
  const now = new Date().toISOString();
  let publishedAt = existing.published_at;
  if (status === "published" && !publishedAt) publishedAt = now;
  if (status === "draft") publishedAt = null;
  try {
    await c.env.DB.prepare(
      `UPDATE demo_posts SET slug = ?, title = ?, excerpt = ?, body = ?, status = ?,
       published_at = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(slug, title, excerpt, text, status, publishedAt, now, id)
      .run();
  } catch {
    return c.json({ error: "slug_taken" }, 409);
  }
  const row = await c.env.DB.prepare(`SELECT * FROM demo_posts WHERE id = ?`)
    .bind(id)
    .first<PostRow>();
  return c.json({ post: mapPost(row!) });
});

demoBlogRoutes.delete("/admin/posts/:id", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const id = c.req.param("id");
  const res = await c.env.DB.prepare(`DELETE FROM demo_posts WHERE id = ?`).bind(id).run();
  if (!res.meta.changes) return c.json({ error: "not_found" }, 404);
  return c.json({ ok: true });
});

demoBlogRoutes.get("/admin/comments", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    `SELECT c.id, c.post_id, c.author_name, c.author_email, c.body, c.created_at,
            p.title AS post_title, p.slug AS post_slug
     FROM demo_comments c
     JOIN demo_posts p ON p.id = c.post_id
     ORDER BY c.created_at DESC`,
  ).all<
    CommentRow & { post_title: string; post_slug: string }
  >();
  return c.json({
    comments: (rows.results ?? []).map((r) => ({
      id: r.id,
      postId: r.post_id,
      postTitle: r.post_title,
      postSlug: r.post_slug,
      authorName: r.author_name,
      authorEmail: r.author_email,
      body: r.body,
      createdAt: r.created_at,
    })),
  });
});

demoBlogRoutes.delete("/admin/comments/:id", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const id = c.req.param("id");
  const res = await c.env.DB.prepare(`DELETE FROM demo_comments WHERE id = ?`).bind(id).run();
  if (!res.meta.changes) return c.json({ error: "not_found" }, 404);
  return c.json({ ok: true });
});
