import { request } from "./client";

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mime: string;
  size?: number;
  alt?: string;
};

export const mediaApi = {
  list: (siteId: string) => request<{ media: MediaItem[] }>(`/v1/sites/${siteId}/media`),
  upload: (siteId: string, file: File, alt = "") => {
    const form = new FormData();
    form.append("file", file);
    form.append("alt", alt);
    return request<{ media: { id: string; url: string } }>(`/v1/sites/${siteId}/media`, {
      method: "POST",
      body: form,
    });
  },
  remove: (siteId: string, id: string) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}/media/${id}`, { method: "DELETE" }),
};
