import { site } from "./site";

export type Me = {
  id: string;
  email: string;
  planId: string;
  createdAt: string;
};

export type SiteItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  url: string;
  lastDeployAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Quota = {
  planId: string;
  planName: string;
  sitesUsed: number;
  sitesLimit: number | null;
  mediaUsedBytes: number;
  mediaLimitBytes: number | null;
  mediaUsedLabel: string;
  mediaLimitLabel: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${site.api}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error((body as { error?: string }).error ?? "request_failed"), {
      status: res.status,
      body,
    });
  }
  return res.json() as Promise<T>;
}

export const client = {
  me: () => api<Me>("/auth/me"),
  requestOtp: (email: string) =>
    api<{ ok: true; emailed: boolean; devCode?: string }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verifyOtp: (email: string, code: string, remember: boolean) =>
    api<{ ok: true }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, code, remember }),
    }),
  logout: () => api<{ ok: true }>("/auth/logout", { method: "POST" }),
  listSites: () => api<{ sites: SiteItem[]; quota: Quota }>("/sites"),
  createSite: (input: { name: string; slug: string }) =>
    api<SiteItem>("/sites", { method: "POST", body: JSON.stringify(input) }),
  getSite: (id: string) => api<SiteItem & { deployHint?: string }>(`/sites/${id}`),
  deleteSite: (id: string) => api<{ ok: true }>(`/sites/${id}`, { method: "DELETE" }),
};
