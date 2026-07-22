import { Hono } from "hono";
import { scoreSeoHealth, siteSettingsSchema } from "@kumooo/core";
import { content, media, siteEvents } from "@kumooo/db";
import { and, desc, eq, sql } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { requireSiteAccess } from "../lib/authz.js";
import { checkRoutingHealth } from "../lib/routing-health.js";
import { requireUser } from "../middleware/auth.js";

export const overviewRoutes = new Hono<AppEnv>();

overviewRoutes.get("/sites/:siteId/overview", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { site } = await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");
  const db = c.get("db");
  const settings = siteSettingsSchema.parse(safeJson(site.settings));
  const url = `https://${site.slug}.${c.env.PUBLIC_SITE_SUFFIX}`;

  const countRows = await db
    .select({ status: content.status, count: sql<number>`count(*)` })
    .from(content)
    .where(eq(content.siteId, siteId))
    .groupBy(content.status);

  const counts = {
    published: 0,
    drafts: 0,
    scheduled: 0,
    archived: 0,
    media: 0,
  };
  for (const row of countRows) {
    const n = Number(row.count ?? 0);
    if (row.status === "published") counts.published = n;
    else if (row.status === "draft") counts.drafts = n;
    else if (row.status === "scheduled") counts.scheduled = n;
    else if (row.status === "archived") counts.archived = n;
  }

  const mediaCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .where(eq(media.siteId, siteId));
  counts.media = Number(mediaCount[0]?.count ?? 0);

  const lastPub = (
    await db
      .select({ publishedAt: content.publishedAt })
      .from(content)
      .where(and(eq(content.siteId, siteId), eq(content.status, "published")))
      .orderBy(desc(content.publishedAt))
      .limit(1)
  )[0];

  const routing = await checkRoutingHealth({
    slug: site.slug,
    suffix: c.env.PUBLIC_SITE_SUFFIX,
    archived: site.status === "archived",
  });

  const seo = scoreSeoHealth({
    title: settings.title || site.name,
    description: settings.description,
    ogImage: settings.seo.defaultOgImage,
    canonicalUrl: url,
    hasSitemap: true,
    hasRobots: true,
    hasJsonLd: true,
    hasViewport: true,
  });

  return c.json({
    site: {
      id: site.id,
      name: site.name,
      slug: site.slug,
      theme: site.theme,
      status: site.status,
      url,
    },
    counts,
    lastPublishedAt: lastPub?.publishedAt ? lastPub.publishedAt.toISOString() : null,
    routing,
    seo,
    theme: site.theme,
  });
});

overviewRoutes.get("/sites/:siteId/events", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit") ?? 20)));
  const rows = await c
    .get("db")
    .select()
    .from(siteEvents)
    .where(eq(siteEvents.siteId, siteId))
    .orderBy(desc(siteEvents.createdAt))
    .limit(limit);

  return c.json({
    events: rows.map((e) => ({
      id: e.id,
      siteId: e.siteId,
      actorId: e.actorId,
      type: e.type,
      resourceType: e.resourceType,
      resourceId: e.resourceId,
      metadata: safeJson(e.metadata),
      createdAt: e.createdAt.toISOString(),
    })),
  });
});

overviewRoutes.get("/sites/:siteId/routing-health", async (c) => {
  const user = requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), user.id, "viewer");
  const routing = await checkRoutingHealth({
    slug: site.slug,
    suffix: c.env.PUBLIC_SITE_SUFFIX,
    archived: site.status === "archived",
  });
  return c.json({ routing });
});

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
