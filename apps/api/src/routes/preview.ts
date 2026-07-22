import { Hono } from "hono";
import { signPreviewToken } from "@kumooo/core";
import { content, sites } from "@kumooo/db";
import { and, eq } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireSiteAccess } from "../lib/authz.js";
import { requireUser } from "../middleware/auth.js";

export const previewRoutes = new Hono<AppEnv>();

previewRoutes.post("/sites/:siteId/content/:id/preview-token", async (c) => {
  const user = requireUser(c);
  const siteId = c.req.param("siteId");
  const contentId = c.req.param("id");
  const { site } = await requireSiteAccess(c.get("db"), siteId, user.id, "author");
  const secret = c.env.PREVIEW_SIGNING_SECRET;
  if (!secret) throw ApiError.badRequest("Preview signing is not configured on this API.");

  const row = (
    await c
      .get("db")
      .select()
      .from(content)
      .where(and(eq(content.id, contentId), eq(content.siteId, siteId)))
  )[0];
  if (!row) throw ApiError.notFound("Content not found.");

  const body = (await c.req.json().catch(() => ({}))) as { theme?: string };
  const theme = body.theme || site.theme;
  const exp = Math.floor(Date.now() / 1000) + 15 * 60;
  const token = await signPreviewToken({ siteId, contentId, theme, exp }, secret);
  const hostname = `${site.slug}.${c.env.PUBLIC_SITE_SUFFIX}`;

  return c.json({
    token,
    expiresAt: new Date(exp * 1000).toISOString(),
    url: `https://${hostname}/_preview?token=${encodeURIComponent(token)}`,
  });
});

// silence unused import if tree-shaken differently
void sites;
