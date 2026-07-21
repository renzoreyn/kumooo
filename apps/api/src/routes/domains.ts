import { Hono } from "hono";
import { newId } from "@kumooo/core";
import { domains } from "@kumooo/db";
import { and, eq } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireSiteAccess } from "../lib/authz.js";
import { bumpCacheVersion } from "../lib/cachever.js";
import { requireUser } from "../middleware/auth.js";

export const domainRoutes = new Hono<AppEnv>();

domainRoutes.get("/sites/:siteId/domains", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");
  const rows = await c.get("db").select().from(domains).where(eq(domains.siteId, siteId));
  return c.json({ domains: rows });
});

domainRoutes.post("/sites/:siteId/domains", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "admin");
  const body = (await c.req.json()) as { hostname?: string };
  const hostname = body.hostname?.trim().toLowerCase();
  if (!hostname || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(hostname)) {
    throw ApiError.badRequest("That hostname doesn't look right.");
  }
  const existing = (await c.get("db").select().from(domains).where(eq(domains.hostname, hostname)))[0];
  if (existing) throw ApiError.conflict("That domain is already registered.");

  if (!c.env.CF_API_TOKEN || !c.env.CF_ZONE_ID) {
    // Still register locally so self-hosted routing via Worker routes works.
    const id = newId("dom");
    await c.get("db").insert(domains).values({
      id,
      siteId,
      hostname,
      status: "active",
      verifiedAt: new Date(),
    });
    await bumpCacheVersion(c.env.KV, siteId);
    return c.json(
      {
        domain: { id, hostname, status: "active" },
        note: "CF_ZONE_ID not set. Domain saved locally. Point DNS at your renderer Worker.",
      },
      201,
    );
  }

  const id = newId("dom");
  await c.get("db").insert(domains).values({
    id,
    siteId,
    hostname,
    status: "pending",
  });
  return c.json({ domain: { id, hostname, status: "pending" } }, 201);
});

domainRoutes.delete("/sites/:siteId/domains/:domainId", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "admin");
  await c
    .get("db")
    .delete(domains)
    .where(and(eq(domains.id, c.req.param("domainId")), eq(domains.siteId, siteId)));
  await bumpCacheVersion(c.env.KV, siteId);
  return c.json({ ok: true });
});
