import { Hono } from "hono";
import {
  createContentSchema,
  updateContentSchema,
  newId,
  slugify,
  uniqueSlug,
  contentSeoSchema,
} from "@kumooo/core";
import { content, contentTags, revisions, tags } from "@kumooo/db";
import { and, desc, eq, like, sql } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireSiteAccess } from "../lib/authz.js";
import { bumpCacheVersion } from "../lib/cachever.js";
import { requireUser } from "../middleware/auth.js";

export const contentRoutes = new Hono<AppEnv>();

contentRoutes.get("/sites/:siteId/content", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");

  const type = c.req.query("type");
  const status = c.req.query("status");
  const search = c.req.query("search");
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const perPage = Math.min(100, Math.max(1, Number(c.req.query("perPage") ?? 20)));

  const conditions = [eq(content.siteId, siteId)];
  if (type) conditions.push(eq(content.type, type));
  if (status) conditions.push(eq(content.status, status as "draft"));
  if (search) conditions.push(like(content.title, `%${search}%`));

  const where = and(...conditions);
  const rows = await c
    .get("db")
    .select()
    .from(content)
    .where(where)
    .orderBy(desc(content.updatedAt))
    .limit(perPage)
    .offset((page - 1) * perPage);

  const totalRow = await c
    .get("db")
    .select({ count: sql<number>`count(*)` })
    .from(content)
    .where(where);
  const total = Number(totalRow[0]?.count ?? 0);

  return c.json({
    content: rows.map(serializeContent),
    pagination: { page, perPage, total },
  });
});

contentRoutes.post("/sites/:siteId/content", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { role } = await requireSiteAccess(c.get("db"), siteId, user.id, "author");
  const body = createContentSchema.parse(await c.req.json());

  if ((body.status === "published" || body.status === "scheduled") && role === "author") {
    throw ApiError.forbidden("Authors can draft. Editors publish.");
  }

  const taken = new Set(
    (
      await c
        .get("db")
        .select({ slug: content.slug })
        .from(content)
        .where(and(eq(content.siteId, siteId), eq(content.type, body.type)))
    ).map((r) => r.slug),
  );
  const slug = uniqueSlug(body.slug ? slugify(body.slug) : slugify(body.title), taken);
  const id = newId("cnt");
  const now = new Date();
  const publishedAt = body.status === "published" ? now : null;

  await c.get("db").insert(content).values({
    id,
    siteId,
    type: body.type,
    slug,
    title: body.title,
    excerpt: body.excerpt,
    bodyMarkdown: body.bodyMarkdown,
    customFields: JSON.stringify(body.customFields),
    seo: JSON.stringify(contentSeoSchema.parse(body.seo ?? {})),
    status: body.status,
    publishedAt,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    authorId: user.id,
    featuredImage: body.featuredImage,
    createdAt: now,
    updatedAt: now,
  });

  if (body.tags.length) await syncTags(c.get("db"), siteId, id, body.tags);
  if (body.status === "published") await bumpCacheVersion(c.env.KV, siteId);

  const row = (await c.get("db").select().from(content).where(eq(content.id, id)))[0]!;
  return c.json({ content: serializeContent(row) }, 201);
});

contentRoutes.get("/sites/:siteId/content/:id", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");
  const row = (
    await c
      .get("db")
      .select()
      .from(content)
      .where(and(eq(content.id, c.req.param("id")), eq(content.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Content not found.");
  return c.json({ content: serializeContent(row) });
});

contentRoutes.patch("/sites/:siteId/content/:id", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { role } = await requireSiteAccess(c.get("db"), siteId, user.id, "author");
  const id = c.req.param("id");
  const row = (
    await c
      .get("db")
      .select()
      .from(content)
      .where(and(eq(content.id, id), eq(content.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Content not found.");

  if (role === "author" && row.authorId !== user.id) {
    throw ApiError.forbidden("Authors can only edit their own drafts.");
  }

  const body = updateContentSchema.parse(await c.req.json());
  if (body.status && body.status !== "draft" && role === "author") {
    throw ApiError.forbidden("Authors can draft. Editors publish.");
  }

  await c.get("db").insert(revisions).values({
    id: newId("rev"),
    contentId: id,
    snapshot: JSON.stringify(row),
    createdBy: user.id,
    createdAt: new Date(),
  });

  // Keep last 50 revisions.
  const old = await c
    .get("db")
    .select({ id: revisions.id })
    .from(revisions)
    .where(eq(revisions.contentId, id))
    .orderBy(desc(revisions.createdAt))
    .limit(1000)
    .offset(50);
  for (const r of old) {
    await c.get("db").delete(revisions).where(eq(revisions.id, r.id));
  }

  const nextStatus = body.status ?? row.status;
  const publishedAt =
    nextStatus === "published"
      ? (row.publishedAt ?? new Date())
      : nextStatus === "draft"
        ? null
        : row.publishedAt;

  await c
    .get("db")
    .update(content)
    .set({
      title: body.title ?? row.title,
      excerpt: body.excerpt ?? row.excerpt,
      bodyMarkdown: body.bodyMarkdown ?? row.bodyMarkdown,
      customFields: body.customFields ? JSON.stringify(body.customFields) : row.customFields,
      seo: body.seo ? JSON.stringify(contentSeoSchema.parse(body.seo)) : row.seo,
      status: nextStatus,
      publishedAt,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : row.scheduledAt,
      featuredImage: body.featuredImage ?? row.featuredImage,
      updatedAt: new Date(),
    })
    .where(and(eq(content.id, id), eq(content.siteId, siteId)));

  if (body.tags) await syncTags(c.get("db"), siteId, id, body.tags);
  if (nextStatus === "published" || row.status === "published") {
    await bumpCacheVersion(c.env.KV, siteId);
  }

  const updated = (
    await c.get("db").select().from(content).where(eq(content.id, id))
  )[0]!;
  return c.json({ content: serializeContent(updated) });
});

contentRoutes.delete("/sites/:siteId/content/:id", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { role } = await requireSiteAccess(c.get("db"), siteId, user.id, "author");
  const id = c.req.param("id");
  const row = (
    await c
      .get("db")
      .select()
      .from(content)
      .where(and(eq(content.id, id), eq(content.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Content not found.");
  if (role === "author" && (row.authorId !== user.id || row.status !== "draft")) {
    throw ApiError.forbidden("Authors can only delete their own drafts.");
  }
  await c.get("db").delete(content).where(and(eq(content.id, id), eq(content.siteId, siteId)));
  if (row.status === "published") await bumpCacheVersion(c.env.KV, siteId);
  return c.json({ ok: true });
});

contentRoutes.get("/sites/:siteId/content/:id/revisions", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");
  const id = c.req.param("id");
  const rows = await c
    .get("db")
    .select({ id: revisions.id, createdBy: revisions.createdBy, createdAt: revisions.createdAt })
    .from(revisions)
    .where(eq(revisions.contentId, id))
    .orderBy(desc(revisions.createdAt))
    .limit(50);
  return c.json({ revisions: rows });
});

function serializeContent(row: typeof content.$inferSelect) {
  return {
    ...row,
    customFields: safeJson(row.customFields),
    seo: safeJson(row.seo),
  };
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

async function syncTags(
  db: AppEnv["Variables"]["db"],
  siteId: string,
  contentId: string,
  names: string[],
) {
  await db.delete(contentTags).where(eq(contentTags.contentId, contentId));
  for (const name of names) {
    const slug = slugify(name);
    let tag = (
      await db.select().from(tags).where(and(eq(tags.siteId, siteId), eq(tags.slug, slug)))
    )[0];
    if (!tag) {
      const id = newId("tag");
      await db.insert(tags).values({ id, siteId, slug, name });
      tag = { id, siteId, slug, name, description: null };
    }
    await db.insert(contentTags).values({ contentId, tagId: tag.id });
  }
}
