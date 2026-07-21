import { Hono } from "hono";
import { newId, RESERVED_SLUGS, createSiteSchema, siteSettingsSchema, slugify } from "@kumooo/core";
import { organizations, orgMembers, sites } from "@kumooo/db";
import { and, eq } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireOrgRole, requireSiteAccess } from "../lib/authz.js";
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
  const rows = await c.get("db").select().from(sites).where(eq(sites.orgId, orgId));
  return c.json({
    sites: rows.map((s) => ({
      ...s,
      settings: safeJson(s.settings),
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
    settings: JSON.stringify(settings),
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
    ? siteSettingsSchema.parse({ ...current, ...body.settings, seo: { ...current.seo, ...(body.settings.seo as object) } })
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
  return c.json({ ok: true });
});

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
