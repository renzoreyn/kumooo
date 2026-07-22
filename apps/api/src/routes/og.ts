import { Hono } from "hono";
import { newId, ogTemplateSchema } from "@kumooo/core";
import { ogTemplates } from "@kumooo/db";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireSiteAccess } from "../lib/authz.js";
import { recordSiteEvent } from "../lib/events.js";
import { requireUser } from "../middleware/auth.js";

export const ogRoutes = new Hono<AppEnv>();

const createSchema = z.object({
  name: z.string().min(1).max(120),
  config: ogTemplateSchema,
  isDefault: z.boolean().optional(),
});

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  config: ogTemplateSchema.optional(),
  isDefault: z.boolean().optional(),
});

function serialize(row: typeof ogTemplates.$inferSelect) {
  return {
    id: row.id,
    siteId: row.siteId,
    name: row.name,
    isDefault: row.isDefault,
    config: safeJson(row.config),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

async function clearDefaults(db: AppEnv["Variables"]["db"], siteId: string) {
  await db.update(ogTemplates).set({ isDefault: false }).where(eq(ogTemplates.siteId, siteId));
}

ogRoutes.get("/sites/:siteId/og-templates", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");
  const rows = await c
    .get("db")
    .select()
    .from(ogTemplates)
    .where(eq(ogTemplates.siteId, siteId))
    .orderBy(desc(ogTemplates.updatedAt));
  return c.json({ templates: rows.map(serialize) });
});

ogRoutes.post("/sites/:siteId/og-templates", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "editor");
  const body = createSchema.parse(await c.req.json());
  const id = newId("ogt");
  const now = new Date();
  if (body.isDefault) await clearDefaults(c.get("db"), siteId);

  await c.get("db").insert(ogTemplates).values({
    id,
    siteId,
    name: body.name,
    isDefault: Boolean(body.isDefault),
    config: JSON.stringify(body.config),
    createdAt: now,
    updatedAt: now,
  });

  const row = (await c.get("db").select().from(ogTemplates).where(eq(ogTemplates.id, id)))[0]!;
  return c.json({ template: serialize(row) }, 201);
});

ogRoutes.patch("/sites/:siteId/og-templates/:id", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "editor");
  const id = c.req.param("id");
  const body = patchSchema.parse(await c.req.json());
  const row = (
    await c
      .get("db")
      .select()
      .from(ogTemplates)
      .where(and(eq(ogTemplates.id, id), eq(ogTemplates.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Template not found.");

  if (body.isDefault) await clearDefaults(c.get("db"), siteId);

  await c
    .get("db")
    .update(ogTemplates)
    .set({
      name: body.name ?? row.name,
      config: body.config ? JSON.stringify(body.config) : row.config,
      isDefault: body.isDefault ?? row.isDefault,
      updatedAt: new Date(),
    })
    .where(eq(ogTemplates.id, id));

  const next = (await c.get("db").select().from(ogTemplates).where(eq(ogTemplates.id, id)))[0]!;
  return c.json({ template: serialize(next) });
});

ogRoutes.delete("/sites/:siteId/og-templates/:id", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "editor");
  const id = c.req.param("id");
  const row = (
    await c
      .get("db")
      .select()
      .from(ogTemplates)
      .where(and(eq(ogTemplates.id, id), eq(ogTemplates.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Template not found.");
  await c.get("db").delete(ogTemplates).where(eq(ogTemplates.id, id));
  return c.json({ ok: true });
});

ogRoutes.post("/sites/:siteId/og-templates/:id/default", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "editor");
  const id = c.req.param("id");
  const row = (
    await c
      .get("db")
      .select()
      .from(ogTemplates)
      .where(and(eq(ogTemplates.id, id), eq(ogTemplates.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Template not found.");
  await clearDefaults(c.get("db"), siteId);
  await c
    .get("db")
    .update(ogTemplates)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(ogTemplates.id, id));
  const next = (await c.get("db").select().from(ogTemplates).where(eq(ogTemplates.id, id)))[0]!;
  return c.json({ template: serialize(next) });
});

ogRoutes.post("/sites/:siteId/og-generated", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "editor");
  const body = z
    .object({
      mediaId: z.string().min(1),
      url: z.string().min(1),
      templateId: z.string().optional(),
    })
    .parse(await c.req.json());
  await recordSiteEvent(c.get("db"), {
    siteId,
    actorId: user.id,
    type: "og.generated",
    resourceType: "media",
    resourceId: body.mediaId,
    metadata: { url: body.url, templateId: body.templateId },
  });
  return c.json({ ok: true });
});
