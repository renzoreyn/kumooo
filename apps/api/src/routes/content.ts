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
import { recordSiteEvent } from "../lib/events.js";
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
  if (body.status === "published" || body.status === "scheduled") {
    await bumpCacheVersion(c.env.KV, siteId);
    await recordSiteEvent(c.get("db"), {
      siteId,
      actorId: user.id,
      type: body.status === "published" ? "content.published" : "content.scheduled",
      resourceType: "content",
      resourceId: id,
      metadata: { title: body.title, slug, status: body.status },
    });
  }

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
  if (body.expectedUpdatedAt && body.expectedUpdatedAt !== row.updatedAt.toISOString()) {
    throw new ApiError(409, "conflict", "This content changed elsewhere. Reload or keep your local draft.", {
      current: serializeContent(row),
    });
  }
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
  let publishedAt = row.publishedAt;
  if (nextStatus === "published") publishedAt = row.publishedAt ?? new Date();
  else if (nextStatus === "draft" || nextStatus === "archived") publishedAt = null;

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

  const becamePublic =
    nextStatus === "published" ||
    nextStatus === "scheduled" ||
    row.status === "published" ||
    row.status === "scheduled";
  if (becamePublic) await bumpCacheVersion(c.env.KV, siteId);

  if (body.status && body.status !== row.status) {
    await recordSiteEvent(c.get("db"), {
      siteId,
      actorId: user.id,
      type:
        body.status === "published"
          ? "content.published"
          : body.status === "archived"
            ? "content.archived"
            : body.status === "scheduled"
              ? "content.scheduled"
              : "content.updated",
      resourceType: "content",
      resourceId: id,
      metadata: { from: row.status, to: body.status, title: body.title ?? row.title },
    });
  }

  const updated = (await c.get("db").select().from(content).where(eq(content.id, id)))[0]!;
  return c.json({ content: serializeContent(updated) });
});

contentRoutes.post("/sites/:siteId/content/:id/restore", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { role } = await requireSiteAccess(c.get("db"), siteId, user.id, "author");
  const id = c.req.param("id");
  const body = (await c.req.json()) as { revisionId?: string };
  if (!body.revisionId) throw ApiError.badRequest("revisionId is required.");

  const row = (
    await c
      .get("db")
      .select()
      .from(content)
      .where(and(eq(content.id, id), eq(content.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Content not found.");
  if (role === "author" && row.authorId !== user.id) {
    throw ApiError.forbidden("Authors can only restore their own content.");
  }

  const revision = (
    await c
      .get("db")
      .select()
      .from(revisions)
      .where(and(eq(revisions.id, body.revisionId), eq(revisions.contentId, id)))
  )[0];
  if (!revision) throw ApiError.notFound("Revision not found.");

  const snapshot = safeJson(revision.snapshot) as Partial<typeof content.$inferSelect>;
  await c.get("db").insert(revisions).values({
    id: newId("rev"),
    contentId: id,
    snapshot: JSON.stringify(row),
    createdBy: user.id,
    createdAt: new Date(),
  });

  await c
    .get("db")
    .update(content)
    .set({
      title: typeof snapshot.title === "string" ? snapshot.title : row.title,
      excerpt: (snapshot.excerpt as string | null | undefined) ?? row.excerpt,
      bodyMarkdown:
        typeof snapshot.bodyMarkdown === "string" ? snapshot.bodyMarkdown : row.bodyMarkdown,
      customFields:
        typeof snapshot.customFields === "string" ? snapshot.customFields : row.customFields,
      seo: typeof snapshot.seo === "string" ? snapshot.seo : row.seo,
      featuredImage: (snapshot.featuredImage as string | null | undefined) ?? row.featuredImage,
      updatedAt: new Date(),
    })
    .where(and(eq(content.id, id), eq(content.siteId, siteId)));

  if (row.status === "published") await bumpCacheVersion(c.env.KV, siteId);
  await recordSiteEvent(c.get("db"), {
    siteId,
    actorId: user.id,
    type: "content.restored",
    resourceType: "content",
    resourceId: id,
    metadata: { revisionId: body.revisionId },
  });

  const updated = (await c.get("db").select().from(content).where(eq(content.id, id)))[0]!;
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
  if (row.status !== "archived" && row.status !== "draft") {
    throw ApiError.badRequest("Archive content before permanently deleting it.");
  }
  await c.get("db").delete(contentTags).where(eq(contentTags.contentId, id));
  await c.get("db").delete(revisions).where(eq(revisions.contentId, id));
  await c.get("db").delete(content).where(and(eq(content.id, id), eq(content.siteId, siteId)));
  await recordSiteEvent(c.get("db"), {
    siteId,
    actorId: user.id,
    type: "content.deleted",
    resourceType: "content",
    resourceId: id,
    metadata: { title: row.title, slug: row.slug },
  });
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
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
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
