import { Hono } from "hono";
import { newId } from "@kumooo/core";
import { siteThemes, sites } from "@kumooo/db";
import {
  ALLOWED_THEME_PATHS,
  REQUIRED_THEME_PATHS,
  compileTheme,
  starterThemeFiles,
  validateThemeFiles,
  type ThemeFiles,
} from "@kumooo/theme-studio";
import { and, desc, eq } from "drizzle-orm";
import type { AppEnv } from "../env.js";
import { ApiError } from "../errors.js";
import { requireSiteAccess } from "../lib/authz.js";
import { bumpCacheVersion } from "../lib/cachever.js";
import { recordSiteEvent } from "../lib/events.js";
import { requireUser } from "../middleware/auth.js";
import {
  contentTypeForThemePath,
  draftKey,
  getThemeFile,
  publishedKey,
  putThemeFile,
} from "../lib/theme-r2.js";

export const themeStudioRoutes = new Hono<AppEnv>();

async function readDraftFiles(bucket: R2Bucket, siteId: string): Promise<ThemeFiles | null> {
  const themeJson = await getThemeFile(bucket, draftKey(siteId, "theme.json"));
  if (!themeJson) return null;
  const files = { ...starterThemeFiles() } as ThemeFiles;
  for (const path of ALLOWED_THEME_PATHS) {
    const body = await getThemeFile(bucket, draftKey(siteId, path));
    if (body != null) {
      if (path === "client.js") files["client.js"] = body;
      else (files as Record<string, string>)[path] = body;
    }
  }
  return files;
}

async function writeDraftFiles(bucket: R2Bucket, siteId: string, files: ThemeFiles): Promise<void> {
  for (const path of REQUIRED_THEME_PATHS) {
    const body = files[path];
    await putThemeFile(bucket, draftKey(siteId, path), body, contentTypeForThemePath(path));
  }
  if (files["client.js"] != null) {
    await putThemeFile(
      bucket,
      draftKey(siteId, "client.js"),
      files["client.js"],
      contentTypeForThemePath("client.js"),
    );
  }
}

async function ensureDraft(bucket: R2Bucket, siteId: string, label?: string): Promise<ThemeFiles> {
  const existing = await readDraftFiles(bucket, siteId);
  if (existing) return existing;
  const starter = starterThemeFiles(label ?? "Custom theme");
  await writeDraftFiles(bucket, siteId, starter);
  return starter;
}

themeStudioRoutes.get("/sites/:siteId/theme-studio", async (c) => {
  requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), requireUser(c).id, "viewer");
  const files = await ensureDraft(c.env.MEDIA, site.id, site.name);
  const versions = await c
    .get("db")
    .select()
    .from(siteThemes)
    .where(and(eq(siteThemes.siteId, site.id), eq(siteThemes.status, "published")))
    .orderBy(desc(siteThemes.version))
    .limit(10);
  return c.json({
    files,
    siteTheme: site.theme,
    versions: versions.map((v) => ({
      id: v.id,
      version: v.version,
      label: v.label,
      publishedAt: v.publishedAt,
    })),
  });
});

themeStudioRoutes.put("/sites/:siteId/theme-studio/files", async (c) => {
  const user = requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), user.id, "editor");
  const body = (await c.req.json()) as { files?: Record<string, string> };
  if (!body.files || typeof body.files !== "object") throw ApiError.badRequest("files object required.");

  const current = await ensureDraft(c.env.MEDIA, site.id, site.name);
  for (const [path, value] of Object.entries(body.files)) {
    if (!ALLOWED_THEME_PATHS.has(path)) throw ApiError.badRequest(`Disallowed path: ${path}`);
    if (typeof value !== "string") throw ApiError.badRequest(`File ${path} must be a string.`);
    if (path === "client.js") current["client.js"] = value;
    else (current as Record<string, string>)[path] = value;
  }
  const check = validateThemeFiles(current);
  if (!check.ok) throw ApiError.badRequest(check.errors.join(" "));
  await writeDraftFiles(c.env.MEDIA, site.id, current);
  return c.json({ ok: true, files: current });
});

themeStudioRoutes.post("/sites/:siteId/theme-studio/reset", async (c) => {
  const user = requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), user.id, "editor");
  const starter = starterThemeFiles(site.name);
  await writeDraftFiles(c.env.MEDIA, site.id, starter);
  return c.json({ ok: true, files: starter });
});

themeStudioRoutes.post("/sites/:siteId/theme-studio/publish", async (c) => {
  const user = requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), user.id, "editor");
  const files = await ensureDraft(c.env.MEDIA, site.id, site.name);
  const check = validateThemeFiles(files);
  if (!check.ok) throw ApiError.badRequest(check.errors.join(" "));
  // Ensure compile succeeds before writing published snapshot.
  compileTheme(files);

  const latest = (
    await c
      .get("db")
      .select({ version: siteThemes.version })
      .from(siteThemes)
      .where(eq(siteThemes.siteId, site.id))
      .orderBy(desc(siteThemes.version))
      .limit(1)
  )[0];
  const version = (latest?.version ?? 0) + 1;
  const id = newId("thm");
  const now = new Date();

  for (const path of ALLOWED_THEME_PATHS) {
    const body = path === "client.js" ? files["client.js"] : files[path as keyof ThemeFiles];
    if (body == null) continue;
    await putThemeFile(
      c.env.MEDIA,
      publishedKey(site.id, version, path),
      body,
      contentTypeForThemePath(path),
    );
  }

  await c.get("db").insert(siteThemes).values({
    id,
    siteId: site.id,
    version,
    status: "published",
    label: check.meta.label,
    createdAt: now,
    publishedAt: now,
  });

  // Keep last 10 published; archive older.
  const allPublished = await c
    .get("db")
    .select()
    .from(siteThemes)
    .where(and(eq(siteThemes.siteId, site.id), eq(siteThemes.status, "published")))
    .orderBy(desc(siteThemes.version));
  for (const row of allPublished.slice(10)) {
    await c
      .get("db")
      .update(siteThemes)
      .set({ status: "archived" })
      .where(eq(siteThemes.id, row.id));
  }

  const themeId = `custom:${site.id}`;
  await c
    .get("db")
    .update(sites)
    .set({ theme: themeId, updatedAt: now })
    .where(eq(sites.id, site.id));

  await recordSiteEvent(c.get("db"), {
    siteId: site.id,
    actorId: user.id,
    type: "site.theme_published",
    resourceType: "theme",
    resourceId: id,
    metadata: { version, theme: themeId },
  });
  await bumpCacheVersion(c.env.KV, site.id);

  return c.json({ ok: true, theme: themeId, version, label: check.meta.label });
});

themeStudioRoutes.get("/sites/:siteId/theme-studio/versions", async (c) => {
  requireUser(c);
  const { site } = await requireSiteAccess(c.get("db"), c.req.param("siteId"), requireUser(c).id, "viewer");
  const rows = await c
    .get("db")
    .select()
    .from(siteThemes)
    .where(eq(siteThemes.siteId, site.id))
    .orderBy(desc(siteThemes.version))
    .limit(20);
  return c.json({
    versions: rows.map((v) => ({
      id: v.id,
      version: v.version,
      status: v.status,
      label: v.label,
      publishedAt: v.publishedAt,
    })),
  });
});
