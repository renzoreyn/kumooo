import { createDb, siteThemes, type Db } from "@kumooo/db";
import {
  ALLOWED_THEME_PATHS,
  compileTheme,
  draftKey,
  publishedKey,
  type ThemeFiles,
  starterThemeFiles,
} from "@kumooo/theme-studio";
import type { Theme } from "@kumooo/theme-kit";
import { and, desc, eq } from "drizzle-orm";

async function getObjectText(bucket: R2Bucket, key: string): Promise<string | null> {
  const obj = await bucket.get(key);
  if (!obj) return null;
  return obj.text();
}

async function loadFilesFromPrefix(
  bucket: R2Bucket,
  keyFor: (path: string) => string,
): Promise<ThemeFiles | null> {
  const themeJson = await getObjectText(bucket, keyFor("theme.json"));
  if (!themeJson) return null;
  const files = { ...starterThemeFiles() } as ThemeFiles;
  for (const path of ALLOWED_THEME_PATHS) {
    const body = await getObjectText(bucket, keyFor(path));
    if (body == null) continue;
    if (path === "client.js") files["client.js"] = body;
    else (files as Record<string, string>)[path] = body;
  }
  return files;
}

export async function loadCustomTheme(
  env: { MEDIA: R2Bucket; DB: D1Database },
  siteId: string,
  mode: "published" | "draft" = "published",
): Promise<Theme | null> {
  if (mode === "draft") {
    const files = await loadFilesFromPrefix(env.MEDIA, (path) => draftKey(siteId, path));
    if (!files) return null;
    return compileTheme(files);
  }

  const db = createDb(env.DB);
  const row = (
    await db
      .select({ version: siteThemes.version })
      .from(siteThemes)
      .where(and(eq(siteThemes.siteId, siteId), eq(siteThemes.status, "published")))
      .orderBy(desc(siteThemes.version))
      .limit(1)
  )[0];
  if (!row) return null;
  const files = await loadFilesFromPrefix(env.MEDIA, (path) => publishedKey(siteId, row.version, path));
  if (!files) return null;
  return compileTheme(files);
}

export function parseCustomThemeId(
  name: string,
): { siteId: string; draft: boolean } | null {
  if (name.startsWith("custom-draft:")) {
    return { siteId: name.slice("custom-draft:".length), draft: true };
  }
  if (name.startsWith("custom:")) {
    return { siteId: name.slice("custom:".length), draft: false };
  }
  return null;
}

export async function resolveRenderableTheme(
  name: string,
  env: { MEDIA: R2Bucket; DB: D1Database },
  siteId: string,
  getBuiltin: (name: string) => Theme,
): Promise<{ theme: Theme; custom: boolean }> {
  const custom = parseCustomThemeId(name);
  if (custom) {
    if (custom.siteId !== siteId) return { theme: getBuiltin("haru"), custom: false };
    const loaded = await loadCustomTheme(env, siteId, custom.draft ? "draft" : "published");
    if (loaded) return { theme: loaded, custom: true };
    return { theme: getBuiltin("haru"), custom: false };
  }
  return { theme: getBuiltin(name), custom: false };
}

/** @deprecated keep import happy if unused */
export type _Db = Db;
