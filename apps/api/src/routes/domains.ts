import { Hono } from "hono";
import { newId } from "@kumooo/core";
import { domains } from "@kumooo/db";
import { and, eq } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireSiteAccess } from "../lib/authz.js";
import { bumpCacheVersion } from "../lib/cachever.js";
import { recordSiteEvent } from "../lib/events.js";
import { requireUser } from "../middleware/auth.js";

export const domainRoutes = new Hono<AppEnv>();

function serializeDomain(row: typeof domains.$inferSelect) {
  return {
    id: row.id,
    siteId: row.siteId,
    hostname: row.hostname,
    status: row.status,
    cfHostnameId: row.cfHostnameId,
    verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

function dnsRecords(hostname: string, target: string) {
  const isApex = hostname.split(".").length === 2;
  if (isApex) {
    return [
      { type: "AAAA", name: "@", value: "100::", proxied: true },
      { type: "CNAME", name: "www", value: target, proxied: true },
    ];
  }
  return [{ type: "CNAME", name: hostname.split(".")[0]!, value: target, proxied: true }];
}

async function lookupDnsOk(hostname: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=CNAME`,
      { headers: { Accept: "application/dns-json" } },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { Answer?: { type: number; data: string }[] };
    if (data.Answer?.some((a) => a.type === 5)) return true;
    const aaaa = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=AAAA`,
      { headers: { Accept: "application/dns-json" } },
    );
    if (!aaaa.ok) return false;
    const aaaaData = (await aaaa.json()) as { Answer?: unknown[] };
    return Boolean(aaaaData.Answer?.length);
  } catch {
    return false;
  }
}

async function lookupHttpOk(hostname: string): Promise<{ httpOk: boolean; sslOk: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`https://${hostname}/`, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
    });
    return { httpOk: res.status > 0 && res.status < 500, sslOk: true };
  } catch {
    return { httpOk: false, sslOk: false };
  } finally {
    clearTimeout(timer);
  }
}

domainRoutes.get("/sites/:siteId/domains", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { site } = await requireSiteAccess(c.get("db"), siteId, user.id, "viewer");
  const rows = await c.get("db").select().from(domains).where(eq(domains.siteId, siteId));
  const tenantHostname = `${site.slug}.${c.env.PUBLIC_SITE_SUFFIX}`;
  return c.json({
    tenantHostname,
    recordsHintTarget: tenantHostname,
    domains: rows.map(serializeDomain),
  });
});

domainRoutes.post("/sites/:siteId/domains", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { site } = await requireSiteAccess(c.get("db"), siteId, user.id, "admin");
  const body = (await c.req.json()) as { hostname?: string };
  const hostname = body.hostname?.trim().toLowerCase();
  if (!hostname || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(hostname)) {
    throw ApiError.badRequest("That hostname doesn't look right.");
  }
  if (hostname.endsWith(`.${c.env.PUBLIC_SITE_SUFFIX}`)) {
    throw ApiError.badRequest("Use a domain you control, not a *.kumooo.dev hostname.");
  }
  const existing = (await c.get("db").select().from(domains).where(eq(domains.hostname, hostname)))[0];
  if (existing) throw ApiError.conflict("That domain is already registered.");

  const id = newId("dom");
  const target = `${site.slug}.${c.env.PUBLIC_SITE_SUFFIX}`;
  const hasCf = Boolean(c.env.CF_API_TOKEN && c.env.CF_ZONE_ID);
  await c.get("db").insert(domains).values({
    id,
    siteId,
    hostname,
    status: "pending",
  });
  await recordSiteEvent(c.get("db"), {
    siteId,
    actorId: user.id,
    type: "domain.added",
    resourceType: "domain",
    resourceId: id,
    metadata: { hostname },
  });

  const row = (await c.get("db").select().from(domains).where(eq(domains.id, id)))[0]!;
  return c.json(
    {
      domain: serializeDomain(row),
      records: dnsRecords(hostname, target),
      note: hasCf
        ? undefined
        : "Cloudflare custom hostname API is not configured. Point DNS at your renderer, then Verify.",
    },
    201,
  );
});

domainRoutes.post("/sites/:siteId/domains/:domainId/verify", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const { site } = await requireSiteAccess(c.get("db"), siteId, user.id, "admin");
  const domainId = c.req.param("domainId");
  const row = (
    await c
      .get("db")
      .select()
      .from(domains)
      .where(and(eq(domains.id, domainId), eq(domains.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Domain not found.");

  const target = `${site.slug}.${c.env.PUBLIC_SITE_SUFFIX}`;
  const records = dnsRecords(row.hostname, target);
  const dnsOk = await lookupDnsOk(row.hostname);
  const { httpOk, sslOk } = dnsOk
    ? await lookupHttpOk(row.hostname)
    : { httpOk: false, sslOk: false };

  let status: "pending" | "active" | "error" = "pending";
  if (dnsOk && httpOk && sslOk) status = "active";
  else if (!dnsOk) status = "pending";
  else status = "error";

  await c
    .get("db")
    .update(domains)
    .set({
      status,
      verifiedAt: status === "active" ? new Date() : row.verifiedAt,
    })
    .where(eq(domains.id, domainId));

  if (status === "active") {
    await bumpCacheVersion(c.env.KV, siteId);
    await recordSiteEvent(c.get("db"), {
      siteId,
      actorId: user.id,
      type: "domain.verified",
      resourceType: "domain",
      resourceId: domainId,
      metadata: { hostname: row.hostname, dnsOk, httpOk, sslOk },
    });
  } else if (status === "error") {
    await recordSiteEvent(c.get("db"), {
      siteId,
      actorId: user.id,
      type: "domain.error",
      resourceType: "domain",
      resourceId: domainId,
      metadata: { hostname: row.hostname, dnsOk, httpOk, sslOk },
    });
  }

  const next = (await c.get("db").select().from(domains).where(eq(domains.id, domainId)))[0]!;
  return c.json({
    domain: serializeDomain(next),
    dnsOk,
    httpOk,
    sslOk,
    status,
    records,
  });
});

domainRoutes.delete("/sites/:siteId/domains/:domainId", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  await requireSiteAccess(c.get("db"), siteId, user.id, "admin");
  const domainId = c.req.param("domainId");
  const row = (
    await c
      .get("db")
      .select()
      .from(domains)
      .where(and(eq(domains.id, domainId), eq(domains.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Domain not found.");
  await c.get("db").delete(domains).where(eq(domains.id, domainId));
  await bumpCacheVersion(c.env.KV, siteId);
  await recordSiteEvent(c.get("db"), {
    siteId,
    actorId: user.id,
    type: "domain.removed",
    resourceType: "domain",
    resourceId: domainId,
    metadata: { hostname: row.hostname },
  });
  return c.json({ ok: true });
});
