import { ALLOWED_THEME_PATHS } from "./limits.js";

export function draftKey(siteId: string, path: string): string {
  assertThemePath(path);
  return `themes/${siteId}/draft/${path}`;
}

export function publishedKey(siteId: string, version: number, path: string): string {
  assertThemePath(path);
  if (!Number.isInteger(version) || version < 1) throw new Error("Invalid theme version.");
  return `themes/${siteId}/published/v${version}/${path}`;
}

export function assertThemePath(path: string): void {
  if (!ALLOWED_THEME_PATHS.has(path) || path.includes("..") || path.startsWith("/")) {
    throw new Error(`Disallowed theme path: ${path}`);
  }
}
