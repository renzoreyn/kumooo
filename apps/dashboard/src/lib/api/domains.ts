import { request } from "./client";

export type DomainItem = {
  id: string;
  hostname: string;
  status: string;
  verifiedAt?: string | null;
  createdAt?: string;
};

export type DnsRecord = { type: string; name: string; value: string; proxied?: boolean };

export type DomainVerifyResult = {
  domain: DomainItem;
  dnsOk: boolean;
  httpOk: boolean;
  sslOk: boolean;
  status: string;
  records: DnsRecord[];
};

export const domainsApi = {
  list: (siteId: string) =>
    request<{ domains: DomainItem[]; tenantHostname: string; recordsHintTarget: string }>(
      `/v1/sites/${siteId}/domains`,
    ),
  create: (siteId: string, hostname: string) =>
    request<{ domain: DomainItem; note?: string; records?: DnsRecord[] }>(
      `/v1/sites/${siteId}/domains`,
      {
        method: "POST",
        body: JSON.stringify({ hostname }),
      },
    ),
  verify: (siteId: string, domainId: string) =>
    request<DomainVerifyResult>(`/v1/sites/${siteId}/domains/${domainId}/verify`, {
      method: "POST",
    }),
  remove: (siteId: string, domainId: string) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}/domains/${domainId}`, { method: "DELETE" }),
};
