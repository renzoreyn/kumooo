import { request } from "./client";

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mime: string;
  size: number;
  alt: string;
  width?: number | null;
  height?: number | null;
  createdAt?: string;
};

export const mediaApi = {
  list: (siteId: string) => request<{ media: MediaItem[] }>(`/v1/sites/${siteId}/media`),
  upload: (siteId: string, file: File, alt = "") => {
    const form = new FormData();
    form.append("file", file);
    form.append("alt", alt);
    return request<{ media: MediaItem }>(`/v1/sites/${siteId}/media`, {
      method: "POST",
      body: form,
    });
  },
  update: (siteId: string, id: string, body: { alt?: string }) =>
    request<{ media: MediaItem }>(`/v1/sites/${siteId}/media/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (siteId: string, id: string) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}/media/${id}`, { method: "DELETE" }),
};

export function absoluteMediaUrl(siteUrl: string | undefined, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = (siteUrl ?? "").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
