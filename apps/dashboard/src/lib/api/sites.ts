import { request } from "./client";

export type Site = {
  id: string;
  name: string;
  slug: string;
  theme: string;
  status?: "active" | "archived";
  settings: Record<string, unknown>;
  url?: string;
};

export type SitePlanLimits = {
  plan: "free" | "selfhost";
  maxSites: number | null;
  usedSites: number;
  remainingSites: number | null;
};

export const sitesApi = {
  list: (orgId: string, status?: "archived" | "all") => {
    const q = status ? `?status=${status}` : "";
    return request<{ sites: Site[]; limits: SitePlanLimits }>(`/v1/orgs/${orgId}/sites${q}`);
  },
  get: (siteId: string) => request<{ site: Site }>(`/v1/sites/${siteId}`),
  create: (
    orgId: string,
    body: { name: string; slug?: string; description?: string; theme?: string },
  ) =>
    request<{ site: Site; limits: SitePlanLimits }>(`/v1/orgs/${orgId}/sites`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (
    siteId: string,
    body: { name?: string; theme?: string; settings?: Record<string, unknown> },
  ) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}`, { method: "PATCH", body: JSON.stringify(body) }),
  archive: (siteId: string) =>
    request<{ ok: boolean; status: string }>(`/v1/sites/${siteId}/archive`, { method: "POST" }),
  restore: (siteId: string) =>
    request<{ ok: boolean; status: string; limits?: SitePlanLimits }>(
      `/v1/sites/${siteId}/restore`,
      { method: "POST" },
    ),
  remove: (siteId: string, confirmSlug: string) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}`, {
      method: "DELETE",
      body: JSON.stringify({ confirmSlug }),
    }),
};
