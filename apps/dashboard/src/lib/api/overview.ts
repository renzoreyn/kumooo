import { request } from "./client";

export type RoutingHealth = {
  tenantHostname: string;
  dnsOk: boolean;
  httpOk: boolean;
  status: "live" | "dns_missing" | "unreachable" | "archived";
  checkedAt: string;
};

export type SiteOverview = {
  site: {
    id: string;
    name: string;
    slug: string;
    theme: string;
    status: string;
    url: string;
  };
  counts: {
    published: number;
    drafts: number;
    scheduled: number;
    archived: number;
    media: number;
  };
  lastPublishedAt: string | null;
  routing: RoutingHealth;
  seo: { score: number; checks: { id: string; label: string; ok: boolean; detail?: string }[] };
  theme: string;
};

export type SiteEvent = {
  id: string;
  siteId: string;
  actorId: string | null;
  type: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export const overviewApi = {
  get: (siteId: string) => request<SiteOverview>(`/v1/sites/${siteId}/overview`),
  events: (siteId: string, limit = 20) =>
    request<{ events: SiteEvent[] }>(`/v1/sites/${siteId}/events?limit=${limit}`),
  routingHealth: (siteId: string) =>
    request<{ routing: RoutingHealth }>(`/v1/sites/${siteId}/routing-health`),
};
