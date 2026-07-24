import { site } from "./site";

export type Me = {
  id: string;
  email: string;
  planId: string;
  createdAt: string;
  hasPassword?: boolean;
  emailVerified?: boolean;
};

export type SiteItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  skin: string;
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

export type MediaItem = {
  id: string;
  key: string;
  url: string;
  bytes: number;
  contentType: string;
  filename: string | null;
  createdAt: string;
};

export type MediaList = {
  media: MediaItem[];
  usedBytes: number;
  quotaBytes: number | null;
  usedLabel: string;
  quotaLabel: string;
};

export type PostItem = {
  id: string;
  siteId: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  body: string;
  status?: "published" | "draft";
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!isForm && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const res = await fetch(`${site.api}${path}`, {
    ...init,
    credentials: "include",
    headers,
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
  signup: (email: string, password: string) =>
    api<{ ok: true; emailed: boolean; needsVerification?: boolean; devCode?: string }>(
      "/auth/signup",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),
  loginPassword: (email: string, password: string, remember: boolean) =>
    api<{ ok: true }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    }),
  setPassword: (password: string) =>
    api<{ ok: true }>("/auth/password", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () => api<{ ok: true }>("/auth/logout", { method: "POST" }),
  listSites: () => api<{ sites: SiteItem[]; quota: Quota }>("/sites"),
  createSite: (input: { name: string; slug: string }) =>
    api<SiteItem>("/sites", { method: "POST", body: JSON.stringify(input) }),
  getSite: (id: string) => api<SiteItem & { deployHint?: string }>(`/sites/${id}`),
  updateSite: (id: string, input: { name?: string; skin?: string; status?: string }) =>
    api<SiteItem>(`/sites/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteSite: (id: string) => api<{ ok: true }>(`/sites/${id}`, { method: "DELETE" }),
  listMedia: (siteId: string) => api<MediaList>(`/sites/${siteId}/media`),
  uploadMedia: (siteId: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return api<MediaItem & { ok: true }>(`/sites/${siteId}/media`, { method: "POST", body });
  },
  deleteMedia: (siteId: string, mediaId: string) =>
    api<{ ok: true }>(`/sites/${siteId}/media/${mediaId}`, { method: "DELETE" }),
  listPosts: (siteId: string) => api<{ posts: PostItem[] }>(`/sites/${siteId}/posts`),
  createPost: (siteId: string, input: PostInput) =>
    api<PostItem>(`/sites/${siteId}/posts`, { method: "POST", body: JSON.stringify(input) }),
  updatePost: (siteId: string, postId: string, input: Partial<PostInput>) =>
    api<PostItem>(`/sites/${siteId}/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deletePost: (siteId: string, postId: string) =>
    api<{ ok: true }>(`/sites/${siteId}/posts/${postId}`, { method: "DELETE" }),
};
