import { request } from "./client";
import type { OgTemplate } from "@kumooo/core";

export type OgTemplateRow = {
  id: string;
  siteId: string;
  name: string;
  isDefault: boolean;
  config: OgTemplate;
  createdAt: string;
  updatedAt: string;
};

export const ogApi = {
  list: (siteId: string) =>
    request<{ templates: OgTemplateRow[] }>(`/v1/sites/${siteId}/og-templates`),
  create: (siteId: string, body: { name: string; config: OgTemplate; isDefault?: boolean }) =>
    request<{ template: OgTemplateRow }>(`/v1/sites/${siteId}/og-templates`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (
    siteId: string,
    id: string,
    body: { name?: string; config?: OgTemplate; isDefault?: boolean },
  ) =>
    request<{ template: OgTemplateRow }>(`/v1/sites/${siteId}/og-templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (siteId: string, id: string) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}/og-templates/${id}`, { method: "DELETE" }),
  setDefault: (siteId: string, id: string) =>
    request<{ template: OgTemplateRow }>(`/v1/sites/${siteId}/og-templates/${id}/default`, {
      method: "POST",
    }),
  recordGenerated: (siteId: string, body: { mediaId: string; url: string; templateId?: string }) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}/og-generated`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
