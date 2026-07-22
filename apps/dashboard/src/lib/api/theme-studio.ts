import { request } from "./client";

export type ThemeStudioFiles = {
  "theme.json": string;
  "styles.css": string;
  "templates/home.html": string;
  "templates/post.html": string;
  "templates/page.html": string;
  "templates/archive.html": string;
  "templates/notFound.html": string;
  "client.js"?: string;
};

export type ThemeStudioVersion = {
  id: string;
  version: number;
  label: string;
  publishedAt: string | Date | null;
  status?: string;
};

export const themeStudioApi = {
  get: (siteId: string) =>
    request<{
      files: ThemeStudioFiles;
      siteTheme: string;
      versions: ThemeStudioVersion[];
    }>(`/v1/sites/${siteId}/theme-studio`),
  save: (siteId: string, files: Partial<ThemeStudioFiles>) =>
    request<{ ok: true; files: ThemeStudioFiles }>(`/v1/sites/${siteId}/theme-studio/files`, {
      method: "PUT",
      body: JSON.stringify({ files }),
    }),
  reset: (siteId: string) =>
    request<{ ok: true; files: ThemeStudioFiles }>(`/v1/sites/${siteId}/theme-studio/reset`, {
      method: "POST",
    }),
  publish: (siteId: string) =>
    request<{ ok: true; theme: string; version: number; label: string }>(
      `/v1/sites/${siteId}/theme-studio/publish`,
      { method: "POST" },
    ),
};
