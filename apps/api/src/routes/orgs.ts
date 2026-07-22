import { Hono } from "hono";
import { newId, RESERVED_SLUGS, createSiteSchema, siteSettingsSchema, slugify } from "@kumooo/core";
import {
  content,
  contentCategories,
  contentTags,
  domains,
  media,
  ogTemplates,
  organizations,
  orgMembers,
  revisions,
  siteEvents,
  sites,
} from "@kumooo/db";
import { and, eq, inArray } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireOrgRole, requireSiteAccess } from "../lib/authz.js";
import { recordSiteEvent } from "../lib/events.js";
import { requireUser } from "../middleware/auth.js";

export const orgRoutes = new Hono<AppEnv>();
export const siteRoutes = new Hono<AppEnv>();

orgRoutes.get("/", async (c) => {
  const user = requireUser(c);
  const rows = await c
    .get("db")
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      role: orgMembers.role,
      createdAt: organizations.createdAt,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
    .where(eq(orgMembers.userId, user.id));
  return c.json({ organizations: rows });
});

orgRoutes.get("/:orgId/sites", async (c) => {
  const user = requireUser(c);
  const orgId = c.req.param("orgId");
  await requireOrgRole(c.get("db"), orgId, user.id, "viewer");
  const status = c.req.query("status");
  const rows = await c.get("db").select().from(sites).where(eq(sites.orgId, orgId));
  const filtered =
    status === "archived"
      ? rows.filter((s) => s.status === "archived")
      : status === "all"
        ? rows
        : rows.filter((s) => s.status !== "archived");
  return c.json({
    sites: filtered.map((s) => ({
      ...s,
      settings: safeJson(s.settings),
      url: `https://${s.slug}.${c.env.PUBLIC_SITE_SUFFIX}`,
    })),
  });
});

orgRoutes.post("/:orgId/sites", async (c) => {
  const user = requireUser(c);
  const orgId = c.req.param("orgId");
  await requireOrgRole(c.get("db"), orgId, user.id, "admin");
  const body = createSiteSchema.parse(await c.req.json());
  const slug = (body.slug ?? slugify(body.name)).toLowerCase();
  if (RESERVED_SLUGS.has(slug)) {
    throw ApiError.badRequest(`"${slug}" is reserved. Pick another slug.`);
  }
  const existing = (await c.get("db").select().from(sites).where(eq(sites.slug, slug)))[0];
  if (existing) throw ApiError.conflict("That site slug is taken.");

  const id = newId("site");
  const settings = siteSettingsSchema.parse({
    title: body.name,
    description: body.description ?? "",
  });
  await c.get("db").insert(sites).values({
    id,
    orgId,
    name: body.name,
    slug,
    theme: body.theme,
    status: "active",
    settings: JSON.stringify(settings),
  });
  await recordSiteEvent(c.get("db"), {
    siteId: id,
    actorId: user.id,
    type: "site.created",
    resourceType: "site",
    resourceId: id,
    metadata: { slug, theme: body.theme },
  });
  const site = (await c.get("db").select().from(sites).where(eq(sites.id, id)))[0]!;
  return c.json(
    {
      site: {
        ...site,
        settings,
        url: `https://${slug}.${c.env.PUBLIC_SITE_SUFFIX}`,
      },
    },
    201,
  );
});

siteRoutes.get("/sites/:siteId", async (c) => {
  const user = requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), user.id, "viewer");
  return c.json({
    site: {
      ...site,
      settings: safeJson(site.settings),
      url: `https://${site.slug}.${c.env.PUBLIC_SITE_SUFFIX}`,
    },
  });
});

siteRoutes.patch("/sites/:siteId", async (c) => {
  const user = requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), user.id, "admin");
  const body = (await c.req.json()) as {
    name?: string;
    theme?: string;
    settings?: Record<string, unknown>;
  };
  const current = siteSettingsSchema.parse(safeJson(site.settings));
  const nextSettings = body.settings
    ? siteSettingsSchema.parse({
        ...current,
        ...body.settings,
        seo: { ...current.seo, ...(body.settings.seo as object) },
      })
    : current;
  await c
    .get("db")
    .update(sites)
    .set({
      name: body.name ?? site.name,
      theme: body.theme ?? site.theme,
      settings: JSON.stringify(nextSettings),
      updatedAt: new Date(),
    })
    .where(and(eq(sites.id, site.id), eq(sites.orgId, site.orgId)));

  if (body.theme && body.theme !== site.theme) {
    await recordSiteEvent(c.get("db"), {
      siteId: site.id,
      actorId: user.id,
      type: "site.theme_changed",
      resourceType: "site",
      resourceId: site.id,
      metadata: { from: site.theme, to: body.theme },
    });
  } else {
    await recordSiteEvent(c.get("db"), {
      siteId: site.id,
      actorId: user.id,
      type: "site.settings_changed",
      resourceType: "site",
      resourceId: site.id,
    });
  }

  return c.json({ ok: true });
});

siteRoutes.post("/sites/:siteId/archive", async (c) => {
  const user = requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), user.id, "admin");
  if (site.status === "archived") throw ApiError.badRequest("That site is already archived.");
  await c
    .get("db")
    .update(sites)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(sites.id, site.id));
  await recordSiteEvent(c.get("db"), {
    siteId: site.id,
    actorId: user.id,
    type: "site.archived",
    resourceType: "site",
    resourceId: site.id,
  });
  return c.json({ ok: true, status: "archived" });
});

siteRoutes.post("/sites/:siteId/restore", async (c) => {
  const user = requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), user.id, "admin");
  if (site.status !== "archived") throw ApiError.badRequest("Only archived sites can be restored.");
  await c
    .get("db")
    .update(sites)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(sites.id, site.id));
  await recordSiteEvent(c.get("db"), {
    siteId: site.id,
    actorId: user.id,
    type: "site.restored",
    resourceType: "site",
    resourceId: site.id,
  });
  return c.json({ ok: true, status: "active" });
});

siteRoutes.delete("/sites/:siteId", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { site } = await requireSiteAccess(c.get("db"), siteId, user.id, "owner");
  const body = (await c.req.json().catch(() => ({}))) as { confirmSlug?: string };
  if (!body.confirmSlug || body.confirmSlug !== site.slug) {
    throw ApiError.badRequest("Type the site slug to confirm permanent deletion.");
  }

  const db = c.get("db");
  const contentIds = (
    await db.select({ id: content.id }).from(content).where(eq(content.siteId, siteId))
  ).map((r) => r.id);

  if (contentIds.length) {
    await db.delete(contentTags).where(inArray(contentTags.contentId, contentIds));
    await db.delete(contentCategories).where(inArray(contentCategories.contentId, contentIds));
    await db.delete(revisions).where(inArray(revisions.contentId, contentIds));
  }

  const mediaRows = await db.select().from(media).where(eq(media.siteId, siteId));
  for (const row of mediaRows) {
    try {
      await c.env.MEDIA.delete(row.r2Key);
    } catch {
      // Continue deleting DB rows even if an R2 object is already gone.
    }
  }

  await db.delete(media).where(eq(media.siteId, siteId));
  await db.delete(content).where(eq(content.siteId, siteId));
  await db.delete(domains).where(eq(domains.siteId, siteId));
  await db.delete(ogTemplates).where(eq(ogTemplates.siteId, siteId));
  await db.delete(siteEvents).where(eq(siteEvents.siteId, siteId));
  await db.delete(sites).where(eq(sites.id, siteId));

  return c.json({ ok: true });
});

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
