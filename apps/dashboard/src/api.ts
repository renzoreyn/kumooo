const API = import.meta.env.VITE_API_URL ?? "";

export type User = { id: string; email: string; name: string };
export type Org = { id: string; name: string; slug: string; role: string };
export type Site = {
  id: string;
  name: string;
  slug: string;
  theme: string;
  settings: Record<string, unknown>;
  url?: string;
};
export type ContentItem = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  bodyMarkdown: string;
  excerpt: string | null;
  updatedAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  me: () => request<{ user: User }>("/v1/auth/me"),
  signup: (body: { email: string; password: string; name: string }) =>
    request<{ user: User; organization: { id: string } }>("/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ user: User }>("/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: boolean }>("/v1/auth/logout", { method: "POST" }),
  orgs: () => request<{ organizations: Org[] }>("/v1/orgs"),
  sites: (orgId: string) => request<{ sites: Site[] }>(`/v1/orgs/${orgId}/sites`),
  getSite: (siteId: string) => request<{ site: Site }>(`/v1/sites/${siteId}`),
  createSite: (orgId: string, body: { name: string; slug?: string; description?: string; theme?: string }) =>
    request<{ site: Site }>(`/v1/orgs/${orgId}/sites`, { method: "POST", body: JSON.stringify(body) }),
  content: (siteId: string, q = "") =>
    request<{ content: ContentItem[] }>(`/v1/sites/${siteId}/content${q}`),
  getContent: (siteId: string, id: string) =>
    request<{ content: ContentItem }>(`/v1/sites/${siteId}/content/${id}`),
  createContent: (siteId: string, body: Record<string, unknown>) =>
    request<{ content: ContentItem }>(`/v1/sites/${siteId}/content`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateContent: (siteId: string, id: string, body: Record<string, unknown>) =>
    request<{ content: ContentItem }>(`/v1/sites/${siteId}/content/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteContent: (siteId: string, id: string) =>
    request<{ ok: boolean }>(`/v1/sites/${siteId}/content/${id}`, { method: "DELETE" }),
  media: (siteId: string) => request<{ media: { id: string; filename: string; url: string; mime: string }[] }>(`/v1/sites/${siteId}/media`),
  uploadMedia: (siteId: string, file: File, alt = "") => {
    const form = new FormData();
    form.append("file", file);
    form.append("alt", alt);
    return request<{ media: { id: string; url: string } }>(`/v1/sites/${siteId}/media`, {
      method: "POST",
      body: form,
    });
  },
};
