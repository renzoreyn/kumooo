import { request } from "./client";

export type DomainItem = {
  id: string;
  hostname: string;
  status: string;
  verifiedAt?: string | null;
};

export const domainsApi = {
  list: (siteId: string) => request<{ domains: DomainItem[] }>(`/v1/sites/${siteId}/domains`),
  create: (siteId: string, hostname: string) =>
    request<{ domain: DomainItem; note?: string }>(`/v1/sites/${siteId}/domains`, {
      method: "POST",
      body: JSON.stringify({ hostname }),
    }),
  remove: (siteId: string, domainId: string) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}/domains/${domainId}`, { method: "DELETE" }),
};
