import { request } from "./client";

export type ContentItem = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  bodyMarkdown: string;
  excerpt: string | null;
  updatedAt: string;
  createdAt?: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  featuredImage?: string | null;
  tags?: string[];
  seo?: Record<string, unknown>;
};

export const contentApi = {
  list: (siteId: string, q = "") =>
    request<{ content: ContentItem[]; pagination?: { page: number; perPage: number; total: number } }>(
      `/v1/sites/${siteId}/content${q}`,
    ),
  get: (siteId: string, id: string) =>
    request<{ content: ContentItem }>(`/v1/sites/${siteId}/content/${id}`),
  create: (siteId: string, body: Record<string, unknown>) =>
    request<{ content: ContentItem }>(`/v1/sites/${siteId}/content`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (siteId: string, id: string, body: Record<string, unknown>) =>
    request<{ content: ContentItem }>(`/v1/sites/${siteId}/content/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (siteId: string, id: string) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}/content/${id}`, { method: "DELETE" }),
  revisions: (siteId: string, id: string) =>
    request<{ revisions: { id: string; createdBy: string; createdAt: string }[] }>(
      `/v1/sites/${siteId}/content/${id}/revisions`,
    ),
  restore: (siteId: string, id: string, revisionId: string) =>
    request<{ content: ContentItem }>(`/v1/sites/${siteId}/content/${id}/restore`, {
      method: "POST",
      body: JSON.stringify({ revisionId }),
    }),
  previewToken: (siteId: string, id: string, theme?: string) =>
    request<{ token: string; url: string; expiresAt: string }>(
      `/v1/sites/${siteId}/content/${id}/preview-token`,
      { method: "POST", body: JSON.stringify({ theme }) },
    ),
};
